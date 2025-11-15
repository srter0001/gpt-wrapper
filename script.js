document.addEventListener("DOMContentLoaded", () => {
  const scriptTag = document.querySelector('script[src="script.js"]');

  const API_KEY = scriptTag.getAttribute("ai-key");
  const PROVIDER = scriptTag.getAttribute("ai-provider") || "groq"; // your provider
  const MODEL = scriptTag.getAttribute("ai-model") || "model_name"; // your model name

  const messagesEl = document.getElementById("messages");
  const inputEl = document.getElementById("input");
  const sendBtn = document.getElementById("send");
  const centerText = document.getElementById("center-text");

  function addMessage(role, text) {
    const div = document.createElement("div");
    div.className = "message";
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function sendMessage() {
    const msg = inputEl.value.trim();
    if (!msg) return;

    if (centerText) {
      centerText.classList.add("fade-out");
      setTimeout(() => centerText.remove(), 400);
    }

    addMessage("user", msg);
    inputEl.value = "";

    addMessage("assistant", "Thinking...");

    const reply = await askAI(msg);

    messagesEl.lastChild.textContent = reply;
  }

  sendBtn.onclick = sendMessage;

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });

  async function askAI(prompt) {
    try {
      const url =
        PROVIDER === "groq"
          ? "https://api.groq.com/openai/v1/chat/completions"
          : "https://api.openai.com/v1/chat/completions";

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const json = await res.json();

      if (!json.choices) {
        console.error(json);
        return json.error?.message || "error";
      }

      return json.choices[0].message.content;
    } catch (e) {
      console.error(e);
      return "network error";
    }
  }
});