process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/products', async (req, res) => {
  try {
    const response = await fetch('https://exercise.develop.maximaster.ru/service/products/', {
      headers: {
        'Authorization': 'Basic ' + Buffer.from('cli:12344321').toString('base64'),
        'Accept': 'application/json',
        'User-Agent': 'NodeProxy/1.0'
      }
    });

    if (!response.ok) throw new Error('Bad response: ' + response.status);

    const data = await response.json();
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ошибка прокси', details: e.message });
  }
});

app.get('/cpu', async (req, res) => {
  try {
    const response = await fetch('https://exercise.develop.maximaster.ru/service/cpu/', {
      headers: {
        'Authorization': 'Basic ' + Buffer.from('cli:12344321').toString('base64'),
        'Accept': 'application/json',
        'User-Agent': 'NodeProxy/1.0'
      }
    });
    if (!response.ok) throw new Error('Bad response: ' + response.status);
    const text = await response.text();
    res.send(text);
  } catch (e) {
    console.error(e);
    res.status(500).send('0');
  }
});



app.listen(PORT, () => {
  console.log(`Proxy listening on http://localhost:${PORT}`);
});
