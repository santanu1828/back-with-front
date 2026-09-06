import './style.css';

/**
 * OmniChat - Multilingual Chatbot Front-End
 * 
 * Features:
 * - Native multilingual & script support (LTR & RTL via dir="auto")
 * - Auto-resizing textarea with Enter-to-send (Shift+Enter for newline)
 * - Auto-scrolling chat history with smooth animation
 * - Animated typing indicator for pending bot responses
 * - Pluggable backend adapter (supports custom REST APIs, WebSockets, or built-in mock engine)
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. Configuration & Backend Connector
  // =========================================================================
  const CONFIG = {
    // Set to your actual backend API endpoint (e.g., 'http://localhost:8000/api/chat')
    // When null or empty, it uses the built-in intelligent mock response generator.
    backendApiUrl: '', 

    // Bot details
    botName: 'OmniChat',
    simulatedLatencyMs: 900, // Realistic response delay for natural UX
  };

  /**
   * BACKEND INTEGRATION ADAPTER
   * 
   * Connect this function to your real backend (Python FastAPI/Flask, Node/Express,
   * OpenAI/Gemini/Claude endpoints, etc.)
   *
   * @param {string} userMessage - The raw message input in any language
   * @param {Array<{role: string, content: string}>} history - Full conversation history
   * @returns {Promise<string>} - The bot's text reply
   */
  async function sendMessageToBackend(userMessage, history) {
    // If a real backend URL is configured, call it:
    if (CONFIG.backendApiUrl) {
      try {
        const response = await fetch(CONFIG.backendApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            history: history,
            timestamp: new Date().toISOString()
          }),
        });

        if (!response.ok) {
          throw new Error(`Server returned error status: ${response.status}`);
        }

        const data = await response.json();
        // Adjust according to your backend payload structure (e.g., data.reply or data.message)
        return data.reply || data.response || data.message || JSON.stringify(data);
      } catch (err) {
        console.error('Backend connection error:', err);
        return `âš ï¸ Connection error: Unable to reach the chat backend (${err.message}).`;
      }
    }

    // Otherwise, simulate a thoughtful multilingual backend response
    return await simulateMultilingualBackend(userMessage);
  }

  /**
   * Built-in Multilingual Demonstration Engine
   * Recognizes script families and patterns across diverse languages.
   */
  async function simulateMultilingualBackend(input) {
    await new Promise((resolve) => setTimeout(resolve, CONFIG.simulatedLatencyMs));

    const trimmed = input.trim().toLowerCase();

    // Arabic / RTL check
    if (/[\u0600-\u06FF\u0750-\u077F]/.test(input)) {
      return `Ù…Ø±Ø­Ø¨Ø§Ù‹ Ø¨Ùƒ! Ù„Ù‚Ø¯ Ø§Ø³ØªÙ„Ù…Øª Ø±Ø³Ø§Ù„ØªÙƒ Ø¨ÙƒÙ„ ÙˆØ¶ÙˆØ­: "${input}"\n\nØ£Ù†Ø§ Ø¬Ø§Ù‡Ø² Ù„Ù…Ø³Ø§Ø¹Ø¯ØªÙƒ ÙÙŠ Ø£ÙŠ Ø³Ø¤Ø§Ù„ Ø£Ùˆ Ù…ÙˆØ¶ÙˆØ¹ ØªØ±ØºØ¨ ÙÙŠ Ù…Ù†Ø§Ù‚Ø´ØªÙ‡.`;
    }

    // Hebrew / RTL check
    if (/[\u0590-\u05FF]/.test(input)) {
      return `×©×œ×•×! ×§×™×‘×œ×ª×™ ××ª ×”×”×•×“×¢×” ×©×œ×š: "${input}". ××™×š ××•×›×œ ×œ×¢×–×•×¨ ×œ×š ×”×™×•×?`;
    }

    // Hindi / Devanagari script check
    if (/[\u0900-\u097F]/.test(input)) {
      return `à¤¨à¤®à¤¸à¥à¤¤à¥‡! à¤®à¥à¤à¥‡ à¤†à¤ªà¤•à¤¾ à¤¸à¤‚à¤¦à¥‡à¤¶ à¤ªà¥à¤°à¤¾à¤ªà¥à¤¤ à¤¹à¥à¤†: "${input}"à¥¤\n\nà¤®à¥ˆà¤‚ à¤†à¤ªà¤•à¥€ à¤•à¤¿à¤¸ à¤ªà¥à¤°à¤•à¤¾à¤° à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾ à¤•à¤° à¤¸à¤•à¤¤à¤¾ à¤¹à¥‚à¤?`;
    }

    // Chinese script check
    if (/[\u4E00-\u9FFF]/.test(input)) {
      return `ä½ å¥½ï¼æˆ‘å·²æ”¶åˆ°æ‚¨çš„æ¶ˆæ¯ï¼šâ€œ${input}â€ã€‚\n\nè¯·é—®ä»Šå¤©æœ‰ä»€ä¹ˆæˆ‘å¯ä»¥ä¸ºæ‚¨æ•ˆåŠ³çš„å—ï¼Ÿ`;
    }

    // Japanese (Hiragana, Katakana, Kanji) check
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(input)) {
      return `ã“ã‚“ã«ã¡ã¯ï¼ãƒ¡ãƒƒã‚»ãƒ¼ã‚¸ã‚’å—ã‘å–ã‚Šã¾ã—ãŸï¼šã€Œ${input}ã€\n\nä½•ã‹ãŠæ‰‹ä¼ã„ã§ãã‚‹ã“ã¨ãŒã‚ã‚Œã°ã€ãŠæ°—è»½ã«ã©ã†ãžï¼`;
    }

    // Russian / Cyrillic script check
    if (/[\u0400-\u04FF]/.test(input)) {
      return `Ð—Ð´Ñ€Ð°Ð²ÑÑ‚Ð²ÑƒÐ¹Ñ‚Ðµ! Ð¯ Ð¿Ð¾Ð»ÑƒÑ‡Ð¸Ð» Ð²Ð°ÑˆÐµ ÑÐ¾Ð¾Ð±Ñ‰ÐµÐ½Ð¸Ðµ: "${input}". Ð§ÐµÐ¼ Ñ Ð¼Ð¾Ð³Ñƒ Ð²Ð°Ð¼ Ð¿Ð¾Ð¼Ð¾Ñ‡ÑŒ ÑÐµÐ³Ð¾Ð´Ð½Ñ?`;
    }

    // Spanish / Portuguese greetings
    if (trimmed.includes('hola') || trimmed.includes('cÃ³mo estÃ¡s') || trimmed.includes('ola') || trimmed.includes('obrigado')) {
      return `Â¡Hola! He recibido tu mensaje: "${input}".\n\nEstoy aquÃ­ para ayudarte con cualquier consulta o tema. Â¿En quÃ© podemos trabajar hoy?`;
    }

    // French greetings
    if (trimmed.includes('bonjour') || trimmed.includes('salut') || trimmed.includes('merci') || trimmed.includes('comment allez')) {
      return `Bonjour ! J'ai bien reÃ§u votre message : "${input}".\n\nComment puis-je vous assister aujourd'hui ?`;
    }

    // German greetings
    if (trimmed.includes('hallo') || trimmed.includes('guten tag') || trimmed.includes('danke')) {
      return `Hallo! Ich habe Ihre Nachricht erhalten: "${input}".\n\nWie kann ich Ihnen heute behilflich sein?`;
    }

    // Bengali greetings
    if (/[\u0980-\u09FF]/.test(input)) {
      return `à¦¨à¦®à¦¸à§à¦•à¦¾à¦°! à¦†à¦®à¦¿ à¦†à¦ªà¦¨à¦¾à¦° à¦¬à¦¾à¦°à§à¦¤à¦¾ à¦ªà§‡à¦¯à¦¼à§‡à¦›à¦¿: "${input}"à¥¤\n\nà¦†à¦®à¦¿ à¦†à¦ªà¦¨à¦¾à¦•à§‡ à¦•à§€à¦­à¦¾à¦¬à§‡ à¦¸à¦¾à¦¹à¦¾à¦¯à§à¦¯ à¦•à¦°à¦¤à§‡ à¦ªà¦¾à¦°à¦¿?`;
    }

    // Default English / Universal response
    return `Thank you for your message: "${input}"\n\nI can process multilingual inquiries across any script or dialect. How else can I assist you?`;
  }

  // =========================================================================
  // 2. DOM Elements & State
  // =========================================================================
  const chatWindow = document.getElementById('chat-window');
  const messagesContainer = document.getElementById('messages-container');
  const chatForm = document.getElementById('chat-form');
  const messageInput = document.getElementById('message-input');
  const sendBtn = document.getElementById('send-btn');
  const typingIndicator = document.getElementById('typing-indicator');
  const clearChatBtn = document.getElementById('clear-chat-btn');
  const quickPrompts = document.getElementById('quick-prompts');

  // Conversation history in memory
  let conversationHistory = [];
  let isAwaitingResponse = false;

  // =========================================================================
  // 3. UI Helpers
  // =========================================================================

  /**
   * Format current time as a localized compact string (e.g., "10:45 AM")
   */
  function getCurrentTimeString() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Automatically scroll the chat window to the very bottom
   * @param {boolean} smooth - Whether to animate smoothly
   */
  function scrollToBottom(smooth = true) {
    chatWindow.scrollTo({
      top: chatWindow.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }

  /**
   * Create an SVG avatar node for bot messages
   */
  function createBotAvatarElement() {
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect width="16" height="12" x="4" y="8" rx="2"></rect>
        <path d="M12 8V4H8"></path>
        <path d="M9 13v2"></path>
        <path d="M15 13v2"></path>
      </svg>
    `;
    return avatar;
  }

  /**
   * Append a message bubble to the chat container
   * 
   * @param {string} text - Message text
   * @param {'user' | 'bot'} sender - Sender type
   */
  function appendMessage(text, sender) {
    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper ${sender}`;

    // Bot messages include an avatar icon on the left
    if (sender === 'bot') {
      wrapper.appendChild(createBotAvatarElement());
    }

    const bubbleGroup = document.createElement('div');
    bubbleGroup.className = 'message-bubble-group';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    // Crucial for multilingual support:
    // dir="auto" makes the browser automatically detect RTL or LTR script per paragraph
    bubble.setAttribute('dir', 'auto');
    bubble.textContent = text; // Safe against XSS

    const timestamp = document.createElement('span');
    timestamp.className = 'message-timestamp';
    timestamp.textContent = getCurrentTimeString();

    bubbleGroup.appendChild(bubble);
    bubbleGroup.appendChild(timestamp);
    wrapper.appendChild(bubbleGroup);

    // Hide quick prompts once conversation starts
    if (quickPrompts && quickPrompts.parentNode) {
      quickPrompts.style.display = 'none';
    }

    messagesContainer.appendChild(wrapper);
    scrollToBottom(true);

    // Update in-memory history
    conversationHistory.push({
      role: sender === 'user' ? 'user' : 'assistant',
      content: text,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Toggle the typing indicator display and auto-scroll
   */
  function showTypingIndicator(visible) {
    isAwaitingResponse = visible;
    if (visible) {
      typingIndicator.style.display = 'flex';
      scrollToBottom(true);
    } else {
      typingIndicator.style.display = 'none';
    }
  }

  /**
   * Adjust textarea height dynamically to content
   */
  function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    const newHeight = Math.min(messageInput.scrollHeight, 140);
    messageInput.style.height = `${newHeight}px`;

    // Enable/disable send button based on trimmed content
    const hasText = messageInput.value.trim().length > 0;
    sendBtn.disabled = !hasText || isAwaitingResponse;
  }

  // =========================================================================
  // 4. Action Handlers
  // =========================================================================

  /**
   * Handle user submitting a message
   */
  async function handleSendMessage() {
    const rawText = messageInput.value;
    const trimmedText = rawText.trim();

    if (!trimmedText || isAwaitingResponse) {
      return;
    }

    // 1. Render user message
    appendMessage(trimmedText, 'user');

    // 2. Reset input field
    messageInput.value = '';
    autoResizeTextarea();
    messageInput.focus();

    // 3. Show typing indicator
    showTypingIndicator(true);

    try {
      // 4. Fetch response from backend / mock engine
      const botResponse = await sendMessageToBackend(trimmedText, conversationHistory);
      
      // 5. Hide typing indicator & render bot message
      showTypingIndicator(false);
      appendMessage(botResponse, 'bot');
    } catch (err) {
      console.error('Error in message flow:', err);
      showTypingIndicator(false);
      appendMessage('Sorry, an unexpected error occurred while processing your message. Please try again.', 'bot');
    }
  }

  /**
   * Reset conversation to clean slate
   */
  function clearConversation() {
    if (conversationHistory.length === 0) return;

    if (confirm('Clear this chat conversation?')) {
      // Retain only the initial welcome message
      conversationHistory = [];
      const firstWelcome = messagesContainer.querySelector('[data-id="welcome-msg"]');
      
      // Clear container
      messagesContainer.innerHTML = '';

      if (firstWelcome) {
        messagesContainer.appendChild(firstWelcome);
      }

      if (quickPrompts) {
        quickPrompts.style.display = 'flex';
        messagesContainer.appendChild(quickPrompts);
      }

      messageInput.value = '';
      autoResizeTextarea();
      scrollToBottom(false);
    }
  }

  // =========================================================================
  // 5. Event Listeners & Initialization
  // =========================================================================

  // Textarea input event for dynamic auto-grow and validation
  messageInput.addEventListener('input', autoResizeTextarea);

  // Keyboard shortcut: Enter sends, Shift+Enter makes newline
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  // Form submission via send button
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSendMessage();
  });

  // Clear chat button
  clearChatBtn.addEventListener('click', clearConversation);

  // Quick prompt sample chips
  document.querySelectorAll('.prompt-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const promptText = chip.getAttribute('data-prompt');
      if (promptText) {
        messageInput.value = promptText;
        autoResizeTextarea();
        handleSendMessage();
      }
    });
  });

  // Initial timestamp for welcome message
  const welcomeTimestamp = document.getElementById('welcome-timestamp');
  if (welcomeTimestamp) {
    welcomeTimestamp.textContent = getCurrentTimeString();
  }

  // Initial focus on input
  messageInput.focus();

  // Scroll to bottom on load
  scrollToBottom(false);
})();
