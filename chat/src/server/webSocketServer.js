const WebSocket = require('ws');
const MessageModel = require('./models/messageSchema'); 

module.exports = function (server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {

    ws.on('message', async (message) => {
      
      try {
        const parsedMessage = JSON.parse(message);

        // Felhasználónév beállítása
        if (parsedMessage.username) {
          ws.username = parsedMessage.username; 
          console.log(`Felhasználó csatlakozott: ${ws.username}`);
          return; 
        }

        const { sender, receiver, message: msgText } = parsedMessage;

        if (!sender || !receiver || !msgText) {
          ws.send(JSON.stringify({ error: 'Hiba: Hiányzó mezők!' }));
          return;
        }

        const chatId = [sender, receiver].sort().join('-');
        const newMessage = new MessageModel({
          chatId,
          sender,
          receiver,
          message: msgText,
          timestamp: new Date(),
        });

        await newMessage.save();
        console.log('Üzenet elmentve az adatbázisba!');

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  sender,
                  receiver,
                  message: msgText,
                  timestamp: newMessage.timestamp
                }));
            }
        });
      } catch (err) {
        console.error('Hiba az üzenet feldolgozása során:', err);
        ws.send(JSON.stringify({ error: 'Hiba az üzenet feldolgozása során!' }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket kapcsolat bezárva');
    });
  });
};
