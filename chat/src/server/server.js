const express = require('express');
const http = require('http'); 
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const WebSocketServer = require('./webSocketServer')

const port = process.env.PORT || 8080; 
const url = process.env.MONGOOSE_URI;
const jwtSecretKey = process.env.JWT_SECRETKEY;

// Model import
const UserModel = require('./models/userSchema');
const MessageModel = require('./models/messageSchema');

// Middleware
const app = express();
const server = http.createServer(app);
WebSocketServer(server);

app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(bodyParser.json({ limit: '500mb' }));

//Mongodb
mongoose.connect(url) 
  .then(() => {
    console.log('A MongoDB adatbázishoz sikeresen kapcsolódva!');
  })
  .catch((error) => {
    console.log('Hiba a MongoDB adatbázis kapcsolat során:', error);
  });

// Üzenetek elérése
app.get('/api/messages/:senderId/:receiverId', async (req, res) => {
  const { senderId, receiverId } = req.params;

  // Generálj egy azonosítót a sender és receiver nevéből
  const chatId = [senderId, receiverId].sort().join('-');

  try {
    const messages = await MessageModel.find({ chatId }).sort({ timestamp: 1 });
    res.status(200).json(messages);
    console.log(messages);
  } catch (err) {
    console.log('Hiba az üzenetek lekérdezésekor:', err);
    res.status(500).json({ message: 'Hiba az üzenetek lekérdezésekor!' });
  }
});

// Üzenet küldése (POST)
app.post('/api/messages', async (req, res) => {
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

// User regisztrációs útvonal
app.post('/api/userregistration', async (req, res) => {
  const { username, password, email, profileImage } = req.body;

  if (!username || !password || !email || !profileImage) {
    return res.status(400).json({ message: 'Nincs fájl az adatokban!' });
  }

  try {
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'A felhasználónév már foglalt!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = new UserModel({
      username,
      password: hashedPassword, 
      email,
      profileImage: profileImage,
    });

    await userData.save();
    console.log('Az adatok mentése sikeres volt!');
    res.status(200).json({ message: 'Adatok sikeresen fogadva és mentve a szerveren.' });

  } catch (err) {
    console.log('Hiba az adatok mentésekor:', err);
    res.status(500).json({ message: 'Hiba az adatok mentésekor!' });
  }
});


// User bejelentkezési útvonal
app.post('/api/userlogin', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Hibás felhasználónév vagy jelszó!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Hibás felhasználónév vagy jelszó!' });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, jwtSecretKey, { expiresIn: '1h' });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
    });

  } catch (err) {
    console.log('Hiba a bejelentkezés során:', err);
    res.status(500).json({ message: 'Hiba a bejelentkezés során!' });
  }
});

// Users adatok lekérdezése
app.get('/api/getuser', (req, res) => {
  UserModel.find({})
    .then((data) => {
      const userData = data.map(user => ({
        id: user._id, 
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      }));
      console.log('Az user lekérdezése sikeres volt!');
      res.send(userData);
    })
    .catch((err) => {
      console.log('Hiba az user lekérdezésekor:', err);
      res.status(500).send('Hiba az user lekérdezésekor!');
    });
});

// User adatok lekérdezése ID alapján
app.get('/api/getuser/:id', (req, res) => {
  const id = req.params.id;

  UserModel.findById(id)
    .then((data) => {
      if (!data) {
        return res.status(404).send('A keresett adat nem található!');
      }
      res.send({
        id: data._id,
        username: data.username,
        email: data.email,
        profileImage: data.profileImage,
      });
    })
    .catch((err) => {
      console.log('Hiba az adat lekérdezésekor:', err);
      res.status(500).send('Hiba az adat lekérdezésekor!');
    });
});

//User adatok frissítése
app.put('/api/updateuser/:id', async (req, res) => {
  const id = req.params.id;
  const {username, email, profileImage, password} = req.body

  if (password) {
    try {
      password = await bcrypt.hash(password, 10);
    } catch (hashError) {
      console.log('Hiba a jelszó hash-elésekor:', hashError);
      return res.status(500).send('Hiba a jelszó hash-elésekor!');
    }
  }

  UserModel.findByIdAndUpdate(
    id, {username, email, profileImage, password}, { new: true }) 
    .then((data) => {
      if (!data) {
        return res.status(404).send('A frissített adat nem található!');
      }
      console.log('Az adat sikeresen frissítve lett!');
      res.status(200).send(data);
    })
    .catch((err) => {
      console.log('Hiba az adat frissítésekor:', err);
      res.status(500).send('Hiba az adat frissítésekor!');
    });
});

server.listen(port, () => {
  console.log(`Szerver fut a http://localhost:${port} címen`);
});
