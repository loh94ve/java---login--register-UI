function isUserLoggedIn() {
    return document.cookie.indexOf("loggedIn=true") >= 0;
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
document.getElementById('meun-mining').addEventListener('click', function() {
    // 這裡我們會向伺服器請求確認是否已登入，你可能需要更改此URL以匹配你的路由結構
    fetch('/is-logged-in', {
        method: 'GET',
        credentials: 'same-origin'
    }).then(response => response.json()).then(data => {
        if (data.loggedIn) {
            // 如果已登入，導向遊戲頁面
            window.location.href = 'mining';
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
document.getElementById('meun-mining').addEventListener('click', function() {
    // 這裡我們會向伺服器請求確認是否已登入，你可能需要更改此URL以匹配你的路由結構
    fetch('/is-logged-in', {
        method: 'GET',
        credentials: 'same-origin'
    }).then(response => response.json()).then(data => {
        if (data.loggedIn) {
            // 如果已登入，導向遊戲頁面
            window.location.href = 'mining';
        } else {
            // 如果未登入，顯示提示訊息
            alert('請先登入');
        }
    });
});
//圖鑑
document.getElementById('meun-book').addEventListener('click', function() {
    // 這裡我們會向伺服器請求確認是否已登入，你可能需要更改此URL以匹配你的路由結構
    fetch('/is-logged-in', {
        method: 'GET',
        credentials: 'same-origin'
    }).then(response => response.json()).then(data => {
        if (data.loggedIn) {
            // 如果已登入，導向遊戲頁面
            window.location.href = 'book';
        } else {
            // 如果未登入，顯示提示訊息
            alert('請先登入');
        }
    });
});
//對戰
document.getElementById('meun-battle').addEventListener('click', function() {
    // 這裡我們會向伺服器請求確認是否已登入，你可能需要更改此URL以匹配你的路由結構
    fetch('/is-logged-in', {
        method: 'GET',
        credentials: 'same-origin'
    }).then(response => response.json()).then(data => {
        if (data.loggedIn) {
            // 如果已登入，導向遊戲頁面
            window.location.href = 'battle';
        } else {
            // 如果未登入，顯示提示訊息
            alert('請先登入');
        }
    });
});
//登出
document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.getElementById('logout');

    if (logoutButton) {
        logoutButton.addEventListener('click', function(event) {
            event.preventDefault(); // 防止默认的提交行为

            fetch('/logout', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin' // 需要发送cookies时
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '/'; // 登出成功后重定向到首页
                } else {
                    console.error('登出失败');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }
});
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