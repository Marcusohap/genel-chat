// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Statik dosyaları sun (örneğin index.html)
app.use(express.static(__dirname));

// Çevrimiçi kullanıcı sayısı ve kullanıcı listesi
let onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('Bir kullanıcı bağlandı:', socket.id);

  // Yeni kullanıcı geldiğinde kayıt et
  socket.on('newUser', ({ username, userId }) => {
    onlineUsers.set(socket.id, { username, userId });
    console.log(`${username} bağlandı.`);
    io.emit('onlineUsers', onlineUsers.size);
  });

  // Yeni mesaj geldiğinde herkese yayınla
  socket.on('newMessage', (messageData) => {
    // Mesajı tüm kullanıcılara gönder, gönderen hariç
    socket.broadcast.emit('newMessage', messageData);
  });

  // Kullanıcı ayrılınca güncelle
  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.id);
    if(user) {
      console.log(`${user.username} ayrıldı.`);
      onlineUsers.delete(socket.id);
      io.emit('onlineUsers', onlineUsers.size);
    }
  });
});

// Sunucu 3000 portunda çalışsın
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});
