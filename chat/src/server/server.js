const express = require('express');
const http = require('http'); 
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const WebSocketServer = require('./webSocketServer');

const port = process.env.PORT || 8080; 
const url = process.env.MONGOOSE_URI;

// Middleware
const app = express();
const server = http.createServer(app);
WebSocketServer(server);

app.use(cors());
app.use(express.json({ limit: '500mb' }));

mongoose.connect(url) 
  .then(() => {
    console.log('A MongoDB adatbázishoz sikeresen kapcsolódva!');
  })
  .catch((error) => {
    console.log('Hiba a MongoDB adatbázis kapcsolat során:', error);
  });

const messagesRoutes = require('./routes/messages');
const usersRoutes = require('./routes/user');

app.use('/api/messages', messagesRoutes);
app.use('/api/user', usersRoutes);

server.listen(port, () => {
  console.log(`Szerver fut a http://localhost:${port} címen`);
});
