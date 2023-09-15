const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port =8080;

const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'iii'
});

// 连接数据库
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to the database');
});

// 创建表的查询
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    coins INT DEFAULT 0,
    pn INT DEFAULT 0,
    totalResources INT DEFAULT 0,
    cards TEXT
  );
`;

// 执行创建表的查询
connection.query(createTableQuery, (err) => {
  if (err) {
    console.error('Error creating table:', err);
    return;
  }
  console.log('Table "users" created (if not exists)');
});

// 继续添加其他服务器和路由逻辑
// ...

app.get('/getUserData/:username', (req, res) => {
    const username = req.params.username;

    // 從數據庫中查詢該用戶的數據
    const query = `SELECT * FROM users WHERE username = ?`;
    connection.query(query, [username], (error, results) => {
        if (error) {
            return res.status(500).json({ status: 'error', message: 'Database query failed.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ status: 'error', message: 'User not found.' });
        }

        res.json({ status: 'success', data: results[0] });
    });
});
