class EDMAIApp {
    constructor() {
        this.apiKey = null;
        this.currentChatId = 'default';
        this.chats = {};
        this.userProfile = null;
        this.settings = {
            darkTheme: true,
            animations: true
        };
        this.isMenuOpen = false;
        this.init();
    }

    async init() {
        // Инициализация Telegram Web App
        if (window.Telegram && window.Telegram.WebApp) {
            this.tg = window.Telegram.WebApp;
            this.tg.expand();
            this.tg.enableClosingConfirmation();
            this.tg.setHeaderColor('#141414');
            this.tg.setBackgroundColor('#0a0a0a');
        }
        
        // Загрузка данных
        this.loadData();
        
        // Инициализация интерфейса
        this.initUI();
        
        // Загрузка текущего чата
        this.loadCurrentChat();
        
        // Проверка авторизации
        this.checkAuth();
        
        // Инициализация горячих клавиш
        this.initHotkeys();
    }

    initUI() {
        // Получаем элементы DOM
        this.elements = {
            // Основные контейнеры
            sideMenu: document.getElementById('side-menu'),
            mainContent: document.querySelector('.main-content'),
            messagesContainer: document.getElementById('messages-container'),
            
            // Кнопки навигации
            menuToggle: document.getElementById('menu-toggle'),
            closeMenuBtn: document.getElementById('close-menu-btn'),
            settingsBtn: document.getElementById('settings-btn'),
            closeSettings: document.getElementById('close-settings'),
            
            // Элементы чата
            messageInput: document.getElementById('message-input'),
            sendBtn: document.getElementById('send-btn'),
            attachBtn: document.getElementById('attach-btn'),
            voiceBtn: document.getElementById('voice-btn'),
            
            // Список чатов
            chatsList: document.getElementById('chats-list'),
            newChatBtn: document.getElementById('new-chat-btn'),
            
            // Модальные окна
            settingsModal: document.getElementById('settings-modal'),
            authModal: document.getElementById('auth-modal'),
            
            // Настройки API
            apiKeyInput: document.getElementById('api-key-input'),
            toggleKeyVisibility: document.getElementById('toggle-key-visibility'),
            saveApiBtn: document.getElementById('save-api-btn'),
            apiStatus: document.getElementById('api-status'),
            
            // Настройки интерфейса
            darkThemeToggle: document.getElementById('dark-theme-toggle'),
            animationsToggle: document.getElementById('animations-toggle'),
            
            // Аутентификация
            profilePlaceholder: document.getElementById('profile-placeholder'),
            closeAuth: document.getElementById('close-auth'),
            usernameInput: document.getElementById('username-input'),
            passwordInput: document.getElementById('password-input'),
            registerBtn: document.getElementById('register-btn'),
            cancelAuth: document.getElementById('cancel-auth'),
            
            // Дополнительные кнопки
            searchBtn: document.getElementById('search-btn'),
            reasoningBtn: document.getElementById('reasoning-btn'),
            welcomeMessage: document.getElementById('welcome-message')
        };
        
        // Назначаем обработчики событий
        this.bindEvents();
        
        // Применяем сохраненные настройки
        this.applySettings();
    }

    bindEvents() {
        // Навигация
        this.elements.menuToggle.addEventListener('click', () => this.toggleMenu());
        this.elements.closeMenuBtn.addEventListener('click', () => this.closeMenu());
        
        // Отправка сообщений
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        this.elements.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Авторазмер текстового поля
        this.elements.messageInput.addEventListener('input', () => {
            this.adjustTextareaHeight();
        });
        
        // Настройки
        this.elements.settingsBtn.addEventListener('click', () => this.showSettings());
        this.elements.closeSettings.addEventListener('click', () => this.hideSettings());
        
        // API настройки
        this.elements.saveApiBtn.addEventListener('click', () => this.saveApiKey());
        this.elements.toggleKeyVisibility.addEventListener('click', () => this.toggleKeyVisibility());
        
        // Настройки интерфейса
        this.elements.darkThemeToggle.addEventListener('change', (e) => this.toggleDarkTheme(e.target.checked));
        this.elements.animationsToggle.addEventListener('change', (e) => this.toggleAnimations(e.target.checked));
        
        // Аутентификация
        this.elements.profilePlaceholder.addEventListener('click', () => this.showAuthModal());
        this.elements.closeAuth.addEventListener('click', () => this.hideAuthModal());
        this.elements.registerBtn.addEventListener('click', () => this.registerUser());
        this.elements.cancelAuth.addEventListener('click', () => this.hideAuthModal());
        
        // Закрытие модальных окон при клике вне их
        [this.elements.settingsModal, this.elements.authModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
        
        // Новый чат
        this.elements.newChatBtn.addEventListener('click', () => this.createNewChat());
        
        // Дополнительные кнопки
        this.elements.searchBtn.addEventListener('click', () => this.showSearch());
        this.elements.reasoningBtn.addEventListener('click', () => this.toggleReasoningMode());
        
        // Анимация кнопки отправки
        this.elements.sendBtn.addEventListener('mousedown', () => {
            this.elements.sendBtn.classList.add('sending');
            setTimeout(() => {
                this.elements.sendBtn.classList.remove('sending');
            }, 300);
        });
    }

    initHotkeys() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+/ или Cmd+/ - открыть меню
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.toggleMenu();
            }
            
            // Esc - закрыть меню или модальные окна
            if (e.key === 'Escape') {
                if (this.isMenuOpen) {
                    this.closeMenu();
                }
                if (this.elements.settingsModal.style.display === 'flex') {
                    this.hideSettings();
                }
                if (this.elements.authModal.style.display === 'flex') {
                    this.hideAuthModal();
                }
            }
            
            // Ctrl+K или Cmd+K - фокус на поле ввода
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.elements.messageInput.focus();
            }
        });
    }

    loadData() {
        // Загрузка API ключа
        this.apiKey = localStorage.getItem('edm_ai_api_key');
        
        // Загрузка чатов
        const savedChats = localStorage.getItem('edm_ai_chats');
        if (savedChats) {
            this.chats = JSON.parse(savedChats);
        }
        
        // Загрузка текущего ID чата
        const savedChatId = localStorage.getItem('edm_ai_current_chat');
        if (savedChatId) {
            this.currentChatId = savedChatId;
        }
        
        // Загрузка профиля пользователя
        const savedProfile = localStorage.getItem('edm_ai_profile');
        if (savedProfile) {
            this.userProfile = JSON.parse(savedProfile);
        }
        
        // Загрузка настроек
        const savedSettings = localStorage.getItem('edm_ai_settings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
        }
    }

    saveData() {
        if (this.apiKey) {
            localStorage.setItem('edm_ai_api_key', this.apiKey);
        }
        localStorage.setItem('edm_ai_chats', JSON.stringify(this.chats));
        localStorage.setItem('edm_ai_current_chat', this.currentChatId);
        localStorage.setItem('edm_ai_settings', JSON.stringify(this.settings));
        if (this.userProfile) {
            localStorage.setItem('edm_ai_profile', JSON.stringify(this.userProfile));
        }
    }

    loadCurrentChat() {
        // Создаем чат по умолчанию, если его нет
        if (!this.chats[this.currentChatId]) {
            this.chats[this.currentChatId] = {
                id: this.currentChatId,
                name: 'Новый чат',
                created: new Date().toISOString(),
                messages: []
            };
            this.saveData();
        }
        
        // Очищаем контейнер сообщений
        this.elements.messagesContainer.innerHTML = '';
        
        // Скрываем приветственное сообщение
        if (this.elements.welcomeMessage) {
            this.elements.welcomeMessage.style.display = 'none';
        }
        
        // Загружаем сообщения из текущего чата
        const chat = this.chats[this.currentChatId];
        if (chat.messages.length === 0) {
            // Если сообщений нет, показываем приветственное сообщение
            if (this.elements.welcomeMessage) {
                this.elements.welcomeMessage.style.display = 'block';
            }
        } else {
            // Отображаем все сообщения
            chat.messages.forEach(msg => {
                this.addMessageToUI(msg.text, msg.type, msg.id, true);
            });
        }
        
        // Обновляем список чатов
        this.updateChatsList();
        
        // Прокручиваем вниз
        this.scrollToBottom();
    }

    async sendMessage() {
        const message = this.elements.messageInput.value.trim();
        if (!message) return;
        
        // Очищаем поле ввода
        this.elements.messageInput.value = '';
        this.adjustTextareaHeight();
        
        // Показываем сообщение пользователя
        this.addMessageToUI(message, 'user');
        
        // Проверяем API ключ
        if (!this.apiKey) {
            this.addMessageToUI('Пожалуйста, настройте API ключ в настройках', 'ai');
            this.showSettings();
            return;
        }
        
        // Показываем индикатор загрузки
        const loadingId = 'loading_' + Date.now();
        this.showTypingIndicator(loadingId);
        
        try {
            // Отправляем запрос к AI
            const response = await this.callGeminiAPI(message);
            
            // Убираем индикатор загрузки
            this.hideTypingIndicator(loadingId);
            
            // Показываем ответ AI
            this.addMessageToUI(response, 'ai');
            
        } catch (error) {
            // Убираем индикатор загрузки
            this.hideTypingIndicator(loadingId);
            
            // Показываем ошибку
            console.error('Ошибка при отправке сообщения:', error);
            this.addMessageToUI(`Ошибка: ${error.message}`, 'ai');
        }
    }

    async callGeminiAPI(prompt) {
        const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
        
        const systemPrompt = `Ты - EDM_AI, полезный и дружелюбный AI-ассистент. Отвечай на русском языке.
        
Твои характеристики:
1. На простые вопросы (привет, как дела) отвечай кратко и вежливо (1-2 предложения)
2. На сложные/технические вопросы отвечай подробно и информативно
3. Будь полезным, но избегай излишней формальности
4. Если просят код, предоставляй полные, рабочие примеры
5. Сохраняй дружелюбный, но профессиональный тон

Текущее время: ${new Date().toLocaleString('ru-RU')}
Пользователь: ${this.userProfile?.username || 'Гость'}`;

        const requestBody = {
            contents: [{
                parts: [
                    { text: systemPrompt },
                    { text: prompt }
                ]
            }],
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 2048,
            }
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': this.apiKey
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                let errorDetail = `HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorDetail += `: ${JSON.stringify(errorData.error || errorData)}`;
                } catch (e) {
                    const text = await response.text();
                    if (text) errorDetail += ` - ${text.substring(0, 100)}`;
                }
                throw new Error(`Ошибка API: ${errorDetail}`);
            }

            const data = await response.json();
            
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Неожиданный формат ответа от AI');
            }
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Сетевая ошибка. Проверьте подключение к интернету');
            }
            throw error;
        }
    }

    addMessageToUI(text, type = 'ai', messageId = null, fromHistory = false) {
        // Сохраняем сообщение в историю чата
        if (!fromHistory) {
            this.saveMessageToChat(text, type, messageId);
        }
        
        // Скрываем приветственное сообщение при первом сообщении
        if (this.elements.welcomeMessage && this.elements.welcomeMessage.style.display !== 'none') {
            this.elements.welcomeMessage.style.display = 'none';
        }
        
        // Создаем элемент сообщения
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}-message new-message`;
        if (messageId) {
            messageEl.dataset.id = messageId;
        }
        
        // Генерируем HTML в зависимости от типа сообщения
        if (type === 'ai') {
            const avatarColor = this.generateAvatarColor('EDM_AI');
            messageEl.innerHTML = `
                <div class="message-avatar">
                    <div class="ai-avatar" style="background: ${avatarColor}">
                        <i class="fas fa-robot"></i>
                    </div>
                </div>
                <div class="message-content">
                    <div class="message-bubble">
                        <div class="message-text">${this.escapeHtml(text)}</div>
                        <div class="message-actions">
                            <button class="msg-action-btn copy-btn" title="Скопировать" onclick="app.copyMessage('${messageId || ''}')">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="msg-action-btn like-btn" title="Нравится" onclick="app.rateMessage('${messageId || ''}', 'like')">
                                <i class="fas fa-thumbs-up"></i>
                            </button>
                            <button class="msg-action-btn dislike-btn" title="Не нравится" onclick="app.rateMessage('${messageId || ''}', 'dislike')">
                                <i class="fas fa-thumbs-down"></i>
                            </button>
                            <button class="msg-action-btn regenerate-btn" title="Сгенерировать заново" onclick="app.regenerateMessage('${messageId || ''}')">
                                <i class="fas fa-redo"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else if (type === 'user') {
            const avatarColor = this.userProfile ? 
                this.generateAvatarColor(this.userProfile.username) : 
                'linear-gradient(135deg, #3b82f6, #1d4ed8)';
            const avatarText = this.userProfile ? 
                this.userProfile.username.charAt(0).toUpperCase() : 'В';
            
            messageEl.innerHTML = `
                <div class="message-content">
                    <div class="message-bubble">
                        <div class="message-text">${this.escapeHtml(text)}</div>
                    </div>
                </div>
                <div class="message-avatar">
                    <div class="user-avatar" style="background: ${avatarColor}">
                        ${avatarText}
                    </div>
                </div>
            `;
        }
        
        // Добавляем сообщение в контейнер
        this.elements.messagesContainer.appendChild(messageEl);
        
        // Прокручиваем вниз
        this.scrollToBottom();
        
        return messageEl;
    }

    saveMessageToChat(text, type, messageId = null) {
        if (!this.chats[this.currentChatId]) {
            this.chats[this.currentChatId] = {
                id: this.currentChatId,
                name: 'Новый чат',
                created: new Date().toISOString(),
                messages: []
            };
        }
        
        this.chats[this.currentChatId].messages.push({
            id: messageId || Date.now().toString(),
            text,
            type,
            timestamp: new Date().toISOString(),
            rating: null
        });
        
        // Обновляем название чата по первому сообщению
        if (this.chats[this.currentChatId].messages.length === 1 && type === 'user') {
            this.chats[this.currentChatId].name = text.length > 30 ? 
                text.substring(0, 27) + '...' : text;
        }
        
        // Сохраняем только последние 100 сообщений
        if (this.chats[this.currentChatId].messages.length > 100) {
            this.chats[this.currentChatId].messages = this.chats[this.currentChatId].messages.slice(-100);
        }
        
        this.saveData();
        this.updateChatsList();
    }

    showTypingIndicator(id) {
        const typingEl = document.createElement('div');
        typingEl.className = 'message ai-message new-message';
        typingEl.dataset.id = id;
        typingEl.innerHTML = `
            <div class="message-avatar">
                <div class="ai-avatar" style="background: linear-gradient(135deg, #8a2be2, #6d28d9)">
                    <i class="fas fa-robot"></i>
                </div>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                    <div class="typing-text">Печатает...</div>
                </div>
            </div>
        `;
        
        this.elements.messagesContainer.appendChild(typingEl);
        this.scrollToBottom();
        
        return typingEl;
    }

    hideTypingIndicator(id) {
        const typingEl = document.querySelector(`[data-id="${id}"]`);
        if (typingEl) {
            typingEl.remove();
        }
    }

    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.elements.sideMenu.classList.add('active');
        this.isMenuOpen = true;
        
        // Блюрим основной контент
        if (this.settings.animations) {
            this.elements.mainContent.style.filter = 'blur(2px)';
        }
    }

    closeMenu() {
        this.elements.sideMenu.classList.remove('active');
        this.isMenuOpen = false;
        
        // Убираем блюр
        this.elements.mainContent.style.filter = 'none';
    }

    updateChatsList() {
        if (!this.elements.chatsList) return;
        
        this.elements.chatsList.innerHTML = '';
        
        // Сортируем чаты по дате создания (новые сверху)
        const sortedChats = Object.values(this.chats).sort((a, b) => 
            new Date(b.created) - new Date(a.created)
        );
        
        sortedChats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${chat.id === this.currentChatId ? 'active' : ''}`;
            chatItem.dataset.chatId = chat.id;
            
            // Получаем последнее сообщение для превью
            const lastMessage = chat.messages.length > 0 ? 
                chat.messages[chat.messages.length - 1].text : 'Нет сообщений';
            
            const preview = lastMessage.length > 40 ? 
                lastMessage.substring(0, 37) + '...' : lastMessage;
            
            // Создаем аватар на основе названия чата
            const avatarColor = this.generateAvatarColor(chat.name);
            const avatarText = chat.name.charAt(0).toUpperCase();
            
            const date = new Date(chat.created).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            chatItem.innerHTML = `
                <div class="chat-avatar" style="background: ${avatarColor}">
                    ${avatarText}
                </div>
                <div class="chat-info">
                    <div class="chat-name">${this.escapeHtml(chat.name)}</div>
                    <div class="chat-preview">${this.escapeHtml(preview)}</div>
                </div>
            `;
            
            chatItem.addEventListener('click', () => {
                this.switchChat(chat.id);
                this.closeMenu();
            });
            
            this.elements.chatsList.appendChild(chatItem);
        });
    }

    switchChat(chatId) {
        if (this.currentChatId === chatId) return;
        
        this.currentChatId = chatId;
        this.saveData();
        this.loadCurrentChat();
        
        // Обновляем активный элемент в списке чатов
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.chatId === chatId) {
                item.classList.add('active');
            }
        });
    }

    createNewChat() {
        const chatId = 'chat_' + Date.now();
        this.chats[chatId] = {
            id: chatId,
            name: 'Новый чат',
            created: new Date().toISOString(),
            messages: []
        };
        
        this.currentChatId = chatId;
        this.saveData();
        this.loadCurrentChat();
        this.closeMenu();
    }

    showSettings() {
        // Заполняем поле API ключа (замаскированное)
        if (this.apiKey) {
            this.elements.apiKeyInput.value = '••••••••••••' + this.apiKey.slice(-4);
        } else {
            this.elements.apiKeyInput.value = '';
        }
        
        // Устанавливаем переключатели
        this.elements.darkThemeToggle.checked = this.settings.darkTheme;
        this.elements.animationsToggle.checked = this.settings.animations;
        
        this.elements.settingsModal.style.display = 'flex';
    }

    hideSettings() {
        this.elements.settingsModal.style.display = 'none';
        this.elements.apiStatus.textContent = '';
        this.elements.apiStatus.className = 'status-message';
    }

    saveApiKey() {
        const key = this.elements.apiKeyInput.value.trim();
        
        if (!key) {
            this.showApiStatus('Введите API ключ', 'error');
            return;
        }
        
        // Если ключ замаскирован, не меняем его
        if (key.includes('••••') && this.apiKey) {
            this.showApiStatus('Ключ уже сохранен', 'success');
            return;
        }
        
        this.apiKey = key;
        this.saveData();
        this.showApiStatus('API ключ успешно сохранен!', 'success');
        
        // Маскируем ключ в поле ввода
        setTimeout(() => {
            this.elements.apiKeyInput.value = '••••••••••••' + key.slice(-4);
        }, 100);
    }

    showApiStatus(message, type) {
        this.elements.apiStatus.textContent = message;
        this.elements.apiStatus.className = `status-message ${type}`;
        
        setTimeout(() => {
            this.elements.apiStatus.className = 'status-message';
            this.elements.apiStatus.textContent = '';
        }, 3000);
    }

    toggleKeyVisibility() {
        const input = this.elements.apiKeyInput;
        const button = this.elements.toggleKeyVisibility;
        
        if (input.type === 'password') {
            input.type = 'text';
            button.innerHTML = '<i class="fas fa-eye-slash"></i>';
            button.title = 'Скрыть ключ';
        } else {
            input.type = 'password';
            button.innerHTML = '<i class="fas fa-eye"></i>';
            button.title = 'Показать ключ';
        }
    }

    applySettings() {
        // Применяем тему
        if (this.settings.darkTheme) {
            document.documentElement.style.setProperty('--primary-bg', '#0a0a0a');
            document.documentElement.style.setProperty('--secondary-bg', '#141414');
            document.documentElement.style.setProperty('--primary-text', '#ffffff');
        } else {
            document.documentElement.style.setProperty('--primary-bg', '#f8f9fa');
            document.documentElement.style.setProperty('--secondary-bg', '#ffffff');
            document.documentElement.style.setProperty('--primary-text', '#1a1a1a');
        }
        
        // Применяем настройки анимаций
        if (!this.settings.animations) {
            document.documentElement.style.setProperty('--transition', 'none');
        }
    }

    toggleDarkTheme(enabled) {
        this.settings.darkTheme = enabled;
        this.saveData();
        this.applySettings();
    }

    toggleAnimations(enabled) {
        this.settings.animations = enabled;
        this.saveData();
        this.applySettings();
    }

    checkAuth() {
        if (this.userProfile) {
            this.updateProfileUI();
        } else {
            // Показываем модальное окно регистрации при первом запуске
            const hasSeenAuth = localStorage.getItem('edm_ai_has_seen_auth');
            if (!hasSeenAuth) {
                setTimeout(() => {
                    this.showAuthModal();
                    localStorage.setItem('edm_ai_has_seen_auth', 'true');
                }, 1000);
            }
        }
    }

    showAuthModal() {
        this.elements.authModal.style.display = 'flex';
        this.elements.usernameInput.focus();
    }

    hideAuthModal() {
        this.elements.authModal.style.display = 'none';
        this.elements.usernameInput.value = '';
        this.elements.passwordInput.value = '';
    }

    registerUser() {
        const username = this.elements.usernameInput.value.trim();
        const password = this.elements.passwordInput.value.trim();
        
        if (!username || username.length < 3) {
            alert('Имя пользователя должно содержать минимум 3 символа');
            return;
        }
        
        if (!password || password.length < 6) {
            alert('Пароль должен содержать минимум 6 символов');
            return;
        }
        
        // Сохраняем профиль
        this.userProfile = {
            username,
            registeredAt: new Date().toISOString(),
            avatarColor: this.generateRandomColor()
        };
        
        this.saveData();
        this.updateProfileUI();
        this.hideAuthModal();
        
        // Приветствуем пользователя
        this.addMessageToUI(`Привет, ${username}! Рад видеть вас в EDM_AI!`, 'ai');
    }

    updateProfileUI() {
        if (!this.userProfile || !this.elements.profilePlaceholder) return;
        
        const profileHtml = `
            <div class="profile-info">
                <div class="profile-avatar" style="background: ${this.userProfile.avatarColor}">
                    ${this.userProfile.username.charAt(0).toUpperCase()}
                </div>
                <div class="profile-details">
                    <div class="profile-username">${this.userProfile.username}</div>
                    <div class="profile-status">Пользователь</div>
                </div>
            </div>
        `;
        
        this.elements.profilePlaceholder.innerHTML = profileHtml;
        
        // Обновляем обработчик клика для выхода
        this.elements.profilePlaceholder.addEventListener('click', () => {
            if (confirm('Выйти из аккаунта?')) {
                this.logout();
            }
        });
    }

    logout() {
        this.userProfile = null;
        localStorage.removeItem('edm_ai_profile');
        this.checkAuth();
        location.reload();
    }

    copyMessage(messageId) {
        const messageElement = document.querySelector(`[data-id="${messageId}"]`);
        if (!messageElement) return;
        
        const messageText = messageElement.querySelector('.message-text');
        if (!messageText) return;
        
        const textToCopy = messageText.textContent;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            // Показываем подтверждение
            const copyBtn = messageElement.querySelector('.copy-btn');
            if (copyBtn) {
                const originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                copyBtn.classList.add('active');
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                    copyBtn.classList.remove('active');
                }, 2000);
            }
        }).catch(err => {
            console.error('Ошибка копирования:', err);
        });
    }

    rateMessage(messageId, rating) {
        // Находим сообщение в текущем чате
        const chat = this.chats[this.currentChatId];
        if (!chat) return;
        
        const message = chat.messages.find(msg => msg.id === messageId);
        if (message) {
            message.rating = rating;
            this.saveData();
            
            // Обновляем кнопку
            const messageElement = document.querySelector(`[data-id="${messageId}"]`);
            if (messageElement) {
                const btn = rating === 'like' ? 
                    messageElement.querySelector('.like-btn') : 
                    messageElement.querySelector('.dislike-btn');
                
                if (btn) {
                    btn.classList.add('active');
                    
                    // Через 2 секунды убираем подсветку
                    setTimeout(() => {
                        btn.classList.remove('active');
                    }, 2000);
                }
            }
        }
    }

    regenerateMessage(messageId) {
        // Находим сообщение
        const chat = this.chats[this.currentChatId];
        if (!chat) return;
        
        const messageIndex = chat.messages.findIndex(msg => msg.id === messageId);
        if (messageIndex === -1) return;
        
        // Находим предыдущее сообщение пользователя
        let userMessageIndex = -1;
        for (let i = messageIndex - 1; i >= 0; i--) {
            if (chat.messages[i].type === 'user') {
                userMessageIndex = i;
                break;
            }
        }
        
        if (userMessageIndex === -1) return;
        
        const userMessage = chat.messages[userMessageIndex].text;
        
        // Удаляем старый ответ AI и все последующие сообщения
        chat.messages.splice(messageIndex);
        this.saveData();
        
        // Перезагружаем чат
        this.loadCurrentChat();
        
        // Отправляем запрос заново
        this.elements.messageInput.value = userMessage;
        this.sendMessage();
    }

    showSearch() {
        // TODO: Реализовать поиск по сообщениям
        alert('Функция поиска будет добавлена в следующем обновлении');
    }

    toggleReasoningMode() {
        // TODO: Реализовать режим рассуждения
        alert('Режим рассуждения будет добавлен в следующем обновлении');
    }

    adjustTextareaHeight() {
        const textarea = this.elements.messageInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    scrollToBottom() {
        setTimeout(() => {
            this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
        }, 100);
    }

    generateAvatarColor(str) {
        // Генерируем цвет на основе строки
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const colors = [
            'linear-gradient(135deg, #667eea, #764ba2)',
            'linear-gradient(135deg, #f093fb, #f5576c)',
            'linear-gradient(135deg, #4facfe, #00f2fe)',
            'linear-gradient(135deg, #43e97b, #38f9d7)',
            'linear-gradient(135deg, #fa709a, #fee140)',
            'linear-gradient(135deg, #a8edea, #fed6e3)',
            'linear-gradient(135deg, #d299c2, #fef9d7)',
            'linear-gradient(135deg, #89f7fe, #66a6ff)'
        ];
        
        return colors[Math.abs(hash) % colors.length];
    }

    generateRandomColor() {
        const colors = [
            'linear-gradient(135deg, #667eea, #764ba2)',
            'linear-gradient(135deg, #f093fb, #f5576c)',
            'linear-gradient(135deg, #4facfe, #00f2fe)',
            'linear-gradient(135deg, #43e97b, #38f9d7)',
            'linear-gradient(135deg, #fa709a, #fee140)'
        ];
        
        return colors[Math.floor(Math.random() * colors.length)];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.app = new EDMAIApp();
});