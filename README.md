# Back with Front — Full-Stack Multilingual AI Chatbot

A production-ready full-stack AI chatbot solution featuring a **FastAPI backend (Google Gemini 2.5 Flash + MongoDB)** and a modern **Vite frontend (BiDi / RTL & Unicode script agnostic)**.

---

## 🏗️ Architecture Overview

```
back-with-front/
├── backend/                  # FastAPI Python Backend
│   ├── main.py               # API endpoints, Gemini 2.5 integration, MongoDB + fallback
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Environment variable template
│   └── README.md             # Backend setup & API reference
├── frontend/                 # Vite Frontend SPA
│   ├── public/
│   │   └── favicon.svg       # Vector icon
│   ├── src/
│   │   ├── main.js           # Chat client, session management, language tags
│   │   └── style.css         # Responsive layout (100dvh), LTR/RTL dir="auto"
│   ├── index.html            # Entry HTML
│   ├── vite.config.js        # Vite config with /chat proxy to backend:8000
│   ├── package.json          # Frontend dependencies and build scripts
│   └── vercel.json           # Vercel Vite deployment configuration
├── package.json              # Monorepo root workspace scripts
├── vercel.json               # Root Vercel build configuration
└── README.md                 # Full-stack documentation
```

---

## 🔌 How Frontend & Backend Connect

```
┌───────────────────────────┐                ┌──────────────────────────────┐
│     Frontend (Vite)       │                │      Backend (FastAPI)       │
│   http://localhost:3000   │                │    http://localhost:8000     │
├───────────────────────────┤                ├──────────────────────────────┤
│  User types in any script │                │                              │
│  (English, Arabic, Hindi) │                │                              │
│             │             │                │                              │
│             ▼             │                │                              │
│   POST /chat ------------─┼──[Vite Proxy]─►│  1. Detect Language          │
│   { message, session_id } │   (or direct)  │  2. Fetch Session History    │
│                           │                │  3. Call Gemini 2.5 Flash    │
│                           │                │  4. Save Turn (MongoDB/Mem)  │
│             ▲             │                │             │                │
│             │             │                │             ▼                │
│   ◄───────────────────────┼────────────────┼── Response:                  │
│   { reply, session_id,    │                │   { reply, session_id,       │
│     detected_language }   │                │     detected_language }      │
│             │             │                │                              │
│  - Displays response      │                │                              │
│  - Tags language badge    │                │                              │
│  - Persists session_id    │                │                              │
└───────────────────────────┘                └──────────────────────────────┘
```

1. **Proxy in Dev**: In local development, `vite.config.js` forwards `/chat`, `/history`, and `/health` calls directly to `http://localhost:8000`, eliminating any CORS or port mismatch issues.
2. **Session Persistence**: The frontend generates or reuses a `session_id` stored in `localStorage`, maintaining conversation continuity across messages.
3. **Language Detection**: `langdetect` identifies the language ISO code (e.g. `en`, `hi`, `ar`, `es`, `zh-cn`), and the frontend displays a sleek language badge with each message.
4. **Resilience**: If MongoDB is offline, the backend seamlessly falls back to an in-memory session store. If the backend is unreachable, the frontend falls back to a simulated mock response without crashing.

---

## 🚀 Quick Start

### 1. Run the Backend
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate       # On Windows
# source venv/bin/activate    # On Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure your Gemini API key
cp .env.example .env
# Open .env and add: GOOGLE_API_KEY=your_key_here

# Start FastAPI server
uvicorn main:app --reload --port 8000
```
- API is running at: `http://localhost:8000`
- Interactive Swagger docs: `http://localhost:8000/docs`

### 2. Run the Frontend
```bash
# In another terminal at project root:
npm run dev

# Or directly in frontend folder:
cd frontend
npm install
npm run dev
```
- Frontend will open at: `http://localhost:3000`

---

## ⚡ Deployment

### Frontend (Vercel)
This repository is pre-configured for **Vercel**. When importing the repo on Vercel:
- **Framework Preset**: `Vite`
- **Root Directory**: `.` (or `frontend`)
- **Build Command**: `npm --prefix frontend install && npm --prefix frontend run build` (automatic via `vercel.json`)
- **Output Directory**: `frontend/dist`
- **Environment Variables**: Add `VITE_BACKEND_URL` pointing to your deployed FastAPI backend (e.g. on Render/Railway/Fly).

### Backend (Render / Railway / Fly.io / AWS)
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
  - `GOOGLE_API_KEY`: Your Gemini API key
  - `MONGODB_URI`: MongoDB connection string (e.g. MongoDB Atlas)