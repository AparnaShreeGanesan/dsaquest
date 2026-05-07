/*
====================================================================================
JAVASCRIPT DOCUMENTATION - CHATBOT WIDGET
====================================================================================
This JavaScript file handles the floating chatbot widget functionality.
Controls opening/closing the chat, sending/receiving messages, and animations.
Explains every function, event handler, and DOM manipulation.
====================================================================================
*/

/*
(function () {
  ...
})();

Immediately Invoked Function Expression (IIFE)
( function() { ... } ) = Define anonymous function
() = Call the function immediately
; = Semicolon to end statement

Creates private scope for variables
Prevents polluting global window scope
All variables inside are local to this function
*/
(function () {

  /*
  ============================================================================
  SECTION 1: HELPER FUNCTIONS
  ============================================================================
  Utility functions used throughout the chatbot code.
  */

  /*
  function $(sel, root = document) { ... }
  function = Define function
  $ = Function name (shorthand for querySelector, like jQuery)
  sel = CSS selector string (e.g., ".class-name", "#id")
  root = DOM element to search in (default: document)
    - = Default parameter (used if not provided)
    - document = Global browser object (entire page)
  
  Returns: First element matching selector
  Shorthand for document.querySelector
  */
  function $(sel, root = document) {
    /*
    return root.querySelector(sel);
    
    root = Element to search in (usually document)
    .querySelector = Method to find first matching element
    sel = CSS selector to search for
    
    Returns the first DOM element matching selector
    */
    return root.querySelector(sel);
  }

  /*
  function createMessageEl(text, role) { ... }
  createMessageEl = Function that creates message HTML element
  text = Message text content
  role = "user" or "assistant" (determines styling)
  
  Returns: DOM element representing a chat message
  */
  function createMessageEl(text, role) {
    /*
    const wrap = document.createElement("div");
    
    document.createElement = Create new HTML element
    "div" = Element type (container)
    wrap = Variable holding the new div element
    
    Creates empty <div> element
    */
    const wrap = document.createElement("div");
    
    /*
    wrap.className = `chat-msg ${role}`;
    
    wrap.className = Assign CSS classes
    `chat-msg ${role}` = Template literal with string interpolation
      - chat-msg = Base class for all messages
      - ${role} = Variable inserted (e.g., "user" or "assistant")
      - Result: "chat-msg user" or "chat-msg assistant"
    
    Sets classes for styling (different colors for user/bot)
    */
    wrap.className = `chat-msg ${role}`;
    
    /*
    const avatar = document.createElement("div");
    avatar.className = "chat-avatar";
    avatar.textContent = role === "user" ? "You" : "DSA";
    
    Creates avatar element
    role === "user" ? "You" : "DSA" = Ternary operator
      - role === "user" = Check if role equals "user"
      - ? "You" = If true, use "You"
      - : "DSA" = If false, use "DSA"
    
    Shows "You" for user messages, "DSA" for bot
    */
    const avatar = document.createElement("div");
    avatar.className = "chat-avatar";
    avatar.textContent = role === "user" ? "You" : "DSA";

    /*
    const body = document.createElement("div");
    body.className = "chat-bubble";
    
    Creates message bubble element
    */
    const body = document.createElement("div");
    body.className = "chat-bubble";

    /*
    if (text.includes('<pre>') || text.includes('<code>') || text.includes('<strong>')) {
      body.innerHTML = text;
    } else {
      body.textContent = text;
    }
    
    if (...) = Conditional statement
    text.includes(...) = String method checking if text contains substring
      - '<pre>' = HTML pre tag for code blocks
      - '<code>' = HTML code tag
      - '<strong>' = HTML strong tag
    || = OR operator (true if any condition is true)
    
    .innerHTML = Set as HTML (parses HTML tags)
    .textContent = Set as plain text (ignores HTML tags)
    
    If message contains HTML, parse it
    If plain text, display as-is (safer against injection)
    */
    if (text.includes('<pre>') || text.includes('<code>') || text.includes('<strong>')) {
      body.innerHTML = text;
    } else {
      body.textContent = text;
    }

    /*
    wrap.appendChild(avatar);
    wrap.appendChild(body);
    
    appendChild = Add element as child to another element
    wrap = Parent container
    avatar, body = Child elements
    
    Adds avatar and message bubble as children of wrap
    Structure: wrap > [avatar, body]
    */
    wrap.appendChild(avatar);
    wrap.appendChild(body);
    
    /*
    return wrap;
    
    return = Exit function and return value
    wrap = The created message element
    
    Calling code gets the complete message element
    */
    return wrap;
  }

  /*
  function createTypingIndicator() { ... }
  createTypingIndicator = Function creating "bot is typing" indicator
  Creates animated three-dot animation showing bot is thinking
  */
  function createTypingIndicator() {
    /*
    const wrap = document.createElement("div");
    wrap.className = "chat-msg assistant typing";
    wrap.id = "typing-indicator";
    
    Creates wrapper div with classes
    id = "typing-indicator" = Unique ID for finding later
    */
    const wrap = document.createElement("div");
    wrap.className = "chat-msg assistant typing";
    wrap.id = "typing-indicator";

    /*
    Create avatar element (same as regular messages)
    */
    const avatar = document.createElement("div");
    avatar.className = "chat-avatar";
    avatar.textContent = "DSA";

    /*
    Create message bubble with animated dots
    */
    const body = document.createElement("div");
    body.className = "chat-bubble";
    body.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    /*
    body.innerHTML = HTML string
    '<div class="typing-dots">...' = Creates three animated dots
    Each <span></span> = One dot (CSS animates them)
    */

    /*
    Assemble the typing indicator
    */
    wrap.appendChild(avatar);
    wrap.appendChild(body);
    return wrap;
  }

  /*
  ============================================================================
  SECTION 2: DOM ELEMENT GETTER FUNCTIONS
  ============================================================================
  Simple functions that return frequently-used DOM elements.
  Avoids repeating querySelector calls throughout code.
  */

  /*
  const getFloatingBtn = () => $("#chatbot-floating-button");
  const = Constant variable
  () => ... = Arrow function (anonymous short function)
    - () = No parameters
    - => = Arrow function syntax
  
  Each function returns a specific DOM element
  Using $ helper function to select by ID or class
  */
  const getFloatingBtn = () => $("#chatbot-floating-button");
  const getWidget = () => $("#chatbot-widget");
  const getInput = () => $("#chat-input");
  const getSendBtn = () => $("#chat-send");
  const getLog = () => $("#chat-log");
  const getClearBtn = () => $("#chat-clear");
  const getCloseBtn = () => $("#chatbot-close-btn");

  /*
  ============================================================================
  SECTION 3: WIDGET STATE
  ============================================================================
  Variable tracking whether chatbot is open or closed.
  */

  /*
  let isWidgetOpen = false;
  
  let = Variable that can be reassigned
  isWidgetOpen = Boolean tracking widget state
  false = Initially closed (not visible)
  
  This state determines which CSS classes to apply
  */
  let isWidgetOpen = false;

  /*
  ============================================================================
  SECTION 4: MAIN CHATBOT FUNCTIONS
  ============================================================================
  Key functions for opening, closing, and managing the chatbot.
  */

  /*
  function openChatbot() { ... }
  openChatbot = Opens/shows the chatbot widget
  Called when floating button is clicked
  */
  function openChatbot() {
    /*
    const widget = getWidget();
    const floatingBtn = getFloatingBtn();
    
    getWidget/getFloatingBtn = Get DOM elements
    const = Store in constants for use below
    */
    const widget = getWidget();
    const floatingBtn = getFloatingBtn();
    
    /*
    if (!widget || !floatingBtn) return;
    
    Guard clause: exit if elements don't exist
    ! = NOT operator
    && = AND operator (both must be true to continue)
    
    Prevents error if elements missing
    */
    if (!widget || !floatingBtn) return;

    /*
    isWidgetOpen = true;
    
    Update state variable
    true = Widget is now open
    */
    isWidgetOpen = true;
    
    /*
    widget.classList.remove("chatbot-closed");
    widget.classList.add("chatbot-open");
    
    classList = List of CSS classes on element
    .remove(...) = Remove class (CSS shows closed state)
    .add(...) = Add class (CSS shows open state)
    
    Changes CSS classes to show widget
    CSS animations handle the visual effect
    */
    widget.classList.remove("chatbot-closed");
    widget.classList.add("chatbot-open");
    
    /*
    floatingBtn.style.display = "none";
    
    floatingBtn = The floating button element
    .style = DOM element's inline CSS styles
    .display = CSS display property
    = "none" = Hide the floating button
    
    Hides floating button when widget open
    (Shows it again when widget closes)
    */
    floatingBtn.style.display = "none";
    
    /*
    setTimeout(() => {
      const input = getInput();
      if (input) input.focus();
    }, 350);
    
    setTimeout = Schedule function to run after delay
    () => { ... } = Arrow function
    350 = Milliseconds to wait (350ms = 0.35s)
    
    Waits for animation to complete, then focuses input
    .focus() = Browser method to focus input field
    User can immediately type in the input
    */
    setTimeout(() => {
      const input = getInput();
      if (input) input.focus();
    }, 350);
  }

  /*
  function closeChatbot() { ... }
  closeChatbot = Closes/hides the chatbot widget
  Opposite of openChatbot
  */
  function closeChatbot() {
    /*
    Same pattern as openChatbot, but reversed
    */
    const widget = getWidget();
    const floatingBtn = getFloatingBtn();
    
    if (!widget || !floatingBtn) return;

    /*
    isWidgetOpen = false;
    
    Update state (now closed)
    */
    isWidgetOpen = false;
    
    /*
    Remove open class, add closed class
    */
    widget.classList.add("chatbot-closed");
    widget.classList.remove("chatbot-open");
    
    /*
    Show floating button again
    */
    floatingBtn.style.display = "flex";
    /*
    display: "flex" = Show button in flex layout
    (flex layout was set in CSS for floating button)
    */
  }

  /*
  function clearChat() { ... }
  clearChat = Clear all messages from chat history
  Reset to welcome message
  */
  function clearChat() {
    /*
    const logEl = getLog();
    
    Get the message log container
    */
    const logEl = getLog();
    
    /*
    if (logEl) { ... }
    
    Guard: only proceed if log element exists
    */
    if (logEl) {
      /*
      logEl.innerHTML = '';
      
      Clear all HTML content
      Removes all messages from display
      */
      logEl.innerHTML = '';
      
      /*
      const welcomeMsg = createMessageEl(
        "Hello! I'm your DSA tutor. ...",
        "assistant"
      );
      
      Create welcome message
      createMessageEl = Function defined earlier
      "Hello!..." = Welcome text
      "assistant" = Role (shows as "DSA")
      */
      const welcomeMsg = createMessageEl(
        "Hello! I'm your DSA tutor. Ask me about data structures, algorithms, complexities, and implementation details. Try: 'What is a binary search tree?' or 'How does quicksort work?'",
        "assistant"
      );
      
      /*
      logEl.appendChild(welcomeMsg);
      
      Add welcome message to chat
      */
      logEl.appendChild(welcomeMsg);
      
      /*
      logEl.scrollTop = logEl.scrollHeight;
      
      scrollTop = Scroll position in element
      scrollHeight = Total height of scrollable content
      Setting them equal = Scroll to bottom
      
      Automatically scrolls to latest message
      */
      logEl.scrollTop = logEl.scrollHeight;
    }
  }

  /*
  ============================================================================
  SECTION 5: MESSAGE SENDING
  ============================================================================
  Functions for sending user messages and receiving responses.
  */

  /*
  async function sendMessage() { ... }
  async = Function can use await (wait for promises)
  sendMessage = Send message to chatbot and get response
  */
  async function sendMessage() {
    /*
    Get DOM elements
    */
    const inEl = getInput();
    const logEl = getLog();
    const btn = getSendBtn();
    
    if (!inEl || !logEl || !btn) return;

    /*
    const message = (inEl.value || "").trim();
    
    inEl.value = Text content of input field
    || "" = OR empty string (if value is falsy)
    .trim() = Remove whitespace from both ends
    message = The user's message
    
    Gets user input and removes extra spaces
    */
    const message = (inEl.value || "").trim();
    
    /*
    if (!message) return;
    
    Guard: don't send empty messages
    */
    if (!message) return;

    /*
    const typingIndicator = $("#typing-indicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }
    
    Remove any existing typing indicator
    .remove() = Delete element from DOM
    
    If there's an old typing indicator from previous message, remove it
    */
    const typingIndicator = $("#typing-indicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }

    /*
    logEl.appendChild(createMessageEl(message, "user"));
    logEl.scrollTop = logEl.scrollHeight;
    
    Add user's message to chat log
    createMessageEl(...) = Create message element
    appendChild = Add to log
    Scroll to bottom
    */
    logEl.appendChild(createMessageEl(message, "user"));
    logEl.scrollTop = logEl.scrollHeight;

    /*
    Clear input field and disable button
    */
    inEl.value = "";
    inEl.disabled = true;
    btn.disabled = true;

    /*
    Show typing indicator (bot is responding)
    */
    const typingEl = createTypingIndicator();
    logEl.appendChild(typingEl);
    logEl.scrollTop = logEl.scrollHeight;

    /*
    try { ... } catch (e) { ... }
    try = Code that might fail
    catch = Handle error
    */
    try {
      /*
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      
      fetch = Send HTTP request
      await = Wait for response
      "/api/chat" = API endpoint (backend route)
      method: "POST" = Send data to server
      headers = HTTP metadata
      body = Request data (message as JSON)
      
      Sends message to backend chatbot API
      */
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      /*
      const data = await res.json();
      
      res.json() = Parse response as JSON
      await = Wait for parsing
      data = Response object with reply
      */
      const data = await res.json();
      
      /*
      const reply = data?.reply || data?.error || "Sorry, I couldn't...";
      
      data?.reply = Get reply field (optional chaining with ?.)
      || ... = OR fallback to error message or default message
      reply = The bot's response text
      
      Gets bot response, with fallbacks if missing
      */
      const reply = data?.reply || data?.error || "Sorry, I couldn't process that. Try asking about arrays, linked lists, sorting, or searching.";

      /*
      Remove typing indicator
      */
      if (typingEl.parentNode) {
        typingEl.remove();
      }

      /*
      Add bot's response to chat
      */
      logEl.appendChild(createMessageEl(reply, "assistant"));
      logEl.scrollTop = logEl.scrollHeight;
    } catch (e) {
      /*
      catch block: Handle fetch/network errors
      */
      if (typingEl.parentNode) {
        typingEl.remove();
      }

      /*
      Show error message
      */
      logEl.appendChild(
        createMessageEl(
          "Network error. Please check your connection and try again.",
          "assistant"
        )
      );
      logEl.scrollTop = logEl.scrollHeight;
    } finally {
      /*
      finally = Code that runs whether try/catch succeeded or failed
      Executes after try or catch block
      */
      inEl.disabled = false;
      btn.disabled = false;
      inEl.focus();
      /*
      Re-enable input and button, focus input for next message
      */
    }
  }

  /*
  ============================================================================
  SECTION 6: EVENT LISTENER INITIALIZATION
  ============================================================================
  Attach functions to HTML events.
  Runs when page loads (DOM Ready).
  */

  /*
  document.addEventListener("DOMContentLoaded", () => {
    ...
  });
  
  document = Global browser object
  .addEventListener = Register event handler
  "DOMContentLoaded" = Event (fires when HTML fully loaded)
  () => { ... } = Arrow function to run
  
  Ensures HTML elements exist before we try to use them
  Code inside runs once on page load
  */
  document.addEventListener("DOMContentLoaded", () => {
    /*
    Get all needed DOM elements
    */
    const floatingBtn = getFloatingBtn();
    const widget = getWidget();
    const closeBtn = getCloseBtn();
    const input = getInput();
    const sendBtn = getSendBtn();
    const clearBtn = getClearBtn();
    const logEl = getLog();

    /*
    Guard: exit if critical elements missing
    */
    if (!floatingBtn || !widget) return;

    /*
    Initialize welcome message
    */
    if (logEl && logEl.children.length === 0) {
      clearChat();
    }

    /*
    ===== EVENT LISTENER 1: Floating Button Click =====
    */
    /*
    floatingBtn.addEventListener("click", () => {
      openChatbot();
    });
    
    floatingBtn = Floating button element
    .addEventListener = Register event handler
    "click" = Event type (mouse click)
    () => openChatbot() = Function to call on click
    
    When user clicks floating button, open chatbot
    */
    floatingBtn.addEventListener("click", () => {
      openChatbot();
    });

    /*
    ===== EVENT LISTENER 2: Close Button =====
    */
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        closeChatbot();
      });
    }

    /*
    ===== EVENT LISTENER 3: Send Button Click =====
    */
    if (sendBtn) {
      sendBtn.addEventListener("click", () => {
        sendMessage();
      });
    }

    /*
    ===== EVENT LISTENER 4: Input Enter Key =====
    */
    if (input) {
      input.addEventListener("keydown", (e) => {
        /*
        keydown = Event (key is pressed down)
        (e) = Event object with information about the key
        e.key = Which key was pressed ("Enter", "a", "A", etc.)
        */
        if (e.key === "Enter") {
          /*
          e.preventDefault() = Prevent default behavior
          (normally Enter in input submits form)
          */
          e.preventDefault();
          /*
          Send message instead of form submission
          */
          sendMessage();
        }
      });
    }

    /*
    ===== EVENT LISTENER 5: Clear Button =====
    */
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        /*
        confirm = Browser dialog asking user to confirm
        Returns true if user clicks OK, false if Cancel
        */
        if (confirm("Clear chat history?")) {
          clearChat();
        }
      });
    }

    /*
    ===== EVENT LISTENER 6: Close on Outside Click (Optional) =====
    */
    document.addEventListener("click", (e) => {
      /*
      e = Event object
      e.target = Element that was clicked
      
      This listener checks if click was outside widget
      */
      const isClickInsideWidget = widget.contains(e.target);
      /*
      widget.contains = Check if element is inside widget
      true if clicked inside, false if outside
      */
      
      const isClickOnFloatingBtn = floatingBtn.contains(e.target);
      /*
      Check if click was on floating button
      */
      
      /*
      if (!isClickInsideWidget && !isClickOnFloatingBtn && isWidgetOpen) {
        // closeChatbot();
      }
      
      Commented out: Don't close on outside click
      ! = NOT operator
      && = AND operator
      
      Would close widget if user clicks outside
      Currently disabled (commented) as app doesn't want this behavior
      */
      if (!isClickInsideWidget && !isClickOnFloatingBtn && isWidgetOpen) {
        // closeChatbot();
      }
    });
  });

})();
/*
End of IIFE
All variables are scoped to function
Doesn't pollute global window object
Prevents naming conflicts with other scripts
*/

/*
====================================================================================
SUMMARY OF CHATBOT.JS
====================================================================================

STRUCTURE:
1. IIFE (Immediately Invoked Function Expression) - Creates private scope
2. Helper functions - Reusable utility functions
3. Getter functions - Simple selectors for frequently-used elements
4. State management - isWidgetOpen boolean
5. Main functions - Open, close, clear, send
6. Event listeners - Attach handlers on DOMContentLoaded

KEY FEATURES:
1. Floating button in bottom-right corner
2. Opens animated chat widget
3. Takes user input and sends to backend
4. Displays bot responses
5. Shows typing indicator while waiting
6. Manages message history
7. Clear chat feature

EVENT HANDLING:
1. Click floating button -> open chatbot
2. Click close button -> close chatbot
3. Click send button -> send message
4. Press Enter in input -> send message
5. Click clear button -> clear history

DOM MANIPULATION:
1. createElement - Create new elements
2. appendChild - Add elements to DOM
3. classList.add/remove - Manage CSS classes
4. addEventListener - Register event handlers
5. querySelector - Find elements
6. innerHTML/textContent - Set content

ASYNC PATTERNS:
1. async function - Can use await
2. fetch - Send HTTP request
3. await - Wait for promise to resolve
4. try/catch/finally - Error handling
5. JSON.stringify - Convert to JSON
6. .json() - Parse response JSON

JAVASCRIPT CONCEPTS:
1. Arrow functions: () => {}
2. Template literals: `string ${variable}`
3. Optional chaining: object?.property
4. Nullish coalescing: value || fallback
5. Ternary operator: condition ? true : false
6. Spread operator: ...array
7. Async/await: Modern promise handling
8. Event objects: event.preventDefault(), event.target
9. DOM methods: querySelector, appendChild, classList
10. Data flow: User input -> API call -> Bot response -> Display

====================================================================================
*/
