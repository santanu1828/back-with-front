# OmniChat - Multilingual Chatbot Interface

A clean, responsive, and mobile-friendly front-end interface for chatbots, designed from the ground up to accept and render text seamlessly in **any language or script** (including Latin, Devanagari, Arabic, Hebrew, Cyrillic, Hanzi, Kanji, Hiragana, etc.).

---

## ✨ Features

- **Universal Script & Language Support**:
  - Incorporates `dir="auto"` on message bubbles and the input field for automatic Bidirectional (BiDi) script handling (RTL languages like Arabic, Hebrew, Urdu, and Persian render naturally from right to left).
  - Robust Unicode font stack prioritizing `Plus Jakarta Sans`, `Noto Sans`, and system unicode glyph fallbacks.
  - Safe CSS word-wrapping (`overflow-wrap: break-word; word-break: break-word;`) prevents long words or scripts without spaces (e.g., Chinese, Japanese, Thai) from breaking layout.
- **Visual Distinction & Alignment**:
  - User messages: Distinct primary accent color, aligned to the right.
  - Bot messages: Soft neutral background with avatar icon, aligned to the left.
- **Smooth Auto-Scrolling**:
  - Seamlessly keeps conversation in view as new messages and typing indicators appear.
- **Interactive UX**:
  - Animated bouncing typing indicator when waiting for bot replies.
  - Auto-resizing input textarea (grows as the user types, up to maximum height).
  - Quick-starter prompt pills in multiple languages for immediate testing.
  - Keyboard shortcuts: `Enter` to send, `Shift` + `Enter` for a new line.
  - Clear conversation button with confirmation.
- **Mobile-First & Responsive**:
  - Utilizes dynamic viewport units (`100dvh`) to prevent mobile keyboard and address-bar layout jitter.
  - Clean card layout on desktop, full-screen mobile app layout on phones.
- **Easy Backend Integration**:
  - Pluggable adapter function in `app.js` ready to connect to any REST API, WebSocket, or AI service (OpenAI, Gemini, Anthropic, Ollama, etc.).
  - Includes a built-in intelligent mock engine for immediate testing right out of the box without requiring a backend server.

---

## 🚀 Getting Started

### Local Development (Vite)
```bash
# Install dependencies
npm install

# Start local dev server with Hot Module Replacement (HMR)
npm run dev
```
Then open `http://localhost:3000` in your browser.

### Production Build & Preview
```bash
# Build optimized static bundle in dist/
npm run build

# Preview production build locally
npm run preview
```

---

## ⚡ Deploy to Vercel

OmniChat is built with **Vite** and configured for instant zero-configuration deployment on **Vercel**.

### Method A: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/santanu1828/project-1)

### Method B: Via Vercel Dashboard
1. Go to [vercel.com/new](https://vercel.com/new).
2. Sign in with GitHub and import **`santanu1828/project-1`**.
3. Vercel automatically detects the **Vite** framework preset:
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Click **Deploy**. Your site will be live instantly with a free `.vercel.app` domain and automatic SSL!

---

## 🔌 Backend Integration Guide

Connecting this front-end to your backend is as simple as configuring one line in `app.js`.

### 1. Configure the Endpoint in `app.js`

Open `app.js` and update `CONFIG.backendApiUrl`:

```javascript
const CONFIG = {
  backendApiUrl: 'http://localhost:8000/api/chat', // Your backend URL
  botName: 'OmniChat',
  simulatedLatencyMs: 900,
};
```

### 2. Sample Backend Implementations

#### Python (FastAPI)
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict

app = FastAPI()

# Allow CORS for front-end
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    user_msg = req.message
    
    # Process user_msg with your multilingual LLM (e.g. Gemini, OpenAI, or local model)
    bot_reply = f"Echoing in any language: {user_msg}"
    
    return {"reply": bot_reply}
```

#### Node.js (Express)
```javascript
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;

  // Process message with your AI/chatbot pipeline
  const botReply = `Response to: "${message}"`;

  res.json({ reply: botReply });
});

app.listen(8000, () => console.log('Chat backend running on port 8000'));
```

---

## 📁 Project Structure
 
```
project-1/
├── public/
│   └── favicon.svg       # Vector gradient bot icon
├── src/
│   ├── main.js           # Chat interface logic, auto-resize, backend connector
│   └── style.css         # Modern responsive styling, RTL/LTR rules, animations
├── index.html            # Vite HTML entry point
├── vite.config.js        # Vite bundler configuration
├── package.json          # Vite scripts and dependencies
├── vercel.json           # Vercel Vite deployment configuration
└── README.md             # Project documentation and guide
```
