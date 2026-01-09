/**
 * Telegram Mini Apps - Система автоматической авторизации для EDM™ UFC
 * Версия: 1.0
 */

class TelegramAuth {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.user = null;
        this.isInitialized = false;
        this.authCallbacks = [];
    }

    /**
     * Инициализация системы авторизации
     */
    async init() {
        // Сначала скрываем loader
        document.getElementById('loader').style.display = 'none';
        
        if (!this.tg) {
            console.log('Telegram WebApp не найден. Запускаем в режиме разработки.');
            return this.initDevMode();
        }

        try {
            // Инициализируем Telegram WebApp
            this.tg.expand();
            this.tg.ready();
            
            // Получаем данные пользователя
            await this.loadUserData();
            
            // Сохраняем в localStorage
            this.saveUserToStorage();
            
            this.isInitialized = true;
            
            // Вызываем все колбэки авторизации
            this.authCallbacks.forEach(callback => callback(this.user));
            
            console.log('Telegram Auth: Пользователь успешно авторизован', this.user);
            return this.user;
            
        } catch (error) {
            console.error('Telegram Auth: Ошибка инициализации', error);
            return this.initDevMode();
        }
    }

    /**
     * Загрузка данных пользователя из Telegram
     */
    async loadUserData() {
        if (!this.tg || !this.tg.initDataUnsafe) {
            throw new Error('Данные Telegram не доступны');
        }

        const tgUser = this.tg.initDataUnsafe.user;
        
        if (!tgUser) {
            throw new Error('Данные пользователя не найдены');
        }

        // Создаем объект пользователя
        this.user = {
            id: tgUser.id,
            is_bot: tgUser.is_bot || false,
            first_name: tgUser.first_name || 'Пользователь',
            last_name: tgUser.last_name || '',
            username: tgUser.username || `user_${tgUser.id}`,
            language_code: tgUser.language_code || 'ru',
            is_premium: tgUser.is_premium || false,
            photo_url: tgUser.photo_url || null,
            
            // Дополнительные данные для приложения
            app_data: {
                registration_date: new Date().toISOString(),
                last_login: new Date().toISOString(),
                session_id: this.generateSessionId()
            }
        };

        // Проверяем, есть ли сохраненные данные в localStorage
        const savedUser = this.getUserFromStorage();
        if (savedUser && savedUser.id === this.user.id) {
            // Объединяем с сохраненными данными
            this.user.app_data = { ...savedUser.app_data, ...this.user.app_data };
            this.user.app_data.last_login = new Date().toISOString();
        }

        return this.user;
    }

    /**
     * Режим разработки (когда приложение запущено вне Telegram)
     */
    initDevMode() {
        // Проверяем, есть ли сохраненный пользователь
        const savedUser = this.getUserFromStorage();
        if (savedUser) {
            this.user = savedUser;
            this.user.app_data.last_login = new Date().toISOString();
        } else {
            // Создаем тестового пользователя
            this.user = {
                id: Date.now(),
                is_bot: false,
                first_name: 'Тестовый',
                last_name: 'Пользователь',
                username: 'test_user',
                language_code: 'ru',
                is_premium: false,
                photo_url: null,
                
                app_data: {
                    registration_date: new Date().toISOString(),
                    last_login: new Date().toISOString(),
                    session_id: this.generateSessionId()
                }
            };
        }

        this.saveUserToStorage();
        this.isInitialized = true;
        
        console.log('Telegram Auth: Режим разработки активирован', this.user);
        return this.user;
    }

    /**
     * Сохранение пользователя в localStorage
     */
    saveUserToStorage() {
        if (!this.user) return;
        
        try {
            localStorage.setItem('tg_user', JSON.stringify(this.user));
            localStorage.setItem('tg_user_id', this.user.id.toString());
        } catch (error) {
            console.error('Telegram Auth: Ошибка сохранения в localStorage', error);
        }
    }

    /**
     * Загрузка пользователя из localStorage
     */
    getUserFromStorage() {
        try {
            const userData = localStorage.getItem('tg_user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Telegram Auth: Ошибка загрузки из localStorage', error);
            return null;
        }
    }

    /**
     * Генерация ID сессии
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Получение данных текущего пользователя
     */
    getUser() {
        if (!this.isInitialized) {
            return this.getUserFromStorage();
        }
        return this.user;
    }

    /**
     * Получение ID пользователя
     */
    getUserId() {
        return this.user?.id || localStorage.getItem('tg_user_id');
    }

    /**
     * Получение имени пользователя
     */
    getUserName() {
        if (!this.user) return 'Гость';
        
        if (this.user.first_name && this.user.last_name) {
            return `${this.user.first_name} ${this.user.last_name}`;
        }
        return this.user.first_name || this.user.username || 'Пользователь';
    }

    /**
     * Получение аватара пользователя
     */
    getUserAvatar() {
        if (!this.user) return null;
        
        // Если есть фото из Telegram
        if (this.user.photo_url) {
            return this.user.photo_url;
        }
        
        // Генерируем аватар на основе имени
        const name = this.user.first_name || this.user.username || 'U';
        const initial = name.charAt(0).toUpperCase();
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=FF6B6B&color=fff&size=200`;
    }

    /**
     * Показ анимации приветствия
     */
    showWelcomeAnimation() {
        const welcomeEl = document.getElementById('telegram-welcome');
        const avatarEl = document.getElementById('welcome-avatar');
        const nameEl = document.getElementById('welcome-name');
        const idEl = document.getElementById('welcome-id');
        
        if (!welcomeEl || !this.user) return;
        
        // Устанавливаем данные
        const avatarUrl = this.getUserAvatar();
        if (avatarUrl) {
            avatarEl.src = avatarUrl;
            avatarEl.onerror = function() {
                this.src = 'https://via.placeholder.com/200/FF6B6B/FFFFFF?text=' + 
                          (window.TelegramAuth.user?.first_name?.charAt(0) || 'U');
            };
        }
        
        nameEl.textContent = this.getUserName();
        idEl.textContent = `ID: ${this.user.id}`;
        
        // Показываем анимацию
        welcomeEl.classList.add('active');
        
        // Скрываем через 2.5 секунды
        setTimeout(() => {
            welcomeEl.classList.remove('active');
        }, 2500);
    }

    /**
     * Обновление данных пользователя
     */
    updateUserData(updates) {
        if (!this.user) return false;
        
        try {
            Object.assign(this.user, updates);
            this.saveUserToStorage();
            return true;
        } catch (error) {
            console.error('Telegram Auth: Ошибка обновления данных', error);
            return false;
        }
    }

    /**
     * Добавление обработчика авторизации
     */
    onAuth(callback) {
        if (typeof callback !== 'function') return;
        
        this.authCallbacks.push(callback);
        
        if (this.isInitialized && this.user) {
            callback(this.user);
        }
    }

    /**
     * Проверка, авторизован ли пользователь
     */
    isAuthenticated() {
        return !!this.user && this.isInitialized;
    }

    /**
     * Проверка, запущено ли в Telegram
     */
    isInTelegram() {
        return !!this.tg;
    }
}

// Создаем глобальный экземпляр
window.TelegramAuth = new TelegramAuth();