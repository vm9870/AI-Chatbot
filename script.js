const API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = "Enter API Key here";

const messagesEl = document.querySelector("#messages");
const userInput = document.querySelector("#userInput");
const chatForm = document.querySelector("#chatForm");
const sendBtn = document.querySelector("#sendBtn");
const clearBtn = document.querySelector("#clearBtn");
const themeBtn = document.querySelector("#themeBtn");

function appendMessage(role, text = "", typing = false) {
  const li = document.createElement("li");
  li.className = role === "assistant" ? "msg-assistant" : "msg-user";
  if (!typing) {
    li.textContent = text;
  }
  messagesEl.appendChild(li);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return li;
}

async function askOpenAI(prompt) {
  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful AI assistant." },
      { role: "user", content: prompt }
    ]
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

// 🔹 Typing animation
async function typeMessage(element, text, speed = 20) {
  for (let i = 0; i < text.length; i++) {
    element.textContent += text[i];
    element.scrollIntoView({ behavior: "smooth", block: "end" });
    await new Promise(resolve => setTimeout(resolve, speed));
  }
}

// 🔹 Send function
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage("user", text);
  userInput.value = "";
  sendBtn.disabled = true;
  sendBtn.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i>";

  try {
    // Show "AI is typing..."
    const typingIndicator = appendMessage("assistant", "💬 AI is typing...");
    
    const reply = await askOpenAI(text);

    // Replace indicator with empty bubble
    typingIndicator.textContent = "";
    
    // Animate typing reply
    await typeMessage(typingIndicator, reply, 15);

  } catch (err) {
    appendMessage("assistant", "⚠️ " + err.message);
  } finally {
    sendBtn.disabled = false;
    sendBtn.innerHTML = "<i class='fa-solid fa-paper-plane'></i>";
  }
}

// 🔹 Form submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});

// 🔹 Enter = Send , Shift+Enter = newline
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// 🔹 Clear Chat
clearBtn.addEventListener("click", () => {
  messagesEl.innerHTML = "";
});

// 🔹 Theme Toggle
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});
