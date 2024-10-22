const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Alapértelmezett route
app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

// Szerver indítása
app.listen(PORT, () => {
  console.log(`Szerver fut a http://localhost:${PORT} címen`);
});
