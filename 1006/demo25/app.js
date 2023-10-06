const express = require("express");
const session = require('express-session');
const mysql = require("mysql");
const dotenv = require("dotenv");
const path = require("path");
const util = require('util');
const WebSocket = require('ws');
const http = require('http');
const { v4: uuidv4 } = require('uuid');









const { getRandomCardType,calculateMiningBonus ,getRandomCardType2} = require('./game/gameLogic.js');

const{ getCoinsFromDatabase, updateDatabase, saveCardToUserBag,getCardsFromUserBag,getCoinsForUser} = require('./db/database.js');
const{ isLoggedIn }=require('./routes/middlewares.js')





dotenv.config({path:'./.env'});

const app = express();


const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());    

// 假設有一個函數用於從資料庫中獲取金幣數量

// 使用 express-session 中间件
app.use(session({
    name: 'sid',
    secret: 'your-session-secret',
    resave: false,
    saveUninitialized: false
    // resave: true,
    // saveUninitialized: true,
    // cookie: {
    //     maxAge: 24 * 60 * 60 * 1000, // 设置为一天的毫秒数
    // },
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


app.get('/is-logged-in', (req, res) => {
        if (req.session.loggedIn) {
            res.json({ loggedIn: true });
        } else {
            res.json({ loggedIn: false });
        }
});

app.get('/topup', (req, res) => {
    res.render('topup');
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
//抽卡2
app.post('/shop2', async (req, res) => {
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
                cardResults.push(getRandomCardType2());
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


//讀卡片
// app.get('/getUserCards', async (req, res) => {
//         const userId = req.user.id;
    
//         try {
//             // 從數據庫中獲取用戶的背包卡片信息
//             const bagCards = await getCardsFromUserBag(userId);
            
//             // 從數據庫中獲取用戶的礦區卡片信息
//             const miningCards = await getCardsInMiningArea(userId);
    
//             // 創建一個映射來存儲每種卡片的總數量
//             const combinedCardsMap = {};
    
//             for (let card of bagCards) {
//                 combinedCardsMap[card.card_type] = card.quantity;
//             }
    
//             for (let card of miningCards) {
//                 if (combinedCardsMap[card.card_type]) {
//                     combinedCardsMap[card.card_type] += card.quantity;
//                 } else {
//                     combinedCardsMap[card.card_type] = card.quantity;
//                 }
//             }
    
//             const combinedCards = Object.keys(combinedCardsMap).map(cardType => ({
//                 card_type: cardType,
//                 quantity: combinedCardsMap[cardType]
//             }));
    
//             if (combinedCards.length > 0) {
//                 res.json({ success: true, cards: combinedCards });
//             } else {
//                 res.json({ success: false, message: '没有找到卡片信息' });
//             }
//         } catch (error) {
//             console.error("Error fetching user cards:", error);
//             res.status(500).json({ success: false, message: '服务器错误' });
//         }
// });
    

//讀卡片資料
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
           SELECT COALESCE(SUM(totalCards), 0) as totalCards FROM (
                SELECT COALESCE(SUM(quantity), 0) as totalCards FROM user_bag WHERE user_id = ?
                UNION ALL
                SELECT COALESCE(SUM(quantity), 0) as totalCards FROM mining_area WHERE user_id = ?
            ) as combinedResults;

        `;
        
        db.query(queryTotalCards, [userId, userId], (errorTotalCards, resultsTotalCards) => {
            if (errorTotalCards) {
                console.error("Error querying totalCards:", errorTotalCards);
                return res.status(500).json({ success: false, message: '伺服器錯誤' });
            }
    
                // 使用 userId 和 cardType 查询特定卡片的数量
                const queryCardCount = `
                SELECT 
                    COALESCE(
                        (SELECT SUM(quantity) FROM user_bag WHERE user_id = ? AND card_type = ?), 
                        0
                    ) +
                    COALESCE(
                        (SELECT SUM(quantity) FROM mining_area WHERE user_id = ? AND card_type = ?),
                        0
                    ) 
                as CardCount;
            `;               
                db.query(queryCardCount, [userId, cardType, userId, cardType], (errorCardCount, resultsCardCount) => {
                    if (errorCardCount) {
                        console.error("Error querying cardCount:", errorCardCount);
                        return res.status(500).json({ success: false, message: '伺服器錯誤' });
                    }
    
                    // 如果没有错误，返回查询到的金币数量、总卡片数量和特定卡片数量
                    const coins = resultsCoins.length > 0 ? (resultsCoins[0].coins || 0) : 0;
                    const totalCards = resultsTotalCards.length > 0 ? (resultsTotalCards[0].totalCards || 0) : 0;
                    const CardCount = resultsCardCount.length > 0 ? (resultsCardCount[0].CardCount || 0) : 0;
                    console.log('Database query result789999999999999:', coins, totalCards, CardCount);
                    return res.json({ success: true, coins: coins, totalCards: totalCards, cardACount: CardCount });
                });
            });
        });
});
    
    
//讀礦場資料
app.get('/getMiningCards', (req, res) => {
        const userId = req.session.userId; 
        console.log('userId:', userId);
    
        const query = `
        SELECT ub.card_id, ub.card_type, ub.quantity, ci.image_url 
        FROM mining_area AS ub
        JOIN card_images AS ci ON ub.card_type = ci.card_type
        WHERE ub.user_id = ?
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
    
    

//移到礦區
// app.post('/moveToMining', async (req, res) => {
//     const userId = req.body.userId;

//     db.beginTransaction(async (err) => {
//         if (err) {
//             return res.send({ success: false, message: err.message });
//         }

//         db.query('SELECT card_id, card_type, COALESCE(quantity, 1) as quantity FROM user_bag WHERE user_id = ? AND card_type != "nocard"', [userId], (error, rows) => {
//             if (error) {
//                 return db.rollback(() => {
//                     res.send({ success: false, message: error.message });
//                 });
//             }

//             const deleteQuery = 'DELETE FROM user_bag WHERE user_id = ?';
//             db.query(deleteQuery, [userId], (error) => {
//                 if (error) {
//                     return db.rollback(() => {
//                         res.send({ success: false, message: error.message });
//                     });
//                 }

//                 const insertQueries = rows.map(row => {
//                     return new Promise((resolve, reject) => {
//                         // 先检查cards表中是否存在该卡片类型
//                         db.query('SELECT card_type FROM cards WHERE card_type = ?', [row.card_type], (error, cardResults) => {
//                             if (error) {
//                                 reject(error);
//                                 return;
//                             }

//                             // 如果该卡片类型不存在于cards表中，则返回错误
//                             if (cardResults.length === 0) {
//                                 reject(new Error(`Card type ${row.card_type} does not exist in cards table.`));
//                                 return;
//                             }

//                             // 插入或更新mining_area表
//                             const query = `
//                                 INSERT INTO mining_area (card_id, user_id, card_type, quantity) 
//                                 VALUES (?, ?, ?, ?) 
//                                 ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
//                             `;
//                             db.query(query, [row.card_id, userId, row.card_type, row.quantity], (error) => {
//                                 if (error) reject(error);
//                                 else resolve();
//                             });
//                         });
//                     });
//                 });

//                 Promise.all(insertQueries)
//                     .then(() => {
//                         // 在这里添加查询矿区卡片的代码
//                         const query0 = `
//                             SELECT card_type, quantity FROM mining_area WHERE user_id = ?;
//                         `;

//                         db.query(query0, [userId], (error, cards) => {
//                             if (error) {
//                                 return db.rollback(() => {
//                                     res.send({ success: false, message: error.message });
//                                 });
//                             }

//                             const bonus = calculateMiningBonus(cards);
//                             console.log("Calculated bonus:", bonus);

//                             db.commit((err) => {
//                                 if (err) {
//                                     return db.rollback(() => {
//                                         res.send({ success: false, message: err.message });
//                                     });
//                                 }
//                                 res.send({ success: true, bonus: bonus });
//                             });
//                         });
//                     })
//                     .catch(error => {
//                         db.rollback(() => {
//                             res.send({ success: false, message: error.message });
//                         });
//                     });
//             });
//         });
//     });
// });

 

// 從礦區移動卡片回背包
// app.post('/moveToBackpack', (req, res) => {
//     const userId = req.body.userId;

//     // 检查参数
//     if (!userId) {
//         return res.status(400).send({ success: false, message: 'Invalid userId' });
//     }

//     // 查询礦區的卡片
//     db.query('SELECT card_id, card_type, COALESCE(quantity, 1) as quantity FROM mining_area WHERE user_id = ?', [userId], (error, rows) => {
//         if (error) {
//             return res.status(500).send({ success: false, message: error.message });
//         }

//         const bonus = calculateMiningBonus(rows); // 計算要扣除的獎勵

//         // 删除礦區的卡片
//         db.query('DELETE FROM mining_area WHERE user_id = ?', [userId], (error) => {
//             if (error) {
//                 return res.status(500).send({ success: false, message: error.message });
//             }

//             // 将卡片移回背包
//             const insertQueries = rows.map(row => {
//                 return new Promise((resolve, reject) => {
//                     const query = `
//                         INSERT INTO user_bag (card_id, user_id, card_type, quantity) 
//                         VALUES (?, ?, ?, ?) 
//                         ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
//                     `;
//                     db.query(query, [row.card_id, userId, row.card_type, row.quantity], (error) => {
//                         if (error) reject(error);
//                         else resolve();
//                     });
//                 });
//             });

//             // 等待所有查询完成
//             Promise.all(insertQueries)
//                 .then(() => {
//                     res.status(200).send({ success: true, bonus: bonus });
//                 })
//                 .catch(error => {
//                     res.status(500).send({ success: false, message: error.message });
//                 });
//         });
//     });
// });





// API端點：更新礦區
app.post('/api/updateMiningArea', (req, res) => {
        console.log('updateMiningArea被呼叫')
        const userId = req.session.userId;
        console.log('userId98989898998',userId)
        // 呼叫存儲過程
        db.query('CALL UpdateResourceRate(?)', [userId], (err, results) => {
            if (err) {
                console.error(err);
                res.status(500).send('Server error');
                return;
            }

            // 假設您在users表中有一個totalResourceRate欄位
            db.query('SELECT totalResourceRate FROM users WHERE user_id = ?', [userId], (err, results) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Server error');
                    return;
                }

                const newRate = results[0].totalResourceRate;
                console.log('newRate98989898998',newRate)
                res.json({ newResourceRate: newRate });
            });
        });
});


app.get('/api/getResourceRate/:userId', (req, res) => {
    console.log('getResourceRate已使用')
    const userId = req.params.userId;
    
    console.log('userId00000000000000',userId)
    // 假設您在users表中有一個totalResourceRate欄位
    db.query('SELECT totalResourceRate FROM users WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server error');
            return;
        }

        const currentRate = results[0].totalResourceRate;
        res.json({ resourceRate: currentRate });
    });
});







//mining 網站
app.get('/mining', isLoggedIn, (req, res) => {
    const userId = req.session.userId;

    // 使用傳統的回調方式查詢資料庫
    db.query('SELECT totalResourceRate FROM users WHERE user_id = ?', [userId], (error, rows) => {
        if (error) {
            console.error('Error fetching from database:', error);
            res.status(500).send('Server error');
            return;
        }

        if (rows && rows.length > 0) {
            res.render('mining', {
                userId: userId,
                loggedIn: true,
                totalResourceRate: rows[0].totalResourceRate,
            
            });
        } else {
            res.status(404).send('User not found');
        }
    });
});


function getAllUsers() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM users', (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }
  
  // 更新指定用户的资源
function updateUserResources(userId, newResources) {
    return new Promise((resolve, reject) => {
      db.query('UPDATE users SET totalResources = ? WHERE user_id = ?', [newResources, userId], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
}

//每10秒钟运行一次挖矿的逻辑
async function updateAllUsersResources() {
    try {
      const users = await getAllUsers();
  
      const updatePromises = users.map(async user => {
        console.log(`Checking user with ID ${user.user_id}: resources = ${user.totalResources}, miningRate = ${user.totalResourceRate}`);
  
        if (typeof user.totalResources !== 'number' || typeof user.totalResourceRate !== 'number' || isNaN(user.totalResources) || isNaN(user.totalResourceRate) || user.user_id == null) {
          console.error(`Skipping user with ID ${user.user_id} due to invalid data`);
          return Promise.resolve(); 
        }
  
        const newResources = user.totalResources + user.totalResourceRate ;
  
        if (isNaN(newResources) || user.user_id == null) {
          console.error(`Skipping user with ID ${user.user_id} due to invalid data: newResources = ${newResources}`);
          return Promise.resolve(); 
        }
  
        await updateUserResources(user.user_id, newResources);
        console.log(`Updated resources for user with ID ${user.user_id}`);
      });
  
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error updating user resources:', error);
    }
  }








app.post('/moveSelectedToMining', async (req, res) => {
    console.log('789789789',req.body);
    const userId = req.body.userId;
    const selectedCardId = req.body.cards.map(card => card.cardId);  
    console.log('787897889798',selectedCardId);
    db.beginTransaction(async (err) => {
        if (err) {
            return res.send({ success: false, message: err.message });
        }

        db.query('SELECT card_id, card_type, count FROM user_bag WHERE user_id = ? AND card_id IN (?)', [userId, selectedCardId], (error, rows) => {
            if (error) {
                return db.rollback(() => {
                    res.send({ success: false, message: error.message });
                });
            }

            const selectedCards = rows;

            if (selectedCards.length === 0) {
                return db.rollback(() => {
                    res.send({ success: false, message: 'No cards selected' });
                });
            }

            const deleteQuery = 'DELETE FROM user_bag WHERE user_id = ? AND card_id IN (?)';
            db.query(deleteQuery, [userId, selectedCards.map(card => card.card_id)], (error) => {
                if (error) {
                    return db.rollback(() => {
                        res.send({ success: false, message: error.message });
                    });
                }

                const insertQueries = selectedCards.map(card => {
                    return new Promise((resolve, reject) => {
                        const query = `
                            INSERT INTO mining_area (card_id, user_id, card_type, quantity, count) 
                            VALUES (?, ?, ?, ?,?) 
                            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
                        `;
                        db.query(query, [card.card_id, userId, card.card_type, 1 ,card.count], (error) => {  // Assuming quantity is 1
                            if (error) reject(error);
                            else resolve();
                        });
                    });
                });

                Promise.all(insertQueries)
                    .then(() => {
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




app.post('/moveSelectedToBackpack', async (req, res) => {
    const userId = req.body.userId;
    const selectedCardId = req.body.cards.map(card => card.cardId);  

    db.beginTransaction(async (err) => {
        if (err) {
            return res.send({ success: false, message: err.message });
        }

        // Use card_id to identify selected cards instead of card_type
        db.query('SELECT card_id, card_type ,count FROM mining_area WHERE user_id = ? AND card_id IN (?)', [userId, selectedCardId], (error, rows) => {
            if (error) {
                return db.rollback(() => {
                    res.send({ success: false, message: error.message });
                });
            }

            const selectedCards = rows;
            const deleteQuery = 'DELETE FROM mining_area WHERE user_id = ? AND card_id IN (?)';
            db.query(deleteQuery, [userId, selectedCards.map(card => card.card_id)], (error) => {
                if (error) {
                    return db.rollback(() => {
                        res.send({ success: false, message: error.message });
                    });
                }

                const insertQueries = selectedCards.map(card => {
                    return new Promise((resolve, reject) => {
                        const query = `
                            INSERT INTO user_bag (card_id, user_id, card_type, quantity , count) 
                            VALUES (?, ?, ?, ? , ?) 
                            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
                        `;
                        db.query(query, [card.card_id, userId, card.card_type, 1 ,card.count], (error) => {  // Assuming quantity is 1
                            if (error) reject(error);
                            else resolve();
                        });
                    });
                });

                Promise.all(insertQueries)
                    .then(() => {
                        const query0 = `
                            SELECT card_type, quantity FROM user_bag WHERE user_id = ?;
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





//玩家卡片數值
 app.get('/getCharacterData/:cardId', (req, res) => {
    const cardId = req.params.cardId;
    const query = `
        SELECT attributes.health, attributes.agility, attributes.strength
        FROM attributes
        INNER JOIN user_bag ON attributes.card_type = user_bag.card_type
        WHERE user_bag.card_id = ?;
    `;
    db.query(query, [cardId], (err, result) => {
        if (err) throw err;
        if (result && result.length > 0) {
            res.json(result[0]);  // 返回匹配的卡片属性
        } else {
            res.status(404).send('Card attributes not found');
        }
    });
});

// BOSS卡片數值
app.get('/getRandomBossData', (req, res) => {
    const query = 'SELECT health, agility, strength FROM levels ORDER BY RAND() LIMIT 1';
    db.query(query, (err, result) => {
        if (err) throw err;
        if (result && result.length > 0) {
            res.json(result[0]);  // 返回随机选择的BOSS属性
        } else {
            res.status(404).send('No bosses found');
        }
    });
});


//卡片次數
app.post('/update-card-count/:cardId', (req, res) => {
    const cardId = req.params.cardId;
    const query = `
        UPDATE user_bag
        SET count = count - 1
        WHERE card_id = ? AND count > 0;
    `;
    db.query(query, [cardId], (err, result) => {
        if (err) throw err;
        if (result.affectedRows > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: '該卡片沒次數' });
        }
    });
});


//檢查錢包
app.get('/check-wallet', (req, res) => {
    const userId = req.session.userId; // 從查詢參數中取得 userId

    db.query('SELECT coins FROM wallet WHERE user_id = ?', [userId], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Internal Server Error');
        }

        const balance = results[0].coins;

        // 假設遊戲需要的金額是50
        const requiredAmount = 30;

        if (balance >= requiredAmount) {
            // 扣除所需金額
            const newBalance = balance - requiredAmount;
            db.query('UPDATE wallet SET coins = ? WHERE user_id = ?', [newBalance, userId], (updateError) => {
                if (updateError) {
                    console.error(updateError);
                    return res.status(500).send('Internal Server Error');
                }
                res.json({ hasEnoughMoney: true });
            });
        } else {
            res.json({ hasEnoughMoney: false });
        }
    });
});


// 在伺服器端
app.post('/update-wallet', (req, res) => {
    const userId = req.session.userId; // 從 session 中獲取 userId
    const amount = req.body.amount; // 從請求體中獲取金額

    // 更新用戶的錢包金額
    // 這裡只是一個簡單的範例，您可能需要根據您的數據庫結構進行調整
    db.query('UPDATE wallet SET coins = coins + ? WHERE user_id = ?', [amount, userId], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Internal Server Error');
        }
        res.json({ success: true });
    });
});











wss.on('connection', (ws) => {
    console.log('New client connected');
  
    const updateResources = async () => {
      const users = await getAllUsers();  
      ws.send(JSON.stringify(users));
    };
  
    
    const intervalId = setInterval(updateResources, 1000);
  
    ws.on('close', () => {
      clearInterval(intervalId); 
    });
  });
  
  

  setInterval(updateAllUsersResources, 1000);

  const port =5000;
  server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });




 
// const PORT = 5000;
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });












   




