const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');


const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});
db.connect((error) => {
    if (error) {
        console.error('Database connection error:', error);
        return;
    }
    console.log('Connected to the database.');
});


async function createBagForUser(userId) {
    return new Promise((resolve, reject) => {
        const cardId = uuidv4();  // 生成一个唯一的UUID
        const query = 'INSERT INTO user_bag (card_id, user_id, card_type, quantity) VALUES (?, ?, ?, ?)';
        db.query(query, [cardId, userId, 'noCard', 0], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}



exports.register = (req, res) => {
    console.log(req.body);

    const { username, email, password, passwordConfirm } = req.body;
    const coins = 0;
    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.log(error);
            req.session.message = '伺服器錯誤';
            return res.redirect('/register');
        }
        if (results && results.length > 0) {
            req.session.message = '該電子郵件已被使用';
            return res.redirect('/register');
        } else if (password !== passwordConfirm) {
            req.session.message = '兩次輸入的密碼不一致';
            return res.redirect('/register');
        }

        let hashedPassword = await bcrypt.hash(password, 8);

        db.query('INSERT INTO users SET ?', { username: username, email: email, password: hashedPassword }, async (error, results) => {
            if (error) {
                console.log(error);
                req.session.message = '註冊時出錯';
                return res.redirect('/register');
            } else {
                // 獲取新用戶的ID
                db.query('SELECT LAST_INSERT_ID() as newUserId', async (error, results) => {
                    if (error) {
                        console.log(error);
                        req.session.message = '獲取用戶ID時出錯';
                        return res.redirect('/register');
                    }

                    const newUserId = results[0].newUserId;

                    // 為新用戶創建錢包
                    const coins =100
                    db.query('INSERT INTO wallet (user_id, coins) VALUES (?, ?)', [newUserId, coins], async (walletError) => {
                        if (walletError) {
                            console.log(walletError);
                            req.session.message = '創建錢包時出錯';
                            return res.redirect('/register');
                        }
                    
                        // 用戶註冊成功，為他們創建一個背包
                        try {
                            // await createBagForUser(newUserId);
                            req.session.message = '用戶註冊成功';
                            return res.redirect('/register');
                        } catch (bagError) {
                            console.log(bagError);
                            req.session.message = '創建背包時出錯';
                            return res.redirect('/register');
                        }
                    });
                });
            }
        });
    });
};



exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            req.session.message = '請輸入電子郵件和密碼';
            return res.redirect('/login');
        }

        // 使用聯表查詢
        const query = `
        SELECT users.*, wallet.coins 
        FROM users 
        LEFT JOIN wallet ON users.user_id = wallet.user_id 
        WHERE users.email = ?
        `;
        db.query(query, [email], async (error, results) => {
            if (error) {
                console.error("Database error:", error);
                req.session.message = '伺服器錯誤';
                return res.redirect('/login');
            }

            if (results.length === 0) {
                req.session.message = '該電子郵件未被註冊';
                return res.redirect('/login');
            }
                
            if (!(await bcrypt.compare(password, results[0].password))) {
                req.session.message = '電子郵件或密碼錯誤';
                return res.redirect('/login');
            } else {
                const id = results[0].id;
                const userId =results[0].user_id;
                const coins = results[0].coins; // 這裡你可以直接獲取coins的值
                const username = results[0].username;
                const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });
                req.session.userId = userId;
                req.session.username = username;
                req.session.loggedIn = true;
                req.session.coins = coins;

                console.log("Logged in user:");
                console.log("ID:", id);
                console.log("ID:", userId);
                console.log("Username:", results[0].username);
                console.log("Email:", results[0].email);
                console.log("Coins:", results[0].coins);
                
                // 这里的逻辑不变，仍然是登录成功后重定向到首页
                res.status(200).redirect('/');
            }
        });

    } catch (error) {
        console.log(error);
        req.session.message = '伺服器錯誤';
        return res.redirect('/login');
    }
};



exports.db = db;