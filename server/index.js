const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors()); // CORS'u genel açıyoruz

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" } // Her yerden erişime izin ver
});

let messages = [];
let onlineUsers = 0;

io.on('connection', (socket) => {
  onlineUsers++;
  console.log('Yeni kullanıcı bağlandı, çevrimiçi:', onlineUsers);

  // Çevrimiçi kullanıcı sayısını tüm clientlara gönder
  io.emit('online_count', onlineUsers);

  // Bağlanan kullanıcıya tüm mesajları gönder
  socket.emit('all_messages', messages);

  // Yeni mesaj geldiğinde
  socket.on('send_message', (msg) => {
    messages.push(msg);
    io.emit('new_message', msg); // Herkese gönder
  });

  socket.on('disconnect', () => {
    onlineUsers--;
    console.log('Kullanıcı ayrıldı, çevrimiçi:', onlineUsers);
    io.emit('online_count', onlineUsers);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
