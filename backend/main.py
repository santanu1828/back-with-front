from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import uuid
import os
from dotenv import load_dotenv


load_dotenv()

from pymongo import MongoClient
from google import genai
from google.genai import types
from langdetect import detect, LangDetectException

app = FastAPI(
    title="Language-Agnostic Chatbot API (Gemini + MongoDB)",
    description="Multilingual conversation backend supporting any language, script, and persistent sessions."
)

# Enable CORS for frontend connectivity (Vite dev server, Vercel, localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = (
    "You are a helpful multilingual assistant. Always respond in the same "
    "language the user writes in, matching their tone and formality level. "
    "If the user switches languages mid-conversation, switch with them."
)

MODEL_NAME = os.environ.get("MODEL_NAME", "gemini-3.6-flash")


# Initialize MongoDB with resilient fallback to in-memory store if unavailable
MONGO_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
messages_collection = None
in_memory_history = {}

try:
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
    mongo_client.admin.command("ping")
    db = mongo_client["chatbot_db"]
    messages_collection = db["messages"]
    messages_collection.create_index("session_id")
    print("[OK] Connected to MongoDB successfully.")
except Exception as e:
    print(f"[INFO] MongoDB not detected ({e}). Using in-memory session store.")
    messages_collection = None



def get_history(session_id: str):
    if messages_collection is not None:
        try:
            docs = messages_collection.find({"session_id": session_id}).sort("_id", 1)
            return [{"role": doc["role"], "text": doc["text"]} for doc in docs]
        except Exception:
            pass
    return in_memory_history.get(session_id, [])


def append_turn(session_id: str, role: str, text: str):
    if messages_collection is not None:
        try:
            messages_collection.insert_one({
                "session_id": session_id,
                "role": role,
                "text": text,
            })
            return
        except Exception:
            pass
    if session_id not in in_memory_history:
        in_memory_history[session_id] = []
    in_memory_history[session_id].append({"role": role, "text": text})


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    detected_language: Optional[str] = None


def detect_language(text: str):
    try:
        return detect(text)
    except LangDetectException:
        return None


def to_genai_history(history):
    return [
        types.Content(role=turn["role"], parts=[types.Part(text=turn["text"])])
        for turn in history
    ]


FRONTEND_DIST = os.environ.get(
    "FRONTEND_DIST",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
)

# Mount frontend assets if directory exists
if os.path.isdir(os.path.join(FRONTEND_DIST, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")


@app.get("/")
def root():
    index_file = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.isfile(index_file):
        return FileResponse(index_file)
    return {
        "name": "Language-Agnostic Chatbot API",
        "status": "online",
        "model": MODEL_NAME,
        "database": "MongoDB" if messages_collection is not None else "In-Memory Fallback",
        "docs": "/docs"
    }


@app.get("/api/info")
def api_info():
    return {
        "name": "Language-Agnostic Chatbot API",
        "status": "online",
        "model": MODEL_NAME,
        "database": "MongoDB" if messages_collection is not None else "In-Memory Fallback",
        "docs": "/docs"
    }



@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    session_id = req.session_id or str(uuid.uuid4())
    history = get_history(session_id)
    lang = detect_language(req.message)

    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        # Graceful fallback response when API key is not yet set
        reply_text = (
            f"Hello! I received your message in language code [{lang or 'unknown'}]: \"{req.message}\".\n\n"
            "⚠️ Note: GOOGLE_API_KEY is not configured yet in backend/.env. "
            "Add your Gemini API key to backend/.env to enable live AI generation!"
        )
        append_turn(session_id, "user", req.message)
        append_turn(session_id, "model", reply_text)
        return ChatResponse(reply=reply_text, session_id=session_id, detected_language=lang)

    try:
        client = genai.Client(api_key=api_key)
        chat_session = client.chats.create(
            model=MODEL_NAME,
            config=types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT),
            history=to_genai_history(history),
        )
        response = chat_session.send_message(req.message)
        reply_text = response.text
    except Exception as e:
        raise HTTPException(status_code=502, detail="LLM call failed: " + str(e))

    append_turn(session_id, "user", req.message)
    append_turn(session_id, "model", reply_text)

    return ChatResponse(reply=reply_text, session_id=session_id, detected_language=lang)


@app.get("/history/{session_id}")
def get_session_history(session_id: str):
    history = get_history(session_id)
    if not history:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"session_id": session_id, "messages": history}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "database": "mongodb" if messages_collection is not None else "in-memory",
        "gemini_api_configured": bool(os.environ.get("GOOGLE_API_KEY"))
    }


# Catch-all route to serve static root files (e.g. favicon.svg) or SPA fallback
@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa(full_path: str):
    file_path = os.path.join(FRONTEND_DIST, full_path)
    if full_path and os.path.isfile(file_path):
        return FileResponse(file_path)

    index_file = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.isfile(index_file):
        return FileResponse(index_file)

    raise HTTPException(status_code=404, detail="Not found")