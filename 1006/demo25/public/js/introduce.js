const links = document.querySelectorAll('.bookf-link');
const sections = ['inprogress', 'september', 'october', 'november', 'winter', 'forward'];

function setActiveLink(sectionId) {
    // 移除所有链接的活动类
    links.forEach(link => {
        link.classList.remove('active');
    });

    // 将活动类添加到对应的链接
    const activeLink = document.querySelector(`[href="#${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// 添加滚动事件监听器
window.addEventListener('scroll', function () {
    // 获取当前可见的部分
    let activeSection = null;

    // 遍历所有部分和链接
    for (let i = 0; i < sections.length; i++) {
        const section = document.getElementById(sections[i]);
        const rect = section.getBoundingClientRect();
        if (rect.top <= 50 && rect.bottom >= 50) {
            // 如果部分可见，将其设置为活动部分
            activeSection = sections[i];
            break;
        }
    }

    if (activeSection) {
        setActiveLink(activeSection);
    }
});

// 点击链接时触发事件
links.forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop,
                behavior: 'smooth'
            });

            setActiveLink(targetId);
        }
    });
});
