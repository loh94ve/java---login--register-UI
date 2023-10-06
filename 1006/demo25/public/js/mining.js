let totalResources = 0;
let resourceRate ;
let interval;


//全選/取消全選
const toggleSelectButton = document.getElementById('toggleSelect');

if (toggleSelectButton) {
    toggleSelectButton.addEventListener('click', toggleSelect);
}

function toggleSelect() {
    const checkboxes = document.querySelectorAll('.card-checkbox');
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
    const anyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
    
    if (allChecked) {
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        toggleSelectButton.textContent = '全選/取消全選';
    } else if (anyChecked) {
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        toggleSelectButton.textContent = '全選/取消全選';
    } else {
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        toggleSelectButton.textContent = '全選/取消全選';
    }
}

// 监听每个复选框的状态改变，以便更新全选按钮的状态
document.querySelectorAll('.card-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', updateToggleSelectButton);
});

function updateToggleSelectButton() {
    const checkboxes = document.querySelectorAll('.card-checkbox');
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
    toggleSelectButton.textContent = allChecked ? '全選/取消全選' : '全選/取消全選';
}







//移到背包按鈕
// document.getElementById('moveToBackpackButton').addEventListener('click',async function() {

//     const response = await fetch('/getMiningCards');
//     const data = await response.json();

//     if (data.cards.length === 0) {
//         alert('沒有卡片了');
//         return;
//     }
//     moveMiningCards('/moveToBackpack', '成功移動回背包！');
//     loadUserCards(); // 加載用户背包卡片
// });

//移到背包按鈕
// const moveToBackpackButton = document.getElementById('moveToBackpackButton');
// if (moveToBackpackButton) {  // 判断按钮是否存在
//     moveToBackpackButton.addEventListener('click', async function() {
//         const response = await fetch('/getMiningCards');
//         const data = await response.json();

//         if (data.cards.length === 0) {
//             alert('沒有卡片了');
//             return;
//         }
//         moveMiningCards('/moveToBackpack', '成功移動回背包！');
//         loadUserCards(); // 加載用戶背包卡片

        
//     });
// }


//礦區卡片移到到背包
// function moveMiningCards(endpoint, successMessage) {
//     const userIdElement = document.getElementById('ID');
//     const userId = userIdElement ? userIdElement.textContent : null;

//     fetch(endpoint, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ userId: userId })
//     })
//     .then(response => response.json())
//     .then(async data => {
//         if (data.success) {
//             alert(successMessage);
//             await loadUserCards();
//             await loadMiningCards();
//             updateResourceRate(-data.bonus);
//             await updateMiningArea(userId);
//             location.reload();
//             console.log("Returned bonus from server2222222222222222:", -data.bonus); 
//         } else {
//             alert('移動失敗02：' + data.message);
//         }
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });
    
// }

//移到礦區按鈕 
// const moveAllToMining = document.getElementById('moveAllToMining');

// if(moveAllToMining){
//     moveAllToMining.addEventListener('click', async function() {  
//         const userIdElement = document.getElementById('ID');
//         const userId = userIdElement ? userIdElement.textContent : null;
    
//         const response = await fetch('/getUserCards');
//         const data = await response.json();
    
//         if (data.cards.length === 0) {
//             alert('沒有卡片了');
//             return;
//         }   
        
//         moveUserCards('/moveToMining', '成功移動至礦區！');
//         loadMiningCards(); // 加載礦區卡片
//     });
// }
 
 
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
             //loadMiningCards();
             updateMiningArea(userId);
             
             // 使用從伺服器返回的 bonus 值来更新 resourceRate
            if (document.getElementById('resourceRate')) {
                if (data.bonus) {
                    updateResourceRate(data.bonus);
                    console.log("Returned bonus from server:", data.bonus);
                }
            }
        } else {
             alert('移動失敗01：' + data.message);
         }
     })
     .catch(error => {
         console.error('Error:', error);
     });
}

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
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.classList.add('card-checkbox');
                    imgContainer.appendChild(checkbox);
    
                    const imgElement = document.createElement('img');
                    imgElement.src = card.image_url;
                    imgElement.alt = `Card ${card.card_type}`;
                    imgElement.classList.add('card-image');  
                    imgContainer.appendChild(imgElement);
                    
                    cardContainer.appendChild(imgContainer);
                    
                    userCardsDiv.appendChild(cardContainer);
                    
                    cardContainer.setAttribute('data-card_id', card.card_id);  // 確保 card_id 字段現在包含在你的 card 對象中
                    
                    imgContainer.addEventListener('click', (event) => {
                        if (event.target !== checkbox) {
                            checkbox.checked = !checkbox.checked;
                        }
                    });
                }
            });
        }
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
        const miningCardsDiv = document.getElementById('miningCards');
        if(miningCardsDiv){
            miningCardsDiv.innerHTML = '';
            const cardsData = data.cards;
            cardsData.forEach(card => {
                for (let i = 0; i < card.quantity; i++) {
                    // 創建容器元素
                    const cardContainer = document.createElement('div');
                    cardContainer.classList.add('card-container');
                    
                    // 創建圖像容器元素
                    const imgContainer = document.createElement('div');
                    imgContainer.classList.add('img-container');
                    
                    // 創建並添加複選框
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.classList.add('card-checkbox');
                    imgContainer.appendChild(checkbox);

                    // 創建並添加圖像
                    const imgElement = document.createElement('img');
                    imgElement.src = card.image_url;
                    imgElement.alt = `Card ${card.card_type}`;
                    imgElement.classList.add('card-image');  // 添加類明，以便稍后在事件处理程序中使用
                    imgContainer.appendChild(imgElement);

                    // 將圖像容器添加到卡片容器中
                    cardContainer.appendChild(imgContainer);

                    // 將卡片容器添加到 userCardsDiv
                    miningCardsDiv.appendChild(cardContainer);

                    cardContainer.setAttribute('data-card_id', card.card_id);

                    // 添加 click 事件監聽器
                    imgContainer.addEventListener('click', (event) => {
                        // 避免雙重切換
                        if (event.target !== checkbox) {
                            checkbox.checked = !checkbox.checked;
                        }
                    });
                }
            });
        }
    })
    .catch(error => {
        console.error('Error fetching mining cards:', error);
    });
}

 




//收金幣
function collectCoins() {
        

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
                //localStorage.setItem('totalResources', totalResources);
                document.getElementById('totalResources').textContent = totalResources;                
            } else {
                alert("錯誤: " + data.message);
            
            }
        });
    }

//更新礦區區域
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
        console.log('newRate00000000000000', newRate);
        const resourceRateElement = document.getElementById("resourceRate");
        if (resourceRateElement) {
            resourceRateElement.textContent = newRate;
        } else {
            console.warn('Element with ID "resourceRate" not found in DOM.');
        }
    })
    .catch(error => {
        console.error('Error updating mining area:', error);
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


function incrementTotalResources(amount) {
    totalResources += amount;  // 使用傳遞的數量 (amount) 來更新 totalResources
    updateDisplay();      // 更新頁面顯示
    updateTotalResourcesInDatabase(totalResources);
      // 保存到數據庫
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


