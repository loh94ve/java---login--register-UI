document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById('search-input');
    const imageContainer = document.querySelector('.book-container'); // 图片容器
    const images = document.querySelectorAll('.book-container img'); // 获取所有图片元素
    const noResultsMessage = document.createElement('p'); // 创建一个段落元素用于显示无结果消息
    noResultsMessage.textContent = '没有找到匹配的结果'; // 设置无结果消息的文本
    noResultsMessage.style.display = 'none'; // 初始状态下隐藏无结果消息

    searchInput.addEventListener('input', () => {
        performSearch();
    });

    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // 阻止默认的Enter键行为，例如提交表单
            performSearch();
        }
    });

    // 新增函数：重置卡片的排序为原始顺序
    function resetImageOrder() {
        const sortedImages = Array.from(images).sort((a, b) => {
            const altA = a.alt.toLowerCase();
            const altB = b.alt.toLowerCase();
            return altA.localeCompare(altB);
        });

        sortedImages.forEach((img) => {
            imageContainer.appendChild(img);
        });
    }

 // ... (其它的代碼)

function performSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    let hasResults = false;

    const matchingImages = [];
    const nonMatchingImages = [];

    images.forEach((img) => {
        const alt = img.alt.toLowerCase();
        if (alt.includes(searchTerm)) {
            img.classList.remove('fade-out');
            img.classList.add('fade-in');
            matchingImages.push(img); // 收集匹配的圖片
            hasResults = true;
        } else {
            img.classList.remove('fade-in');
            img.classList.add('fade-out');
            nonMatchingImages.push(img); // 收集不匹配的圖片
        }
    });

    // 根据搜索结果显示或隐藏无结果消息
    noResultsMessage.style.display = hasResults ? 'none' : 'block';

    if (!imageContainer.contains(noResultsMessage)) {
        imageContainer.appendChild(noResultsMessage);
    }

    // 將匹配的圖片先放入容器
    matchingImages.forEach((img) => {
        imageContainer.appendChild(img);
    });

    // 然後將不匹配的圖片放入容器
    nonMatchingImages.forEach((img) => {
        imageContainer.appendChild(img);
    });
}

// ... (其它的代碼)


    // 监听搜索框的清空事件
    searchInput.addEventListener('search', () => {
        resetImageOrder(); // 清空搜索后，重新排序卡片为原始顺序
    });
});
