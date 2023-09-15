const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'your_mysql_username',
    password: 'your_mysql_password',
    database: 'your_database_name'
});

db.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to database');
    }
});

app.post('/saveUserData', (req, res) => {
    const { username, coins, pn, totalResources, cards } = req.body;
    const saveQuery = 'INSERT INTO users (username, coins, pn, totalResources, cards) VALUES (?, ?, ?, ?, ?)';
    db.query(saveQuery, [username, coins, pn, totalResources, JSON.stringify(cards)], (err, result) => {
        if (err) {
            console.error('Error saving user data:', err);
            res.status(500).json({ status: 'error' });
        } else {
            console.log('User data saved');
            res.json({ status: 'success' });
        }
    });
});

app.get('/getUserData/:username', (req, res) => {
    const username = req.params.username;
    const getQuery = 'SELECT * FROM users WHERE username = ?';
    db.query(getQuery, [username], (err, result) => {
        if (err) {
            console.error('Error getting user data:', err);
            res.status(500).json({ status: 'error' });
        } else {
            if (result.length > 0) {
                const user = result[0];
                res.json({
                    status: 'success',
                    coins: user.coins,
                    pn: user.pn,
                    totalResources: user.totalResources,
                    cards: JSON.parse(user.cards)
                });
            } else {
                res.json({ status: 'user_not_found' });
            }
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
