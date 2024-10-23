const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const port = process.env.PORT
const url = process.env.MONGOOSE_URI
const jwtSecretKey = process.env.JWT_SECRETKEY

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

// User regisztrációs útvonal
app.post('/api/userregistration', async (req, res) => {
  const { username, password, email, profileImage} = req.body;

  if (!username || !password || !email || !profileImage) {
    return res.status(400).json({message:'Nincs fájl az adatokban!'});
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
      profileImage
    });

    await userData.save();
    console.log('Az adatok mentése sikeres volt!');
    res.status(200).json({ message: 'Adatok sikeresen fogadva és mentve a szerveren.' });

  } catch (err) {
    console.log('Hiba az adatok mentésekor:', err);
    res.status(500).json({message:'Hiba az adatok mentésekor!'});
  }
});

// User bejelentkezési útvonal
app.post('/api/userlogin', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(401).json({message:'Hibás felhasználónév vagy jelszó!'});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({message:'Hibás felhasználónév vagy jelszó!'});
    }

    const token = jwt.sign({ id: user._id, username: user.username }, jwtSecretKey, { expiresIn: '1h' });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage
      }
    });
    
  } catch (err) {
    console.log('Hiba a bejelentkezés során:', err);
    res.status(500).json({message:'Hiba a bejelentkezés során!'});
  }
});

// Users adataok lekérdezése
app.get('/api/getuser', (req, res) => {
  UserModel.find({})
      .then((data) => {
        const userData = data.map(user => ({
          id: user._id, 
          username: user.username,
          email: user.email,
          profileImage: user.profileImage
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
            profileImage: data.profileImage
          });
      })
      .catch((err) => {
          console.log('Hiba az adat lekérdezésekor:', err);
          res.status(500).send('Hiba az adat lekérdezésekor!');
      });
});

app.listen(port, () => {
  console.log(`Szerver fut a http://localhost:${port} címen`);
});
