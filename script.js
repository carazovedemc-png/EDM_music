// Основные переменные
let currentPage = 'home';
let bannerInterval = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', async function() {
    // Сразу скрываем loader
    document.getElementById('loader').style.display = 'none';
    
    try {
        // Инициализируем Telegram Auth
        await window.TelegramAuth.init();
        
        // Показываем анимацию приветствия
        window.TelegramAuth.showWelcomeAnimation();
        
        // Инициализируем приложение
        initializeApp();
        setupEventListeners();
        
        // Обновляем профиль
        updateProfileDisplay();
        setupProfileButtons();
        
        // Устанавливаем активную страницу
        switchPage('home');
        
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        // В случае ошибки все равно продолжаем
        initializeApp();
        setupEventListeners();
        switchPage('home');
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
        videoCard.className = 'video-card';
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
        fightCard.className = 'fight-card';
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

function setupEventListeners() {
    // Навигация
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            
            // Убираем активный класс у всех кнопок
            document.querySelectorAll('.nav-btn').forEach(b => {
                b.classList.remove('active');
            });
            
            // Добавляем активный класс текущей кнопке
            this.classList.add('active');
            
            // Переключаем страницу
            switchPage(page);
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
    
    // Устанавливаем активную кнопку навигации
    document.querySelector('.nav-btn[data-page="home"]').classList.add('active');
}

function updateProfileDisplay() {
    const userName = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');
    const userId = document.getElementById('user-id');
    
    const auth = window.TelegramAuth;
    const user = auth.getUser();
    
    if (user && userName) {
        userName.textContent = auth.getUserName();
    }
    
    if (user && userId) {
        userId.textContent = `ID: ${auth.getUserId()}`;
    }
    
    if (user && userAvatar) {
        const avatarUrl = auth.getUserAvatar();
        userAvatar.src = avatarUrl;
        userAvatar.onerror = function() {
            this.src = 'https://via.placeholder.com/200/FF6B6B/FFFFFF?text=' + 
                      (user.first_name?.charAt(0) || 'U');
        };
    }
}

function setupProfileButtons() {
    const auth = window.TelegramAuth;
    const userId = auth.getUserId();
    
    // Кнопка "Ставки" - показываем только если пользователь в списке
    const betsBtn = document.getElementById('bets-btn');
    if (betsBtn) {
        if (APP_CONFIG.betsAllowedUsers.includes(parseInt(userId))) {
            betsBtn.style.display = 'flex';
            betsBtn.addEventListener('click', function() {
                alert('Функция ставок в разработке');
            });
        } else {
            betsBtn.style.display = 'none';
        }
    }
    
    // Кнопка "Мои бои"
    const myFightsBtn = document.getElementById('my-fights-btn');
    if (myFightsBtn) {
        myFightsBtn.addEventListener('click', function() {
            const userId = window.TelegramAuth.getUserId();
            if (APP_CONFIG.userFights && APP_CONFIG.userFights[userId]) {
                const fights = APP_CONFIG.userFights[userId];
                let message = 'Ваши бои:\n\n';
                fights.forEach(fight => {
                    message += `Против: ${fight.opponent}\n`;
                    message += `Дата: ${fight.date} ${fight.time}\n`;
                    message += `Место: ${fight.place}\n`;
                    message += `Гонорар: ${fight.reward} руб.\n`;
                    message += `Статус: ${fight.status === 'upcoming' ? 'Предстоящий' : fight.status === 'completed' ? 'Завершен' : 'Отменен'}\n\n`;
                });
                alert(message);
            } else {
                alert('У вас пока нет запланированных боев');
            }
        });
    }
    
    // Кнопка "Анкета/Контракт"
    const contractBtn = document.getElementById('contract-btn');
    if (contractBtn) {
        // Обновляем текст кнопки
        if (APP_CONFIG.contracts[userId]) {
            document.getElementById('contract-btn-title').textContent = 'Мой контракт';
            document.getElementById('contract-btn-subtitle').textContent = 'Просмотреть контракт';
        }
        
        contractBtn.addEventListener('click', function() {
            if (APP_CONFIG.contracts[userId]) {
                // Показываем контракт
                const contractUrl = APP_CONFIG.contracts[userId];
                window.open(contractUrl, '_blank');
            } else {
                // Показываем анкету
                showApplicationForm();
            }
        });
    }
    
    // Кнопка "Пользовательское соглашение"
    const agreementBtn = document.getElementById('agreement-btn');
    if (agreementBtn) {
        agreementBtn.addEventListener('click', function() {
            window.open(APP_CONFIG.agreementUrl, '_blank');
        });
    }
    
    // Кнопка "Мои билеты"
    const ticketsBtn = document.getElementById('my-tickets-btn');
    if (ticketsBtn) {
        ticketsBtn.addEventListener('click', function() {
            showMyTickets();
        });
    }
}

function showApplicationForm() {
    let formHTML = `
        <div class="modal-header">
            <h2><i class="fas fa-edit"></i> Анкета для участия в боях</h2>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <p style="text-align: center; margin-bottom: 20px; color: rgba(255,255,255,0.7);">
                Заполните анкету для участия в школьных боях
            </p>
            
            <div class="input-group">
                <input type="text" id="app-fullname" placeholder="ФИО" required>
                <input type="date" id="app-birthdate" required>
                <div style="display: flex; gap: 15px;">
                    <input type="number" id="app-height" placeholder="Рост (см)" required style="flex: 1;">
                    <input type="number" id="app-weight" placeholder="Вес (кг)" required style="flex: 1;">
                </div>
                <textarea id="app-experience" placeholder="Опыт в единоборствах" rows="2"></textarea>
                <textarea id="app-achievements" placeholder="Достижения в спорте" rows="2"></textarea>
                <textarea id="app-health" placeholder="Состояние здоровья, противопоказания" rows="3" required></textarea>
                <input type="tel" id="app-contact" placeholder="Контактный телефон" required>
                <input type="email" id="app-email" placeholder="Email (необязательно)">
                <select id="training-type" style="padding: 16px 20px; background: rgba(255,255,255,0.07); color: white; border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; width: 100%;">
                    <option value="">Выберите тип занятий</option>
                    <option value="boxing">Бокс (Ислям Нариманович)</option>
                    <option value="mma">MMA</option>
                    <option value="wrestling">Борьба</option>
                    <option value="hosting">Хостинг</option>
                </select>
                <input type="date" id="training-date" required>
            </div>
            
            <div style="margin-top: 30px;">
                <button class="btn-primary" id="submit-application-btn">
                    <i class="fas fa-paper-plane"></i> Отправить анкету в Telegram
                </button>
                <button class="btn-secondary" id="clear-form-btn" style="margin-top: 10px;">
                    <i class="fas fa-eraser"></i> Очистить форму
                </button>
            </div>
            
            <p style="text-align: center; margin-top: 20px; color: rgba(255,255,255,0.6); font-size: 0.9rem;">
                <i class="fas fa-info-circle"></i> После отправки анкеты мы свяжемся с вами в Telegram
            </p>
        </div>
    `;
    
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            ${formHTML}
        </div>
    `;
    
    document.body.appendChild(modal);
    
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
    
    // Обработчики для модального окна
    const closeBtn = modal.querySelector('.modal-close');
    const submitBtn = modal.querySelector('#submit-application-btn');
    const clearBtn = modal.querySelector('#clear-form-btn');
    
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    submitBtn.addEventListener('click', submitApplication);
    clearBtn.addEventListener('click', () => {
        const inputs = modal.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.type !== 'button') {
                input.value = '';
            }
        });
    });
}

function submitApplication() {
    const auth = window.TelegramAuth;
    
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
        userId: auth.getUserId(),
        userName: auth.getUserName()
    };
    
    // Проверяем обязательные поля
    if (!application.fullName || !application.birthDate || !application.contact) {
        alert('Заполните обязательные поля!');
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
    
    // Закрываем модалку
    document.querySelector('.modal.active').remove();
    
    alert('✅ Анкета сформирована! Откройте Telegram для отправки.');
}

function showMyTickets() {
    const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    
    if (tickets.length === 0) {
        alert('У вас пока нет купленных билетов');
        return;
    }
    
    let message = 'Ваши билеты:\n\n';
    tickets.forEach(ticket => {
        message += `🎫 ${ticket.fighters.join(' vs ')}\n`;
        message += `📅 ${ticket.date} ${ticket.time}\n`;
        message += `📍 ${ticket.place}\n`;
        message += `💵 ${ticket.price} руб.\n`;
        message += `🛒 Куплен: ${ticket.purchaseDate} ${ticket.purchaseTime}\n\n`;
    });
    
    alert(message);
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
    
    alert(`✅ Билет куплен! ${fight.ticketPrice} руб.`);
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
    setTimeout(() => {
        if (page === 'videos') {
            loadVideos();
        } else if (page === 'home') {
            loadUpcomingFights();
            setupBanners();
        }
    }, 100);
}

// Запускаем при загрузке страницы
window.addEventListener('load', function() {
    // Адаптируем размеры для мобильных
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isTablet = /iPad|Tablet|PlayBook|Silk/i.test(navigator.userAgent) || 
                     (window.innerWidth >= 600 && window.innerWidth <= 1024);
    
    document.body.classList.toggle('mobile', isMobile);
    document.body.classList.toggle('tablet', isTablet);
    document.body.classList.toggle('desktop', !isMobile && !isTablet);
});