document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Инициализация фона и основных данных
    document.body.style.backgroundImage = `url('${appData.config.mainBackground}')`;
    document.getElementById('heroLogo').src = appData.config.logoUrl;
    document.getElementById('heroTitle').innerText = appData.config.heroTitle;
    document.getElementById('heroSubtitle').innerText = appData.config.heroSubtitle;

    // 2. Генерация плавающих логотипов (Анимация в Hero)
    const techBg = document.getElementById('techBg');
    const techStack = appData.techStack;

    function createFloatingIcon() {
        const span = document.createElement('span');
        span.classList.add('tech-icon');
        span.innerText = techStack[Math.floor(Math.random() * techStack.length)];
        
        // Рандомная позиция по горизонтали
        span.style.left = Math.random() * 100 + '%';
        // Рандомный размер шрифта для глубины
        let size = Math.random() * 2 + 1; // от 1 до 3 rem
        span.style.fontSize = size + 'rem';
        // Скорость анимации зависит от размера (параллакс эффект)
        let duration = Math.random() * 10 + 10; // от 10 до 20 сек
        span.style.animationDuration = duration + 's';
        
        techBg.appendChild(span);

        // Удаляем после завершения анимации, чтобы не перегружать DOM
        setTimeout(() => {
            span.remove();
        }, duration * 1000);
    }

    // Создаем иконки каждые 800мс
    setInterval(createFloatingIcon, 800);
    // Создадим сразу несколько для старта
    for(let i=0; i<15; i++) createFloatingIcon();

    // 3. Рендер Портфолио
    const portfolioGrid = document.getElementById('portfolioGrid');
    
    appData.portfolio.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('portfolio-card', 'glass-card');
        card.innerHTML = `
            <img src="${item.image}" alt="${item.title}" class="card-img">
            <h3>${item.title}</h3>
            <p>${item.shortDesc}</p>
        `;
        
        // Открытие модалки
        card.addEventListener('click', () => {
            openModal(item);
        });
        
        portfolioGrid.appendChild(card);
    });

    // 4. Рендер Услуг
    const servicesGrid = document.getElementById('servicesGrid');

    appData.services.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('service-card', 'glass-card');
        card.innerHTML = `
            <div>
                <img src="${item.image}" alt="${item.title}" class="card-img">
                <h3>${item.title}</h3>
                <p style="margin-top:10px; font-size: 0.9rem; opacity: 0.8">${item.description}</p>
            </div>
            <div>
                <div class="price-tag">от ${item.priceStart} ${appData.config.currency}</div>
                <button class="glass-btn primary" onclick="alert('Заказ услуги: ${item.title}')">Заказать</button>
            </div>
        `;
        servicesGrid.appendChild(card);
    });

    // 5. Логика Модальных окон
    const projectModal = document.getElementById('projectModal');
    const modalImg = document.getElementById('modalImg');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const closeModalBtn = document.querySelector('.close-modal');

    function openModal(item) {
        modalImg.src = item.image;
        modalTitle.innerText = item.title;
        modalDesc.innerText = item.fullDesc;
        projectModal.classList.add('active');
    }

    window.closeModal = function() {
        projectModal.classList.remove('active');
    }

    closeModalBtn.onclick = window.closeModal;

    // Закрытие по клику вне окна
    window.onclick = function(event) {
        if (event.target == projectModal) {
            window.closeModal();
        }
        if (event.target == loginModal) {
            toggleLogin();
        }
    }

    // 6. Логика Логина
    const loginModal = document.getElementById('loginModal');
    const profileBtn = document.getElementById('profileBtn');
    const closeLoginBtn = document.querySelector('.close-modal-login');

    window.toggleLogin = function() {
        if (loginModal.classList.contains('active')) {
            loginModal.classList.remove('active');
        } else {
            loginModal.classList.add('active');
        }
    }

    profileBtn.onclick = toggleLogin;
    closeLoginBtn.onclick = toggleLogin;

    // 7. Подсветка активной навигации при скролле
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollContainer = document.querySelector('.scroll-container');

    scrollContainer.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Простая проверка: если середина экрана попадает в секцию
            if (scrollContainer.scrollTop >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
});
