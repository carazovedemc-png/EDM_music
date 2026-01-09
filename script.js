// Основные переменные
let currentUser = null;
let currentPage = 'home';
let bannerInterval = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkFirstVisit();
});

function initializeApp() {
    // Загружаем конфигурацию
    loadAppConfig();
    
    // Показываем баннеры
    setupBanners();
    
    // Загружаем видео
    loadVideos();
    
    // Загружаем предстоящие бои
    loadUpcomingFights();
    
    // Проверяем авторизацию
    checkAuth();
}

function loadAppConfig() {
    document.getElementById('app-title').textContent = APP_CONFIG.appName;
    document.getElementById('app-logo').src = APP_CONFIG.logoUrl;
}

function setupBanners() {
    const container = document.querySelector('.banner-container');
    const banners = APP_CONFIG.banners.filter(b => b.active);
    
    banners.forEach((banner, index) => {
        const bannerDiv = document.createElement('div');
        bannerDiv.className = `banner-slide ${index === 0 ? 'active' : ''}`;
        bannerDiv.innerHTML = `
            <a href="${banner.link}" target="_blank">
                <img src="${banner.imageUrl}" alt="Баннер ${index + 1}">
            </a>
        `;
        container.appendChild(bannerDiv);
    });
    
    // Автопереключение баннеров
    let currentBanner = 0;
    const slides = document.querySelectorAll('.banner-slide');
    
    bannerInterval = setInterval(() => {
        slides[currentBanner].classList.remove('active');
        currentBanner = (currentBanner + 1) % slides.length;
        slides[currentBanner].classList.add('active');
    }, 10000);
}

function loadVideos() {
    const container = document.querySelector('.videos-grid');
    APP_CONFIG.fightVideos.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card glass-card';
        videoCard.innerHTML = `
            <a href="${video.videoUrl}" target="_blank" class="video-link">
                <img src="${video.thumbnail}" alt="${video.title}" class="video-thumbnail">
                <h3>${video.title}</h3>
                <p class="video-description">${video.description}</p>
                <div class="video-date">${video.date}</div>
            </a>
        `;
        container.appendChild(videoCard);
    });
}

function loadUpcomingFights() {
    const container = document.querySelector('.fights-list');
    APP_CONFIG.upcomingFights.forEach(fight => {
        const fightCard = document.createElement('div');
        fightCard.className = 'fight-card glass-card';
        fightCard.innerHTML = `
            <h3>${fight.fighters.join(' vs ')}</h3>
            <p><i class="far fa-calendar"></i> ${fight.date} ${fight.time}</p>
            <p><i class="fas fa-map-marker-alt"></i> ${fight.place}</p>
            <p><i class="fas fa-ticket-alt"></i> Билет: ${fight.ticketPrice} руб.</p>
            <button class="btn-primary buy-ticket-btn" data-fight-id="${fight.id}">Купить билет</button>
        `;
        container.appendChild(fightCard);
    });
}

function checkFirstVisit() {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
        showRegistrationModal();
        localStorage.setItem('hasVisited', 'true');
    }
}

function showRegistrationModal() {
    const modal = document.getElementById('registration-modal');
    modal.classList.add('active');
}

function setupEventListeners() {
    // Навигация
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            switchPage(page);
            
            // Обновляем активную кнопку
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Регистрация
    document.getElementById('register-btn').addEventListener('click', registerUser);
    document.getElementById('skip-reg-btn').addEventListener('click', () => {
        document.getElementById('registration-modal').classList.remove('active');
    });
    
    // Профиль
    document.getElementById('save-profile-btn').addEventListener('click', saveProfile);
    document.getElementById('login-bets-btn').addEventListener('click', loginWithBets);
    document.getElementById('logout-bets-btn').addEventListener('click', logoutBets);
    
    // Покупка билетов
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('buy-ticket-btn')) {
            const fightId = e.target.dataset.fightId;
            buyTicket(fightId);
        }
    });
    
    // Защита от копирования
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showNotification('Копирование запрещено!', 'error');
    });
    
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
    });
    
    // Изменение аватарки
    document.querySelector('.change-avatar-btn').addEventListener('click', changeAvatar);
}

function switchPage(page) {
    // Скрываем все страницы
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Показываем выбранную страницу
    document.getElementById(`${page}-page`).classList.add('active');
    currentPage = page;
    
    // Загружаем контент для страницы
    if (page === 'contract') {
        loadContractContent();
    } else if (page === 'profile') {
        loadProfileData();
    }
}

function registerUser() {
    const firstName = document.getElementById('reg-firstname').value;
    const lastName = document.getElementById('reg-lastname').value;
    const login = document.getElementById('reg-login').value;
    const password = document.getElementById('reg-password').value;
    
    if (!firstName || !lastName) {
        showNotification('Введите имя и фамилию!', 'error');
        return;
    }
    
    // Сохраняем данные пользователя
    currentUser = {
        firstName,
        lastName,
        login,
        isAdultAccount: false,
        avatar: 'assets/default-avatar.png'
    };
    
    // Сохраняем в localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Обновляем профиль
    updateProfileDisplay();
    
    // Закрываем модалку
    document.getElementById('registration-modal').classList.remove('active');
    
    showNotification('Регистрация успешна!', 'success');
}

function saveProfile() {
    const firstName = document.getElementById('input-firstname').value;
    const lastName = document.getElementById('input-lastname').value;
    
    if (currentUser) {
        currentUser.firstName = firstName || currentUser.firstName;
        currentUser.lastName = lastName || currentUser.lastName;
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateProfileDisplay();
        showNotification('Профиль обновлен!', 'success');
    }
}

function loginWithBets() {
    const login = document.getElementById('input-login').value;
    const password = document.getElementById('input-password').value;
    
    // Проверяем в базе данных
    const adultAccount = APP_CONFIG.adultAccounts.find(
        acc => acc.login === login && acc.password === password
    );
    
    if (adultAccount) {
        // Обновляем текущего пользователя
        if (currentUser) {
            currentUser.isAdultAccount = true;
            currentUser.betsAllowed = true;
            currentUser.originalName = currentUser.firstName + ' ' + currentUser.lastName;
        } else {
            currentUser = {
                firstName: adultAccount.firstName,
                lastName: adultAccount.lastName,
                isAdultAccount: true,
                betsAllowed: true
            };
        }
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateProfileDisplay();
        showNotification('Вход в аккаунт со ставками выполнен!', 'success');
    } else {
        showNotification('Неверный логин или пароль!', 'error');
    }
}

function logoutBets() {
    if (currentUser && currentUser.isAdultAccount) {
        // Возвращаем оригинальное имя
        if (currentUser.originalName) {
            const names = currentUser.originalName.split(' ');
            currentUser.firstName = names[0];
            currentUser.lastName = names[1] || '';
        }
        
        currentUser.isAdultAccount = false;
        currentUser.betsAllowed = false;
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateProfileDisplay();
        showNotification('Вы вышли из аккаунта со ставками', 'info');
    }
}

function loadContractContent() {
    const container = document.getElementById('contract-content');
    
    if (currentUser && currentUser.isAdultAccount) {
        // Показываем контракт для взрослого аккаунта
        const contractUrl = APP_CONFIG.contracts[currentUser.login] || APP_CONFIG.contracts.default;
        container.innerHTML = `
            <div class="contract-container">
                <h2><i class="fas fa-file-signature"></i> Ваш контракт</h2>
                <img src="${contractUrl}" alt="Контракт" class="contract-image">
                <div class="contract-actions">
                    <button class="btn-primary" onclick="downloadContract()">Скачать контракт</button>
                </div>
            </div>
        `;
    } else {
        // Показываем форму анкеты для школьников
        container.innerHTML = `
            <div class="application-form">
                <h2><i class="fas fa-edit"></i> Анкета для участия в боях</h2>
                
                <div class="input-group">
                    <input type="text" id="app-fullname" placeholder="ФИО" required>
                    <input type="date" id="app-birthdate" required>
                    <input type="number" id="app-height" placeholder="Рост (см)" required>
                    <input type="number" id="app-weight" placeholder="Вес (кг)" required>
                    <textarea id="app-achievements" placeholder="Достижения в спорте" rows="3"></textarea>
                    <textarea id="app-health" placeholder="Состояние здоровья, противопоказания" rows="3" required></textarea>
                    <textarea id="app-experience" placeholder="Опыт в единоборствах" rows="3"></textarea>
                    <input type="text" id="app-contact" placeholder="Контактный телефон" required>
                </div>
                
                <div class="form-section">
                    <h3><i class="fas fa-dumbbell"></i> Запись на занятия</h3>
                    <select id="training-type">
                        <option value="boxing">Бокс (Ислям Нариманович)</option>
                        <option value="mma">MMA</option>
                        <option value="wrestling">Борьба</option>
                    </select>
                    <input type="date" id="training-date" required>
                </div>
                
                <button class="btn-primary" onclick="submitApplication()">Отправить анкету</button>
            </div>
        `;
    }
}

function submitApplication() {
    // Собираем данные анкеты
    const application = {
        fullName: document.getElementById('app-fullname').value,
        birthDate: document.getElementById('app-birthdate').value,
        height: document.getElementById('app-height').value,
        weight: document.getElementById('app-weight').value,
        achievements: document.getElementById('app-achievements').value,
        healthInfo: document.getElementById('app-health').value,
        experience: document.getElementById('app-experience').value,
        contact: document.getElementById('app-contact').value,
        trainingType: document.getElementById('training-type').value,
        trainingDate: document.getElementById('training-date').value,
        submissionDate: new Date().toISOString()
    };
    
    // В реальном приложении здесь отправка на сервер
    // Для демо сохраняем в localStorage
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    applications.push(application);
    localStorage.setItem('applications', JSON.stringify(applications));
    
    showNotification('Анкета отправлена! Мы свяжемся с вами в Telegram.', 'success');
    
    // Очищаем форму
    document.querySelectorAll('#contract-content input, #contract-content textarea').forEach(el => {
        el.value = '';
    });
}

function buyTicket(fightId) {
    const fight = APP_CONFIG.upcomingFights.find(f => f.id == fightId);
    if (!fight) return;
    
    const ticket = {
        id: Date.now(),
        fightId: fightId,
        fighters: fight.fighters,
        date: fight.date,
        time: fight.time,
        place: fight.place,
        price: fight.ticketPrice,
        purchaseDate: new Date().toLocaleDateString('ru-RU')
    };
    
    // Сохраняем билет
    const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    tickets.push(ticket);
    localStorage.setItem('tickets', JSON.stringify(tickets));
    
    showNotification(`Билет куплен! Стоимость: ${fight.ticketPrice} руб.`, 'success');
    
    // Обновляем список билетов в профиле
    loadProfileData();
}

function loadProfileData() {
    if (!currentUser) return;
    
    // Обновляем данные пользователя
    updateProfileDisplay();
    
    // Загружаем билеты
    loadTickets();
    
    // Загружаем ставки
    loadBets();
}

function updateProfileDisplay() {
    if (currentUser) {
        document.getElementById('user-name').textContent = 
            `${currentUser.firstName} ${currentUser.lastName}`;
        
        document.getElementById('user-status').textContent = 
            currentUser.isAdultAccount ? 'Аккаунт со ставками (18+)' : 'Школьный аккаунт';
        
        document.getElementById('user-status').style.color = 
            currentUser.isAdultAccount ? '#4ECDC4' : '#FFD166';
        
        // Обновляем поля ввода
        document.getElementById('input-firstname').value = currentUser.firstName || '';
        document.getElementById('input-lastname').value = currentUser.lastName || '';
        
        // Показываем/скрываем кнопки
        document.getElementById('logout-bets-btn').style.display = 
            currentUser.isAdultAccount ? 'block' : 'none';
    }
}

function loadTickets() {
    const container = document.getElementById('tickets-list');
    const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    
    if (tickets.length === 0) {
        container.innerHTML = '<p class="empty-message">Билетов пока нет</p>';
        return;
    }
    
    container.innerHTML = tickets.map(ticket => `
        <div class="ticket-item">
            <h4>${ticket.fighters.join(' vs ')}</h4>
            <p>Дата: ${ticket.date} ${ticket.time}</p>
            <p>Место: ${ticket.place}</p>
            <p>Цена: ${ticket.price} руб.</p>
            <p>Куплен: ${ticket.purchaseDate}</p>
        </div>
    `).join('');
}

function loadBets() {
    const container = document.getElementById('bets-list');
    
    if (!currentUser || !currentUser.isAdultAccount) {
        container.innerHTML = '<p class="empty-message">Ставки доступны только для аккаунтов 18+</p>';
        return;
    }
    
    const bets = JSON.parse(localStorage.getItem('bets') || '[]');
    const userBets = bets.filter(bet => bet.userId === currentUser.login);
    
    if (userBets.length === 0) {
        container.innerHTML = '<p class="empty-message">Ставок пока нет</p>';
        return;
    }
    
    container.innerHTML = userBets.map(bet => `
        <div class="bet-item">
            <h4>${bet.fight}</h4>
            <p>Ставка: ${bet.amount} руб. на ${bet.fighter}</p>
            <p>Коэффициент: ${bet.odds}</p>
            <p>Статус: <span class="bet-status ${bet.status}">${bet.status}</span></p>
        </div>
    `).join('');
}

function changeAvatar() {
    // В реальном приложении здесь загрузка файла
    // Для демо просто меняем на случайный цвет
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Создаем canvas для генерации аватарки
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Рисуем круг с цветом
    ctx.fillStyle = randomColor;
    ctx.beginPath();
    ctx.arc(100, 100, 100, 0, Math.PI * 2);
    ctx.fill();
    
    // Добавляем инициалы
    if (currentUser) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const initials = (currentUser.firstName[0] + currentUser.lastName[0]).toUpperCase();
        ctx.fillText(initials, 100, 100);
    }
    
    // Преобразуем в data URL
    const dataUrl = canvas.toDataURL();
    
    // Сохраняем
    document.getElementById('user-avatar').src = dataUrl;
    if (currentUser) {
        currentUser.avatar = dataUrl;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    showNotification('Аватар обновлен!', 'success');
}

function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateProfileDisplay();
    }
}

function showNotification(message, type = 'info') {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#FF6B6B' : type === 'success' ? '#4ECDC4' : '#FFD166'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 4000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(notification);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Вспомогательные функции
function downloadContract() {
    const link = document.createElement('a');
    link.href = APP_CONFIG.contracts[currentUser.login] || APP_CONFIG.contracts.default;
    link.download = `Контракт_${currentUser.firstName}_${currentUser.lastName}.jpg`;
    link.click();
}