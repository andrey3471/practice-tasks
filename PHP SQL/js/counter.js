// Для запуска cd PHP SQL
// И потом node js/counter.js
// http://localhost:3000
const express = require('express');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const HTML_FILE = path.join(__dirname, '../counter.html');
const COUNTER_FILE = path.join(__dirname, '../counter.txt');

//  для отдачи CSS-файлов
const app = express();
app.use('/css', express.static(path.join(__dirname, '../css')));

app.get('/', (req, res) => {
  res.sendFile(HTML_FILE);
});

app.get('/counter', (req, res) => {
  fs.readFile(COUNTER_FILE, 'utf8', (err, data) => {
    let count = 0;
    if (!err && !isNaN(+data)) count = +data;
    count++;
    fs.writeFile(COUNTER_FILE, String(count), (err2) => {
      if (err2) {
        return res.status(500).json({ error: 'Ошибка записи счетчика' });
      }
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const time = `${hh}:${mm}`;
      res.json({ count, time });
    });
  });
});

app.listen(PORT, () => {
  if (!fs.existsSync(COUNTER_FILE)) fs.writeFileSync(COUNTER_FILE, '0');
  console.log(`Server running on http://localhost:${PORT}`);
});
