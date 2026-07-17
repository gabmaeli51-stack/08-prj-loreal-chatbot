// ==========================================
// CORE DOM ELEMENTS & CONFIGURATION
// ==========================================

// 1. Get the form element from the page using its ID
const chatForm = document.getElementById("chatForm");
// 2. Get the input field where the user types their message
const userInput = document.getElementById("userInput");
// 3. Get the chat window area where messages are displayed
const chatWindow = document.getElementById("chatWindow");
// ⚡ Aesthetic Monitor: Element displaying the latest query text above the viewport
const latestQuestionBox = document.getElementById("latestQuestionBox");

// LIVE CLOUDFLARE WORKER ENDPOINT LINK
const WORKER_URL = "https://ancient-brook-d770.gabmaeli51.workers.dev/";

// ==========================================
// CONVERSATION MEMORY & SYSTEM SYSTEM
// ==========================================

// LevelUp: System context maintaining conversation memory log arrays
let conversationHistory = [
  {
    role: "system",
    content: "You are an AI beauty advisor for L'Oréal. You only give answers and advice related to L'Oréal products, skincare routines, haircare treatments, makeup application, and fragrances. If a user asks a question unrelated to beauty, skincare, makeup, or L'Oréal products, you must politely refuse to answer and remind them that you are a specialized L'Oréal beauty assistant. Keep responses high-end, inspiring, and direct."
  }
];

// Set initial styled welcome message 
appendMessage("ai", "⚡ // SYSTEM ONLINE... Welcome to the L'Oréal Beauty Core. Input your skin, hair, makeup, or routine query.");

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Helper function to create and append interactive glassmorphic message bubbles
function appendMessage(sender, text) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("msg-wrapper", `${sender}-wrapper`);

  const msgBubble = document.createElement("div");
  msgBubble.classList.add("msg", sender);
  msgBubble.innerText = text;

  wrapper.appendChild(msgBubble);
  chatWindow.appendChild(wrapper);
  
  // Auto scroll window safely down to the latest message entry
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return wrapper;
}

// ==========================================
// 🚀 EVENT LISTENERS & API ROUTING
// ==========================================

// 4. Add an event listener to handle when the user clicks 'Send' or presses Enter
chatForm.addEventListener("submit", async (event) => {
  // Prevent the page from reloading when the form is submitted
  event.preventDefault();

  // Get the message text the user typed and clear any empty spaces around it
  const queryText = userInput.value.trim();

  // If the input field is empty, stop here and do nothing
  if (!queryText) return;

  // LevelUp: Display current user question in the glowing monitor deck block
  latestQuestionBox.innerText = `// MONITORING QUERY: "${queryText}"`;
  latestQuestionBox.style.display = "block";

  // Clear the input field immediately so it's ready for the next message
  userInput.value = "";

  // Display the user's message in the chat window
  appendMessage("user", queryText);

  // Store user prompt within history logs array states to maintain memory context
  conversationHistory.push({ role: "user", content: queryText });

  // Render glowing neon system loader status text item while waiting for the API
  const loadingBubble = appendMessage("ai", "// SYNTHESIZING RECOMMENDATIONS...");
  loadingBubble.querySelector('.msg').classList.add('system-loading');

  try {
    // Send the user's message securely to your Cloudflare Worker proxy line
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ 
        messages: conversationHistory 
      })
    });

    if (!response.ok) {
      throw new Error("Worker communication failed.");
    }

    const data = await response.json();
    const aiReply = data.choices[0].message.content;

    // Clear runtime styling loader elements smoothly
    loadingBubble.remove();

    // Inject reply node text matching architecture with interactive hover scales
    appendMessage("ai", aiReply);

    // Keep assistant context intact for the next conversation sequence
    conversationHistory.push({ role: "assistant", content: aiReply });

  } catch (error) {
    console.error("Worker channel runtime error details:", error);
    loadingBubble.remove();
    appendMessage("ai", "// LINK ERROR: Could not establish secure worker data line.");
  }
});