const express = require('express');
const mysql = require("mysql");
const authController = require('../controllers/auth');
const { isLoggedIn } = require('../routes/middlewares');
const router = express.Router();

const { getCoinsFromDatabase, updateDatabase,getTotalCardCountForUser  ,getCardsFromUserBag,getCardCountForUser} = require('../db/database.js');

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST, 
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

db.connect((error) => {
    if (error) {
        console.error("Error connecting to MySQL:", error);
        return;
    }
    console.log("Connected to MySQL successfully.");
});





//註冊
router.get("/register", (req, res) => {
    const message = req.session.message;
    delete req.session.message;  // 删除消息，避免在下次请求时再次显示
    res.render("register", { message });
});

//登入
router.get("/login", (req, res) => {
    const message = req.session.message;
    delete req.session.message;  // 删除消息，避免在下次请求时再次显示
    res.render("login", { message });
});

//商店
router.get("/shop", isLoggedIn, async (req, res) => {
    try {
        console.log("Username:", req.session.username);
        const userId = req.session.userId;

        // 從資料庫中獲取用戶的金幣數量
        const userCoins = await getCoinsFromDatabase(userId);
        console.log("userCoins:", userCoins);

        // 從資料庫中獲取用戶的總卡片量
        
        const totalCards = await getTotalCardCountForUser(userId);

        // 從資料庫中獲取用戶的A卡總卡片量
        const cardACount = await getCardCountForUser(userId, 'A');

        db.query('SELECT totalResourceRate FROM users WHERE user_id = ?', [userId], (error, rows) => {
            if (error) {
                console.error('Error fetching from database:', error);
                res.status(500).send('Server error');
                return;
            }
    
            if (rows && rows.length > 0) {
                res.render('shop', {
                    userId: userId,
                    loggedIn: true,
                    totalResourceRate: rows[0].totalResourceRate,
                    coins: userCoins,
                    totalCards: totalCards,
                    cardACount: cardACount
                
                });
            } else {
                res.status(404).send('User not found');
            }
        });


        
        

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            success: false,
            message: "Error: " + error
        });
    }
});


//首頁
router.get('/', (req, res) => {
    // 假設你使用了 express-session，且當用戶登入時，你設置了 req.session.loggedIn = true;
    const isLoggedIn = req.session.loggedIn || false;
    
    res.render('index', { isLoggedIn: isLoggedIn });  // 這裡，'index' 是你的模板名稱
});


//登出
// router.post('/logout', (req, res) => {
//     // 這裡我假設你使用了express-session，你需要清除session來實現登出
//     req.session.destroy((err) => {
//         if (err) throw err;
//         res.redirect('/');
//     });
// });
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.json({ success: false, message: '登出失败' });
            return;
        }
        res.json({ success: true, message: '已成功登出' });
    });
});




//來挖礦錢
router.post('/collectCoins', async (req, res) => {
    const userId = req.session.userId;
    const coinsToCollect = req.body.coins;

    try {
        // 获取用户当前的金币数量
        const currentCoins = await getCoinsFromDatabase(userId);
        const newCoins = currentCoins + coinsToCollect;

        // 更新用户的金币数量
        await updateDatabase(userId, newCoins);
        res.status(200).json({ success: true, message: "金币已更新" });
    } catch (error) {
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});

//讀卡片
router.get('/getUserCards', async (req, res) => {
    const userId = req.session.userId;

    try {

        const userCards = await getCardsFromUserBag(userId);
        res.status(200).json({ success: true, cards: userCards });
    } catch (error) {
        res.status(500).json({ success: false, message: "服务器错误" });
    }
});



router.get('/bag', isLoggedIn, (req, res) => {
    const userId = req.session.userId;
    db.query('SELECT totalResourceRate FROM users WHERE user_id = ?', [userId], (error, rows) => {
        if (error) {
            console.error('Error fetching from database:', error);
            res.status(500).send('Server error');
            return;
        }

        if (rows && rows.length > 0) {
            res.render('bag', {
                userId: userId,
                loggedIn: true,
                totalResourceRate: rows[0].totalResourceRate,
            
            });
        } else {
            res.status(404).send('User not found');
        }
    });
});

router.get('/book', isLoggedIn, (req, res) => {
    const userId = req.session.userId;
    db.query('SELECT totalResourceRate FROM users WHERE user_id = ?', [userId], (error, rows) => {
        if (error) {
            console.error('Error fetching from database:', error);
            res.status(500).send('Server error');
            return;
        }

        if (rows && rows.length > 0) {
            res.render('book', {
                userId: userId,
                loggedIn: true,
                totalResourceRate: rows[0].totalResourceRate,
            
            });
        } else {
            res.status(404).send('User not found');
        }
    });
});













module.exports = router;