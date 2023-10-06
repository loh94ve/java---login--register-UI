const express = require('express');
const mysql = require("mysql");
const authController = require('../controllers/auth');
const { isLoggedIn } = require('../routes/middlewares');
const router = express.Router();

const { getCoinsFromDatabase,getWalletBalance, updateDatabase,getTotalCardCountForUser,insertTransactionRecord,getLatestTransactionStatusForUser ,getCardsFromUserBag,getCardCountForUser,resetTotalResources,getTotalResources ,updateUserWallet} = require('../db/database.js');

const ecpay_payment = require('ecpay_aio_nodejs');
const { MERCHANTID, HASHKEY, HASHIV, HOST } = process.env;

const options = {
    OperationMode: 'Test',
    MercProfile: {
      MerchantID: MERCHANTID,
      HashKey: HASHKEY,
      HashIV: HASHIV,
    },
    IgnorePayment: [],
    IsProjectContractor: false,
  };
let TradeNo;

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
    

    try {

        const coinsToCollect = await getTotalResources(userId);
        
        const currentCoins = await getCoinsFromDatabase(userId);

        const newCoins = currentCoins + coinsToCollect;

        
        await updateDatabase(userId, newCoins);

        await resetTotalResources(userId);
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

router.get('/select-level', isLoggedIn, (req, res) => {
    const userId = req.session.userId;
    db.query('SELECT totalResourceRate FROM users WHERE user_id = ?', [userId], (error, rows) => {
        if (error) {
            console.error('Error fetching from database:', error);
            res.status(500).send('Server error');
            return;
        }

        if (rows && rows.length > 0) {
            res.render('select-level', {
                userId: userId,
                loggedIn: true,
                totalResourceRate: rows[0].totalResourceRate,
            
            });
        } else {
            res.status(404).send('User not found');
        }
    });
});

router.get('/battle', isLoggedIn, async (req, res) => {
    const userId = req.session.userId;

    try {
        const userCoins = await getCoinsFromDatabase(userId);
        console.log("userCoins:", userCoins);

        db.query('SELECT totalResourceRate FROM users WHERE user_id = ?', [userId], (error, rows) => {
            if (error) {
                console.error('Error fetching from database:', error);
                return res.status(500).send('Server error');
            }

            if (rows && rows.length > 0) {
                const { totalResourceRate } = rows[0];
                res.render('battle', {
                    userId,
                    loggedIn: true,
                    coins: userCoins,
                    totalResourceRate
                });
            } else {
                res.status(404).send('User not found');
            }
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Server error');
    }
});



router.get('/select-level/:cardId', isLoggedIn, (req, res) => {
    const userId = req.session.userId;
    const cardId = req.params.cardId;

    db.query('SELECT totalResourceRate FROM users WHERE user_id = ?', [userId], (error, rows) => {
        if (error) {
            console.error('Error fetching from database:', error);
            res.status(500).send('Server error');
            return;
        }

        if (rows && rows.length > 0) {
            res.render('select-level', {
                cardId: cardId,
                userId: userId,
                loggedIn: true,
                totalResourceRate: rows[0].totalResourceRate,
            
            });
        } else {
            res.status(404).send('User not found');
        }
    });
});


router.get('/demo', (req, res) => {
    res.render('demo');
});



router.get('/select-level/:cardId/demo', isLoggedIn, (req, res) => {
    const cardId = req.params.cardId;
    const level = req.query.level;
    const bossMapping = {
        1: '噴火龍',
        2: '巴大蝶',
        3: '水箭龜'
    };
    const bossName = bossMapping[level];
    if (!bossName) {
        res.status(404).send('Invalid level');
        return;
    }

    db.query('SELECT card_type FROM user_bag WHERE card_id = ?', [cardId], (error, rows) => {
        console.log(cardId)
        if (error) {
            console.error('Error fetching from database:', error);
            res.status(500).send('Server error');
            return;
        }

        if (rows && rows.length > 0) {
            const cardType = rows[0].card_type;
            res.render('demo', {
                bossName: bossName,  // 将bossName传递给demo视图
                cardType: cardType   // 将cardType传递给demo视图
            });
        } else {
            res.status(404).send('Card not found');
        }
    });
});


router.get('/introduce', (req, res) => {
    const isLoggedIn = req.session.loggedIn || false;
    
    res.render('introduce', { isLoggedIn: isLoggedIn });
});





  
router.get('/payment', (req, res) => {
    const MerchantTradeDate = new Date().toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    });
    const TradeNo = req.query.orderId;
    let base_param = {
        CustomField1: req.session.userId.toString(),
        MerchantTradeNo: TradeNo.toString(),
        MerchantTradeDate: MerchantTradeDate.toString(),
        TotalAmount: (req.query.amount || '100').toString(),
        TradeDesc: '測試交易描述',
        ItemName: '測試商品等',
        ReturnURL: `https://e460-59-127-153-132.ngrok.io/return`,
        ClientBackURL: `${HOST}/clientReturn`,
      };
      
    const create = new ecpay_payment(options);
    try {
        const html = create.payment_client.aio_check_out_all(base_param);
        res.send(html);
    } catch (error) {
        console.error("Error calling ECPay:", error);
        res.status(500).send("Error processing payment: " + error.message);
    }
    
    
});

router.post('/return', async (req, res) => {
    try {
        console.log('req.body:', req.body);
        const { CheckMacValue, CustomField1 } = req.body;
        const orderId = req.query.orderId; // Retrieve the orderId from the query
        const data = { ...req.body };
        delete data.CheckMacValue;

        const create = new ecpay_payment(options);
        const checkValue = create.payment_client.helper.gen_chk_mac_value(data);

        if (CheckMacValue === checkValue) {
            const userId = req.body.CustomField1;
            const orderId = req.body.MerchantTradeNo;
            const amount = req.body.TradeAmt;
            console.log('User ID:', userId);
            console.log('Order ID:', orderId);
            console.log('Amount:', amount);

            const status = req.body.RtnCode === '1' ? '成功' : '失敗';
            await insertTransactionRecord(userId, amount, status, orderId);

            await updateUserWallet(userId, amount);
        }

        res.send('1|OK');
    } catch (error) {
        console.error('Error processing payment return:', error);
        res.status(500).send('Internal Server Error');
    }
});



router.get('/clientReturn', (req, res) => {
    console.log('clientReturn:', req.query);
   
    res.render('return', { query: req.query.amount });
});



router.get('/checkTransactionStatus', async (req, res) => {
    try {
        const userId = req.session.userId;
        const orderId =req.query.orderId;

        // Use both userId and orderId to fetch the transaction status
        const transactionStatus = await getLatestTransactionStatusForUser(userId, orderId);

        if (transactionStatus === '成功') {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        console.error('Error checking transaction status:', error);
        res.status(500).json({ success: false });
    }
});
router.get('/api/getWalletBalance', getWalletBalance);


module.exports = router;