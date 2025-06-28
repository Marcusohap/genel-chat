const socket = io("https://genel-chat.onrender.com");
const messagesDiv = document.getElementById("messages");
const input = document.getElementById("msgInput");

let userName = prompt("Adınız nedir?") || "Anonim";

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  socket.emit("chatMessage", {
    user: userName,
    text: text
  });

  input.value = "";
}

socket.on("chatMessage", (msg) => {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<span class="username">${msg.user}:</span> ${msg.text}`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
