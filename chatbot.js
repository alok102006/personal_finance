// Frontend JavaScript with finance topic filtering
async function sendMessage() {
    const userInput = document.getElementById("user-input");
    const message = userInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addUserMessage(message);
    
    // Clear input field
    userInput.value = "";
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
      // Send request to server
      const response = await fetch("http://localhost:5000/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: message
        }),
      });
      
      // Remove typing indicator
      removeTypingIndicator();
      
      if (!response.ok) {
        throw new Error('Server error: ' + response.status);
      }
      
      const data = await response.json();
      
      // Add bot response
      addBotMessage(data.reply);
    } catch (error) {
      // Remove typing indicator
      removeTypingIndicator();
      
      // Show error message
      addBotMessage("Sorry, I'm having trouble connecting to the server. Please try again later.");
      console.error("Error:", error);
    }
    
    // Scroll to the bottom
    scrollToBottom();
  }
  
  function addUserMessage(message) {
    const chatBox = document.getElementById("chat-box");
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", "user-message");
    messageElement.innerHTML = `${message} <div class="timestamp">${getCurrentTime()}</div>`;
    chatBox.appendChild(messageElement);
    scrollToBottom();
  }
  
  function addBotMessage(message) {
    const chatBox = document.getElementById("chat-box");
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", "bot-message");
    messageElement.innerHTML = `${message} <div class="timestamp">${getCurrentTime()}</div>`;
    chatBox.appendChild(messageElement);
    scrollToBottom();
  }
  
  function showTypingIndicator() {
    const chatBox = document.getElementById("chat-box");
    const typingIndicator = document.createElement("div");
    typingIndicator.classList.add("typing-indicator");
    typingIndicator.id = "typing-indicator";
    typingIndicator.innerHTML = `<span></span> <span></span> <span></span>`;
    chatBox.appendChild(typingIndicator);
    scrollToBottom();
  }
  
  function removeTypingIndicator() {
    const typingIndicator = document.getElementById("typing-indicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
  
  function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  function scrollToBottom() {
    const chatBox = document.getElementById("chat-box");
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  
  // Add event listener for the Enter key
  document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
    
    // Add a welcome message
    setTimeout(() => {
      addBotMessage("Hello! I'm your personal finance assistant. You can ask me questions about budgeting, investing, saving, and other financial topics.");
    }, 500);
  });