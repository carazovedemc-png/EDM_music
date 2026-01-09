// Основные переменные
let currentUser = null;
let currentPage = 'home';
let bannerInterval = null;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async function() {
    // Скрываем loader
    document.getElementById('loader').style.display = 'none';
    
    try {
        // Инициализируем Telegram Auth
        currentUser = await window.TelegramAuth.init();
        
        // Показываем анимацию приветствия
        window.TelegramAuth.showWelcomeAnimation();
        
        // Обновляем профиль
        updateProfileDisplay();
        
        // Настраиваем кнопки профиля
        setupProfileButtons();
        
        // Инициализируем приложение
        initializeApp();
        setupEventListeners();
        
        // Устанавливаем активную страницу
        switchPage('home');
        
    } catch (error) {
        console.error('Ошибка инициализации приложения:', error);
        // Показываем ошибку пользователю
        showNotification('Ошибка загрузки приложения. Пожалуйста, перезагрузите страницу.', 'error');
    }
});

function initializeApp() {
    // Загружаем конфигурацию
    loadAppConfig();
    
    // Загружаем контент
    setTimeout(() => {
        setupBanners();
        loadVideos();
        loadUpcomingFights();
    }, 100);
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

function setupProfileButtons() {
    const userId = window.TelegramAuth.getUserId();
    
    // 1. Кнопка "Ставки" - показываем только если пользователь в списке
    const betsBtn = document.getElementById('bets-btn');
    if (betsBtn && APP_CONFIG.betsAllowedUsers.includes(parseInt(userId))) {
        betsBtn.style.display = 'flex';
        betsBtn.addEventListener('click', function() {
            showNotification('Функция ставок в разработке', 'info');
        });
    }
    
    // 2. Кнопка "Мои бои"
    const myFightsBtn = document.getElementById('my-fights-btn');
    myFightsBtn.addEventListener('click', showMyFights);
    
    // 3. Кнопка "Анкета/Контракт"
    const contractBtn = document.getElementById('contract-btn');
    updateContractButton();
    
    contractBtn.addEventListener('click', function() {
        if (APP_CONFIG.contracts[userId]) {
            showContract();
        } else {
            showApplicationForm();
        }
    });
    
    // 4. Кнопка "Пользовательское соглашение"
    const agreementBtn = document.getElementById('agreement-btn');
    agreementBtn.addEventListener('click', function() {
        window.open(APP_CONFIG.agreementUrl, '_blank');
    });
    
    // 5. Кнопка "Мои билеты"
    const ticketsBtn = document.getElementById('my-tickets-btn');
    ticketsBtn.addEventListener('click', showMyTickets);
}

function updateContractButton() {
    const userId = window.TelegramAuth.getUserId();
    const contractBtn = document.getElementById('contract-btn');
    const title = document.getElementById('contract-btn-title');
    const subtitle = document.getElementById('contract-btn-subtitle');
    
    if (APP_CONFIG.contracts[userId]) {
        title.textContent = 'Мой контракт';
        subtitle.textContent = 'Просмотреть контракт';
    } else {
        title.textContent = 'Моя анкета';
        subtitle.textContent = 'Заполнить анкету для участия';
    }
}

function updateProfileDisplay() {
    const userName = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');
    const userId = document.getElementById('user-id');
    
    if (currentUser) {
        const tgAuth = window.TelegramAuth;
        
        if (userName) {
            userName.textContent = tgAuth.getUserName();
        }
        
        if (userId) {
            userId.textContent = `ID: ${tgAuth.getUserId()}`;
        }
        
        if (userAvatar) {
            const avatarUrl = tgAuth.getUserAvatar();
            userAvatar.src = avatarUrl;
            userAvatar.onerror = function() {
                this.src = 'https://via.placeholder.com/200/FF6B6B/FFFFFF?text=' + 
                          (currentUser.first_name?.charAt(0) || 'U');
            };
        }
    }
}

function showMyTickets() {
    const modal = document.getElementById('my-tickets-modal');
    const container = document.getElementById('tickets-list');
    
    const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    
    if (tickets.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-ticket-alt"></i>
                <p>Билетов пока нет</p>
                <p style="margin-top: 10px; font-size: 0.9rem; color: rgba(255,255,255,0.5);">
                    Купите билеты на главной странице
                </p>
            </div>
        `;
    } else {
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
    
    modal.classList.add('active');
}

function showMyFights() {
    const modal = document.getElementById('my-fights-modal');
    const container = document.getElementById('fights-list');
    const userId = window.TelegramAuth.getUserId();
    
    if (APP_CONFIG.userFights && APP_CONFIG.userFights[userId]) {
        const fights = APP_CONFIG.userFights[userId];
        
        container.innerHTML = fights.map(fight => `
            <div class="fight-item">
                <h3>Бой против: ${fight.opponent}</h3>
                <p><i class="far fa-calendar"></i> ${fight.date} ${fight.time}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${fight.place}</p>
                <p><i class="fas fa-coins"></i> Гонорар: <span class="fight-reward">${fight.reward} руб.</span></p>
                <p><i class="fas fa-info-circle"></i> Статус: ${
                    fight.status === 'upcoming' ? 'Предстоящий' :
                    fight.status === 'completed' ? 'Завершен' : 'Отменен'
                }</p>
            </div>
        `).join('');
    } else {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-fist-raised"></i>
                <p>Боев пока нет</p>
                <p style="margin-top: 10px; font-size: 0.9rem; color: rgba(255,255,255,0.5);">
                    Заполните анкету для участия в боях
                </p>
            </div>
        `;
    }
    
    modal.classList.add('active');
}

function showApplicationForm() {
    const modal = document.getElementById('application-modal');
    const container = modal.querySelector('.application-form');
    
    container.innerHTML = `
        <div class="modal-header">
            <h2><i class="fas fa-edit"></i> Анкета для участия в боях</h2>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
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
                <button class="btn-primary" id="submit-application-btn">
                    <i class="fas fa-paper-plane"></i> Отправить анкету в Telegram
                </button>
                <button class="btn-secondary" id="clear-form-btn">
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
    
    // Добавляем обработчики
    const submitBtn = container.querySelector('#submit-application-btn');
    const clearBtn = container.querySelector('#clear-form-btn');
    const closeBtn = container.querySelector('.modal-close');
    
    submitBtn.addEventListener('click', submitApplication);
    clearBtn.addEventListener('click', clearApplicationForm);
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    
    modal.classList.add('active');
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
        userId: window.TelegramAuth.getUserId(),
        userName: window.TelegramAuth.getUserName()
    };
    
    // Проверяем обязательные поля
    if (!application.fullName || !application.birthDate || !application.contact) {
        showNotification('Заполните обязательные поля!', 'error');
        return;
    }
    
    // Формируем сообщение для Telegram
    const message = `📋 Новая анкета для участия в боях:
    
👤 Пользователь: ${application.userName}
🆔 ID: ${application.userId}
📅 Дата подачи: ${application.submissionDate}

📝 Личные данные:
• ФИО: ${application.fullName}
• Дата рождения: ${application.birthDate}
• Рост: ${application.height} см
• Вес: ${application.weight} кг

🥊 Спортивные данные:
• Опыт: ${application.experience || 'Не указано'}
• Достижения: ${application.achievements || 'Не указаны'}

❤️ Состояние здоровья:
${application.healthInfo}

📞 Контакты:
• Телефон: ${application.contact}
• Email: ${application.email || 'Не указан'}

📅 Запись на занятия:
• Тип: ${application.trainingType}
• Дата: ${application.trainingDate}`;
    
    // Кодируем сообщение для URL
    const encodedMessage = encodeURIComponent(message);
    
    // Ссылка для отправки в Telegram
    const telegramUrl = `https://t.me/EDEM_CR?text=${encodedMessage}`;
    
    // Открываем Telegram
    window.open(telegramUrl, '_blank');
    
    // Сохраняем в localStorage
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    applications.push(application);
    localStorage.setItem('applications', JSON.stringify(applications));
    
    // Показываем успешное сообщение
    showNotification('✅ Анкета сформирована! Откройте Telegram для отправки.', 'success');
    
    // Закрываем модалку через 2 секунды
    setTimeout(() => {
        document.getElementById('application-modal').classList.remove('active');
    }, 2000);
}

function clearApplicationForm() {
    const inputs = document.querySelectorAll('#application-modal input, #application-modal textarea, #application-modal select');
    inputs.forEach(input => {
        if (input.type !== 'button') {
            input.value = '';
        }
    });
}

function showContract() {
    const modal = document.getElementById('contract-modal');
    const container = modal.querySelector('.contract-container');
    const userId = window.TelegramAuth.getUserId();
    const contractUrl = APP_CONFIG.contracts[userId];
    
    if (!contractUrl) {
        showNotification('Контракт не найден!', 'error');
        return;
    }
    
    container.innerHTML = `
        <div class="modal-header">
            <h2><i class="fas fa-file-signature"></i> Ваш контракт</h2>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <div class="contract-image-container">
                <img src="${contractUrl}" alt="Контракт" class="contract-image"
                     onerror="this.src='https://via.placeholder.com/800x1131/FFFFFF/000000?text=Контракт'">
            </div>
            <div class="contract-actions">
                <button class="btn-primary" onclick="downloadContract()">
                    <i class="fas fa-download"></i> Скачать контракт
                </button>
                <button class="btn-secondary modal-close">
                    <i class="fas fa-times"></i> Закрыть
                </button>
            </div>
        </div>
    `;
    
    const closeBtn = container.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    
    modal.classList.add('active');
}

function downloadContract() {
    const userId = window.TelegramAuth.getUserId();
    const contractUrl = APP_CONFIG.contracts[userId];
    
    if (!contractUrl) {
        showNotification('Контракт не найден!', 'error');
        return;
    }
    
    const link = document.createElement('a');
    link.href = contractUrl;
    link.download = `Контракт_${window.TelegramAuth.getUserName()}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Контракт скачивается...', 'info');
}

function setupEventListeners() {
    // Навигация
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            
            document.querySelectorAll('.nav-btn').forEach(b => {
                b.classList.remove('active');
            });
            
            this.classList.add('active');
            switchPage(page);
        });
    });
    
    // Закрытие модалок
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });
    
    // Закрытие модалок при клике вне их
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
    
    // Покупка билетов
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('buy-ticket-btn')) {
            const fightId = e.target.getAttribute('data-fight-id');
            buyTicket(fightId);
        }
        
        // Открытие видео
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
}

function switchPage(page) {
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
    });
    
    const targetPage = document.getElementById(`${page}-page`);
    if (targetPage) {
        targetPage.style.display = 'block';
        setTimeout(() => {
            targetPage.classList.add('active');
        }, 10);
    }
    
    currentPage = page;
    
    setTimeout(() => {
        if (page === 'videos') {
            loadVideos();
        } else if (page === 'home') {
            loadUpcomingFights();
            setupBanners();
        }
    }, 100);
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
    
    const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    tickets.push(ticket);
    localStorage.setItem('tickets', JSON.stringify(tickets));
    
    showNotification(`✅ Билет куплен! ${fight.ticketPrice} руб.`, 'success');
}

function showNotification(message, type = 'info') {
    const oldNotifications = document.querySelectorAll('.notification');
    oldNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Глобальные функции для кнопок
window.downloadContract = downloadContract;