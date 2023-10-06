window.onload = function() {
    fetchCharacterDataAndStartBattle();
    fetchBossDataAndStartBattle()   
    
};
const urlParts = window.location.pathname.split('/');
const cardId = urlParts[urlParts.length - 2];  // cardId 是 12345




function fetchCharacterDataAndStartBattle() {
    fetch('/getCharacterData/' + cardId)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        character1 = {
            health: data.health,
            maxHealth: data.health,
            agility: data.agility,
            strength: data.strength
        };
        console.log(character1);
        
    })
    .catch(error => console.error('Error:', error));
}

function fetchBossDataAndStartBattle() {
    fetch('/getRandomBossData' )
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        character2 = {
            health: data.health,
            maxHealth: data.health,
            agility: data.agility,
            strength: data.strength
        };
        console.log(character2);
        battleRound();  // 开始战斗
        
    })
    .catch(error => console.error('Error:', error));
}




function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

function decideWhoseTurn(character1, character2) {
    if (character1.health <= 0) return character2;
    if (character2.health <= 0) return character1;

    const totalAgility = character1.agility + character2.agility;

    // 計算每個角色的出手機率
    const char1Chance = character1.agility / totalAgility;
    const char2Chance = character2.agility / totalAgility;

    // 產生一個0到1之間的隨機數
    const randomValue = Math.random();

    // 使用隨機數和機率來決定誰先出手
    return randomValue <= char1Chance ? character1 : character2;
}


function attack(attacker, defender) {
    const attackerElement = document.getElementById(attacker === character1 ? 'character1' : 'character2');
    const defenderElement = document.getElementById(attacker === character1 ? 'character2' : 'character1');
    
    attackerElement.classList.add('attack');
    defenderElement.classList.add('hit');

    setTimeout(() => {
        attackerElement.classList.remove('attack');
        
        const damage = attacker.strength * getRandomNumber(0.8, 1.2);
        defender.health -= damage;

        // 如果血量為負，設為0
        if (defender.health < 0) {
            defender.health = 0;
        }

        updateUI();

        if (defender.health <= 0) {
            setTimeout(() => {
                endGame(attacker);
            }, 1000);  // 延遲1秒顯示勝利信息
        } else {
            battleRound();
        }
    }, 500);

    setTimeout(() => {
        defenderElement.classList.remove('hit');
    }, 500);
}


function updateUI() {
    const character1HealthPercentage = (character1.health / character1.maxHealth) * 100;
    const character2HealthPercentage = (character2.health / character2.maxHealth) * 100;

    document.querySelector('#healthBar1 .health').style.width = `${character1HealthPercentage}%`;
    document.querySelector('#healthBar2 .health').style.width = `${character2HealthPercentage}%`;

    document.querySelector('#healthBar1 .health-text').textContent = `${Math.round(character1.health)}/${character1.maxHealth}`;
    document.querySelector('#healthBar2 .health-text').textContent = `${Math.round(character2.health)}/${character2.maxHealth}`;
}

function endGame(winner) {
    const winnerName = winner === character1 ? "玩家" : "電腦";
    alert(winnerName + " 勝利！遊戲結束");

    if (winnerName === "玩家") {
        // 如果玩家勝利，增加 50 元
        fetch('/update-wallet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount: 50 })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("恭喜！您的錢包增加了 50 元！");
            } else {
                alert("更新錢包失敗，請稍後再試。");
            }
            window.location.href = '/battle';
        })
        .catch(error => {
            console.error('Error:', error);
            alert("更新錢包失敗，請稍後再試。");
            window.location.href = '/battle';
        });
    } else {
        // 如果玩家輸了，直接返回戰鬥頁面
        window.location.href = '/battle';
    }
}


function battleRound() {
    updateUI();
    // 檢查兩角色的健康狀態
    if (character1.health <= 0 || character2.health <= 0) {
        return; // 如果有一個角色血條已經為零，則直接返回，不再進行攻擊
    }

    const firstAttacker = decideWhoseTurn(character1, character2);
    const defender = firstAttacker === character1 ? character2 : character1;
    setTimeout(() => {
        attack(firstAttacker, defender);
    }, 1000);
}

