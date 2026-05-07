// Floating DSA Chatbot Widget - Modern Support Assistant Style

(function () {
  // DOM Query Helper
  function $(sel, root = document) {
    return root.querySelector(sel);
  }

  // Message Element Creator
  function createMessageEl(text, role) {
    const wrap = document.createElement("div");
    wrap.className = `chat-msg ${role}`;
    
    const avatar = document.createElement("div");
    avatar.className = "chat-avatar";
    avatar.textContent = role === "user" ? "You" : "DSA";

    const body = document.createElement("div");
    body.className = "chat-bubble";

    // Handle HTML content for code blocks and formatting
    if (text.includes('<pre>') || text.includes('<code>') || text.includes('<strong>')) {
      body.innerHTML = text;
    } else {
      body.textContent = text;
    }

    wrap.appendChild(avatar);
    wrap.appendChild(body);
    return wrap;
  }

  // Typing Indicator Creator
  function createTypingIndicator() {
    const wrap = document.createElement("div");
    wrap.className = "chat-msg assistant typing";
    wrap.id = "typing-indicator";

    const avatar = document.createElement("div");
    avatar.className = "chat-avatar";
    avatar.textContent = "DSA";

    const body = document.createElement("div");
    body.className = "chat-bubble";
    body.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';

    wrap.appendChild(avatar);
    wrap.appendChild(body);
    return wrap;
  }

  // DOM Element Getters
  const getFloatingBtn = () => $("#chatbot-floating-button");
  const getWidget = () => $("#chatbot-widget");
  const getInput = () => $("#chat-input");
  const getSendBtn = () => $("#chat-send");
  const getLog = () => $("#chat-log");
  const getClearBtn = () => $("#chat-clear");
  const getCloseBtn = () => $("#chatbot-close-btn");

  // Widget State Management
  let isWidgetOpen = false;

  // Open Chatbot Widget
  function openChatbot() {
    const widget = getWidget();
    const floatingBtn = getFloatingBtn();
    
    if (!widget || !floatingBtn) return;

    isWidgetOpen = true;
    widget.classList.remove("chatbot-closed");
    widget.classList.add("chatbot-open");
    floatingBtn.style.display = "none";
    
    // Focus input after animation
    setTimeout(() => {
      const input = getInput();
      if (input) input.focus();
    }, 350);
  }

  // Close Chatbot Widget
  function closeChatbot() {
    const widget = getWidget();
    const floatingBtn = getFloatingBtn();
    
    if (!widget || !floatingBtn) return;

    isWidgetOpen = false;
    widget.classList.add("chatbot-closed");
    widget.classList.remove("chatbot-open");
    floatingBtn.style.display = "flex";
  }

  // Clear Chat History
  function clearChat() {
    const logEl = getLog();
    if (logEl) {
      logEl.innerHTML = '';
      const welcomeMsg = createMessageEl(
        "Hello! I'm your DSA tutor. Ask me about data structures, algorithms, complexities, and implementation details. Try: 'What is a binary search tree?' or 'How does quicksort work?'",
        "assistant"
      );
      logEl.appendChild(welcomeMsg);
      logEl.scrollTop = logEl.scrollHeight;
    }
  }

  // Send Message Handler
  async function sendMessage() {
    const inEl = getInput();
    const logEl = getLog();
    const btn = getSendBtn();
    
    if (!inEl || !logEl || !btn) return;

    const message = (inEl.value || "").trim();
    if (!message) return;

    // Remove any existing typing indicator
    const typingIndicator = $("#typing-indicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }

    // Add user message
    logEl.appendChild(createMessageEl(message, "user"));
    logEl.scrollTop = logEl.scrollHeight;

    // Clear input and disable button
    inEl.value = "";
    inEl.disabled = true;
    btn.disabled = true;

    // Show typing indicator
    const typingEl = createTypingIndicator();
    logEl.appendChild(typingEl);
    logEl.scrollTop = logEl.scrollHeight;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      const reply = data?.reply || data?.error || "Sorry, I couldn't process that. Try asking about arrays, linked lists, sorting, or searching.";

      // Remove typing indicator
      if (typingEl.parentNode) {
        typingEl.remove();
      }

      // Add bot response
      logEl.appendChild(createMessageEl(reply, "assistant"));
      logEl.scrollTop = logEl.scrollHeight;
    } catch (e) {
      // Remove typing indicator
      if (typingEl.parentNode) {
        typingEl.remove();
      }

      // Show error message
      logEl.appendChild(
        createMessageEl(
          "Network error. Please check your connection and try again.",
          "assistant"
        )
      );
      logEl.scrollTop = logEl.scrollHeight;
    } finally {
      inEl.disabled = false;
      btn.disabled = false;
      inEl.focus();
    }
  }

  // Initialize Widget on DOM Ready
  document.addEventListener("DOMContentLoaded", () => {
    const floatingBtn = getFloatingBtn();
    const widget = getWidget();
    const closeBtn = getCloseBtn();
    const input = getInput();
    const sendBtn = getSendBtn();
    const clearBtn = getClearBtn();
    const logEl = getLog();

    if (!floatingBtn || !widget) return;

    // Initialize welcome message
    if (logEl && logEl.children.length === 0) {
      clearChat();
    }

    // Floating button click - Open chatbot
    floatingBtn.addEventListener("click", () => {
      openChatbot();
    });

    // Close button click
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        closeChatbot();
      });
    }

    // Send button click
    if (sendBtn) {
      sendBtn.addEventListener("click", () => {
        sendMessage();
      });
    }

    // Input enter key
    if (input) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          sendMessage();
        }
      });
    }

    // Clear button click
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (confirm("Clear chat history?")) {
          clearChat();
        }
      });
    }

    // Close widget when clicking outside (optional)
    document.addEventListener("click", (e) => {
      const isClickInsideWidget = widget.contains(e.target);
      const isClickOnFloatingBtn = floatingBtn.contains(e.target);
      
      if (!isClickInsideWidget && !isClickOnFloatingBtn && isWidgetOpen) {
        // Optionally close on outside click - comment out if not desired
        // closeChatbot();
      }
    });
  });
})();

