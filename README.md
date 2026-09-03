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

## 🚀 How to Run

### Option 1: Direct Browser Launch
Simply double-click `index.html` or open it with your favorite web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local HTTP Server

**Using Python:**
```bash
# Python 3
python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

**Using Node.js (`npx serve`):**
```bash
npx serve .
```

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
project 1/
├── index.html        # Semantic HTML5 markup, header, chat window, input area
├── style.css         # Modern, responsive styles, animations, RTL/LTR rules
├── app.js            # UI logic, auto-resize, scrolling, backend connector
└── README.md         # Documentation and backend setup guide
```
