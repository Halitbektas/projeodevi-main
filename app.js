const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.static('public'));

// Kullanıcıları tutacak olan JSON dosyası
const usersFile = './users.json';

// Eğer dosya yoksa, boş bir kullanıcı listesi oluştur
if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, '[]');
}

// JSON verilerini okumak ve yazmak için yardımcı fonksiyonlar
const readUsersFromFile = () => {
    try {
        const fileContent = fs.readFileSync(usersFile, 'utf8');
        return JSON.parse(fileContent);
    } catch (err) {
        // Eğer dosya boşsa veya geçerli JSON değilse, boş bir dizi döndür
        return [];
    }
};

const writeUsersToFile = (users) => fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

// Body-parser middleware kullanarak gelen isteklerdeki verileri işle
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Ana sayfa
app.get('/girisekrani', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/girisekrani.html'));
});

// Giriş sayfası
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

// Giriş formundan gelen veriyi kontrol et

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = readUsersFromFile();
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        // Giriş başarılı olduğunda anasayfaya yönlendir
        res.redirect('/site');
    } else {
        res.status(401).send('Hatalı kullanıcı adı veya şifre.');
    }
});

// Anasayfa
app.get('/site', (req, res) => {
    // Kullanıcı giriş yapmışsa, web sitesini göster
    res.sendFile(path.join(__dirname, 'public/index.html'));
});


// Kayıt sayfası
app.get('/register', (req, res) => {
    res.send(`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kayıt Ol</title>
    </head>
    <body>
        <h2>Kayıt Ol</h2>
        <form action="/register" method="POST">
            <label for="username">Kullanıcı Adı:</label>
            <input type="text" id="username" name="username" required><br><br>
            <label for="password">Şifre:</label>
            <input type="password" id="password" name="password" required><br><br>
            <button type="submit">Kayıt Ol</button>
        </form>
        <p>Zaten bir hesabınız var mı? <a href="/login">Giriş yapın</a>.</p>
    </body>
    </html>
    `);
});

// Kayıt formundan gelen veriyi işle
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const users = readUsersFromFile();
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        res.status(400).send('Bu kullanıcı adı zaten kullanılıyor.');
    } else {
        users.push({ username, password });
        writeUsersToFile(users);
        res.send('Kayıt başarılı!');
    }
});

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor...`);
});
