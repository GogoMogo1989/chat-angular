const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const port = process.env.PORT
const url = process.env.MONGOOSE_URI

//Model import
const UserModel = require('./models/userSchema')

// Middleware
app.use(cors());
app.use(express.json({ limit: '500mb' }));

mongoose.connect(url) 
  .then(() => {
    console.log('A MongoDB adatbázishoz sikeresen kapcsolódva!');
  })
  .catch((error) => {
    console.log('Hiba a MongoDB adatbázis kapcsolat során:', error);
  });

// Admin regisztrációs útvonal
app.post('/api/userregistration', async (req, res) => {
  const { username, password, email} = req.body;

  if (!username || !password || !email) {
    return res.status(400).json('Nincs fájl az adatokban!');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = new UserModel({
      username,
      password: hashedPassword, 
      email,
    });

    await userData.save();
    console.log('Az adatok mentése sikeres volt!');
    res.status(200).json({ message: 'Adatok sikeresen fogadva és mentve a szerveren.' });

  } catch (err) {
    console.log('Hiba az adatok mentésekor:', err);
    res.status(500).json('Hiba az adatok mentésekor!');
  }
});

app.listen(port, () => {
  console.log(`Szerver fut a http://localhost:${port} címen`);
});
