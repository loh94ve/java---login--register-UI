function isUserLoggedIn() {
    return document.cookie.indexOf("loggedIn=true") >= 0;
}

function checkLoginAndRedirect() {
    fetch('/is-logged-in', {
        method: 'GET',
        credentials: 'same-origin'
    }).then(response => response.json()).then(data => {
        if (data.loggedIn) {
            window.location.href = 'play';
        } else {
            alert('請先登入');
        }
    });
}


//抽卡
document.getElementById('meun-shop').addEventListener('click', function() {
    // 這裡我們會向伺服器請求確認是否已登入，你可能需要更改此URL以匹配你的路由結構
    fetch('/is-logged-in', {
        method: 'GET',
        credentials: 'same-origin'
    }).then(response => response.json()).then(data => {
        if (data.loggedIn) {
            // 如果已登入，導向遊戲頁面
            window.location.href = 'shop';
        } else {
            // 如果未登入，顯示提示訊息
            alert('請先登入');
        }
    });
});

//挖礦
document.getElementById('meun-play').addEventListener('click', function() {
    // 這裡我們會向伺服器請求確認是否已登入，你可能需要更改此URL以匹配你的路由結構
    fetch('/is-logged-in', {
        method: 'GET',
        credentials: 'same-origin'
    }).then(response => response.json()).then(data => {
        if (data.loggedIn) {
            // 如果已登入，導向遊戲頁面
            window.location.href = 'play';
        } else {
            // 如果未登入，顯示提示訊息
            alert('請先登入');
        }
    });
});

//背包
document.getElementById('meun-bag').addEventListener('click', function() {
    // 這裡我們會向伺服器請求確認是否已登入，你可能需要更改此URL以匹配你的路由結構
    fetch('/is-logged-in', {
        method: 'GET',
        credentials: 'same-origin'
    }).then(response => response.json()).then(data => {
        if (data.loggedIn) {
            // 如果已登入，導向遊戲頁面
            window.location.href = 'bag';
        } else {
            // 如果未登入，顯示提示訊息
            alert('請先登入');
        }
    });
});

 //測試
document.getElementById('meun-test').addEventListener('click', function() {
    // 這裡我們會向伺服器請求確認是否已登入，你可能需要更改此URL以匹配你的路由結構
    fetch('/is-logged-in', {
        method: 'GET',
        credentials: 'same-origin'
    }).then(response => response.json()).then(data => {
        if (data.loggedIn) {
            // 如果已登入，導向遊戲頁面
            window.location.href = 'shop01';
        } else {
            // 如果未登入，顯示提示訊息
            alert('請先登入');
        }
    });
});