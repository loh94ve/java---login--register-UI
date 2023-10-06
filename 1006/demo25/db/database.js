const mysql = require("mysql");
const dotenv = require("dotenv");
dotenv.config({path:'./.env'});
const { v4: uuidv4 } = require('uuid');


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

exports.getCoinsFromDatabase = (userId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT coins FROM wallet WHERE user_id= ?';
        console.log("Query:", query);
        console.log("Passed userId:", userId);

        db.query(query, [userId], (error, results) => {
            if (error) {
                console.error("Database error:", error);
                reject(error);
            } else {
                console.log("Query results:", results);

                if(results.length > 0) {
                    resolve(results[0].coins);
                } else {
                    reject("No wallet found for the given userId.");
                }
            }
        });
    });
};

exports.updateDatabase = (userId, newCoins, newCards) => {
    return new Promise((resolve, reject) => {
        // 更新用户的金币数量
        db.query('UPDATE wallet SET coins = ? WHERE user_id = ?', [newCoins, userId], (error) => {
            if (error) {
                console.error("Database error:", error);
                reject(error);
            } else {
                // 这里你可以继续添加代码来更新用户的卡片结果，如果你有存储用户的卡片的话。
                resolve();
            }
        });
    });
};


//讀取TotalResources
exports.getTotalResources=(userId)=> {
    return new Promise((resolve, reject) => {
        db.query('SELECT totalResources FROM users WHERE user_id = ?', [userId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                // 确保结果不为空，并且有一个匹配的用户
                if (results.length > 0) {
                    resolve(results[0].totalResources);
                } else {
                    reject(new Error('User not found'));
                }
            }
        });
    });
}


//歸零
exports.resetTotalResources =(userId) =>{
    return new Promise((resolve, reject) => {
        db.query('UPDATE users SET totalResources = 0 WHERE user_id = ?', [userId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}


//存卡片
exports.saveCardToUserBag = (userId, cardType) => {
    return new Promise((resolve, reject) => {
        const cardId = uuidv4();  // 为每张卡片生成一个唯一的ID
        const query = 'INSERT INTO user_bag (card_id, user_id, card_type, quantity) VALUES (?, ?, ?, 1)';
        db.query(query, [cardId, userId, cardType], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};



exports.getCardsFromUserBag = (userId) => {
    return new Promise((resolve, reject) => {
        // 使用JOIN操作連接user_bag和card_images資料表
        const query = `
        SELECT ub.card_id, ub.card_type, ub.quantity, ci.image_url, ub.count
        FROM user_bag AS ub
        JOIN card_images AS ci ON ub.card_type = ci.card_type
        WHERE ub.user_id = ?
        
        `;
        db.query(query, [userId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};


//讀總卡片
exports.getTotalCardCountForUser = (userId) => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT SUM(totalCards) as totalCards FROM (
            SELECT SUM(quantity) as totalCards FROM user_bag WHERE user_id = ?
            UNION ALL
            SELECT SUM(quantity) as totalCards FROM mining_area WHERE user_id = ?
        ) as combinedResults`;



        db.query(query, [userId,userId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results[0].totalCards || 0); // 如果沒有卡片，則返回0
            }
        });
    });
};

//抽到A卡 讀卡片
exports.getCardCountForUser = (userId, cardType) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT SUM(cardACount) as totalCardCount FROM (
                SELECT SUM(quantity) as cardACount FROM user_bag WHERE user_id = ? AND card_type = ?
                UNION ALL
                SELECT SUM(quantity) as cardACount FROM mining_area WHERE user_id = ? AND card_type = ?
            ) as combinedCounts
        `;

        db.query(query, [userId, cardType, userId, cardType], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results[0].totalCardCount || 0); // 如果沒有該卡片，則返回0
            }
        });
    });
};

exports.moveToMiningArea = (userId, cardType, quantity) => {
    return new Promise(async (resolve, reject) => {
        try {
            const conn = await db.getConnection();
            // 先从 user_bag 表中获取 card_id
            const [rows] = await conn.query('SELECT card_id FROM user_bag WHERE user_id = ? AND card_type = ?', [userId, cardType]);
            if (rows.length > 0) {
                const cardId = rows[0].card_id;
                await conn.query('INSERT INTO mining_area (card_id, user_id, card_type, quantity) VALUES (?, ?, ?, ?)', [cardId, userId, cardType, quantity]);
                await conn.query('DELETE FROM user_bag WHERE user_id = ? AND card_type = ?', [userId, cardType]);
            }
            conn.release();
            resolve();
        } catch (error) {
            if (conn) conn.release();
            reject(error);
        }
    });
};

exports.moveToBackpack = (userId, cardType, quantity) => {
    return new Promise(async (resolve, reject) => {
        try {
            const conn = await db.getConnection();
            // 先从 mining_area 表中获取 card_id
            const [rows] = await conn.query('SELECT card_id FROM mining_area WHERE user_id = ? AND card_type = ?', [userId, cardType]);
            if (rows.length > 0) {
                const cardId = rows[0].card_id;
                await conn.query('INSERT INTO user_bag (card_id, user_id, card_type, quantity) VALUES (?, ?, ?, ?)', [cardId, userId, cardType, quantity]);
                await conn.query('DELETE FROM mining_area WHERE user_id = ? AND card_type = ?', [userId, cardType]);
            }
            conn.release();
            resolve();
        } catch (error) {
            if (conn) conn.release();
            reject(error);
        }
    });
};





// 在您的db模块或相应的数据库操作模块中
exports.getCardsInMiningArea = async (userId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT card_id, card_type, quantity FROM mining_area WHERE user_id = ?';  // 添加 card_id 字段
        db.query(query, [userId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};



exports.getCoinsForUser = (userId) =>{
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

exports.updateUserWallet = (userId, amount) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = 'UPDATE wallet SET coins = coins + ? WHERE user_id = ?';
        db.query(sqlQuery, [amount, userId], (error, results) => {
            if (error) {
                console.error('Error updating user wallet:', error);
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}


exports.getLatestTransactionStatusForUser = (userId, orderId) => {
    return new Promise((resolve, reject) => {
        console.log('getLatestTransactionStatusForUser已使用');
        
        // Modify the SQL query to include the orderId in the WHERE clause
        const sqlQuery = 'SELECT status FROM transactions WHERE user_id = ? AND order_id = ? ORDER BY transactionDate DESC LIMIT 1';
        
        db.query(sqlQuery, [userId, orderId], (error, results) => {
            if (error) {
                console.error('Error fetching latest transaction status:', error);
                reject(error);
            } else {
                console.log('456444', results);
                if (results && results.length > 0) {
                    resolve(results[0].status);
                } else {
                    resolve(null);  // 沒有找到交易
                }
            }
        });
    });
}



exports.insertTransactionRecord = (userId, amount, status, orderId) => {
    return new Promise((resolve, reject) => {
        // Add order_id to the SQL query
        const sql = "INSERT INTO transactions (user_id, amount, status, order_id, transactionDate) VALUES (?, ?, ?, ?, NOW())";
        
        // Include orderId in the query parameters
        db.query(sql, [userId, amount, status, orderId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}


exports.getWalletBalance = (req, res) => {
    const userId = req.session.userId;  // 假設您從session中獲取userId
    console.log("User ID:7777777777777777777==", userId);

    return new Promise((resolve, reject) => {
        const sqlQuery = 'SELECT coins FROM wallet WHERE user_id = ?';
        db.query(sqlQuery, [userId], (error, result) => {
            if (error) {
                console.error('Error fetching wallet balance:', error);
                reject(error);
            } else {
                if (result && result.length > 0) {
                    resolve({ success: true, coins: result[0].coins });
                } else {
                    resolve({ success: false, message: 'No wallet found for this user' });
                }
            }
        });
    })
    .then(response => {
        res.json(response);
    })
    .catch(error => {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    });
};
