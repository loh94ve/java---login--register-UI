// exports.getRandomCardType = function() {
//     let randomNumber = Math.random();
//     if (randomNumber < 0.01) {
//         return "A";
//     } else if (randomNumber < 0.06) {
//         return "B";
//     } else if (randomNumber < 0.46) {
//         return "C";
//     } else {
//         return "D";
//     }
// }


// exports.getRandomCardType = function() {
//     let randomNumber = Math.random();

//     if (randomNumber < 0.54) {
//         // 返回01到10之間的隨機數字
//         let cardNumber = Math.floor(randomNumber / 0.054) + 1;
//         return cardNumber.toString().padStart(2, '0');
//     } else if (randomNumber < 0.94) { // 0.54 + 0.40 = 0.94
//         // 返回11到20之間的隨機數字
//         let cardNumber = Math.floor((randomNumber - 0.54) / 0.04) + 11;
//         return cardNumber.toString().padStart(2, '0');
//     } else {
//         // 返回21到30之間的隨機數字
//         let cardNumber = Math.floor((randomNumber - 0.94) / 0.006) + 21;
//         return cardNumber.toString().padStart(2, '0');
//     }
// }

exports.getRandomCardType = function() {
    const cardTypes = [
        { type: "A", probability: 0.01 },
        { type: "B", probability: 0.02 },
        { type: "C", probability: 0.03 },
        { type: "D", probability: 0.03 },
        { type: "E", probability: 0.03 },
        { type: "F", probability: 0.03 },
        { type: "G", probability: 0.03 },
        { type: "H", probability: 0.03 },
        { type: "I", probability: 0.03 },
        { type: "J", probability: 0.03 },
        { type: "K", probability: 0.03 },
        { type: "L", probability: 0.03 },
        { type: "M", probability: 0.03 },
        { type: "N", probability: 0.03 },
        { type: "O", probability: 0.03 },
        { type: "P", probability: 0.03 },
        { type: "Q", probability: 0.03 },
        { type: "R", probability: 0.03 },
        { type: "S", probability: 0.03 },
        { type: "T", probability: 0.03 },
        { type: "U", probability: 0.03 },
        { type: "V", probability: 0.03 },
        { type: "W", probability: 0.03 },
        { type: "X", probability: 0.03 },
        { type: "Y", probability: 0.03 },
        { type: "Z", probability: 0.03 },
        { type: "AA", probability: 0.03 },
        { type: "AB", probability: 0.03 },
        { type: "AC", probability: 0.03 },
        { type: "AD", probability: 0.16 },
    ];

    let randomNumber = Math.random();
    let cumulativeProbability = 0;

    for (const cardType of cardTypes) {
        cumulativeProbability += cardType.probability;
        if (randomNumber < cumulativeProbability) {
            return cardType.type;
        }
    }
    return "AD";
}
// exports.calculateMiningBonus = function(cardsInMiningArea) {
//     let bonus = 0;
//     for (const card of cardsInMiningArea) {
//         switch (card.card_type) {
//             case 'A': bonus += 5 * card.quantity; break;
//             case 'B': bonus += 4 * card.quantity; break;
//             case 'C': bonus += 3 * card.quantity; break;
//             case 'D': bonus += 3 * card.quantity; break;
//             case 'E': bonus += 3 * card.quantity; break;
//             case 'F': bonus += 3 * card.quantity; break;
//             case 'G': bonus += 3 * card.quantity; break;
//             case 'H': bonus += 3 * card.quantity; break;
//             case 'I': bonus += 3 * card.quantity; break;
//             case 'J': bonus += 3 * card.quantity; break;
//             case 'K': bonus += 3 * card.quantity; break;
//             case 'L': bonus += 3 * card.quantity; break;
//             case 'O': bonus += 3 * card.quantity; break;
//             case 'P': bonus += 3 * card.quantity; break;
//             case 'Q': bonus += 3 * card.quantity; break;
//             case 'R': bonus += 3 * card.quantity; break;
//             case 'S': bonus += 3 * card.quantity; break;
//             case 'T': bonus += 3 * card.quantity; break;
//             case 'U': bonus += 3 * card.quantity; break;
//             case 'V': bonus += 3 * card.quantity; break;
//             case 'W': bonus += 3 * card.quantity; break;
//             case 'X': bonus += 3 * card.quantity; break;
//             case 'Y': bonus += 3 * card.quantity; break;
//             case 'Z': bonus += 3 * card.quantity; break;
//             case 'AA': bonus += 3 * card.quantity; break;
//             case 'AB': bonus += 3 * card.quantity; break;
//             case 'AC': bonus += 3 * card.quantity; break;
//             case 'AD': bonus += 3 * card.quantity; break;
//             // ... 其他卡片类型
//         }
//     }
//     return bonus;
// }

const CARD_BONUSES = {
    'A': 5,
    'B': 4,
    'C': 3,
    'D': 3,
    'E': 3,
    'F': 3,
    'G': 3,
    'H': 3,
    'I': 3,
    'J': 3,
    'K': 3,
    'L': 3,
    'O': 3,
    'P': 3,
    'Q': 3,
    'R': 3,
    'S': 3,
    'T': 3,
    'U': 3,
    'V': 3,
    'W': 3,
    'X': 3,
    'Y': 3,      
    'Z': 3,
    'AA': 3,
    'AB': 3,
    'AC': 3,
    'AD': 3
};

exports.calculateMiningBonus = function(cardsInMiningArea) {
    console.trace("calculateMiningBonus is called");
    console.log("calculateMiningBonus is called with cards:", cardsInMiningArea); 
    let bonus = 0;
    for (const card of cardsInMiningArea) {
        if (CARD_BONUSES[card.card_type]) {
            bonus += CARD_BONUSES[card.card_type] * card.quantity;
        }
        // 可以添加一个 else 语句来处理未知的卡片类型，如果需要的话
    }
    console.log("Calculated bonus:", bonus); 
    return bonus;
}
