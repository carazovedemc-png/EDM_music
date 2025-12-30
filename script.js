class EDMAIApp {
    constructor() {
        this.apiKey = null;
        this.currentChatId = 'default';
        this.chats = {};
        this.userProfile = null;
        this.isMenuOpen = false;
        
        // Свойства для голосового ввода
        this.isRecording = false;
        this.recognition = null;
        this.finalTranscript = '';
        
        // Свойства для остановки генерации
        this.isGenerating = false;
        this.generationController = null;
        this.lastPrompt = '';
        this.partialResponse = '';
        this.stoppedGenerationId = null;
        
        // Свойства для режима рассуждения
        this.reasoningMode = false;
        
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
        
        // Инициализация распознавания речи
        this.initSpeechRecognition();
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
            settingsBtnInMenu: document.getElementById('settings-btn-in-menu'),
            closeSettings: document.getElementById('close-settings'),
            newChatBtnTop: document.getElementById('new-chat-btn-top'),
            newChatMenuBtn: document.getElementById('new-chat-menu-btn'),
            
            // Элементы чата
            messageInput: document.getElementById('message-input'),
            sendBtn: document.getElementById('send-btn'),
            sendIcon: document.getElementById('send-icon'),
            stopIcon: document.getElementById('stop-icon'),
            voiceControlBtn: document.getElementById('voice-control-btn'),
            stopRecordBtn: document.getElementById('stop-record-btn'),
            
            // Кнопки действий
            searchBtn: document.getElementById('search-btn'),
            reasoningBtn: document.getElementById('reasoning-btn'),
            
            // Список чатов
            chatsList: document.getElementById('chats-list'),
            
            // Модальные окна
            settingsModal: document.getElementById('settings-modal'),
            authModal: document.getElementById('auth-modal'),
            profileModal: document.getElementById('profile-modal'),
            
            // Настройки API
            apiKeyInput: document.getElementById('api-key-input'),
            toggleKeyVisibility: document.getElementById('toggle-key-visibility'),
            saveApiBtn: document.getElementById('save-api-btn'),
            apiStatus: document.getElementById('api-status'),
            
            // Аутентификация
            profilePlaceholder: document.getElementById('profile-placeholder'),
            closeAuth: document.getElementById('close-auth'),
            usernameInput: document.getElementById('username-input'),
            passwordInput: document.getElementById('password-input'),
            registerBtn: document.getElementById('register-btn'),
            cancelAuth: document.getElementById('cancel-auth'),
            
            // Профиль
            closeProfile: document.getElementById('close-profile'),
            logoutBtn: document.getElementById('logout-btn'),
            profileDisplay: document.getElementById('profile-display'),
            
            // Приветственное сообщение
            welcomeMessage: document.getElementById('welcome-message'),
            
            // Панель продолжения генерации
            continueGenerationPanel: document.getElementById('continue-generation-panel'),
            continueGenerationBtn: document.getElementById('continue-generation-btn'),
            generationStoppedText: document.querySelector('.generation-stopped-text')
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
        
        // Отправка сообщений и остановка генерации
        this.elements.sendBtn.addEventListener('click', () => {
            if (this.isGenerating) {
                this.stopGeneration();
            } else {
                this.sendMessage();
            }
        });
        
        this.elements.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (this.isGenerating) {
                    this.stopGeneration();
                } else {
                    this.sendMessage();
                }
            }
        });
        
        // Авторазмер текстового поля
        this.elements.messageInput.addEventListener('input', () => {
            this.adjustTextareaHeight();
        });
        
        // Настройки
        this.elements.settingsBtnInMenu.addEventListener('click', () => this.showSettings());
        this.elements.closeSettings.addEventListener('click', () => this.hideSettings());
        
        // API настройки
        this.elements.saveApiBtn.addEventListener('click', () => this.saveApiKey());
        this.elements.toggleKeyVisibility.addEventListener('click', () => this.toggleKeyVisibility());
        
        // Новые чаты
        this.elements.newChatBtnTop.addEventListener('click', () => this.createNewChat());
        this.elements.newChatMenuBtn.addEventListener('click', () => {
            this.createNewChat();
            this.closeMenu();
        });
        
        // Аутентификация
        this.elements.profilePlaceholder.addEventListener('click', () => this.showProfileModal());
        this.elements.closeAuth.addEventListener('click', () => this.hideAuthModal());
        this.elements.registerBtn.addEventListener('click', () => this.registerUser());
        this.elements.cancelAuth.addEventListener('click', () => this.hideAuthModal());
        
        // Профиль
        this.elements.closeProfile.addEventListener('click', () => this.hideProfileModal());
        this.elements.logoutBtn.addEventListener('click', () => this.logout());
        
        // Голосовой ввод
        this.elements.voiceControlBtn.addEventListener('click', () => this.startVoiceRecognition());
        this.elements.stopRecordBtn.addEventListener('click', () => this.stopVoiceRecognition());
        
        // Дополнительные кнопки
        this.elements.searchBtn.addEventListener('click', () => this.showSearch());
        this.elements.reasoningBtn.addEventListener('click', () => this.toggleReasoningMode());
        
        // Продолжение генерации
        this.elements.continueGenerationBtn.addEventListener('click', () => this.continueGeneration());
        
        // Закрытие модальных окон при клике вне их
        [this.elements.settingsModal, this.elements.authModal, this.elements.profileModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    if (modal.id === 'settings-modal') this.hideSettings();
                    if (modal.id === 'auth-modal') this.hideAuthModal();
                    if (modal.id === 'profile-modal') this.hideProfileModal();
                }
            });
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
                if (this.elements.profileModal.style.display === 'flex') {
                    this.hideProfileModal();
                }
                if (this.isGenerating) {
                    this.stopGeneration();
                }
            }
            
            // Ctrl+K или Cmd+K - фокус на поле ввода
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.elements.messageInput.focus();
            }
        });
    }

    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'ru-RU';
            
            this.recognition.onstart = () => {
                this.isRecording = true;
                this.elements.voiceControlBtn.style.display = 'none';
                this.elements.stopRecordBtn.style.display = 'flex';
                this.elements.stopRecordBtn.classList.add('recording');
            };
            
            this.recognition.onresult = (event) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        this.finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                
                if (interimTranscript) {
                    this.elements.messageInput.value = this.finalTranscript + interimTranscript;
                    this.adjustTextareaHeight();
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.stopVoiceRecognition();
                this.showNotification('Ошибка распознавания речи', 'error');
            };
            
            this.recognition.onend = () => {
                this.stopVoiceRecognition();
                if (this.finalTranscript) {
                    this.elements.messageInput.value = this.finalTranscript;
                    this.adjustTextareaHeight();
                    this.elements.messageInput.focus();
                }
            };
        } else {
            console.warn('Speech recognition not supported');
            this.elements.voiceControlBtn.style.display = 'none';
        }
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
    }

    saveData() {
        if (this.apiKey) {
            localStorage.setItem('edm_ai_api_key', this.apiKey);
        }
        localStorage.setItem('edm_ai_chats', JSON.stringify(this.chats));
        localStorage.setItem('edm_ai_current_chat', this.currentChatId);
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
        
        // Скрываем панель продолжения генерации
        this.hideContinuePanel();
        
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
        
        // Сохраняем промпт для возможного продолжения
        this.lastPrompt = message;
        this.partialResponse = '';
        
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
        
        // Устанавливаем флаг генерации
        this.isGenerating = true;
        this.updateSendButtonState();
        
        // Создаем контроллер для возможности прерывания
        this.generationController = new AbortController();
        
        try {
            // Отправляем запрос к API
            const response = await this.callGeminiAPI(message, this.generationController.signal);
            
            // Убираем индикатор загрузки
            this.hideTypingIndicator(loadingId);
            
            // Сбрасываем флаг генерации
            this.isGenerating = false;
            this.updateSendButtonState();
            
            // Показываем ответ AI
            this.addMessageToUI(response, 'ai');
            
        } catch (error) {
            // Убираем индикатор загрузки
            this.hideTypingIndicator(loadingId);
            
            // Сбрасываем флаг генерации
            this.isGenerating = false;
            this.updateSendButtonState();
            
            // Проверяем, была ли остановка генерации
            if (error.name === 'AbortError') {
                // Генерация была остановлена пользователем
                this.stoppedGenerationId = loadingId;
                this.showContinuePanel();
            } else {
                // Другая ошибка
                console.error('Ошибка при отправке сообщения:', error);
                this.addMessageToUI(`Ошибка: ${error.message}`, 'ai');
            }
        }
    }

    stopGeneration() {
        if (this.isGenerating && this.generationController) {
            // Прерываем запрос
            this.generationController.abort();
            
            // Сбрасываем флаг генерации
            this.isGenerating = false;
            this.updateSendButtonState();
            
            // Показываем уведомление
            this.showNotification('Генерация остановлена', 'info');
        }
    }

    continueGeneration() {
        if (!this.lastPrompt || !this.stoppedGenerationId) return;
        
        // Скрываем панель продолжения
        this.hideContinuePanel();
        
        // Удаляем предыдущее незавершенное сообщение
        this.hideTypingIndicator(this.stoppedGenerationId);
        
        // Показываем новый индикатор загрузки
        const newLoadingId = 'loading_' + Date.now();
        this.showTypingIndicator(newLoadingId);
        
        // Устанавливаем флаг генерации
        this.isGenerating = true;
        this.updateSendButtonState();
        
        // Создаем новый контроллер
        this.generationController = new AbortController();
        
        // Отправляем запрос с тем же промптом
        this.callGeminiAPI(this.lastPrompt, this.generationController.signal)
            .then(response => {
                // Убираем индикатор загрузки
                this.hideTypingIndicator(newLoadingId);
                
                // Сбрасываем флаг генерации
                this.isGenerating = false;
                this.updateSendButtonState();
                
                // Показываем ответ AI
                this.addMessageToUI(response, 'ai');
                
                // Сбрасываем ID остановленной генерации
                this.stoppedGenerationId = null;
            })
            .catch(error => {
                // Убираем индикатор загрузки
                this.hideTypingIndicator(newLoadingId);
                
                // Сбрасываем флаг генерации
                this.isGenerating = false;
                this.updateSendButtonState();
                
                if (error.name === 'AbortError') {
                    // Генерация снова была остановлена
                    this.stoppedGenerationId = newLoadingId;
                    this.showContinuePanel();
                } else {
                    console.error('Ошибка при продолжении генерации:', error);
                    this.addMessageToUI(`Ошибка: ${error.message}`, 'ai');
                }
            });
    }

    updateSendButtonState() {
        if (this.isGenerating) {
            // Показываем иконку остановки
            this.elements.sendIcon.style.display = 'none';
            this.elements.stopIcon.style.display = 'block';
            this.elements.sendBtn.classList.add('generating');
            this.elements.sendBtn.title = 'Остановить генерацию';
        } else {
            // Показываем иконку отправки
            this.elements.sendIcon.style.display = 'block';
            this.elements.stopIcon.style.display = 'none';
            this.elements.sendBtn.classList.remove('generating');
            this.elements.sendBtn.title = 'Отправить';
        }
    }

    showContinuePanel() {
        if (this.elements.continueGenerationPanel) {
            this.elements.continueGenerationPanel.style.display = 'flex';
            this.scrollToBottom();
        }
    }

    hideContinuePanel() {
        if (this.elements.continueGenerationPanel) {
            this.elements.continueGenerationPanel.style.display = 'none';
        }
    }

    async callGeminiAPI(prompt, signal) {
        const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
        
        let systemPrompt = `Ты - EDM AI, полезный и дружелюбный AI-ассистент. Отвечай на русском языке.
        
Твои характеристики:
1. На простые вопросы (привет, как дела) отвечай кратко и вежливо (1-2 предложения)
2. На сложные/технические вопросы отвечай подробно и информативно
3. Будь полезным, но избегай излишней формальности
4. Если просят код, предоставляй полные, рабочие примеры
5. Сохраняй дружелюбный, но профессиональный тон`;

        if (this.reasoningMode) {
            systemPrompt += "\n6. Для этого запроса покажи свой мыслительный процесс перед финальным ответом";
        }

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
                body: JSON.stringify(requestBody),
                signal: signal // Передаем сигнал для возможности прерывания
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
            if (error.name === 'AbortError') {
                throw error; // Пробрасываем ошибку прерывания
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
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
            const avatarColor = this.generateAvatarColor('EDM AI');
            messageEl.innerHTML = `
                <div class="message-avatar">
                    <div class="ai-avatar">
                        <img src="https://sun9-63.userapi.com/s/v1/ig2/xFXQy8Z-tBdqm3_0VIyRQC-Rqn4SD5p21syKAfSfgzERB0LJZ_4Ca43TxJKtnKDqr4hR1GtDuW2FsGgsgXBs6DqA.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080&from=bu&u=z9seQ0Q9GKcv-_BeLg7iZPuwEks6UMnZ7DyVf39C2OM&cs=640x0" alt="EDM AI" class="company-logo">
                    </div>
                </div>
                <div class="message-content">
                    <div class="message-bubble">
                        <div class="message-text">${this.escapeHtml(text)}</div>
                        <div class="message-actions">
                            <button class="msg-action-btn copy-btn" title="Скопировать" onclick="app.copyMessage('${messageId || Date.now()}')">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="msg-action-btn regenerate-btn" title="Сгенерировать заново" onclick="app.regenerateMessage('${messageId || Date.now()}')">
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
                <div class="ai-avatar">
                    <img src="https://sun9-63.userapi.com/s/v1/ig2/xFXQy8Z-tBdqm3_0VIyRQC-Rqn4SD5p21syKAfSfgzERB0LJZ_4Ca43TxJKtnKDqr4hR1GtDuW2FsGgsgXBs6DqA.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080&from=bu&u=z9seQ0Q9GKcv-_BeLg7iZPuwEks6UMnZ7DyVf39C2OM&cs=640x0" alt="EDM AI" class="company-logo">
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
    }

    closeMenu() {
        this.elements.sideMenu.classList.remove('active');
        this.isMenuOpen = false;
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
        
        this.showNotification('Новый чат создан', 'success');
    }

    showSettings() {
        // Заполняем поле API ключа (замаскированное)
        if (this.apiKey) {
            this.elements.apiKeyInput.value = '••••••••••••' + this.apiKey.slice(-4);
        } else {
            this.elements.apiKeyInput.value = '';
        }
        
        this.elements.settingsModal.style.display = 'flex';
        this.closeMenu();
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
        // Применяем тему (всегда темная)
        document.documentElement.style.setProperty('--primary-bg', '#0a0a0a');
        document.documentElement.style.setProperty('--secondary-bg', '#141414');
        document.documentElement.style.setProperty('--primary-text', '#ffffff');
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
            this.showNotification('Имя пользователя должно содержать минимум 3 символа', 'error');
            return;
        }
        
        if (!password || password.length < 6) {
            this.showNotification('Пароль должен содержать минимум 6 символов', 'error');
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
        this.addMessageToUI(`Привет, ${username}! Рад видеть вас в EDM AI!`, 'ai');
        
        this.showNotification('Профиль успешно создан', 'success');
    }

    showProfileModal() {
        if (!this.userProfile) {
            this.showAuthModal();
            return;
        }
        
        // Заполняем информацию о профиле
        this.elements.profileDisplay.innerHTML = `
            <div class="profile-avatar-large" style="background: ${this.userProfile.avatarColor}">
                ${this.userProfile.username.charAt(0).toUpperCase()}
            </div>
            <div class="profile-username-large">${this.userProfile.username}</div>
            <div class="profile-email">Зарегистрирован: ${new Date(this.userProfile.registeredAt).toLocaleDateString('ru-RU')}</div>
        `;
        
        this.elements.profileModal.style.display = 'flex';
        this.closeMenu();
    }

    hideProfileModal() {
        this.elements.profileModal.style.display = 'none';
    }

    updateProfileUI() {
        if (!this.userProfile) {
            this.elements.profilePlaceholder.innerHTML = `
                <i class="fas fa-user-circle"></i>
                <span>Профиль</span>
            `;
        } else {
            this.elements.profilePlaceholder.innerHTML = `
                <div class="profile-avatar-small" style="background: ${this.userProfile.avatarColor}">
                    ${this.userProfile.username.charAt(0).toUpperCase()}
                </div>
                <span>${this.userProfile.username}</span>
            `;
        }
    }

    logout() {
        if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
            this.userProfile = null;
            localStorage.removeItem('edm_ai_profile');
            this.updateProfileUI();
            this.hideProfileModal();
            this.showNotification('Вы вышли из аккаунта', 'info');
        }
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
            
            this.showNotification('Текст скопирован в буфер обмена', 'success');
        }).catch(err => {
            console.error('Ошибка копирования:', err);
            this.showNotification('Не удалось скопировать текст', 'error');
        });
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

    startVoiceRecognition() {
        if (!this.recognition) {
            this.showNotification('Голосовой ввод не поддерживается в вашем браузере', 'error');
            return;
        }
        
        // Запрос разрешения
        if (typeof navigator.permissions !== 'undefined') {
            navigator.permissions.query({ name: 'microphone' }).then(permissionStatus => {
                if (permissionStatus.state === 'granted') {
                    this.startRecording();
                } else if (permissionStatus.state === 'prompt') {
                    this.startRecording();
                } else {
                    this.showNotification('Разрешите доступ к микрофону в настройках браузера', 'error');
                }
            });
        } else {
            // Для браузеров без Permissions API
            this.startRecording();
        }
    }

    startRecording() {
        try {
            this.finalTranscript = '';
            this.recognition.start();
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            this.showNotification('Не удалось начать запись', 'error');
        }
    }

    stopVoiceRecognition() {
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
            this.isRecording = false;
            this.elements.voiceControlBtn.style.display = 'flex';
            this.elements.stopRecordBtn.style.display = 'none';
            this.elements.stopRecordBtn.classList.remove('recording');
        }
    }

    showSearch() {
        // TODO: Реализовать поиск по сообщениям
        this.showNotification('Функция поиска будет добавлена в следующем обновлении', 'info');
    }

    toggleReasoningMode() {
        this.reasoningMode = !this.reasoningMode;
        this.elements.reasoningBtn.classList.toggle('active', this.reasoningMode);
        
        if (this.reasoningMode) {
            this.showNotification('Режим рассуждения включен', 'success');
        } else {
            this.showNotification('Режим рассуждения выключен', 'info');
        }
    }

    adjustTextareaHeight() {
        const textarea = this.elements.messageInput;
        textarea.style.height = 'auto';
        const maxHeight = 120;
        const newHeight = Math.min(textarea.scrollHeight, maxHeight);
        textarea.style.height = newHeight + 'px';
        textarea.style.overflowY = newHeight >= maxHeight ? 'auto' : 'hidden';
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

    showNotification(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Добавляем стили
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 20px;
            background: ${type === 'success' ? 'var(--success-color)' : 
                         type === 'error' ? 'var(--error-color)' : 
                         type === 'warning' ? 'var(--warning-color)' : 'var(--surface-bg)'};
            color: white;
            border-radius: var(--border-radius-sm);
            z-index: 3000;
            animation: slideInDown 0.3s ease-out;
            max-width: 90%;
            word-wrap: break-word;
            text-align: center;
            box-shadow: var(--shadow-md);
        `;
        
        // Стили для анимации
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInDown {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
            
            @keyframes slideOutUp {
                from {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        // Удаляем через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOutUp 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                if (style.parentNode) {
                    style.parentNode.removeChild(style);
                }
            }, 300);
        }, 3000);
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.app = new EDMAIApp();
});