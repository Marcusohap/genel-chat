const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

// Public klasörünü statik olarak sun
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

let messages = [];
let onlineUsers = 0;

io.on('connection', (socket) => {
  onlineUsers++;
  console.log('Yeni kullanıcı bağlandı, çevrimiçi:', onlineUsers);

  io.emit('online_count', onlineUsers);
  socket.emit('all_messages', messages);

  socket.on('send_message', (msg) => {
    messages.push(msg);
    io.emit('new_message', msg);
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
