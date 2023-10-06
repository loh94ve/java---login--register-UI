document.addEventListener('DOMContentLoaded', (event) => {
    console.log(document.getElementById('myInput').value);
});

// window.onload = function() {
//     if (!sessionStorage.getItem('forceReload')) {
//     sessionStorage.setItem('forceReload', 'true');
//     location.reload(true);
// } else {
//     sessionStorage.removeItem('forceReload');
// }
//     initInputControls()
//     const storedTotalCards = localStorage.getItem('totalCards');
//     if (storedTotalCards) {
//         updatepn(storedTotalCards);
//     }
// }



// function initCoinsAndPn() {  
//     var coins = localStorage.getItem('coins');
//     var pn = localStorage.getItem('pn');
//     pn = parseInt(pn, 10);
//     coins = parseInt(coins, 10);

//     if (isNaN(coins) & isNaN(pn)) {
//         coins = 0;
//         pn = 0;
//     }

//     updateCoins();
//     updatepn();
    
//     window.drawCard1 = drawCard1;
//     window.drawCard2 = drawCard2;
// }


function initInputControls() {
    var myInput = document.getElementById("myInput");
    var myInput2 = document.getElementById("myInput2");
    var costSpan = document.getElementById("cost");
    var costSpan2 = document.getElementById("cost2");
    var incrementButton = document.getElementById("increment");
    var incrementButton2 = document.getElementById("increment2");
    var decrementButton = document.getElementById("decrement");
    var decrementButton2 = document.getElementById("decrement2");

    // Functions to update the cost
    function updateCost() {
        var quantity = parseInt(myInput.value, 10);       

        if (!isNaN(quantity) && quantity >= 1) {
            var cost = quantity * 10;
            costSpan.textContent = cost;
        } else {
            costSpan.textContent = "10"; // Default value
            myInput.value = "1"; // Reset to default value
        }
    }

    function updateCost2() {
        var quantity = parseInt(myInput2.value, 10);

        if (!isNaN(quantity) && quantity >= 1) {
            var cost2 = quantity * 20;
            costSpan2.textContent = cost2;
        } else {
            costSpan2.textContent = "20"; // Default value
            myInput2.value = "1"; // Reset to default value
        }
    }

    // Event listeners for input and buttons
    myInput.addEventListener("input", updateCost);
    incrementButton.addEventListener("click", function() {
        adjustInputValue(myInput, 1);
        updateCost();
    });
    decrementButton.addEventListener("click", function() {
        adjustInputValue(myInput, -1);
        updateCost();
    });

    myInput2.addEventListener("input", updateCost2);
    incrementButton2.addEventListener("click", function() {
        adjustInputValue(myInput2, 1);
        updateCost2();
    });
    decrementButton2.addEventListener("click", function() {
        adjustInputValue(myInput2, -1);
        updateCost2();
    });
}

// Utility function to adjust the input value
function adjustInputValue(inputElement, incrementValue) {
    var currentValue = parseInt(inputElement.value, 10);
    if (isNaN(currentValue)) {
        currentValue = 0;
    }

    inputElement.value = currentValue + incrementValue;
}