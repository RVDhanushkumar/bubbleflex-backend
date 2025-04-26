const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
  },
});

io.on('connection', (socket) => {
  console.log('🔌 A user connected:', socket.id);

  socket.on('join', (roomId) => {
    socket.join(roomId);
    console.log(`👥 ${socket.id} joined room: ${roomId}`);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  // Listen for video sharing event
  socket.on('share-video', ({ roomId, videoSrc }) => {
    console.log(`🎬 Video shared in room ${roomId}:`, videoSrc);  // Log the video data (or base64 for verification)
    socket.to(roomId).emit('share-video', { videoSrc });  // Send it to the other clients in the room
  });

  // Handle WebRTC signaling and video sync actions (play/pause/seek)
  socket.on('signal', ({ roomId, data }) => {
    socket.to(roomId).emit('signal', { data });
  });

  socket.on('video-event', ({ roomId, action, time }) => {
    socket.to(roomId).emit('video-event', { action, time });
  });

  socket.on('video-file', ({ roomId, buffer, type }) => {
    const base64Buffer = Buffer.from(buffer).toString('base64');
    socket.to(roomId).emit('video-file', { buffer: base64Buffer, type });
  });
});

app.get("/", (req, res) => {
  res.send("Backend running..!!");
});

// Start the server
server.listen(process.env.PORT || 3001, () => {
  console.log(`🎉 Signaling server running on http://localhost:${process.env.PORT || 3001}`);
});
