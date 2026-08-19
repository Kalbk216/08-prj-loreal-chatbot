// URL for chat function
const WORKER_URL = "https://loreal.khaledmbkairat2.workers.dev/";

/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

/* Conversation history sent to OpenAI (system prompt lives in the Worker,
   so we only track user/assistant turns here) */
let conversationHistory = [];

/* Render a message bubble */
function addMessage(text, sender, isThinking = false) {
  const bubble = document.createElement("div");
  bubble.classList.add("msg", sender);
  if (isThinking) bubble.classList.add("thinking");
  bubble.textContent = text;
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return bubble;
}

// Initial greeting
addMessage("👋 Hello! Ask me about L'Oréal products or routines.", "ai");

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = userInput.value.trim();
  if (!question) return;

  // Show user's message
  addMessage(question, "user");
  userInput.value = "";

  // Add to history
  conversationHistory.push({ role: "user", content: question });

  // Show thinking placeholder
  const thinkingBubble = addMessage("Thinking...", "ai", true);

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: conversationHistory
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;

    // Replace "Thinking..." with the real reply
    thinkingBubble.textContent = reply;
    thinkingBubble.classList.remove("thinking");

    // Add assistant reply to history so future turns have context
    conversationHistory.push({ role: "assistant", content: reply });
  } catch (err) {
    thinkingBubble.textContent = "Something went wrong. Please try again.";
    thinkingBubble.classList.remove("thinking");
    console.error(err);
  }
});