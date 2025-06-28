const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Render ortamından port al, yoksa 3000 kullan
const PORT = process.env.PORT || 3000;

// Badwords listesini yükle
const badWords = JSON.parse(fs.readFileSync("badwords.json", "utf-8"));

// Public klasöründeki dosyaları statik servis et
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("Yeni kullanıcı bağlandı");

  socket.on("chatMessage", (msg) => {
    let message = msg.text;
    const username = msg.user;

    // Küfürlü kelimeleri sansürle
    badWords.forEach(word => {
      const regex = new RegExp(word, "gi");
      message = message.replace(regex, "****");
    });

    // Link ve @ ile başlayanları engelle
    if (/@|https?:\/\/|www\./gi.test(message)) return;

    // 60 karakter sınırı
    if (message.length > 60) return;

    // Mesajı tüm kullanıcılara gönder
    io.emit("chatMessage", {
      user: username,
      text: message
    });
  });
});

// Sunucuyu başlat
server.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
