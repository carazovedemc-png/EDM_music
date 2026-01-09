// Основные переменные
let currentUser = null;
let currentPage = 'home';
let bannerInterval = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Сразу скрываем loader
    document.getElementById('loader').style.display = 'none';
    
    initializeApp();
    setupEventListeners();
    checkFirstVisit();
});

function initializeApp() {
    // Загружаем конфигурацию
    loadAppConfig();
    
    // Проверяем авторизацию
    checkAuth();
    
    // Показываем баннеры
    setTimeout(() => {
        setupBanners();
    }, 100);
    
    // Загружаем видео
    setTimeout(() => {
        loadVideos();
    }, 150);
    
    // Загружаем предстоящие бои
    setTimeout(() => {
        loadUpcomingFights();
    }, 200);
}

function loadAppConfig() {
    document.getElementById('app-title').textContent = APP_CONFIG.appName;
    const logoImg = document.getElementById('app-logo');
    logoImg.src = APP_CONFIG.logoUrl;
    logoImg.onerror = function() {
        this.src = 'https://via.placeholder.com/50/FF6B6B/FFFFFF?text=UFC';
    };
}

function setupBanners() {
    const container = document.querySelector('.banner-container');
    if (!container) return;
    
    const banners = APP_CONFIG.banners.filter(b => b.active);
    if (banners.length === 0) return;
    
    container.innerHTML = '';
    
    banners.forEach((banner, index) => {
        const bannerDiv = document.createElement('div');
        bannerDiv.className = `banner-slide ${index === 0 ? 'active' : ''}`;
        bannerDiv.innerHTML = `
            <a href="${banner.link}" target="_blank" class="banner-link">
                <img src="${banner.imageUrl}" alt="Баннер ${index + 1}" onerror="this.src='https://via.placeholder.com/800x400/333/fff?text=Баннер'">
            </a>
        `;
        container.appendChild(bannerDiv);
    });
    
    // Автопереключение баннеров
    if (banners.length > 1) {
        let currentBanner = 0;
        const slides = document.querySelectorAll('.banner-slide');
        
        clearInterval(bannerInterval);
        bannerInterval = setInterval(() => {
            slides[currentBanner].classList.remove('active');
            currentBanner = (currentBanner + 1) % slides.length;
            slides[currentBanner].classList.add('active');
        }, 10000);
    }
}

function loadVideos() {
    const container = document.querySelector('.videos-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    APP_CONFIG.fightVideos.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card glass-card';
        videoCard.innerHTML = `
            <a href="${video.videoUrl}" target="_blank" class="video-link">
                <img src="${video.thumbnail}" alt="${video.title}" class="video-thumbnail" 
                     onerror="this.src='https://via.placeholder.com/400x225/333/fff?text=Бой'">
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
    if (!container) return;
    
    container.innerHTML = '';
    
    APP_CONFIG.upcomingFights.forEach(fight => {
        const fightCard = document.createElement('div');
        fightCard.className = 'fight-card glass-card';
        fightCard.innerHTML = `
            <h3>${fight.fighters.join(' vs ')}</h3>
            <p><i class="far fa-calendar"></i> ${fight.date} ${fight.time}</p>
            <p><i class="fas fa-map-marker-alt"></i> ${fight.place}</p>
            <p><i class="fas fa-ticket-alt"></i> Билет: ${fight.ticketPrice} руб.</p>
            <button class="btn-primary buy-ticket-btn" data-fight-id="${fight.id}">
                Купить билет
            </button>
        `;
        container.appendChild(fightCard);
    });
}

function checkFirstVisit() {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
        // Даем время на загрузку интерфейса
        setTimeout(() => {
            showRegistrationModal();
        }, 500);
        localStorage.setItem('hasVisited', 'true');
    }
}

function showRegistrationModal() {
    const modal = document.getElementById('registration-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function setupEventListeners() {
    // Навигация
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const page = this.dataset.page;
            switchPage(page);
            
            // Обновляем активную кнопку
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Регистрация
    const registerBtn = document.getElementById('register-btn');
    const skipRegBtn = document.getElementById('skip-reg-btn');
    
    if (registerBtn) {
        registerBtn.addEventListener('click', registerUser);
    }
    
    if (skipRegBtn) {
        skipRegBtn.addEventListener('click', () => {
            const modal = document.getElementById('registration-modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    }
    
    // Профиль
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const loginBetsBtn = document.getElementById('login-bets-btn');
    const logoutBetsBtn = document.getElementById('logout-bets-btn');
    
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfile);
    }
    
    if (loginBetsBtn) {
        loginBetsBtn.addEventListener('click', loginWithBets);
    }
    
    if (logoutBetsBtn) {
        logoutBetsBtn.addEventListener('click', logoutBets);
    }
    
    // Покупка билетов
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('buy-ticket-btn')) {
            const fightId = e.target.dataset.fightId;
            buyTicket(fightId);
        }
        
        // Открытие видео по клику на карточку
        if (e.target.closest('.video-link')) {
            e.preventDefault();
            const link = e.target.closest('.video-link').href;
            window.open(link, '_blank');
        }
        
        // Открытие баннера
        if (e.target.closest('.banner-link')) {
            e.preventDefault();
            const link = e.target.closest('.banner-link').href;
            window.open(link, '_blank');
        }
    });
    
    // Защита от копирования
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showNotification('Копирование запрещено!', 'error');
        return false;
    });
    
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Отключение drag&drop для изображений
    document.addEventListener('dragstart', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });
    
    // Изменение аватарки
    const changeAvatarBtn = document.querySelector('.change-avatar-btn');
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', changeAvatar);
    }
    
    // Закрытие модалки при клике вне её
    document.addEventListener('click', function(e) {
        const modal = document.getElementById('registration-modal');
        if (modal && modal.classList.contains('active') && e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

function switchPage(page) {
    // Скрываем все страницы
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
    });
    
    // Показываем выбранную страницу
    const targetPage = document.getElementById(`${page}-page`);
    if (targetPage) {
        targetPage.style.display = 'block';
        setTimeout(() => {
            targetPage.classList.add('active');
        }, 10);
    }
    
    currentPage = page;
    
    // Загружаем контент для страницы
    if (page === 'contract') {
        setTimeout(() => {
            loadContractContent();
        }, 100);
    } else if (page === 'profile') {
        setTimeout(() => {
            loadProfileData();
        }, 100);
    }
}

function registerUser() {
    const firstName = document.getElementById('reg-firstname')?.value.trim();
    const lastName = document.getElementById('reg-lastname')?.value.trim();
    
    if (!firstName || !lastName) {
        showNotification('Введите имя и фамилию!', 'error');
        return;
    }
    
    // Создаем пользователя
    currentUser = {
        firstName,
        lastName,
        isAdultAccount: false,
        avatar: 'assets/default-avatar.png',
        registrationDate: new Date().toISOString()
    };
    
    // Сохраняем в localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Обновляем профиль
    updateProfileDisplay();
    
    // Закрываем модалку
    const modal = document.getElementById('registration-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    
    showNotification('Регистрация успешна!', 'success');
}

function saveProfile() {
    const firstName = document.getElementById('input-firstname')?.value.trim();
    const lastName = document.getElementById('input-lastname')?.value.trim();
    
    if (currentUser) {
        currentUser.firstName = firstName || currentUser.firstName;
        currentUser.lastName = lastName || currentUser.lastName;
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateProfileDisplay();
        showNotification('Профиль обновлен!', 'success');
    }
}

function loginWithBets() {
    const login = document.getElementById('input-login')?.value.trim();
    const password = document.getElementById('input-password')?.value.trim();
    
    if (!login || !password) {
        showNotification('Введите логин и пароль!', 'error');
        return;
    }
    
    // Проверяем в базе данных
    const adultAccount = APP_CONFIG.adultAccounts.find(
        acc => acc.login === login && acc.password === password
    );
    
    if (adultAccount) {
        // Обновляем текущего пользователя
        if (currentUser) {
            currentUser.isAdultAccount = true;
            currentUser.betsAllowed = true;
            currentUser.originalFirstName = currentUser.firstName;
            currentUser.originalLastName = currentUser.lastName;
            currentUser.firstName = adultAccount.firstName;
            currentUser.lastName = adultAccount.lastName;
            currentUser.adultLogin = login;
        } else {
            currentUser = {
                firstName: adultAccount.firstName,
                lastName: adultAccount.lastName,
                isAdultAccount: true,
                betsAllowed: true,
                adultLogin: login,
                avatar: 'assets/default-avatar.png'
            };
        }
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateProfileDisplay();
        showNotification('Вход в аккаунт со ставками выполнен!', 'success');
        
        // Обновляем страницу контракта если она открыта
        if (currentPage === 'contract') {
            loadContractContent();
        }
    } else {
        showNotification('Неверный логин или пароль!', 'error');
    }
}

function logoutBets() {
    if (currentUser && currentUser.isAdultAccount) {
        // Возвращаем оригинальное имя
        if (currentUser.originalFirstName && currentUser.originalLastName) {
            currentUser.firstName = currentUser.originalFirstName;
            currentUser.lastName = currentUser.originalLastName;
        }
        
        currentUser.isAdultAccount = false;
        currentUser.betsAllowed = false;
        delete currentUser.adultLogin;
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateProfileDisplay();
        showNotification('Вы вышли из аккаунта со ставками', 'info');
        
        // Обновляем страницу контракта если она открыта
        if (currentPage === 'contract') {
            loadContractContent();
        }
    }
}

function loadContractContent() {
    const container = document.getElementById('contract-content');
    if (!container) return;
    
    if (currentUser && currentUser.isAdultAccount && currentUser.adultLogin) {
        // Показываем контракт для взрослого аккаунта
        const login = currentUser.adultLogin;
        const contractUrl = APP_CONFIG.contracts[login] || 'https://via.placeholder.com/800x1131/FFFFFF/000000?text=Контракт';
        
        container.innerHTML = `
            <div class="contract-container">
                <h2><i class="fas fa-file-signature"></i> Ваш контракт</h2>
                <div class="contract-image-container">
                    <img src="${contractUrl}" alt="Контракт" class="contract-image"
                         onerror="this.src='https://via.placeholder.com/800x1131/FFFFFF/000000?text=Контракт'">
                </div>
                <div class="contract-actions">
                    <button class="btn-primary" onclick="downloadContract()">
                        <i class="fas fa-download"></i> Скачать контракт
                    </button>
                </div>
            </div>
        `;
    } else {
        // Показываем форму анкеты для школьников
        container.innerHTML = `
            <div class="application-form">
                <h2><i class="fas fa-edit"></i> Анкета для участия в боях</h2>
                <p class="form-subtitle">Заполните анкету для участия в школьных боях</p>
                
                <div class="form-section">
                    <h3><i class="fas fa-user"></i> Личная информация</h3>
                    <div class="input-group">
                        <input type="text" id="app-fullname" placeholder="ФИО" required>
                        <input type="date" id="app-birthdate" required>
                        <div class="input-row">
                            <input type="number" id="app-height" placeholder="Рост (см)" required>
                            <input type="number" id="app-weight" placeholder="Вес (кг)" required>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3><i class="fas fa-dumbbell"></i> Спортивные данные</h3>
                    <div class="input-group">
                        <textarea id="app-experience" placeholder="Опыт в единоборствах" rows="2"></textarea>
                        <textarea id="app-achievements" placeholder="Достижения в спорте" rows="2"></textarea>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3><i class="fas fa-heartbeat"></i> Состояние здоровья</h3>
                    <div class="input-group">
                        <textarea id="app-health" placeholder="Состояние здоровья, противопоказания" rows="3" required></textarea>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3><i class="fas fa-phone"></i> Контактная информация</h3>
                    <div class="input-group">
                        <input type="tel" id="app-contact" placeholder="Контактный телефон" required>
                        <input type="email" id="app-email" placeholder="Email (необязательно)">
                    </div>
                </div>
                
                <div class="form-section">
                    <h3><i class="fas fa-calendar-alt"></i> Запись на занятия</h3>
                    <div class="input-group">
                        <select id="training-type">
                            <option value="">Выберите тип занятий</option>
                            <option value="boxing">Бокс (Ислям Нариманович)</option>
                            <option value="mma">MMA</option>
                            <option value="wrestling">Борьба</option>
                            <option value="hosting">Хостинг</option>
                        </select>
                        <input type="date" id="training-date" required>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button class="btn-primary" onclick="submitApplication()">
                        <i class="fas fa-paper-plane"></i> Отправить анкету
                    </button>
                    <button class="btn-secondary" onclick="clearForm()">
                        <i class="fas fa-eraser"></i> Очистить форму
                    </button>
                </div>
                
                <p class="form-note">
                    <i class="fas fa-info-circle"></i> После отправки анкеты мы свяжемся с вами в Telegram
                </p>
            </div>
        `;
        
        // Устанавливаем минимальную дату для записи (завтра)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const minDate = tomorrow.toISOString().split('T')[0];
        setTimeout(() => {
            const dateInput = document.getElementById('training-date');
            if (dateInput) {
                dateInput.min = minDate;
                dateInput.value = minDate;
            }
        }, 100);
    }
}

function submitApplication() {
    // Собираем данные анкеты
    const application = {
        fullName: document.getElementById('app-fullname')?.value,
        birthDate: document.getElementById('app-birthdate')?.value,
        height: document.getElementById('app-height')?.value,
        weight: document.getElementById('app-weight')?.value,
        achievements: document.getElementById('app-achievements')?.value,
        healthInfo: document.getElementById('app-health')?.value,
        experience: document.getElementById('app-experience')?.value,
        contact: document.getElementById('app-contact')?.value,
        email: document.getElementById('app-email')?.value,
        trainingType: document.getElementById('training-type')?.value,
        trainingDate: document.getElementById('training-date')?.value,
        submissionDate: new Date().toLocaleString('ru-RU'),
        userId: currentUser ? currentUser.firstName + ' ' + currentUser.lastName : 'Аноним'
    };
    
    // Проверяем обязательные поля
    if (!application.fullName || !application.birthDate || !application.contact) {
        showNotification('Заполните обязательные поля!', 'error');
        return;
    }
    
    // В реальном приложении здесь отправка на сервер
    // Для демо сохраняем в localStorage
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    applications.push(application);
    localStorage.setItem('applications', JSON.stringify(applications));
    
    // Показываем успешное сообщение
    showNotification('✅ Анкета отправлена! Мы свяжемся с вами в Telegram.', 'success');
    
    // Очищаем форму через 2 секунды
    setTimeout(clearForm, 2000);
}

function clearForm() {
    const inputs = document.querySelectorAll('#contract-content input, #contract-content textarea, #contract-content select');
    inputs.forEach(input => {
        if (input.type !== 'button') {
            input.value = '';
        }
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
        purchaseDate: new Date().toLocaleDateString('ru-RU'),
        purchaseTime: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };
    
    // Сохраняем билет
    const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    tickets.push(ticket);
    localStorage.setItem('tickets', JSON.stringify(tickets));
    
    showNotification(`✅ Билет куплен! ${fight.ticketPrice} руб.`, 'success');
    
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
        const userName = document.getElementById('user-name');
        const userStatus = document.getElementById('user-status');
        
        if (userName) {
            userName.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        }
        
        if (userStatus) {
            if (currentUser.isAdultAccount) {
                userStatus.textContent = 'Аккаунт со ставками (18+)';
                userStatus.style.color = '#4ECDC4';
                userStatus.innerHTML = '<i class="fas fa-check-circle"></i> Аккаунт со ставками (18+)';
            } else {
                userStatus.textContent = 'Школьный аккаунт';
                userStatus.style.color = '#FFD166';
                userStatus.innerHTML = '<i class="fas fa-user-graduate"></i> Школьный аккаунт';
            }
        }
        
        // Обновляем поля ввода
        const inputFirstName = document.getElementById('input-firstname');
        const inputLastName = document.getElementById('input-lastname');
        
        if (inputFirstName) inputFirstName.value = currentUser.firstName || '';
        if (inputLastName) inputLastName.value = currentUser.lastName || '';
        
        // Показываем/скрываем кнопки
        const logoutBetsBtn = document.getElementById('logout-bets-btn');
        if (logoutBetsBtn) {
            logoutBetsBtn.style.display = currentUser.isAdultAccount ? 'block' : 'none';
        }
        
        // Обновляем аватар
        const userAvatar = document.getElementById('user-avatar');
        if (userAvatar && currentUser.avatar) {
            userAvatar.src = currentUser.avatar;
        }
    }
}

function loadTickets() {
    const container = document.getElementById('tickets-list');
    if (!container) return;
    
    const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    
    if (tickets.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-ticket-alt"></i><p>Билетов пока нет</p></div>';
        return;
    }
    
    container.innerHTML = tickets.map(ticket => `
        <div class="ticket-item glass-card">
            <div class="ticket-header">
                <h4>${ticket.fighters.join(' vs ')}</h4>
                <span class="ticket-price">${ticket.price} руб.</span>
            </div>
            <div class="ticket-details">
                <p><i class="far fa-calendar"></i> ${ticket.date} ${ticket.time}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${ticket.place}</p>
                <p><i class="far fa-clock"></i> Куплен: ${ticket.purchaseDate} ${ticket.purchaseTime}</p>
            </div>
        </div>
    `).join('');
}

function loadBets() {
    const container = document.getElementById('bets-list');
    if (!container) return;
    
    if (!currentUser || !currentUser.isAdultAccount) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-ban"></i><p>Ставки доступны только для аккаунтов 18+</p></div>';
        return;
    }
    
    const bets = JSON.parse(localStorage.getItem('bets') || '[]');
    const userBets = bets.filter(bet => bet.userId === currentUser.adultLogin);
    
    if (userBets.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-chart-line"></i><p>Ставок пока нет</p></div>';
        return;
    }
    
    container.innerHTML = userBets.map(bet => `
        <div class="bet-item glass-card">
            <div class="bet-header">
                <h4>${bet.fight}</h4>
                <span class="bet-amount">${bet.amount} руб.</span>
            </div>
            <div class="bet-details">
                <p><i class="fas fa-user"></i> Ставка на: ${bet.fighter}</p>
                <p><i class="fas fa-percentage"></i> Коэффициент: ${bet.odds}x</p>
                <p class="bet-status ${bet.status}">
                    <i class="fas fa-${bet.status === 'win' ? 'check-circle' : bet.status === 'lose' ? 'times-circle' : 'clock'}"></i>
                    ${bet.status === 'win' ? 'Выигрыш' : bet.status === 'lose' ? 'Проигрыш' : 'Ожидание'}
                </p>
            </div>
        </div>
    `).join('');
}

function changeAvatar() {
    // В реальном приложении здесь загрузка файла
    // Для демо просто меняем цвет фона
    const colors = [
        'linear-gradient(135deg, #FF6B6B, #FF8E53)',
        'linear-gradient(135deg, #4ECDC4, #44A08D)',
        'linear-gradient(135deg, #FFD166, #FFB347)',
        'linear-gradient(135deg, #06D6A0, #05B384)',
        'linear-gradient(135deg, #118AB2, #0A6A8A)'
    ];
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Создаем аватар с инициалами
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Градиентный фон
    const gradient = ctx.createLinearGradient(0, 0, 200, 200);
    gradient.addColorStop(0, randomColor.split(',')[0].split('(')[1].trim());
    gradient.addColorStop(1, randomColor.split(',')[2].split(')')[0].trim());
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(100, 100, 100, 0, Math.PI * 2);
    ctx.fill();
    
    // Добавляем инициалы
    if (currentUser) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 80px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const initials = (currentUser.firstName[0] + currentUser.lastName[0]).toUpperCase();
        ctx.fillText(initials, 100, 100);
    }
    
    // Преобразуем в data URL
    const dataUrl = canvas.toDataURL('image/png');
    
    // Сохраняем
    const userAvatar = document.getElementById('user-avatar');
    if (userAvatar) {
        userAvatar.src = dataUrl;
    }
    
    if (currentUser) {
        currentUser.avatar = dataUrl;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    showNotification('Аватар обновлен!', 'success');
}

function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            updateProfileDisplay();
        } catch (e) {
            console.error('Ошибка загрузки пользователя:', e);
            currentUser = null;
        }
    }
}

function showNotification(message, type = 'info') {
    // Удаляем старые уведомления
    const oldNotifications = document.querySelectorAll('.notification');
    oldNotifications.forEach(n => n.remove());
    
    // Создаем новое уведомление
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Показываем уведомление
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Вспомогательные функции
function downloadContract() {
    if (!currentUser || !currentUser.adultLogin) return;
    
    const contractUrl = APP_CONFIG.contracts[currentUser.adultLogin];
    if (!contractUrl) {
        showNotification('Контракт не найден!', 'error');
        return;
    }
    
    const link = document.createElement('a');
    link.href = contractUrl;
    link.download = `Контракт_${currentUser.firstName}_${currentUser.lastName}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Инициализация при загрузке
window.addEventListener('load', function() {
    // Гарантированно скрываем loader
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }, 1000);
    
    // Адаптируем размеры для мобильных
    adaptLayout();
});

// Адаптация layout под устройство
function adaptLayout() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isTablet = /iPad|Tablet|PlayBook|Silk/i.test(navigator.userAgent) || 
                     (window.innerWidth >= 600 && window.innerWidth <= 1024);
    
    document.body.classList.toggle('mobile', isMobile);
    document.body.classList.toggle('tablet', isTablet);
    document.body.classList.toggle('desktop', !isMobile && !isTablet);
    
    // Корректируем размеры для iOS
    if (/(iPhone|iPod|iPad)/i.test(navigator.userAgent)) {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
        }
    }
}

// Ресайз окна
window.addEventListener('resize', adaptLayout);