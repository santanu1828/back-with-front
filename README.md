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

## ⚡ Deployment to Render

You can deploy this full-stack application (Vite Frontend + FastAPI Backend) to **[Render](https://render.com)** using either of the following methods:

### Method 1: 1-Click Render Blueprint (Recommended ⭐)

The repository includes a ready-to-use [`render.yaml`](file:///render.yaml) Blueprint that provisions a unified full-stack container on Render's free tier.

1. Push your latest code to your GitHub repository:
   ```bash
   git add .
   git commit -m "Configure Render deployment"
   git push origin main
   ```
2. Log in to your **[Render Dashboard](https://dashboard.render.com)**.
3. Click **New +** (top right) and select **Blueprint**.
4. Connect your GitHub repository (`santanu1828/back-with-front`).
5. Render will automatically detect `render.yaml` and prompt you for environment variables:
   - `GOOGLE_API_KEY`: Your Gemini API key from Google AI Studio.
   - `MONGODB_URI`: (Optional) Your MongoDB Atlas connection string. If left blank, it automatically uses the built-in resilient in-memory session store.
6. Click **Apply**. Render will build the Vite frontend, package the FastAPI backend, and deploy everything under a single live URL (e.g. `https://back-with-front.onrender.com`).

---

### Method 2: Manual Web Service (Docker)

If you prefer creating the service manually via the Render UI:

1. In the **Render Dashboard**, click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Choose **Docker** as the Runtime (Render will automatically detect the root `Dockerfile`).
4. Set **Plan** to **Free**.
5. Scroll down to **Environment Variables** and add:
   - `GOOGLE_API_KEY` = `your_gemini_api_key`
   - `MONGODB_URI` = `your_mongodb_atlas_uri` (optional)
   - `MODEL_NAME` = `gemini-3.6-flash` (or `gemini-2.5-flash-lite`)
6. Click **Create Web Service**.

---

### Method 3: Two Separate Services (Static Site + Python Web Service)

If you prefer hosting the frontend on a CDN and the API on a separate web service:

#### 1. Backend Web Service:
- **Runtime**: `Python`
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**: `GOOGLE_API_KEY`, `MONGODB_URI`

#### 2. Frontend Static Site:
- **Runtime**: `Static`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**:
  - `VITE_BACKEND_URL`: The URL of your deployed Backend Web Service (e.g. `https://your-api.onrender.com`)

---

## 🌐 Other Deployment Options

### Frontend on Vercel + Backend on Render
- **Frontend (Vercel)**: Import repo, Framework preset `Vite`, Build command `npm --prefix frontend install && npm --prefix frontend run build`, Output `frontend/dist`. Add env `VITE_BACKEND_URL=https://your-backend.onrender.com`.
- **Backend (Render)**: Create a Python Web Service using `backend` as root directory.