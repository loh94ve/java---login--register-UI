const mysql = require("mysql");
const dotenv = require("dotenv");
dotenv.config({path:'./.env'});


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

//存卡片
exports.saveCardToUserBag = (userId, cardType) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO user_bag (user_id, card_type, quantity) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE quantity = quantity + 1';
        db.query(query, [userId, cardType], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

//讀卡片
// exports.getCardsFromUserBag = (userId) => {
//     return new Promise((resolve, reject) => {
//         const query = 'SELECT card_type, quantity FROM user_bag WHERE user_id = ?';
//         db.query(query, [userId], (error, results) => {
//             if (error) {
//                 reject(error);
//             } else {
//                 resolve(results);
//             }
//         });
//     });
// };

exports.getCardsFromUserBag = (userId) => {
    return new Promise((resolve, reject) => {
        // 使用JOIN操作連接user_bag和card_images資料表
        const query = `
            SELECT ub.card_type, ub.quantity, ci.image_url 
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
        const query = 'SELECT SUM(quantity) as totalCards FROM user_bag WHERE user_id = ?';
        db.query(query, [userId], (error, results) => {
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


// // 将卡片从背包移到挖矿区域
// async function moveToMiningArea(userId, cardType, quantity) {
//     const conn = await db.getConnection();
//     await conn.query('INSERT INTO mining_area (user_id, card_type, quantity) VALUES (?, ?, ?)', [userId, cardType, quantity]);
//     await conn.query('UPDATE backpack SET quantity = quantity - ? WHERE user_id = ? AND card_type = ?', [quantity, userId, cardType]);
//     conn.release();
// }

// // 从挖矿区域移回背包
// async function moveToBackpack(userId, cardType, quantity) {
//     const conn = await db.getConnection();
//     await conn.query('INSERT INTO backpack (user_id, card_type, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?', [userId, cardType, quantity, quantity]);
//     await conn.query('DELETE FROM mining_area WHERE user_id = ? AND card_type = ?', [userId, cardType]);
//     conn.release();
// }

exports.moveToMiningArea = (userId, cardType, quantity) => {
    return new Promise(async (resolve, reject) => {
        try {
            const conn = await db.getConnection();
            await conn.query('INSERT INTO mining_area (user_id, card_type, quantity) VALUES (?, ?, ?)', [userId, cardType, quantity]);
            await conn.query('UPDATE backpack SET quantity = quantity - ? WHERE user_id = ? AND card_type = ?', [quantity, userId, cardType]);
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
            await conn.query('INSERT INTO backpack (user_id, card_type, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?', [userId, cardType, quantity, quantity]);
            await conn.query('DELETE FROM mining_area WHERE user_id = ? AND card_type = ?', [userId, cardType]);
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
        const query = 'SELECT card_type, quantity FROM mining_area WHERE user_id = ?';
        db.query(query, [userId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

