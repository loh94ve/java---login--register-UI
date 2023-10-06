let totalResources = 0;
let resourceRate ;
let interval;




//讀取背包卡片
function loadUserCards() {
    fetch('/getUserCards')
    .then(response => {
        if (!response.ok) {
            throw new Error('Server response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const userCardsDiv = document.getElementById('userCards');
        if(userCardsDiv){
            userCardsDiv.innerHTML = '';
            const cardsData = data.cards;
            console.log('456465466546',cardsData)
            cardsData.forEach(card => {
                for (let i = 0; i < card.quantity; i++) {
                    const cardContainer = document.createElement('div');
                    cardContainer.classList.add('card-container');
                    
                    const imgContainer = document.createElement('div');
                    imgContainer.classList.add('img-container');
                    
                    
                    const imgElement = document.createElement('img');
                    imgElement.src = card.image_url;
                    imgElement.alt = `Card ${card.card_type}`;
                    imgElement.classList.add('card-image');  
                    imgContainer.appendChild(imgElement);

                    const countCircle = document.createElement('div');
                    countCircle.classList.add('count-circle');
                    countCircle.textContent = card.count;  // 确保 count 字段现在包含在你的 card 对象中

                    imgContainer.appendChild(countCircle);

                    
                    cardContainer.appendChild(imgContainer);
                    
                    
                    userCardsDiv.appendChild(cardContainer);
                    
                    cardContainer.setAttribute('data-card_id', card.card_id);  // 確保 card_id 字段現在包含在你的 card 對象中
                    
                    
                }
            });
        }
    })
    .catch(error => {
        console.error('Error fetching user cards:', error);
    });
}




//更新資產產出
function updateResourceRate(amount) {
    const resourceRateElement = document.getElementById('resourceRate');
    if (!resourceRateElement) {
        console.warn('Element with ID "resourceRate" not found in DOM.');
        return;
    }
    const currentRate = parseInt(resourceRateElement.textContent, 10);
    resourceRateElement.textContent = currentRate + amount;
    incrementTotalResources(amount);
}



//更新當前資源
function updateTotalResources(amount) {
    totalResources += amount;
    localStorage.setItem('totalResources', totalResources);
    updateDisplay();
}




//獲取資源
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
//
function updateDisplay() {
    document.getElementById('totalResources').textContent = totalResources;
}





function updateTotalResourcesInDatabase(updatedTotalResources) {
    fetch('/updateTotalResources', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        
        body: JSON.stringify({ totalResources: updatedTotalResources })
        
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            console.error('Error updating totalResources in database.');
        }
    });
}
function fetchTotalResourcesFromDatabase() {
    fetch('/getTotalResources')
    .then(response => response.json())
    .then(data => {
        totalResources = data.totalResources;
        updateDisplay();  // 顯示更新的值
    });
}

function incrementTotalResources(amount) {
    totalResources += amount;  // 使用傳遞的數量 (amount) 來更新 totalResources
    updateDisplay();      // 更新頁面顯示
    updateTotalResourcesInDatabase(totalResources);
      // 保存到數據庫
}





//開始挖礦
function startMining() {
    const resourceRateElement = document.getElementById('resourceRate');
    console.log('currentRate878787',resourceRateElement)
    const currentRate = parseInt(resourceRateElement.textContent, 10);
    interval = setInterval(() => {
        incrementTotalResources(currentRate);  
    }, 1000);

    
}

//停止挖礦
function stopMining() {
    clearInterval(interval);
}

//選擇卡片到礦區
const moveSelectedToMining = document.getElementById('moveSelectedToMining');

if (moveSelectedToMining) {
    moveSelectedToMining.addEventListener('click', async function() {  
        const userIdElement = document.getElementById('ID');
        const userId = userIdElement ? userIdElement.textContent : null;

        const checkedCards = Array.from(document.querySelectorAll('.card-checkbox:checked')).map((checkbox) => {
            const cardContainer = checkbox.closest('.card-container');
            const imgElement = cardContainer.querySelector('.card-image');
            const cardId = cardContainer.getAttribute('data-card_id');
            return {
                cardId: cardId,
                card_type: imgElement.alt.replace('Card ', '')
            };
        });

        if (checkedCards.length === 0) {
            alert('請選擇卡片');
            return;
        }   

        const response = await fetch('/moveSelectedToMining', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                cards: checkedCards
            })
        });

        const data = await response.json();
        if (data.success) {
            alert('成功移动至礦區！');
            loadUserCards();
            loadMiningCards();
            updateMiningArea(userId);  // 加載礦區卡片
        } else {
            alert('移動失敗: ' + data.message);
        }
    });
}

//選擇卡片到背包
const moveSelectedToBackpack = document.getElementById('moveSelectedToBackpack');

if (moveSelectedToBackpack) {
    moveSelectedToBackpack.addEventListener('click', async function() {  
        const userIdElement = document.getElementById('ID');
        const userId = userIdElement ? userIdElement.textContent : null;

        const checkedCards = Array.from(document.querySelectorAll('.card-checkbox:checked')).map((checkbox) => {
            const cardContainer = checkbox.closest('.card-container');
            const imgElement = cardContainer.querySelector('.card-image');
            const cardId = cardContainer.getAttribute('data-card_id');
            return {
                cardId: cardId,
                card_type: imgElement.alt.replace('Card ', '')
            };
        });

        if (checkedCards.length === 0) {
            alert('請選擇卡片');
            return;
        }   

        const response = await fetch('/moveSelectedToBackpack', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                cards: checkedCards
            })
        });

        const data = await response.json();
        if (data.success) {
            alert('成功移動背包！');
            loadUserCards();
            loadMiningCards();
            updateMiningArea(userId);  // 加載礦區卡片
            location.reload()
        } else {
            alert('移動失敗: ' + data.message);
        }
    });
}

































