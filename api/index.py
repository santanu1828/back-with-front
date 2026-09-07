import os
import uuid
from typing import Optional
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

app = FastAPI(
    title="OmniChat Serverless API",
    description="Vercel Serverless Function for OmniChat Multilingual AI Chatbot",
    version="1.0.0",
)

# Enable CORS for frontend connectivity
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

MODEL_NAME = os.environ.get("MODEL_NAME", "gemini-flash-latest")
MONGO_URI = os.environ.get("MONGODB_URI")

# In-memory session store fallback
in_memory_history = {}
_mongo_client = None
_messages_col = None
_mongo_checked = False


def get_collection():
    """Lazily and safely connect to MongoDB without blocking cold start."""
    global _mongo_client, _messages_col, _mongo_checked
    if _messages_col is not None:
        return _messages_col
    if _mongo_checked or not MONGO_URI:
        return None

    _mongo_checked = True
    try:
        from pymongo import MongoClient
        _mongo_client = MongoClient(
            MONGO_URI,
            serverSelectionTimeoutMS=1500,
            connectTimeoutMS=1500,
            socketTimeoutMS=1500,
        )
        # Verify connection
        _mongo_client.admin.command("ping")
        db = _mongo_client["chatbot_db"]
        _messages_col = db["messages"]
        _messages_col.create_index("session_id")
        print("[OK] Connected to MongoDB Atlas successfully.")
        return _messages_col
    except Exception as e:
        print(f"[INFO] MongoDB connection skipped or failed ({e}). Using in-memory store.")
        _messages_col = None
        return None


def get_history(session_id: str):
    col = get_collection()
    if col is not None:
        try:
            docs = col.find({"session_id": session_id}).sort("_id", 1)
            return [{"role": doc["role"], "text": doc["text"]} for doc in docs]
        except Exception:
            pass
    return in_memory_history.get(session_id, [])


def append_turn(session_id: str, role: str, text: str):
    col = get_collection()
    if col is not None:
        try:
            col.insert_one({
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


def detect_language(text: str):
    try:
        from langdetect import detect
        return detect(text)
    except Exception:
        return None


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    detected_language: Optional[str] = None


def to_genai_history(history):
    from google.genai import types
    return [
        types.Content(role=turn["role"], parts=[types.Part(text=turn["text"])])
        for turn in history
    ]


# Root and Info endpoints
@app.get("/")
@app.get("/api")
@app.get("/api/info")
def info():
    return {
        "name": "OmniChat Serverless API",
        "status": "online",
        "model": MODEL_NAME,
        "database": "MongoDB" if _messages_col is not None else "In-Memory Store",
        "docs": "/docs",
    }


# Health check endpoints
@app.get("/health")
@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "database": "mongodb" if _messages_col is not None else "in-memory",
        "gemini_api_configured": bool(os.environ.get("GOOGLE_API_KEY")),
    }


# History endpoints
@app.get("/history/{session_id}")
@app.get("/api/history/{session_id}")
def get_session_history(session_id: str):
    history = get_history(session_id)
    if not history:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"session_id": session_id, "messages": history}


# Chat endpoints
@app.post("/chat", response_model=ChatResponse)
@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    session_id = req.session_id or str(uuid.uuid4())
    history = get_history(session_id)
    lang = detect_language(req.message)

    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        reply_text = (
            f"Hello! I received your message in language code [{lang or 'unknown'}]: \"{req.message}\".\n\n"
            "⚠️ Note: GOOGLE_API_KEY is not configured in Vercel Environment Variables. "
            "Add your Gemini API key to Vercel (Project Settings > Environment Variables) to enable live AI responses!"
        )
        append_turn(session_id, "user", req.message)
        append_turn(session_id, "model", reply_text)
        return ChatResponse(reply=reply_text, session_id=session_id, detected_language=lang)

    candidate_models = []
    for m in [MODEL_NAME, "gemini-flash-latest", "gemini-3.5-flash", "gemini-3.6-flash", "gemini-flash-lite-latest", "gemini-pro-latest"]:
        if m and m not in candidate_models:
            candidate_models.append(m)

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
        reply_text = None
        last_error = None

        for candidate in candidate_models:
            try:
                chat_session = client.chats.create(
                    model=candidate,
                    config=types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT),
                    history=to_genai_history(history),
                )
                response = chat_session.send_message(req.message)
                if response and response.text:
                    reply_text = response.text
                    break
            except Exception as e:
                last_error = e
                print(f"[WARN] Model '{candidate}' encountered error ({e}). Trying fallback model...")

        if not reply_text:
            raise HTTPException(status_code=502, detail="LLM call failed: " + str(last_error))

        append_turn(session_id, "user", req.message)
        append_turn(session_id, "model", reply_text)
        return ChatResponse(reply=reply_text, session_id=session_id, detected_language=lang)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")