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



function startMining() {
    const resourceRateElement = document.getElementById('resourceRate');
    console.log('currentRate878787',resourceRateElement)
    const currentRate = parseInt(resourceRateElement.textContent, 10);
    interval = setInterval(() => {
        incrementTotalResources(currentRate);  // 使用 currentRate 來增加 totalResources
    }, 1000);

    // 每10秒保存一次 totalResources 到数据库
    //setInterval(updateTotalResourcesInDatabase, 60000);
}



function incrementTotalResources(amount) {
    totalResources += amount;  // 使用傳遞的數量 (amount) 來更新 totalResources
    updateDisplay();      // 更新页面显示
    updateTotalResourcesInDatabase(totalResources);
      // 保存到数据库
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

function fetchTotalResourcesFromDatabase() {
    fetch('/getTotalResources')
    .then(response => response.json())
    .then(data => {
        totalResources = data.totalResources;
        console.log('totalResources1111111111100000001',totalResources)        
        updateDisplay();  // 顯示更新的值
    });
}