    const express = require("express");
    const session = require('express-session');
    const mysql = require("mysql");
    const dotenv = require("dotenv");
    const path = require("path");


    const { getRandomCardType } = require('./game/gameLogic.js');
    const { getCoinsFromDatabase, updateDatabase, saveCardToUserBag,removeCardsFromUserBag,moveCardsToMiningArea,getCardsFromUserBag} = require('./db/database.js');
    const{ isLoggedIn }=require('./routes/middlewares.js')





    dotenv.config({path:'./.env'});

    const app = express();

    app.use(express.json());

    // 假設有一個函數用於從資料庫中獲取金幣數量

    // 使用 express-session 中间件
    app.use(session({
        name: 'sid',
        secret: 'your-session-secret',
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000, // 设置为一天的毫秒数
        },
    }));

    // Set up the public directory
    const publicDirectory = path.join(__dirname, './public');
    app.use(express.static(publicDirectory));

    // Body parser setup
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    // Database setup
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

    // Setup view engine
    // app.set('view engine', 'hbs');
    app.set('view engine', 'hbs');
    app.set('views', path.join(__dirname, 'views'));

    app.use( express.static('public'));


    // Routes
    app.use('/', require('./routes/pages'));
    app.use('/auth', require('./routes/auth'));

    // Additional routes from your second piece of code
    app.get('/', (req, res) => {
        if (req.session.loggedIn) {
            res.send('欢迎回来！');
        } else {
            res.send('<form method="post" action="/login"><button type="submit">登录</button></form>');
        }
    });




    app.get('/logout', (req, res) => {
        req.session.destroy(err => {
            if (err) {
                return res.redirect('/');
            }
            res.clearCookie('sid'); // 清除session cookie
            res.redirect('/');
        });
    });

    app.get('/play', isLoggedIn, (req, res) => {
        const userId = req.session.userId;
        // 如果已經登錄，正常渲染play頁面
        res.render('play', { userId: userId });
    });
      
    

    //刪掉刪掉刪掉刪掉刪掉刪掉刪掉刪掉刪掉刪掉刪掉刪掉刪掉刪掉刪掉刪掉刪掉刪掉刪掉刪掉刪掉刪掉刪掉刪掉刪掉刪掉刪掉刪掉刪掉
    app.get('/shop01', (req, res) => {
        res.render('shop01');
    });



    app.get('/is-logged-in', (req, res) => {
        if (req.session.loggedIn) {
            res.json({ loggedIn: true });
        } else {
            res.json({ loggedIn: false });
        }
    });




    //抽卡
    app.post('/shop', async (req, res) => {
        const userId = req.session.userId;  // 假設您在session中存儲了用戶ID
        const quantity = req.body.quantity;
        const costPerCard = req.body.costPerCard;
        const totalCost = quantity * costPerCard; 
        const userCoins = await getCoinsFromDatabase(userId);
        console.log("Coins before shopping:", userCoins);
        
        try {
            if (userCoins >= totalCost) {
                const newCoins = userCoins - totalCost;

                let cardResults = [];
                for (let i = 0; i < quantity; i++) {
                    cardResults.push(getRandomCardType());
                }

                // Save each card to the user's bag in the database
                for (let cardType of cardResults) {
                    await saveCardToUserBag(userId, cardType);
                }

                // 更新資料庫中的金幣數量
                await updateDatabase(userId, newCoins, cardResults);

                res.json({
                    success: true,
                    newCoins: newCoins,
                    cards: cardResults
                });
            } else {
                res.json({
                    success: false,
                    message: "金幣不足，無法抽卡。"
                });
            }
        } catch (error) {
            console.error("Error in /shop route:", error);
            res.status(500).json({
                success: false,
                message: "Server error."
            });
        }
    });


    //拿錢
    app.get('/getCoins', (req, res) => {
        getCoinsForUser(req.session.userId)
            .then(coins => {
                res.json({ coins: coins });
            })
            .catch(error => {
                res.status(500).json({ error: error.message });
            });
    });






    function getCoinsForUser(userId) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT coins FROM wallet WHERE userId = ?';
            db.query(query, [userId], (error, results) => {
                if (error) {
                    reject(error);
                } else if (results.length > 0) {
                    resolve(results[0].coins);
                } else {
                    reject(new Error('User not found'));
                }
            });
        });
    }  


    app.get('/getUserData', isLoggedIn, (req, res) => {
        const userId = req.session.userId;
        const cardType = 'A'; // 這裡我們假設您想查詢A卡的數量
    
        // 使用 userId 查询用户的金币
        const queryCoins = 'SELECT coins FROM wallet WHERE user_id = ?';
        db.query(queryCoins, [userId], (errorCoins, resultsCoins) => {
            if (errorCoins) {
                console.error("Error querying coins:", errorCoins);
                return res.status(500).json({ success: false, message: '伺服器錯誤' });
            }
    
            // 使用 userId 查询用户的总卡片数量
            const queryTotalCards = 'SELECT SUM(quantity) as totalCards FROM user_bag WHERE user_id = ?';
            db.query(queryTotalCards, [userId], (errorTotalCards, resultsTotalCards) => {
                if (errorTotalCards) {
                    console.error("Error querying totalCards:", errorTotalCards);
                    return res.status(500).json({ success: false, message: '伺服器錯誤' });
                }
    
                // 使用 userId 和 cardType 查询特定卡片的数量
                const queryCardCount = 'SELECT SUM(quantity) as cardCount FROM user_bag WHERE user_id = ? AND card_type = ?';
                db.query(queryCardCount, [userId, cardType], (errorCardCount, resultsCardCount) => {
                    if (errorCardCount) {
                        console.error("Error querying cardCount:", errorCardCount);
                        return res.status(500).json({ success: false, message: '伺服器錯誤' });
                    }
    
                    // 如果没有错误，返回查询到的金币数量、总卡片数量和特定卡片数量
                    const coins = resultsCoins.length > 0 ? resultsCoins[0].coins : 0;
                    const totalCards = resultsTotalCards.length > 0 ? resultsTotalCards[0].totalCards : 0;
                    const cardCount = resultsCardCount.length > 0 ? resultsCardCount[0].cardCount : 0;
                    return res.json({ success: true, coins: coins, totalCards: totalCards, cardCount: cardCount });
                });
            });
        });
    });
    


  


    app.post('/moveToMiningArea', async (req, res) => {
        const userId = req.body.userId;
        const selectedCardTypes = req.body.cardTypes; // 获取已勾选的卡片类型
    
        try {
            // 循环处理每种卡片类型
            for (const cardType of selectedCardTypes) {
                // First, insert data into mining_area for each selected card type
                const insertSQL = `
                INSERT INTO mining_area (user_id, card_type, quantity)
                SELECT user_id, card_type, quantity FROM user_bag
                WHERE user_id = ? AND card_type = ?;
                `;
                await db.query(insertSQL, [userId, cardType]);
    
                // Then, delete data from user_bag for each selected card type
                const deleteSQL = `
                DELETE FROM user_bag WHERE user_id = ? AND card_type = ?;
                `;
                await db.query(deleteSQL, [userId, cardType]);
            }
    
            const checkDataSQL = `
            SELECT * FROM mining_area WHERE user_id = ?;
            `;
            const results = await db.query(checkDataSQL, [userId]);
            console.log("Data in mining_area for user:", userId, results);
    
            res.json({ success: true, message: '資料已成功移動！' });
        } catch (error) {
            console.error('移動資料時出錯：', error);
            res.status(500).json({ success: false, message: '移動資料時出錯，請稍後再試。' });
        }
    });











    
    
    app.get('/getUserMiningCards', async (req, res) => {
        const userId = req.user.id; // 或者从会话中获取用户ID
        try {
            // 查询数据库以获取用户的挖矿卡片数据
            const cards = await getMiningCardsForUser(userId); // 假设您已经有了这个函数来从数据库中获取卡片数据
            res.json({ success: true, cards });
        } catch (error) {
            console.error("Error fetching mining cards:", error);
            res.status(500).json({ success: false, message: '服务器错误' });
        }
    });

    function queryMiningCardsForUser(userId, callback) {
        const query = 'SELECT * FROM mining_area WHERE user_id = ?';
        db.query(query, [userId], (err, results) => {
            if (err) {
                console.error('Error querying mining cards:', err);
                callback(err, null);
                return;
            }
            callback(null, results);
        });
    }
    










    const PORT = 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });












    app.get('/getUserCards', async (req, res) => {
        const userId = req.session.userId;
    
        try {
            // 从数据库中获取用户的卡片信息
            const cards = await getCardsFromUserBag(userId);  // 假设您已经有了这个函数
    
            if (cards && cards.length > 0) {
                res.json({ success: true, userId: userId, cards });
            } else {
                res.json({ success: false, message: '没有找到卡片信息', userId: userId });
            }
        } catch (error) {
            console.error("Error fetching user cards:", error);
            res.status(500).json({ success: false, message: '服务器错误', userId: userId });
        }
    });
    
