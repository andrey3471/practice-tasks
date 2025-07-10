// Перейти cd PHP SQL
// Запустить node js/guestbook.js
// http://localhost:3000
const express = require('express');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const HTML_FILE = path.join(__dirname, '../guestbook.html');

const CSV_FILE = path.join(__dirname, '../guestbook.csv');


const app = express();
app.use(express.json());

// Главная страница (форма и сообщения)
app.get('/', (req, res) => {
  res.sendFile(HTML_FILE);
});

// Получение сообщений
app.get('/api/messages', (req, res) => {
  // Читаем CSV, разбираем строки в объекты
  fs.readFile(CSV_FILE, 'utf8', (err, data) => {
    if (err || !data) return res.json([]);
    const rows = data.trim().split('\n').map(line => {
      const [date, name, text] = line.split(';').map(v => v.replace(/^"|"$/g, ''));
      return { date, name, text };
    });
    // Последние сверху
    res.json(rows.reverse());
  });
});

// Добавление сообщения
app.post('/api/messages', (req, res) => {
  const name = (req.body.name || '').trim() || 'Анонимно';
  const text = (req.body.text || '').trim();
  if (!text) return res.status(400).json({ error: 'Пустое сообщение' });

  const now = new Date();
  const dt = now.toLocaleDateString('ru-RU') + ' ' +
             now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  // Сохраняем CSV с экранированием (на всякий случай)
  const row = `"${dt}";"${name}";"${text.replace(/"/g, '""')}"\n`;
  fs.appendFile(CSV_FILE, row, err => {
    if (err) return res.status(500).json({ error: 'Ошибка записи' });
    res.json({ ok: 1 });
  });
});

app.listen(PORT, () => {
  if (!fs.existsSync(CSV_FILE)) fs.writeFileSync(CSV_FILE, '');
  console.log('Guestbook сервер: http://localhost:' + PORT);
});
