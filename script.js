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
        this.interimTranscript = '';
        this.hasMicPermission = false;
        
        // Свойства для остановки генерации
        this.isGenerating = false;
        this.generationController = null;
        this.lastPrompt = '';
        this.partialResponse = '';
        this.interruptedMessageId = null;
        
        // Свойства для промптов
        this.customPrompt = '';
        this.communicationStyle = 'normal';
        this.communicationStyles = {
            normal: { name: 'Обычный', icon: 'fa-comment' },
            aggressive: { name: 'Агрессивный', icon: 'fa-fire' },
            funny: { name: 'Весёлый', icon: 'fa-laugh' },
            loving: { name: 'Влюблённый', icon: 'fa-heart' }
        };
        
        // Контекстное меню чатов
        this.contextMenuChatId = null;
        this.touchHoldTimer = null;
        
        // Настройка marked для рендеринга markdown
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                highlight: function(code, lang) {
                    if (lang && hljs && hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(code, { language: lang }).value;
                        } catch (err) {
                            console.warn('Ошибка подсветки кода:', err);
                        }
                    }
                    return hljs ? hljs.highlightAuto(code).value : code;
                },
                breaks: true,
                gfm: true
            });
        }
        
        this.init();
    }

    async init() {
        // Блокировка контекстного меню
        document.addEventListener('contextmenu', (e) => {
            // Разрешаем контекстное меню только в полях ввода
            if (e.target.tagName === 'TEXTAREA' || 
                e.target.tagName === 'INPUT' ||
                e.target.classList.contains('message-text') ||
                e.target.closest('.message-text')) {
                return true;
            }
            e.preventDefault();
            return false;
        });
        
        // Блокировка выделения текста (кроме разрешенных элементов)
        document.addEventListener('selectstart', (e) => {
            if (e.target.tagName === 'TEXTAREA' || 
                e.target.tagName === 'INPUT' ||
                e.target.classList.contains('message-text') ||
                e.target.closest('.message-text') ||
                e.target.classList.contains('copy-btn') ||
                e.target.closest('.copy-btn')) {
                return true;
            }
            e.preventDefault();
            return false;
        });
        
        // Блокировка перетаскивания
        document.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'TEXTAREA' || 
                e.target.tagName === 'INPUT') {
                return true;
            }
            e.preventDefault();
            return false;
        });
        
        // Блокировка стандартных горячих клавиш копирования
        document.addEventListener('keydown', (e) => {
            // Ctrl+C / Cmd+C - только в разрешенных элементах
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                const activeElement = document.activeElement;
                if (!(activeElement.tagName === 'TEXTAREA' || 
                      activeElement.tagName === 'INPUT' ||
                      activeElement.classList.contains('message-text') ||
                      activeElement.closest('.message-text'))) {
                    e.preventDefault();
                }
            }
        });
        
        // Блокировка выделения двойным/тройным кликом
        document.addEventListener('mousedown', (e) => {
            if (e.detail > 1) { // Двойной/тройной клик
                if (!(e.target.tagName === 'TEXTAREA' || 
                      e.target.tagName === 'INPUT' ||
                      e.target.classList.contains('message-text') ||
                      e.target.closest('.message-text'))) {
                    e.preventDefault();
                }
            }
        });
        
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
        
        // Инициализация контекстного меню
        this.initContextMenu();
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
            newChatBtnTop: document.getElementById('new-chat-btn-top'),
            
            // Элементы чата
            messageInput: document.getElementById('message-input'),
            sendBtn: document.getElementById('send-btn'),
            sendIcon: document.getElementById('send-icon'),
            stopIcon: document.getElementById('stop-icon'),
            voiceControlBtn: document.getElementById('voice-control-btn'),
            
            // Список чатов
            chatsList: document.getElementById('chats-list'),
            
            // Профиль в меню
            profilePlaceholder: document.getElementById('profile-placeholder'),
            
            // Модальные окна
            profileSettingsModal: document.getElementById('profile-settings-modal'),
            editProfileModal: document.getElementById('edit-profile-modal'),
            personalizationModal: document.getElementById('personalization-modal'),
            
            // Настройки профиля
            closeProfileSettings: document.getElementById('close-profile-settings'),
            editProfileBtn: document.getElementById('edit-profile-btn'),
            personalizationBtn: document.getElementById('personalization-btn'),
            termsBtn: document.getElementById('terms-btn'),
            supportBtn: document.getElementById('support-btn'),
            
            // Редактирование профиля
            closeEditProfile: document.getElementById('close-edit-profile'),
            editUsernameInput: document.getElementById('edit-username-input'),
            editApiKeyInput: document.getElementById('edit-api-key-input'),
            saveProfileBtn: document.getElementById('save-profile-btn'),
            logoutProfileBtn: document.getElementById('logout-profile-btn'),
            
            // Персонализация
            closePersonalization: document.getElementById('close-personalization'),
            customPromptInput: document.getElementById('custom-prompt-input'),
            
            // Профиль в настройках
            profileSettingsAvatar: document.getElementById('profile-settings-avatar'),
            profileSettingsUsername: document.getElementById('profile-settings-username'),
            profileApiKey: document.getElementById('profile-api-key'),
            
            // Приветственное сообщение
            welcomeMessage: document.getElementById('welcome-message'),
            
            // Контекстное меню
            contextMenu: document.getElementById('chat-context-menu'),
            pinChatBtn: document.getElementById('pin-chat-btn'),
            renameChatBtn: document.getElementById('rename-chat-btn'),
            deleteChatBtn: document.getElementById('delete-chat-btn'),
            
            // Стили промптов
            promptStyleBtns: document.querySelectorAll('.prompt-style-btn')
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
        
        // Enter для новой строки, Shift+Enter для отправки
        this.elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                // Enter без Shift ничего не делает (новая строка через Shift+Enter)
            }
        });
        
        // Авторазмер текстового поля
        this.elements.messageInput.addEventListener('input', () => {
            this.adjustTextareaHeight();
        });
        
        // Новые чаты
        this.elements.newChatBtnTop.addEventListener('click', () => this.createNewChat());
        
        // Профиль в меню
        this.elements.profilePlaceholder.addEventListener('click', () => this.showProfileSettingsModal());
        
        // Настройки профиля
        this.elements.editProfileBtn.addEventListener('click', () => this.showEditProfileModal());
        this.elements.personalizationBtn.addEventListener('click', () => this.showPersonalizationModal());
        this.elements.closeProfileSettings.addEventListener('click', () => this.hideProfileSettingsModal());
        
        // Кнопки пользовательского соглашения и техподдержки
        this.elements.termsBtn.addEventListener('click', () => {
            window.open('https://telegra.ph/POLZOVATELSKOE-SOGLASHENIE-po-ispolzovaniyu-programm-11-06', '_blank');
            this.hideProfileSettingsModal();
        });
        
        this.elements.supportBtn.addEventListener('click', () => {
            window.open('https://t.me/EDEM_CR', '_blank');
            this.hideProfileSettingsModal();
        });
        
        // Редактирование профиля
        this.elements.closeEditProfile.addEventListener('click', () => this.hideEditProfileModal());
        this.elements.saveProfileBtn.addEventListener('click', () => this.saveProfile());
        this.elements.logoutProfileBtn.addEventListener('click', () => this.logout());
        
        // Персонализация
        this.elements.closePersonalization.addEventListener('click', () => this.hidePersonalizationModal());
        this.elements.customPromptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.saveCustomPrompt();
            }
        });
        
        // Голосовой ввод
        this.elements.voiceControlBtn.addEventListener('click', () => this.startVoiceRecognition());
        
        // Стили промптов
        this.elements.promptStyleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const style = btn.dataset.style;
                this.setCommunicationStyle(style);
            });
        });
        
        // Контекстное меню
        this.elements.pinChatBtn.addEventListener('click', () => this.togglePinChat());
        this.elements.renameChatBtn.addEventListener('click', () => this.renameChat());
        this.elements.deleteChatBtn.addEventListener('click', () => this.deleteChat());
        
        // Закрытие модальных окон при клике вне их
        [this.elements.profileSettingsModal, this.elements.editProfileModal, this.elements.personalizationModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    if (modal.id === 'profile-settings-modal') this.hideProfileSettingsModal();
                    if (modal.id === 'edit-profile-modal') this.hideEditProfileModal();
                    if (modal.id === 'personalization-modal') this.hidePersonalizationModal();
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
                if (this.elements.profileSettingsModal.style.display === 'flex') {
                    this.hideProfileSettingsModal();
                }
                if (this.elements.editProfileModal.style.display === 'flex') {
                    this.hideEditProfileModal();
                }
                if (this.elements.personalizationModal.style.display === 'flex') {
                    this.hidePersonalizationModal();
                }
                if (this.isGenerating) {
                    this.stopGeneration();
                }
                this.hideContextMenu();
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
            this.recognition.continuous = false; // Используем старый подход
            this.recognition.interimResults = true;
            this.recognition.lang = 'ru-RU';
            this.recognition.maxAlternatives = 1;
            
            this.recognition.onstart = () => {
                this.isRecording = true;
                this.elements.voiceControlBtn.classList.add('recording');
                this.elements.voiceControlBtn.innerHTML = '<i class="fas fa-stop"></i>';
                this.finalTranscript = '';
                this.interimTranscript = '';
                this.showNotification('Говорите...', 'info');
            };
            
            this.recognition.onresult = (event) => {
                let interim = '';
                
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        this.finalTranscript += event.results[i][0].transcript;
                    } else {
                        interim += event.results[i][0].transcript;
                    }
                }
                
                if (interim) {
                    this.interimTranscript = interim;
                    this.elements.messageInput.value = this.finalTranscript + interim;
                    this.adjustTextareaHeight();
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                if (event.error === 'not-allowed') {
                    this.hasMicPermission = false;
                }
                this.stopVoiceRecognition();
                this.showNotification('Ошибка распознавания речи', 'error');
            };
            
            this.recognition.onend = () => {
                this.stopVoiceRecognition();
                if (this.finalTranscript) {
                    this.elements.messageInput.value = this.finalTranscript;
                    this.adjustTextareaHeight();
                    this.elements.messageInput.focus();
                    this.showNotification('Речь распознана', 'success');
                }
            };
        } else {
            console.warn('Speech recognition not supported');
            this.elements.voiceControlBtn.style.display = 'none';
        }
    }

    initContextMenu() {
        // Долгое нажатие на чат - уменьшена задержка до 400ms
        document.addEventListener('touchstart', (e) => {
            const chatItem = e.target.closest('.chat-item');
            if (chatItem) {
                this.contextMenuChatId = chatItem.dataset.chatId;
                this.touchHoldTimer = setTimeout(() => {
                    this.showContextMenu(e, chatItem);
                }, 400); // Уменьшено до 400ms
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (this.touchHoldTimer) {
                clearTimeout(this.touchHoldTimer);
                this.touchHoldTimer = null;
            }
        });
        
        document.addEventListener('touchmove', () => {
            if (this.touchHoldTimer) {
                clearTimeout(this.touchHoldTimer);
                this.touchHoldTimer = null;
            }
        });
        
        // Клик вне контекстного меню
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.context-menu') && !e.target.closest('.chat-item')) {
                this.hideContextMenu();
            }
        });
        
        document.addEventListener('touchstart', (e) => {
            if (!e.target.closest('.context-menu') && !e.target.closest('.chat-item')) {
                this.hideContextMenu();
            }
        }, { passive: true });
    }

    showContextMenu(e, chatItem) {
        e.preventDefault();
        
        const rect = chatItem.getBoundingClientRect();
        this.elements.contextMenu.style.display = 'flex';
        this.elements.contextMenu.style.top = rect.top + 'px';
        this.elements.contextMenu.style.left = Math.min(rect.left, window.innerWidth - 200) + 'px';
        
        // Обновляем состояние кнопки закрепления
        const chat = this.chats[this.contextMenuChatId];
        const pinIcon = this.elements.pinChatBtn.querySelector('i');
        if (chat.pinned) {
            this.elements.pinChatBtn.innerHTML = '<i class="fas fa-thumbtack"></i> Открепить';
        } else {
            this.elements.pinChatBtn.innerHTML = '<i class="fas fa-thumbtack"></i> Закрепить';
        }
    }

    hideContextMenu() {
        this.elements.contextMenu.style.display = 'none';
        this.contextMenuChatId = null;
    }

    togglePinChat() {
        if (!this.contextMenuChatId) return;
        
        const chat = this.chats[this.contextMenuChatId];
        chat.pinned = !chat.pinned;
        this.saveData();
        this.updateChatsList();
        this.hideContextMenu();
        
        this.showNotification(chat.pinned ? 'Чат закреплен' : 'Чат откреплен', 'success');
    }

    renameChat() {
        if (!this.contextMenuChatId) return;
        
        const chat = this.chats[this.contextMenuChatId];
        const newName = prompt('Введите новое название чата:', chat.name);
        
        if (newName && newName.trim() && newName !== chat.name) {
            chat.name = newName.trim();
            this.saveData();
            this.updateChatsList();
            this.showNotification('Чат переименован', 'success');
        }
        
        this.hideContextMenu();
    }

    deleteChat() {
        if (!this.contextMenuChatId) return;
        
        if (confirm('Вы уверены, что хотите удалить этот чат?')) {
            delete this.chats[this.contextMenuChatId];
            
            // Если удаляем текущий чат, переключаемся на другой
            if (this.currentChatId === this.contextMenuChatId) {
                const chatIds = Object.keys(this.chats);
                if (chatIds.length > 0) {
                    this.currentChatId = chatIds[0];
                } else {
                    this.currentChatId = 'default';
                    this.chats[this.currentChatId] = {
                        id: this.currentChatId,
                        name: 'Новый чат',
                        created: new Date().toISOString(),
                        messages: []
                    };
                }
            }
            
            this.saveData();
            this.loadCurrentChat();
            this.showNotification('Чат удален', 'success');
        }
        
        this.hideContextMenu();
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
        
        // Загрузка кастомного промпта
        this.customPrompt = localStorage.getItem('edm_ai_custom_prompt') || '';
        
        // Загрузка стиля общения
        this.communicationStyle = localStorage.getItem('edm_ai_communication_style') || 'normal';
        
        // Загрузка разрешения микрофона
        this.hasMicPermission = localStorage.getItem('edm_ai_mic_permission') === 'true';
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
        localStorage.setItem('edm_ai_custom_prompt', this.customPrompt);
        localStorage.setItem('edm_ai_communication_style', this.communicationStyle);
        localStorage.setItem('edm_ai_mic_permission', this.hasMicPermission.toString());
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
        
        // Удаляем все кнопки продолжения из предыдущих сообщений
        this.removeAllContinueButtons();
        this.interruptedMessageId = null;
        
        // Проверяем регистрацию
        if (!this.userProfile) {
            this.addMessageToUI('Пожалуйста, создайте профиль для использования нейросети', 'ai');
            this.showEditProfileModal();
            return;
        }
        
        // Проверяем API ключ
        if (!this.apiKey) {
            this.addMessageToUI('Пожалуйста, настройте API ключ в настройках', 'ai');
            this.showPersonalizationModal();
            return;
        }
        
        // Сохраняем промпт для возможного продолжения
        this.lastPrompt = message;
        this.partialResponse = '';
        
        // Очищаем поле ввода
        this.elements.messageInput.value = '';
        this.adjustTextareaHeight();
        
        // Показываем сообщение пользователя
        this.addMessageToUI(message, 'user');
        
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
                const currentMessageEl = document.querySelector(`[data-id="${loadingId}"]`);
                if (currentMessageEl) {
                    this.interruptedMessageId = loadingId;
                    currentMessageEl.classList.add('interrupted');
                    
                    // Заменяем индикатор загрузки на кнопку продолжения
                    const typingIndicator = currentMessageEl.querySelector('.typing-indicator');
                    if (typingIndicator) {
                        typingIndicator.innerHTML = `
                            <div class="typing-dots" style="opacity: 0.5;">
                                <div class="typing-dot"></div>
                                <div class="typing-dot"></div>
                                <div class="typing-dot"></div>
                            </div>
                            <div class="typing-text">Генерация прервана</div>
                            <button class="continue-generation-btn-inline" data-message-id="${loadingId}">
                                <i class="fas fa-play"></i> Продолжить
                            </button>
                        `;
                        
                        // Добавляем обработчик для кнопки продолжения
                        const continueBtn = typingIndicator.querySelector('.continue-generation-btn-inline');
                        if (continueBtn) {
                            continueBtn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                this.continueGeneration(continueBtn.dataset.messageId);
                            });
                        }
                    }
                }
            } else {
                // Другая ошибка
                console.error('Ошибка при отправке сообщения:', error);
                this.addMessageToUI(`Ошибка: ${error.message}`, 'ai');
            }
        }
    }

    removeAllContinueButtons() {
        // Удаляем все кнопки продолжения
        document.querySelectorAll('.continue-generation-btn-inline').forEach(btn => {
            btn.remove();
        });
        
        // Убираем класс interrupted
        document.querySelectorAll('.message.interrupted').forEach(msg => {
            msg.classList.remove('interrupted');
        });
        
        // Убираем старые индикаторы "Генерация прервана"
        document.querySelectorAll('.typing-indicator').forEach(indicator => {
            const text = indicator.querySelector('.typing-text');
            if (text && text.textContent.includes('прервана')) {
                indicator.remove();
            }
        });
    }

    stopGeneration() {
        if (this.isGenerating && this.generationController) {
            // Прерываем запрос
            this.generationController.abort();
            
            // Сбрасываем флаг генерации
            this.isGenerating = false;
            this.updateSendButtonState();
            
            // Находим текущий индикатор загрузки
            const loadingElements = document.querySelectorAll('.typing-indicator');
            if (loadingElements.length > 0) {
                const loadingElement = loadingElements[loadingElements.length - 1];
                if (loadingElement && loadingElement.closest('.message')) {
                    const messageEl = loadingElement.closest('.message');
                    const messageId = messageEl.dataset.id || 'interrupted_' + Date.now();
                    
                    // Сохраняем ID прерванного сообщения
                    this.interruptedMessageId = messageId;
                    
                    // Добавляем класс прерванного сообщения
                    messageEl.classList.add('interrupted');
                    
                    // Заменяем индикатор загрузки на кнопку продолжения
                    const typingIndicator = messageEl.querySelector('.typing-indicator');
                    if (typingIndicator) {
                        typingIndicator.innerHTML = `
                            <div class="typing-dots" style="opacity: 0.5;">
                                <div class="typing-dot"></div>
                                <div class="typing-dot"></div>
                                <div class="typing-dot"></div>
                            </div>
                            <div class="typing-text">Генерация прервана</div>
                            <button class="continue-generation-btn-inline" data-message-id="${messageId}">
                                <i class="fas fa-play"></i> Продолжить
                            </button>
                        `;
                        
                        // Добавляем обработчик для кнопки продолжения
                        const continueBtn = typingIndicator.querySelector('.continue-generation-btn-inline');
                        if (continueBtn) {
                            continueBtn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                this.continueGeneration(continueBtn.dataset.messageId);
                            });
                        }
                    }
                }
            }
            
            this.showNotification('Генерация остановлена', 'info');
        }
    }

    continueGeneration(messageId = null) {
        if (!this.lastPrompt) return;
        
        // Если не указан ID, используем сохраненный
        const targetMessageId = messageId || this.interruptedMessageId;
        if (!targetMessageId) return;
        
        // Удаляем кнопку продолжения из сообщения
        const messageEl = document.querySelector(`[data-id="${targetMessageId}"]`);
        if (messageEl) {
            const continueBtn = messageEl.querySelector('.continue-generation-btn-inline');
            if (continueBtn) continueBtn.remove();
            messageEl.classList.remove('interrupted');
        }
        
        // Убираем старый индикатор
        const oldIndicator = document.querySelector(`[data-id="${targetMessageId}"] .typing-indicator`);
        if (oldIndicator) oldIndicator.remove();
        
        // Показываем новый индикатор загрузки в ТОМ ЖЕ сообщении
        const newLoadingId = 'loading_' + Date.now();
        const loadingEl = this.showTypingIndicator(newLoadingId, targetMessageId);
        
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
                
                // Находим сообщение с индикатором
                const targetMessage = document.querySelector(`[data-id="${targetMessageId}"]`);
                if (targetMessage) {
                    // Удаляем индикатор из сообщения
                    const indicator = targetMessage.querySelector('.typing-indicator');
                    if (indicator) indicator.remove();
                    
                    // Создаем новый элемент с ответом
                    const newMessageEl = this.addMessageToUI(response, 'ai');
                    newMessageEl.dataset.id = targetMessageId;
                    
                    // Удаляем старое прерванное сообщение
                    targetMessage.remove();
                } else {
                    // Если не нашли, просто добавляем новый ответ
                    this.addMessageToUI(response, 'ai');
                }
                
                // Сбрасываем ID прерванного сообщения
                this.interruptedMessageId = null;
            })
            .catch(error => {
                // Убираем индикатор загрузки
                this.hideTypingIndicator(newLoadingId);
                
                // Сбрасываем флаг генерации
                this.isGenerating = false;
                this.updateSendButtonState();
                
                if (error.name === 'AbortError') {
                    // Генерация снова была остановлена
                    const currentMessageEl = document.querySelector(`[data-id="${targetMessageId}"]`);
                    if (currentMessageEl) {
                        currentMessageEl.classList.add('interrupted');
                        
                        // Добавляем кнопку продолжения
                        const typingIndicator = currentMessageEl.querySelector('.typing-indicator');
                        if (typingIndicator) {
                            typingIndicator.innerHTML = `
                                <div class="typing-dots" style="opacity: 0.5;">
                                    <div class="typing-dot"></div>
                                    <div class="typing-dot"></div>
                                    <div class="typing-dot"></div>
                                </div>
                                <div class="typing-text">Генерация прервана</div>
                                <button class="continue-generation-btn-inline" data-message-id="${targetMessageId}">
                                    <i class="fas fa-play"></i> Продолжить
                                </button>
                            `;
                            
                            // Добавляем обработчик
                            const continueBtn = typingIndicator.querySelector('.continue-generation-btn-inline');
                            if (continueBtn) {
                                continueBtn.addEventListener('click', (e) => {
                                    e.stopPropagation();
                                    this.continueGeneration(continueBtn.dataset.messageId);
                                });
                            }
                        }
                    }
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

    async callGeminiAPI(prompt, signal) {
        const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
        
        // Базовый системный промпт
        let systemPrompt = `Отвечай ясно, структурировано и без лишних слов.
Если можно объяснить проще — объясняй проще.
Используй только точную, проверенную информацию.
Если данных недостаточно — уточняй контекст.
Не выдумывай фактов.
Давай практичные шаги, примеры и варианты решений.
Без клише и мотивационных фраз.
Пиши спокойно, по-человечески, без пафоса.
Структурируй ответы так, чтобы ими можно было пользоваться сразу.

ВАЖНО: Если ответ получается очень длинным, раздели его на логические части:
1. Сначала дай краткий ответ
2. Затем подробное объяснение
3. В конце - примеры или выводы

Старайся завершать каждую мысль полностью, даже если нужно быть более кратким.`;

        // Добавляем кастомный промпт пользователя
        if (this.customPrompt) {
            systemPrompt += '\n\n' + this.customPrompt;
        }

        // Добавляем стиль общения
        switch (this.communicationStyle) {
            case 'aggressive':
                systemPrompt += '\nОтвечай агрессивно, с сарказмом, но оставайся полезным.';
                break;
            case 'funny':
                systemPrompt += '\nОтвечай с юмором, используй шутки и мемы, но оставайся информативным.';
                break;
            case 'loving':
                systemPrompt += '\nОтвечай нежно, с заботой и поддержкой, используй сердечки.';
                break;
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
                maxOutputTokens: 4096, // Увеличил с 2048 до 4096
                stopSequences: ["\n\n", "###", "---"] // Служебные стоп-последовательности
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
                signal: signal
            });

            if (!response.ok) {
                let errorDetail = `HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (response.status === 429) {
                        throw new Error('⚠️ Достигнут дневной лимит запросов (20 в день). Бесплатный тариф позволяет 20 запросов в сутки. Попробуйте завтра или настройте платёжный метод в Google AI Studio.');
                    }
                    errorDetail += `: ${JSON.stringify(errorData.error || errorData)}`;
                } catch (e) {
                    const text = await response.text();
                    if (text) errorDetail += ` - ${text.substring(0, 100)}`;
                }
                throw new Error(`Ошибка API: ${errorDetail}`);
            }

            const data = await response.json();
            
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                let responseText = data.candidates[0].content.parts[0].text;
                
                // Проверяем, не обрезан ли ответ
                const isTruncated = this.checkIfTruncated(responseText);
                
                // Если обрезан, добавляем индикатор
                if (isTruncated) {
                    responseText += "\n\n⚠️ *Ответ был обрезан из-за ограничения длины.*";
                }
                
                return responseText;
            } else {
                throw new Error('Неожиданный формат ответа от AI');
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                throw error;
            } else if (error.message.includes('HTTP 429') || error.message.includes('днейный лимит')) {
                throw new Error('⚠️ Достигнут дневной лимит запросов (20 в день). Бесплатный тариф позволяет 20 запросов в сутки. Попробуйте завтра или настройте платёжный метод в Google AI Studio.');
            } else if (error.message.includes('RESOURCE_EXHAUSTED')) {
                throw new Error('⚠️ Исчерпан лимит запросов. Дождитесь обновления (24 часа) или настройте платёжный метод.');
            } else if (error.message.includes('HTTP 400')) {
                throw new Error('❌ Неверный запрос. Проверьте API ключ.');
            } else if (error.message.includes('HTTP 401') || error.message.includes('HTTP 403')) {
                throw new Error('🔑 Неверный или отсутствующий API ключ. Проверьте настройки.');
            } else if (error.message.includes('HTTP 500')) {
                throw new Error('⚙️ Ошибка сервера Google. Попробуйте позже.');
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('🌐 Нет подключения к интернету.');
            } else {
                // Упрощаем сообщение об ошибке
                const simpleError = error.message.split(':')[0];
                throw new Error(`Ошибка: ${simpleError}`);
            }
        }
    }

    checkIfTruncated(text) {
        // Проверяем признаки обрезанного текста:
        // 1. Последнее предложение без точки/знака завершения
        const lastChar = text.trim().slice(-1);
        const endingChars = ['.', '!', '?', ':', ';', ')', ']', '}'];
        
        if (!endingChars.includes(lastChar) && text.length > 100) {
            return true;
        }
        
        // 2. Обрыв в середине слова
        const words = text.trim().split(' ');
        const lastWord = words[words.length - 1];
        if (lastWord.length < 3 && text.length > 500) {
            return true;
        }
        
        // 3. Проверяем, нет ли внезапного обрыва
        const lines = text.split('\n');
        const lastLine = lines[lines.length - 1];
        if (lastLine.length > 0 && lastLine.length < 20 && text.length > 1000) {
            return true;
        }
        
        return false;
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
            // Рендеринг markdown с безопасностью
            const rawMarkdown = text;
            let safeHtml;
            try {
                if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
                    const rawHtml = marked.parse(rawMarkdown);
                    safeHtml = DOMPurify.sanitize(rawHtml, {
                        ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div'],
                        ALLOWED_ATTR: ['class', 'style']
                    });
                } else {
                    safeHtml = this.escapeHtml(text);
                }
            } catch (error) {
                console.error('Ошибка рендеринга markdown:', error);
                safeHtml = this.escapeHtml(text);
            }
            
            messageEl.innerHTML = `
                <div class="message-avatar">
                    <div class="ai-avatar">
                        <img src="https://sun9-63.userapi.com/s/v1/ig2/xFXQy8Z-tBdqm3_0VIyRQC-Rqn4SD5p21syKAfSfgzERB0LJZ_4Ca43TxJKtnKDqr4hR1GtDuW2FsGgsgXBs6DqA.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080&from=bu&u=z9seQ0Q9GKcv-_BeLg7iZPuwEks6UMnZ7DyVf39C2OM&cs=640x0" alt="EDM AI" class="company-logo">
                    </div>
                </div>
                <div class="message-content">
                    <div class="message-bubble">
                        <div class="message-text">${safeHtml}</div>
                        <div class="message-actions">
                            <button class="msg-action-btn copy-btn" title="Скопировать" data-message-id="${messageId || Date.now()}">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="msg-action-btn regenerate-btn" title="Сгенерировать заново" data-message-id="${messageId || Date.now()}">
                                <i class="fas fa-redo"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // Добавляем обработчики для кнопок
            const copyBtn = messageEl.querySelector('.copy-btn');
            const regenerateBtn = messageEl.querySelector('.regenerate-btn');
            
            if (copyBtn) {
                copyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.copyMessage(copyBtn.dataset.messageId);
                });
            }
            
            if (regenerateBtn) {
                regenerateBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.regenerateMessage(regenerateBtn.dataset.messageId);
                });
            }
            
        } else if (type === 'user') {
            const avatarColor = this.userProfile ? 
                this.generateAvatarColor(this.userProfile.username) : 
                'linear-gradient(135deg, #3b82f6, #1d4ed8)';
            const avatarText = this.userProfile ? 
                this.userProfile.username.charAt(0).toUpperCase() : 'В';
            
            // Аватар пользователя справа
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

    showTypingIndicator(id, attachToMessageId = null) {
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
        
        // Если нужно прикрепить к существующему сообщению
        if (attachToMessageId) {
            const existingMessage = document.querySelector(`[data-id="${attachToMessageId}"]`);
            if (existingMessage) {
                const messageContent = existingMessage.querySelector('.message-content');
                if (messageContent) {
                    const oldIndicator = messageContent.querySelector('.typing-indicator');
                    if (oldIndicator) oldIndicator.remove();
                    messageContent.appendChild(typingEl.querySelector('.typing-indicator'));
                }
                return existingMessage;
            }
        }
        
        // Иначе добавляем новое сообщение
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

    copyMessage(messageId) {
        // Разрешаем копирование только через кнопки
        const messageElement = document.querySelector(`[data-id="${messageId}"]`);
        if (!messageElement) return;
        
        // Проверяем, что это AI сообщение
        if (!messageElement.classList.contains('ai-message')) {
            console.warn('Копирование разрешено только для AI сообщений');
            return;
        }
        
        const messageText = messageElement.querySelector('.message-text');
        if (!messageText) return;
        
        // Временно разрешаем выделение
        const originalUserSelect = messageText.style.userSelect;
        messageText.style.userSelect = 'text';
        
        const textToCopy = messageText.textContent || messageText.innerText;
        
        // Создаем временный textarea для копирования
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, 99999);
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
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
                
                this.showNotification('✅ Текст скопирован в буфер обмена', 'success');
            } else {
                this.showNotification('❌ Не удалось скопировать текст', 'error');
            }
        } catch (err) {
            console.error('Ошибка копирования:', err);
            this.showNotification('❌ Не удалось скопировать текст', 'error');
        } finally {
            document.body.removeChild(textarea);
            // Восстанавливаем блокировку
            messageText.style.userSelect = originalUserSelect;
        }
    }

    regenerateMessage(messageId) {
        // Находим сообщение
        const chat = this.chats[this.currentChatId];
        if (!chat) return;
        
        const messageIndex = chat.messages.findIndex(msg => msg.id === messageId);
        if (messageIndex === -1) return;
        
        // Находим последнее сообщение пользователя перед этим ответом
        let userMessageIndex = -1;
        for (let i = messageIndex; i >= 0; i--) {
            if (chat.messages[i].type === 'user') {
                userMessageIndex = i;
                break;
            }
        }
        
        if (userMessageIndex === -1) return;
        
        const userMessage = chat.messages[userMessageIndex].text;
        
        // Удаляем старый ответ AI и все последующие сообщения
        chat.messages.splice(userMessageIndex + 1);
        this.saveData();
        
        // Перезагружаем чат
        this.loadCurrentChat();
        
        // Отправляем запрос заново
        this.elements.messageInput.value = userMessage;
        this.sendMessage();
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
        
        // Сортируем чаты: сначала закрепленные, затем по дате
        const sortedChats = Object.values(this.chats).sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.created) - new Date(a.created);
        });
        
        sortedChats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${chat.id === this.currentChatId ? 'active' : ''} ${chat.pinned ? 'pinned' : ''}`;
            chatItem.dataset.chatId = chat.id;
            
            // Получаем последнее сообщение для превью
            const lastMessage = chat.messages.length > 0 ? 
                chat.messages[chat.messages.length - 1].text : 'Нет сообщений';
            
            const preview = lastMessage.length > 40 ? 
                lastMessage.substring(0, 37) + '...' : lastMessage;
            
            // Создаем аватар на основе названия чата
            const avatarColor = this.generateAvatarColor(chat.name);
            const avatarText = chat.name.charAt(0).toUpperCase();
            
            chatItem.innerHTML = `
                <div class="chat-avatar" style="background: ${avatarColor}">
                    ${avatarText}
                </div>
                <div class="chat-info">
                    <div class="chat-name">${this.escapeHtml(chat.name)}</div>
                    <div class="chat-preview">${this.escapeHtml(preview)}</div>
                </div>
            `;
            
            chatItem.addEventListener('click', (e) => {
                if (!this.touchHoldTimer) {
                    this.switchChat(chat.id);
                    this.closeMenu();
                }
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

    checkAuth() {
        if (!this.userProfile) {
            setTimeout(() => {
                this.showEditProfileModal();
            }, 1000);
        }
    }

    showProfileSettingsModal() {
        if (!this.userProfile) {
            this.showEditProfileModal();
            return;
        }
        
        // Заполняем информацию о профиле
        const avatarColor = this.generateAvatarColor(this.userProfile.username);
        this.elements.profileSettingsAvatar.style.background = avatarColor;
        this.elements.profileSettingsAvatar.textContent = this.userProfile.username.charAt(0).toUpperCase();
        this.elements.profileSettingsUsername.textContent = this.userProfile.username;
        
        // Показываем сокращенный API ключ
        if (this.apiKey) {
            const maskedKey = '••••••••••••' + this.apiKey.slice(-4);
            this.elements.profileApiKey.textContent = `API ключ: ${maskedKey}`;
        } else {
            this.elements.profileApiKey.textContent = 'API ключ: не установлен';
        }
        
        // Обновляем активный стиль промпта
        this.updatePromptStyleButtons();
        
        this.elements.profileSettingsModal.style.display = 'flex';
    }

    hideProfileSettingsModal() {
        this.elements.profileSettingsModal.style.display = 'none';
    }

    showEditProfileModal() {
        if (this.userProfile) {
            this.elements.editUsernameInput.value = this.userProfile.username;
        } else {
            this.elements.editUsernameInput.value = '';
        }
        
        if (this.apiKey) {
            this.elements.editApiKeyInput.value = '••••••••••••' + this.apiKey.slice(-4);
        } else {
            this.elements.editApiKeyInput.value = '';
        }
        
        this.elements.editProfileModal.style.display = 'flex';
    }

    hideEditProfileModal() {
        this.elements.editProfileModal.style.display = 'none';
    }

    saveProfile() {
        const username = this.elements.editUsernameInput.value.trim();
        const apiKey = this.elements.editApiKeyInput.value.trim();
        
        if (!username || username.length < 3) {
            this.showNotification('Имя пользователя должно содержать минимум 3 символа', 'error');
            return;
        }
        
        // Если ключ замаскирован, не меняем его
        if (!apiKey.includes('••••')) {
            this.apiKey = apiKey;
        }
        
        // Сохраняем профиль
        if (!this.userProfile) {
            this.userProfile = {
                username,
                registeredAt: new Date().toISOString(),
                avatarColor: this.generateRandomColor()
            };
        } else {
            this.userProfile.username = username;
        }
        
        this.saveData();
        this.updateProfileUI();
        this.hideEditProfileModal();
        
        if (this.elements.profileSettingsModal.style.display === 'flex') {
            this.hideProfileSettingsModal();
            setTimeout(() => this.showProfileSettingsModal(), 100);
        }
        
        this.showNotification('Профиль успешно сохранен', 'success');
    }

    showPersonalizationModal() {
        this.elements.customPromptInput.value = this.customPrompt;
        this.updatePromptStyleButtons();
        
        this.elements.personalizationModal.style.display = 'flex';
    }

    hidePersonalizationModal() {
        this.elements.personalizationModal.style.display = 'none';
    }

    saveCustomPrompt() {
        const prompt = this.elements.customPromptInput.value.trim();
        this.customPrompt = prompt;
        localStorage.setItem('edm_ai_custom_prompt', prompt);
        this.showNotification('Промпт сохранен', 'success');
    }

    setCommunicationStyle(style) {
        this.communicationStyle = style;
        localStorage.setItem('edm_ai_communication_style', style);
        this.updatePromptStyleButtons();
        this.showNotification(`Стиль общения: ${this.communicationStyles[style].name}`, 'success');
    }

    updatePromptStyleButtons() {
        this.elements.promptStyleBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.style === this.communicationStyle) {
                btn.classList.add('active');
            }
        });
    }

    updateProfileUI() {
        if (!this.elements.profilePlaceholder) return;
        
        if (!this.userProfile) {
            this.elements.profilePlaceholder.innerHTML = `
                <i class="fas fa-user-circle" style="font-size: 24px; color: var(--secondary-text);"></i>
                <span style="font-weight: 500; font-size: 14px;">Профиль</span>
            `;
        } else {
            const avatarColor = this.generateAvatarColor(this.userProfile.username);
            this.elements.profilePlaceholder.innerHTML = `
                <div class="profile-avatar-small" style="background: ${avatarColor};">
                    ${this.userProfile.username.charAt(0).toUpperCase()}
                </div>
                <span style="font-weight: 500; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">
                    ${this.userProfile.username}
                </span>
            `;
        }
    }

    logout() {
        if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
            this.userProfile = null;
            localStorage.removeItem('edm_ai_profile');
            this.updateProfileUI();
            this.hideEditProfileModal();
            this.showNotification('Вы вышли из аккаунта', 'info');
        }
    }

    startVoiceRecognition() {
        if (!this.recognition) {
            this.showNotification('Голосовой ввод не поддерживается в вашем браузере', 'error');
            return;
        }
        
        // Если уже идет запись, останавливаем
        if (this.isRecording) {
            this.stopVoiceRecognition();
            return;
        }
        
        // Проверяем сохраненное разрешение
        if (this.hasMicPermission) {
            this.startRecording();
        } else {
            // Запрашиваем разрешение один раз
            if (typeof navigator.permissions !== 'undefined') {
                navigator.permissions.query({ name: 'microphone' }).then(permissionStatus => {
                    if (permissionStatus.state === 'granted') {
                        this.hasMicPermission = true;
                        this.saveData();
                        this.startRecording();
                    } else if (permissionStatus.state === 'prompt') {
                        // Прямой запрос доступа к микрофону
                        navigator.mediaDevices.getUserMedia({ audio: true })
                            .then(() => {
                                this.hasMicPermission = true;
                                this.saveData();
                                this.startRecording();
                            })
                            .catch(() => {
                                this.showNotification('Доступ к микрофону запрещен', 'error');
                            });
                    } else {
                        this.showNotification('Разрешите доступ к микрофону в настройках браузера', 'error');
                    }
                });
            } else {
                // Для браузеров без Permissions API
                this.startRecording();
            }
        }
    }

    startRecording() {
        try {
            this.finalTranscript = '';
            this.interimTranscript = '';
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
            this.elements.voiceControlBtn.classList.remove('recording');
            this.elements.voiceControlBtn.innerHTML = '<i class="fas fa-microphone"></i>';
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
            if (this.elements.messagesContainer) {
                this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
            }
        }, 100);
    }

    generateAvatarColor(str) {
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
        // Удаляем предыдущие уведомления
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });
        
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Удаляем через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    applySettings() {
        // Применяем тему (всегда темная)
        document.documentElement.style.setProperty('--primary-bg', '#0a0a0a');
        document.documentElement.style.setProperty('--secondary-bg', '#141414');
        document.documentElement.style.setProperty('--primary-text', '#ffffff');
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.app = new EDMAIApp();
});