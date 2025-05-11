const express = require('express');
const bodyParser = require('body-parser');
const speakeasy = require('speakeasy');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3000;

let news = ["Sveiki atvykę!"]; // saugomi tekstai
let adminUser = {
  username: 'admin',
  password: 'password123', // naudoti bcrypt realiam projekte
  twoFASecret: speakeasy.generateSecret().base32
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Prisijungimas
app.post('/login', (req, res) => {
  const { username, password, token } = req.body;
  
  // Tikriname, ar slaptažodis ir vartotojo vardas teisingi
  if (username === adminUser.username && password === adminUser.password) {
    const isValid2FA = speakeasy.totp.verify({
      secret: adminUser.twoFASecret,
      encoding: 'base32',
      token,
    });

    if (isValid2FA) {
      req.session.admin = true;
      return res.json({ success: true });
    } else {
      return res.status(403).json({ success: false, message: 'Neteisingas 2FA kodas' });
    }
  } else {
    return res.status(403).json({ success: false, message: 'Netinkami prisijungimo duomenys' });
  }
});

// Naujas tekstas
app.post('/create', (req, res) => {
  if (!req.session.admin) return res.sendStatus(403);
  news.push(req.body.text);
  res.sendStatus(200);
});

// Gauti tekstus
app.get('/news', (req, res) => {
  res.json(news);
});

// Redaguoti tekstą
app.post('/edit', (req, res) => {
  if (!req.session.admin) return res.sendStatus(403);
  const { index, newText } = req.body;
  news[index] = newText;
  res.sendStatus(200);
});

// Ištrinti tekstą
app.post('/delete', (req, res) => {
  if (!req.session.admin) return res.sendStatus(403);
  const { index } = req.body;
  news.splice(index, 1);
  res.sendStatus(200);
});

// Pateikia 2FA kodą
app.get('/generate-2fa', (req, res) => {
  const token = speakeasy.totp({
    secret: adminUser.twoFASecret,
    encoding: 'base32',
  });
  res.json({ token });
});

app.listen(PORT, () => {
  console.log(`Serveris veikia: http://localhost:${PORT}`);
  console.log(`2FA slaptas raktas adminui: ${adminUser.twoFASecret}`);
});
