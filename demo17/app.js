    const express = require("express");
    const session = require('express-session');
    const mysql = require("mysql");
    const dotenv = require("dotenv");
    const path = require("path");


    const { getRandomCardType,calculateMiningBonus } = require('./game/gameLogic.js');

    const { getCoinsFromDatabase, updateDatabase, saveCardToUserBag,getCardsFromUserBag} = require('./db/database.js');
    const{ isLoggedIn }=require('./routes/middlewares.js')






    dotenv.config({path:'./.env'});

    const app = express();

    app.use(express.json());    

    // 假設有一個函數用於從資料庫中獲取金幣數量

    // 使用 express-session 中间件
    app.use(session({
        name: 'sid',
        secret: 'your-session-secret',
        resave: true,
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


    app.get('/getUserCards', async (req, res) => {
        const userId = req.user.id;
    
        try {
            // 從數據庫中獲取用戶的背包卡片信息
            const bagCards = await getCardsFromUserBag(userId);
            
            // 從數據庫中獲取用戶的礦區卡片信息
            const miningCards = await getCardsInMiningArea(userId);
    
            // 創建一個映射來存儲每種卡片的總數量
            const combinedCardsMap = {};
    
            for (let card of bagCards) {
                combinedCardsMap[card.card_type] = card.quantity;
            }
    
            for (let card of miningCards) {
                if (combinedCardsMap[card.card_type]) {
                    combinedCardsMap[card.card_type] += card.quantity;
                } else {
                    combinedCardsMap[card.card_type] = card.quantity;
                }
            }
    
            const combinedCards = Object.keys(combinedCardsMap).map(cardType => ({
                card_type: cardType,
                quantity: combinedCardsMap[cardType]
            }));
    
            if (combinedCards.length > 0) {
                res.json({ success: true, cards: combinedCards });
            } else {
                res.json({ success: false, message: '没有找到卡片信息' });
            }
        } catch (error) {
            console.error("Error fetching user cards:", error);
            res.status(500).json({ success: false, message: '服务器错误' });
        }
    });
    


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
            const queryTotalCards = `
            SELECT SUM(totalCards) as totalCards FROM (
                SELECT SUM(quantity) as totalCards FROM user_bag WHERE user_id = ?
                UNION ALL
                SELECT SUM(quantity) as totalCards FROM mining_area WHERE user_id = ?
            ) as combinedResults
        `;
        
        db.query(queryTotalCards, [userId, userId], (errorTotalCards, resultsTotalCards) => {
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
    

    // app.post('/moveAllToMining', (req, res) => {
    //     const userId = req.body.userId;
    
    //     // 1. 查询用户的卡片
    //     const query0 = `
    //         SELECT card_type, quantity FROM mining_area WHERE user_id = ?;
    //     `;
    
    //     db.query(query0, [userId], (error, cards) => {
    //         if (error) {
    //             console.error('Error fetching cards:', error);
    //             res.status(500).json({ success: false, message: '移动失败' });
    //             return;
    //         }
    
    //         // 2. 使用 calculateMiningBonus 函数计算奖励
    //         const bonus = calculateMiningBonusAAAAAAAAAAAAAAAAAAAAAA(cards);
    //         console.log("Calculated bonus:", bonus);

    
    //         const query1 = `
    //             INSERT INTO user_bag (user_id, card_type, quantity)
    //             SELECT user_id, card_type, m.quantity FROM mining_area m WHERE user_id = ?
    //             ON DUPLICATE KEY UPDATE quantity = user_bag.quantity + VALUES(quantity);
    //         `;
    //         const query2 = `
    //             DELETE FROM user_bag WHERE user_id = ? AND card_type <> 'noCard';
    //         `;
    
    //         db.query(query1, [userId], (error, results1) => {
    //             if (error) {
    //                 console.error('Error moving cards to user_bag:', error);
    //                 res.status(500).json({ success: false, message: '移动失败' });
    //                 return;
    //             }
    
    //             db.query(query2, [userId], (error, results2) => {
    //                 if (error) {
    //                     console.error('Error deleting cards from user_bag:', error);
    //                     res.status(500).json({ success: false, message: '移动失败' });
    //                     return;
    //                 }
    
    //                 // 3. 在响应中添加一个 bonus 字段来返回奖励值
    //                 res.json({ success: true, message: '成功移动到矿区！', bonus: bonus });
    //             });
    //         });
    //     });
    // });
    

    app.get('/getMiningCards', (req, res) => {
        const userId = req.session.userId; 
        console.log('userId:', userId);
    
        const query = `
            SELECT m.card_type, m.quantity, c.image_url 
            FROM mining_area m
            JOIN card_images c ON m.card_type = c.card_type
            WHERE m.user_id = ?;
        `;
    
        db.query(query, [userId], (error, rows) => {
            if (error) {
                console.error('Error fetching mining cards:', error);
                return res.status(500).json({ success: false, message: '獲取失敗' });
            }
    
            console.log('Database query result:', rows);
            res.json({ success: true, cards: rows });
        });
    });
    
    


app.post('/moveToMining', async (req, res) => {
    const userId = req.body.userId;

    db.beginTransaction(async (err) => {
        if (err) {
            return res.send({ success: false, message: err.message });
        }

        db.query('SELECT card_type, COALESCE(quantity, 1) as quantity FROM user_bag WHERE user_id = ? AND card_type != "nocard"', [userId], (error, rows) => {
            if (error) {
                return db.rollback(() => {
                    res.send({ success: false, message: error.message });
                });
            }

            db.query('DELETE FROM user_bag WHERE user_id = ?', [userId], (error) => {
                if (error) {
                    return db.rollback(() => {
                        res.send({ success: false, message: error.message });
                    });
                }

                const insertQueries = rows.map(row => {
                    return new Promise((resolve, reject) => {
                        const query = `
                            INSERT INTO mining_area (user_id, card_type, quantity) 
                            VALUES (?, ?, ?) 
                            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
                        `;
                        db.query(query, [userId, row.card_type, row.quantity], (error) => {
                            if (error) reject(error);
                            else resolve();
                        });
                    });
                });

                Promise.all(insertQueries)
                    .then(() => {
                        // 在這裡添加查詢礦區卡片的代碼
                        const query0 = `
                            SELECT card_type, quantity FROM mining_area WHERE user_id = ?;
                        `;

                        db.query(query0, [userId], (error, cards) => {
                            if (error) {
                                return db.rollback(() => {
                                    res.send({ success: false, message: error.message });
                                });
                            }

                            const bonus = calculateMiningBonus(cards);
                            console.log("Calculated bonus:", bonus);

                            db.commit((err) => {
                                if (err) {
                                    return db.rollback(() => {
                                        res.send({ success: false, message: err.message });
                                    });
                                }
                                res.send({ success: true, bonus: bonus });
                            });
                        });
                    })
                    .catch(error => {
                        db.rollback(() => {
                            res.send({ success: false, message: error.message });
                        });
                    });
            });
        });
    });
});

    
    
    
    // 從礦區移動卡片回背包
  

app.post('/moveToBackpack', (req, res) => {
    const userId = req.body.userId;

    db.query('SELECT card_type, COALESCE(quantity, 1) as quantity FROM mining_area WHERE user_id = ?', [userId], (error, rows) => {
        if (error) {
            return res.send({ success: false, message: error.message });
        }

        const bonus = calculateMiningBonus(rows); // 計算要扣除的獎勵

        db.query('DELETE FROM mining_area WHERE user_id = ?', [userId], (error) => {
            if (error) {
                return res.send({ success: false, message: error.message });
            }

            const insertQueries = rows.map(row => {
                return new Promise((resolve, reject) => {
                    const query = `
                        INSERT INTO user_bag (user_id, card_type, quantity) 
                        VALUES (?, ?, ?) 
                        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
                    `;
                    db.query(query, [userId, row.card_type, row.quantity], (error) => {
                        if (error) reject(error);
                        else resolve();
                    });
                });
            });

            Promise.all(insertQueries)
                .then(() => res.send({ success: true, bonus: bonus })) 
                .catch(error => res.send({ success: false, message: error.message }));
        });
    });
});

    
    
    
    
    
    
    






















































    














    const PORT = 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });












   




