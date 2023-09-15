var totalResources = parseInt(localStorage.getItem('totalResources'), 10) || 0;
var pn =parseInt(localStorage.getItem('totalCards'));
let coins = parseInt(localStorage.getItem('coins'));
let inventoryArray = [];
let mine = [];
let mineOutput = 0;  // 我添加了這個，以跟踪矿场的输出
let resourcePerSecond = 1;
var resourceRate = 1;

// 我加入了卡片的描述，这可以帮助你方便地获取卡片的描述
const cardDescriptions = {
    A: '<img src="/images/pok/A.png" alt="Card A">',
    B: '<img src="/images/pok/B.png" alt="Card B">',
    C: '<img src="/images/pok/C.png" alt="Card C">',
    D: '<img src="/images/pok/D.png" alt="Card D">',
    E: '<img src="/images/pok/E.png" alt="Card E">',
    F: '<img src="/images/pok/F.png" alt="Card F">',
    G: '<img src="/images/pok/G.png" alt="Card G">',
    H: '<img src="/images/pok/H.png" alt="Card H">',
    I: '<img src="/images/pok/I.png" alt="Card I">',
    J: '<img src="/images/pok/J.png" alt="Card J">',
    K: '<img src="/images/pok/K.png" alt="Card K">',
    L: '<img src="/images/pok/L.png" alt="Card L">',
    M: '<img src="/images/pok/M.png" alt="Card M">',
    N: '<img src="/images/pok/N.png" alt="Card N">',
    O: '<img src="/images/pok/O.png" alt="Card O">',
    P: '<img src="/images/pok/P.png" alt="Card P">',
    Q: '<img src="/images/pok/Q.png" alt="Card Q">',
    R: '<img src="/images/pok/R.png" alt="Card R">',
    S: '<img src="/images/pok/S.png" alt="Card S">',
    T: '<img src="/images/pok/T.png" alt="Card T">',
    U: '<img src="/images/pok/U.png" alt="Card U">',
    V: '<img src="/images/pok/V.png" alt="Card V">',
    W: '<img src="/images/pok/W.png" alt="Card W">',
    X: '<img src="/images/pok/X.png" alt="Card X">',
    Y: '<img src="/images/pok/Y.png" alt="Card Y">',
    Z: '<img src="/images/pok/Z.png" alt="Card Z">',
    AA: '<img src="/images/pok/AA.png" alt="Card AA">',
    AB: '<img src="/images/pok/AB.png" alt="Card AB">',
    AC: '<img src="/images/pok/AC.png" alt="Card AC">',
    AD: '<img src="/images/pok/AD.png" alt="Card AD">',
    
};

function updateResource() {
    totalResources += resourceRate;
    localStorage.setItem('totalResources', totalResources);
}

function updateDisplay() {      
    const totalResourcesDisplay = document.getElementById('totalResources');
    if (totalResourcesDisplay) {
        totalResourcesDisplay.textContent = totalResources;
    } 
}

function updateCoins(coins) {
    const coinsElement = document.getElementById('coins');
    if (coinsElement) {
        coinsElement.textContent = coins;
    }
}
function updateCoins() {
    const coinsElement = document.getElementById('coins');
    if (coinsElement) {
        coinsElement.textContent = coins;
    }
}




function updatepn(totalCards) {
    console.log('updatepn 函數被調用了'); // 添加這行
    document.getElementById("pn").textContent = totalCards;
}


function collectCoins() {
    coins += totalResources;
    totalResources = 0;
    localStorage.setItem('totalResources', totalResources);
    localStorage.setItem('coins', coins);
    updateDisplay();
    localStorage.removeItem('totalResources');
}

setInterval(() => {
    updateResource();
    updateDisplay();
}, 1000);

window.collectCoins = collectCoins;


function drawCard1() {
    var quantity = parseInt(document.getElementById('myInput').value, 10);
    drawCard(quantity, 10);
}

function drawCard2() {
    var quantity = parseInt(document.getElementById('myInput2').value, 10);
    drawCard(quantity, 20);
}

function addToMine() {
    let cards = JSON.parse(localStorage.getItem('cards')) || [];
    if (cards.length > 0) {
        mine = mine.concat(cards);
        cards = []; // Clear the cards array
        localStorage.setItem('cards', JSON.stringify(cards)); // Store the empty array
        updateMineOutput();

        resourceRate += mineOutput;  // Update the resource rate
        updateDisplay();
        updateInventoryDisplay();
    } else {
        alert("背包中没有卡片。");
    }
}

function updateInventoryDisplay() {
    let cards = JSON.parse(localStorage.getItem('cards')) || [];
    let inventoryListElement = document.getElementById('inventoryList');
    
    if (inventoryListElement) {
        // 清除之前的所有卡片
        inventoryListElement.innerHTML = '';
        
        // 對於背包中的每一張卡片，單獨添加到清單中
        cards.forEach(cardType => {
            let cardItem = document.createElement('li');
            cardItem.textContent = cardDescriptions[cardType];
            inventoryListElement.appendChild(cardItem);
        });
    }
}



function updateMineOutput() {
    let totalOutput = 0;
    for (let i = 0; i < mine.length; i++) {
        if (mine[i] === "A") {
            totalOutput += 5;
        } else if (mine[i] === "B") {
            totalOutput += 2;
        } else if (mine[i] === "C") {
            totalOutput += 1;
        } else if (mine[i] === "D") {
            totalOutput += 0.5;
        }
    }
    mineOutput = totalOutput;
}
function imsgbtn() {
    document.getElementById('idivmesg2').style.display = 'none';
}

function imsgbtn1() {
    document.getElementById('idivmesg1').style.display = 'none';
}


// ------- 登入檢查相關功能 -------


document.addEventListener('DOMContentLoaded', function() {
    // 檢查是否存在登出按鈕，如果存在，則綁定事件
    const logoutButton = document.getElementById('logout');
    if(logoutButton) {
        logoutButton.addEventListener('click', function() {
            // 清除localStorage和sessionStorage
            localStorage.clear();
            sessionStorage.clear();

            fetch('/logout', { method: 'POST' }).then(() => {
                window.location.reload(true); // 強制刷新頁面
            });
        });
    }

    // 檢查是否存在登入按鈕，如果存在，則綁定事件 (如果你有登入的JS邏輯)
    const loginButton = document.getElementById('login');
    if(loginButton) {
        // ...綁定你的登入邏輯...
    }
});


// ------- 初始化遊戲狀態與控制項 -------
function initCoinsAndPn() {
    var coins = parseInt(localStorage.getItem('coins'), 10);
    var pn = parseInt(localStorage.getItem('pn'), 10);

    if (isNaN(coins) && isNaN(pn)) {
        coins = 0;
        pn = 0;
    }

    updateCoins();
    updatepn();

    window.drawCard1 = drawCard1;
    window.drawCard2 = drawCard2;
}

function initInputControls() {
    var myInput = document.getElementById("myInput");
    var myInput2 = document.getElementById("myInput2");
    var costSpan = document.getElementById("cost");
    var costSpan2 = document.getElementById("cost2");
    var incrementButton = document.getElementById("increment");
    var incrementButton2 = document.getElementById("increment2");
    var decrementButton = document.getElementById("decrement");
    var decrementButton2 = document.getElementById("decrement2");

    myInput.addEventListener("input", () => updateCost(myInput, costSpan, 10));
    incrementButton.addEventListener("click", () => adjustInputValue(myInput, 1, costSpan, 10));
    decrementButton.addEventListener("click", () => adjustInputValue(myInput, -1, costSpan, 10));

    myInput2.addEventListener("input", () => updateCost(myInput2, costSpan2, 20));
    incrementButton2.addEventListener("click", () => adjustInputValue(myInput2, 1, costSpan2, 20));
    decrementButton2.addEventListener("click", () => adjustInputValue(myInput2, -1, costSpan2, 20));
}

function updateCost(inputElement, costElement, multiplier) {
    var quantity = parseInt(inputElement.value, 10);

    if (!isNaN(quantity) && quantity >= 1) {
        var cost = quantity * multiplier;
        costElement.textContent = cost;
    } else {
        costElement.textContent = multiplier; 
        inputElement.value = "1"; 
    }
}

function adjustInputValue(inputElement, incrementValue, costElement, multiplier) {
    var currentValue = parseInt(inputElement.value, 10);
    if (isNaN(currentValue)) {
        currentValue = 0;
    }

    inputElement.value = currentValue + incrementValue;
    updateCost(inputElement, costElement, multiplier);
}

function drawSingleCard() {
    const cards = ['A', 'B', 'C', 'D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','AA','AB','AC','AD' ];
    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    return cardDescriptions[randomCard];
}



function drawCard(quantity, costPerCard) {
    const totalCost = quantity * costPerCard;
    console.log('coins1', coins);

    if (coins >= totalCost) {
        purchaseCards(quantity, costPerCard);
    } else {
        alert("金幣不足，無法抽卡01。");
    }
}


function purchaseCards(quantity, costPerCard) {
    fetch('/shop', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            quantity: quantity,
            costPerCard: costPerCard
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            coins = data.newCoins;
            console.log("購買完:", coins);

            displayPurchasedCards(data.cards);
            getCoinsAndCardsFromServer();
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error("Error in fetch:", error);
        alert("Failed to fetch data.");
    });
}

function displayPurchasedCards(cards) {
    
    var cardCountElement = document.getElementById("myInput");
    var num = parseInt(cardCountElement.value, 10); // 從輸入框獲取選擇的數量

    var cardResultsElement = document.getElementById("cardResults");
    cardResultsElement.innerHTML = ""; // 清空先前的結果

    for (let card of cards) {
        cardResultsElement.innerHTML += cardDescriptions[card];
    }
    idivmesg2.style.display = "flex";
}



// function displayPurchasedCards(cards) {
//     let cardResult = cards.map(cardType => cardDescriptions[cardType]).join("\n");
//     document.getElementById("mycard").innerText = cardResult;
//     idivmesg2.style.display = "flex";
// }

function getCoinsAndCardsFromServer() {
    console.log('getCoinsAndCardsFromServer 函數被調用了');

    fetch('/getUserData')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            updateCoins(data.coins);
            updatepn(data.totalCards);
            updateCardACount(data.cardCount);

            localStorage.setItem('coins', data.coins);
            localStorage.setItem('totalCards', data.totalCards);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error.message);
        });
}

function updateCardACount(count) {
    const cardACountElement = document.getElementById('cardACount'); // 假設您的A卡數量顯示在一個ID為'cardACount'的元素中
    cardACountElement.textContent = count;
}

