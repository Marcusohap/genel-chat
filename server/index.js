const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Ana sayfa (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Admin paneli (admin.html)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin.html'));
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Veri yapıları
let messages = [];
let onlineUsers = 0;
let userMap = {};        // socket.id => username
let bannedUsers = new Set();
const badWords = ['salak', 'aptal', 'gerizekalı', 'küfür1', 'küfür2']; // yasaklı kelimeler

io.on('connection', (socket) => {
  let currentUser = null;

  socket.on('set_username', (username) => {
    if (bannedUsers.has(username)) {
      socket.emit('banned');
      socket.disconnect();
      return;
    }

    currentUser = username;
    userMap[socket.id] = username;
    onlineUsers++;
    console.log(`Kullanıcı bağlandı: ${username} (${onlineUsers} çevrimiçi)`);

    io.emit('online_count', onlineUsers);
    socket.emit('all_messages', messages);
    io.emit('user_list', Object.values(userMap));
  });

  socket.on('send_message', (msg) => {
    if (!currentUser) return;

    const lower = msg.toLowerCase();
    const containsBadWord = badWords.some(word => lower.includes(word));
    if (containsBadWord) {
      socket.emit('message_blocked', 'Mesajınız uygunsuz içerik nedeniyle gönderilmedi.');
      return;
    }

    const fullMessage = { user: currentUser, text: msg };
    messages.push(fullMessage);
    io.emit('new_message', fullMessage);
  });

  socket.on('ban_user', (username) => {
    bannedUsers.add(username);
    for (let id in userMap) {
      if (userMap[id] === username) {
        io.to(id).emit('banned');
        io.sockets.sockets.get(id).disconnect();
      }
    }
    console.log(`Yasaklandı: ${username}`);
    io.emit('user_list', Object.values(userMap));
  });

  socket.on('get_users', () => {
    socket.emit('user_list', Object.values(userMap));
  });

  socket.on('disconnect', () => {
    if (currentUser) {
      onlineUsers--;
      delete userMap[socket.id];
      io.emit('online_count', onlineUsers);
      io.emit('user_list', Object.values(userMap));
      console.log(`Kullanıcı ayrıldı: ${currentUser} (${onlineUsers} çevrimiçi)`);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
