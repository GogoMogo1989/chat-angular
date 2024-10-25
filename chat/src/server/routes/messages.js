const express = require('express');
const MessageModel = require('../models/messageSchema');

const router = express.Router();

// Üzenetek elérése
router.get('/:senderId/:receiverId', async (req, res) => {
  const { senderId, receiverId } = req.params;
  
  const chatId = [senderId, receiverId].sort().join('-');

  try {
    const messages = await MessageModel.find({ chatId }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (err) {
    console.log('Hiba az üzenetek lekérdezésekor:', err);
    res.status(500).json({ message: 'Hiba az üzenetek lekérdezésekor!' });
  }
});

// Üzenet küldése (POST)
router.post('/', async (req, res) => {
  const { sender, receiver, message } = req.body;

  if (!sender || !receiver || !message) {
    return res.status(400).json({ message: 'Kérjük, adja meg az összes szükséges mezőt!' });
  }

  const chatId = [sender, receiver].sort().join('-');

  const newMessage = new MessageModel({
    chatId: chatId,
    sender,
    receiver,
    message,
    timestamp: new Date(),
  });

  try {
    await newMessage.save();
    console.log('Az üzenet sikeresen elmentve a MongoDB-be!');
    res.status(201).json(newMessage);
  } catch (err) {
    console.log('Hiba az üzenet mentésekor:', err);
    res.status(500).json({ message: 'Hiba az üzenet mentésekor!' });
  }
});

module.exports = router;
