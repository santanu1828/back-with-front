# Language-Agnostic Chatbot Backend

A resilient, multilingual FastAPI backend powered by **Google Gemini 2.5 Flash**, **PyMongo (MongoDB)**, and **langdetect**.

## Features
- **Multilingual System Prompt**: Responds naturally in the exact language & tone of the user.
- **BiDi & Script Agnostic**: Handles Arabic, Hebrew, Hindi, Chinese, Cyrillic, etc.
- **Language Detection**: Automatically returns detected ISO language code (e.g. `en`, `es`, `hi`, `ar`, `zh-cn`).
- **Session Persistence**: Stores conversation turns in MongoDB with automatic fallback to in-memory store if MongoDB is offline.
- **CORS Enabled**: Ready for requests from Vite frontend (`http://localhost:3000`) and production origins.

## Quick Start

### 1. Create Virtual Environment & Install Dependencies
```bash
# In the backend directory:
python -m venv venv

# Windows:
.\venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` and set your `GOOGLE_API_KEY`:
```env
GOOGLE_API_KEY=your_actual_api_key_here
```

### 3. Run FastAPI Server
```bash
uvicorn main:app --reload --port 8000
```
- API Root: `http://localhost:8000`
- Interactive Swagger UI Docs: `http://localhost:8000/docs`
