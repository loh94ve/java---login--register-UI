  // 全局变量
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
    let totalResources = parseInt(localStorage.getItem('totalResources'), 10) || 0;
    let resourceRate ;  // 这个值可以根据你的需求进行初始化
    let interval;

    // 函数定义
 function startMining() {
        interval = setInterval(() => {
            const resourceRateElement = document.getElementById('resourceRate');
            const currentRate = parseInt(resourceRateElement.textContent, 10);
            updateTotalResources(currentRate);
            updateDisplay();
        }, 1000);
    }


    function stopMining() {
        clearInterval(interval);
    }
   

    function updateResourceRate(amount) {
        const resourceRateElement = document.getElementById('resourceRate');
        const currentRate = parseInt(resourceRateElement.textContent, 10);
        resourceRateElement.textContent = currentRate + amount;
        updateTotalResources(amount);
    }

    function updateTotalResources(amount) {
        totalResources += amount;
        localStorage.setItem('totalResources', totalResources);
        updateDisplay();
    }

    function updateDisplay() {
        document.getElementById('totalResources').textContent = totalResources;
    }

    // 当页面加载时开始挖矿
    document.addEventListener("DOMContentLoaded", startMining);








//移到礦區按鈕 
document.getElementById('moveAllToMining').addEventListener('click', async function() {  
   const userIdElement = document.getElementById('ID');
    const userId = userIdElement ? userIdElement.textContent : null;

    const response = await fetch('/getUserCards');
    const data = await response.json();

    if (data.cards.length === 0) {
        alert('沒有卡片了');
        return;
    }   
    
    moveUserCards('/moveToMining', '成功移動至礦區！');
    loadMiningCards(); // 加载矿区卡片
});



//背包卡片移到礦區
function moveUserCards(endpoint, successMessage) {
    const userIdElement = document.getElementById('ID');
    const userId = userIdElement ? userIdElement.textContent : null;
    
    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: userId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(successMessage);
            loadUserCards();
            loadMiningCards();
            updateMiningArea(userId);
            
            // 使用从服务器返回的 bonus 值来更新 resourceRate
            if (data.bonus) {
                updateResourceRate(data.bonus);
                console.log("Returned bonus from server2222222222222222:", data.bonus);
            }
        } else {
            alert('移动失败：' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

//移到背包按鈕
document.getElementById('moveToBackpackButton').addEventListener('click',async function() {

    const response = await fetch('/getMiningCards');
    const data = await response.json();

    if (data.cards.length === 0) {
        alert('沒有卡片了');
        return;
    }
    moveMiningCards('/moveToBackpack', '成功移動回背包！');
    loadUserCards(); // 加载用户背包卡片
});

//礦區卡片移到到背包
function moveMiningCards(endpoint, successMessage) {
    const userIdElement = document.getElementById('ID');
    const userId = userIdElement ? userIdElement.textContent : null;

    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: userId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(successMessage);
            loadUserCards();
            loadMiningCards();
            updateResourceRate(-data.bonus);
            updateMiningArea(userId);
            console.log("Returned bonus from server2222222222222222:", -data.bonus); 
        } else {
            alert('移動失敗：' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
//收金幣
function collectCoins() {
        stopMining();

        fetch('/collectCoins', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ coins: totalResources })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                totalResources = 0;
                localStorage.setItem('totalResources', totalResources);
                document.getElementById('totalResources').textContent = totalResources;
                startMining();
            } else {
                alert("错误: " + data.message);
                startMining();
            }
        });
    }

//讀取背包卡片
function loadUserCards() {
    fetch('/getUserCards')
    .then(response => response.json())
    .then(data => {
        // 清除先前的卡片
        const userCardsDiv = document.getElementById('userCards');
        userCardsDiv.innerHTML = '';

        const cardsData = data.cards;
        cardsData.forEach(card => {
            for (let i = 0; i < card.quantity; i++) {
                const imgElement = document.createElement('img');
                imgElement.src = card.image_url;
                imgElement.alt = `Card ${card.card_type}`;
                userCardsDiv.appendChild(imgElement);
            }
        });
    })
    .catch(error => {
        console.error('Error fetching user cards:', error);
    });
}
//讀取礦區卡片
function loadMiningCards() {
    fetch('/getMiningCards')
    .then(response => response.json())
    .then(data => {
        // 清除先前的卡片
        const miningCardsDiv = document.getElementById('miningCards');
        miningCardsDiv.innerHTML = '';

        const cardsData = data.cards;
        cardsData.forEach(card => {
            for (let i = 0; i < card.quantity; i++) {
                const imgElement = document.createElement('img');
                imgElement.src = card.image_url;
                imgElement.alt = `Card ${card.card_type}`;
                miningCardsDiv.appendChild(imgElement);
            }
        });
    })
    .catch(error => {
        console.error('Error fetching mining cards:', error);
    });
}






function updateMiningArea(userId) {
    
    fetch('/api/updateMiningArea', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: userId })
    })
    .then(response => response.json())
    .then(data => {
        const newRate = data.newResourceRate;
        console.log('newRate00000000000000',newRate)
        document.getElementById("resourceRate").textContent = newRate;
    })
    .catch(error => {
        console.error('Error updating mining area:', error);
    });
}

function getResourceRate(userId){
    if (!userId) {
        console.error('User ID is not provided.');
        return;
    }

    fetch(`/api/getResourceRate/${userId}`)
    .then(response => response.json())
    .then(data => {
        const currentRate = data.resourceRate;
        console.log('currentRate00000000000000',currentRate)
        document.getElementById("resourceRate").textContent = currentRate;
    })
    .catch(error => {
        console.error('Error fetching resource rate:', error);
    });
}









window.onload = function() {
    const userIdElement = document.getElementById('ID');
    const userId = userIdElement ? userIdElement.textContent : null;
    loadUserCards();
    loadMiningCards()
    getResourceRate(userId)
    
}