const express = require('express');
const authController = require('../controllers/auth');
const { isLoggedIn } = require('../routes/middlewares');
const router = express.Router();

const { getCoinsFromDatabase, updateDatabase,getTotalCardCountForUser  ,getCardsFromUserBag,getCardCountForUser} = require('../db/database.js');




router.post('/moveToMining', authController.moveToMining);
router.post('/moveToBackpack', authController.moveToBackpack);


router.get("/register", (req, res) => {
    const message = req.session.message;
    delete req.session.message;  // 删除消息，避免在下次请求时再次显示
    res.render("register", { message });
});

router.get("/login", (req, res) => {
    const message = req.session.message;
    delete req.session.message;  // 删除消息，避免在下次请求时再次显示
    res.render("login", { message });
});

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

        // 將金幣數量和總卡片量傳遞給模板
        res.render("shop", { coins: userCoins, totalCards: totalCards,cardACount: cardACount, loggedIn: true });

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
router.post('/logout', (req, res) => {
    // 這裡我假設你使用了express-session，你需要清除session來實現登出
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect('/login');
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














module.exports = router;