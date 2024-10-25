const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserModel = require('../models/userSchema');

const router = express.Router();

// User regisztrációs útvonal
router.post('/registration', async (req, res) => {
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
      profileImage,
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
router.post('/login', async (req, res) => {
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

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRETKEY, { expiresIn: '1h' });

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
router.get('/', (req, res) => {
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
router.get('/:id', (req, res) => {
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

// User adatok frissítése
router.put('/update/:id', async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  if (updatedData.password) {
    try {
      updatedData.password = await bcrypt.hash(updatedData.password, 10);
    } catch (hashError) {
      console.log('Hiba a jelszó hash-elésekor:', hashError);
      return res.status(500).send('Hiba a jelszó hash-elésekor!');
    }
  }

  UserModel.findByIdAndUpdate(id, updatedData, { new: true })
    .then((data) => {
      if (!data) {
        return res.status(404).send('A frissített adat nem található!');
      }
      res.send({
        id: data._id,
        username: data.username,
        email: data.email,
        profileImage: data.profileImage,
      });
    })
    .catch((err) => {
      console.log('Hiba az adat frissítésekor:', err);
      res.status(500).send('Hiba az adat frissítésekor!');
    });
});

// User adatok törlése
router.delete('/delete/:id', (req, res) => {
  const id = req.params.id;
  UserModel.findByIdAndDelete(id)
      .then(() => {
          console.log('Az adat törlése sikeres volt!');
          res.status(200).json({ message: 'Az adat törlése sikeres volt!' });
      })
      .catch((err) => {
          console.log('Hiba az adat törlésekor:', err);
          res.status(500).send('Hiba az adat törlésekor!');
      });
});

module.exports = router;
