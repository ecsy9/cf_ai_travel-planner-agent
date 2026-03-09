const chatContainer = document.getElementById("chat-container");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Unique session ID per browser — gives each user their own Durable Object instance
let sessionId = localStorage.getItem("travel-session-id");
if (!sessionId) {
  sessionId = crypto.randomUUID();
  localStorage.setItem("travel-session-id", sessionId);
}

let controller = null;

function renderMarkdown(text) {
  // Escape HTML first
  let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Bold: **text**
  html = html.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  // Bullet lines: lines starting with * or -
  html = html.replace(/^[*-] (.+)/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");
  return html;
}

function addMessage(role, text = "") {
  const msg = document.createElement("div");
  msg.className = `message ${role}`;
  if (role === "assistant") {
    msg.innerHTML = renderMarkdown(text);
  } else {
    msg.textContent = text;
  }
  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  return msg;
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  addMessage("user", text);
  input.value = "";
  sendBtn.disabled = true;

  if (controller) controller.abort();
  controller = new AbortController();

  addMessage("assistant", "");
  const streamTarget = chatContainer.lastChild;
  let accumulated = "";

  try {
    const response = await fetch(`/agents/travel-planner-agent/${sessionId}`, {
      method: "POST",
      body: JSON.stringify({ messages: [{ role: "user", content: text }] }),
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE Parser: Split events, extract content deltas
      const events = buffer.split("\n\n");
      for (let i = 0; i < events.length - 1; i++) {
        const event = events[i].trim();
        if (event.startsWith("data: ") && event !== "data: [DONE]") {
          try {
            const data = JSON.parse(event.slice(6));
            if (data.choices?.[0]?.delta?.content) {
              accumulated += data.choices[0].delta.content;
              streamTarget.innerHTML = renderMarkdown(accumulated);
            }
          } catch (e) {
            console.warn("SSE Parse Error:", e);
          }
        }
      }
      buffer = events[events.length - 1]; // Carry incomplete event
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  } catch (err) {
    if (err.name !== "AbortError") {
      console.error("Stream Error:", err);
      streamTarget.textContent = "⚠️ Oops—couldn't fetch your travel plan. Try again!";
    }
  } finally {
    sendBtn.disabled = false;
  }
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});