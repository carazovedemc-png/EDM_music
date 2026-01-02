class EDMAIApp {
    constructor() {
        this.apiKey = null;
        this.currentChatId = 'default';
        this.chats = {};
        this.userProfile = null;
        this.isMenuOpen = false;
        this.isRecording = false;
        this.recognition = null;
        this.finalTranscript = '';
        this.interimTranscript = '';
        this.hasMicPermission = false;
        this.isGenerating = false;
        this.generationController = null;
        this.lastPrompt = '';
        this.partialResponse = '';
        this.interruptedMessageId = null;
        this.customPrompt = '';
        this.communicationStyle = 'normal';
        this.communicationStyles = {
            normal: { name: 'Обычный', icon: 'fa-comment' },
            aggressive: { name: 'Агрессивный', icon: 'fa-fire' },
            funny: { name: 'Весёлый', icon: 'fa-laugh' },
            loving: { name: 'Влюблённый', icon: 'fa-heart' }
        };
        this.contextMenuChatId = null;
        this.touchHoldTimer = null;
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
        document.addEventListener('contextmenu', (e) => {
            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT' || e.target.classList.contains('message-text') || e.target.closest('.message-text')) {
                return true;
            }
            e.preventDefault();
            return false;
        });
        document.addEventListener('selectstart', (e) => {
            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT' || e.target.classList.contains('message-text') || e.target.closest('.message-text') || e.target.classList.contains('copy-btn') || e.target.closest('.copy-btn')) {
                return true;
            }
            e.preventDefault();
            return false;
        });
        document.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
                return true;
            }
            e.preventDefault();
            return false;
        });
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                const activeElement = document.activeElement;
                if (!(activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT' || activeElement.classList.contains('message-text') || activeElement.closest('.message-text'))) {
                    e.preventDefault();
                }
            }
        });
        document.addEventListener('mousedown', (e) => {
            if (e.detail > 1) {
                if (!(e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT' || e.target.classList.contains('message-text') || e.target.closest('.message-text'))) {
                    e.preventDefault();
                }
            }
        });
        if (window.Telegram && window.Telegram.WebApp) {
            this.tg = window.Telegram.WebApp;
            this.tg.expand();
            this.tg.enableClosingConfirmation();
            this.tg.setHeaderColor('#141414');
            this.tg.setBackgroundColor('#0a0a0a');
        }
        this.loadData();
        this.initUI();
        this.loadCurrentChat();
        this.checkAuth();
        this.initHotkeys();
        this.initSpeechRecognition();
        this.initContextMenu();
    }
    initUI() {
        this.elements = {
            sideMenu: document.getElementById('side-menu'),
            mainContent: document.querySelector('.main-content'),
            messagesContainer: document.getElementById('messages-container'),
            menuToggle: document.getElementById('menu-toggle'),
            closeMenuBtn: document.getElementById('close-menu-btn'),
            newChatBtnTop: document.getElementById('new-chat-btn-top'),
            messageInput: document.getElementById('message-input'),
            sendBtn: document.getElementById('send-btn'),
            sendIcon: document.getElementById('send-icon'),
            stopIcon: document.getElementById('stop-icon'),
            voiceControlBtn: document.getElementById('voice-control-btn'),
            chatsList: document.getElementById('chats-list'),
            profilePlaceholder: document.getElementById('profile-placeholder'),
            profileSettingsModal: document.getElementById('profile-settings-modal'),
            editProfileModal: document.getElementById('edit-profile-modal'),
            personalizationModal: document.getElementById('personalization-modal'),
            closeProfileSettings: document.getElementById('close-profile-settings'),
            editProfileBtn: document.getElementById('edit-profile-btn'),
            personalizationBtn: document.getElementById('personalization-btn'),
            termsBtn: document.getElementById('terms-btn'),
            supportBtn: document.getElementById('support-btn'),
            closeEditProfile: document.getElementById('close-edit-profile'),
            editUsernameInput: document.getElementById('edit-username-input'),
            editApiKeyInput: document.getElementById('edit-api-key-input'),
            saveProfileBtn: document.getElementById('save-profile-btn'),
            logoutProfileBtn: document.getElementById('logout-profile-btn'),
            closePersonalization: document.getElementById('close-personalization'),
            customPromptInput: document.getElementById('custom-prompt-input'),
            profileSettingsAvatar: document.getElementById('profile-settings-avatar'),
            profileSettingsUsername: document.getElementById('profile-settings-username'),
            profileApiKey: document.getElementById('profile-api-key'),
            welcomeMessage: document.getElementById('welcome-message'),
            contextMenu: document.getElementById('chat-context-menu'),
            pinChatBtn: document.getElementById('pin-chat-btn'),
            renameChatBtn: document.getElementById('rename-chat-btn'),
            deleteChatBtn: document.getElementById('delete-chat-btn'),
            promptStyleBtns: document.querySelectorAll('.prompt-style-btn'),
            characterSettingsBtn: document.getElementById('character-settings-btn')
        };
        this.bindEvents();
        this.applySettings();
    }
    bindEvents() {
        this.elements.menuToggle.addEventListener('click', () => this.toggleMenu());
        this.elements.closeMenuBtn.addEventListener('click', () => this.closeMenu());
        this.elements.sendBtn.addEventListener('click', () => {
            if (this.isGenerating) {
                this.stopGeneration();
            } else {
                this.sendMessage();
            }
        });
        this.elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
            }
        });
        this.elements.messageInput.addEventListener('input', () => {
            this.adjustTextareaHeight();
        });
        this.elements.newChatBtnTop.addEventListener('click', () => this.createNewChat());
        this.elements.profilePlaceholder.addEventListener('click', () => this.showProfileSettingsModal());
        this.elements.editProfileBtn.addEventListener('click', () => this.showEditProfileModal());
        this.elements.personalizationBtn.addEventListener('click', () => this.showPersonalizationModal());
        this.elements.closeProfileSettings.addEventListener('click', () => this.hideProfileSettingsModal());
        this.elements.termsBtn.addEventListener('click', () => {
            window.open('https://telegra.ph/POLZOVATELSKOE-SOGLASHENIE-po-ispolzovaniyu-programm-11-06', '_blank');
            this.hideProfileSettingsModal();
        });
        this.elements.supportBtn.addEventListener('click', () => {
            window.open('https://t.me/EDEM_CR', '_blank');
            this.hideProfileSettingsModal();
        });
        this.elements.closeEditProfile.addEventListener('click', () => this.hideEditProfileModal());
        this.elements.saveProfileBtn.addEventListener('click', () => this.saveProfile());
        this.elements.logoutProfileBtn.addEventListener('click', () => this.logout());
        this.elements.closePersonalization.addEventListener('click', () => this.hidePersonalizationModal());
        this.elements.customPromptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.saveCustomPrompt();
            }
        });
        this.elements.voiceControlBtn.addEventListener('click', () => this.startVoiceRecognition());
        this.elements.promptStyleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const style = btn.dataset.style;
                this.setCommunicationStyle(style);
            });
        });
        this.elements.pinChatBtn.addEventListener('click', () => this.togglePinChat());
        this.elements.renameChatBtn.addEventListener('click', () => this.renameChat());
        this.elements.deleteChatBtn.addEventListener('click', () => this.deleteChat());
        this.elements.characterSettingsBtn.addEventListener('click', () => {
            this.hideProfileSettingsModal();
            if (window.characterManager) {
                window.characterManager.showSettings();
            }
        });
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
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.toggleMenu();
            }
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
        document.addEventListener('touchstart', (e) => {
            const chatItem = e.target.closest('.chat-item');
            if (chatItem) {
                this.contextMenuChatId = chatItem.dataset.chatId;
                this.touchHoldTimer = setTimeout(() => {
                    this.showContextMenu(e, chatItem);
                }, 400);
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
        this.apiKey = localStorage.getItem('edm_ai_api_key');
        const savedChats = localStorage.getItem('edm_ai_chats');
        if (savedChats) {
            this.chats = JSON.parse(savedChats);
        }
        const savedChatId = localStorage.getItem('edm_ai_current_chat');
        if (savedChatId) {
            this.currentChatId = savedChatId;
        }
        const savedProfile = localStorage.getItem('edm_ai_profile');
        if (savedProfile) {
            this.userProfile = JSON.parse(savedProfile);
        }
        this.customPrompt = localStorage.getItem('edm_ai_custom_prompt') || '';
        this.communicationStyle = localStorage.getItem('edm_ai_communication_style') || 'normal';
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
        if (!this.chats[this.currentChatId]) {
            this.chats[this.currentChatId] = {
                id: this.currentChatId,
                name: 'Новый чат',
                created: new Date().toISOString(),
                messages: []
            };
            this.saveData();
        }
        this.elements.messagesContainer.innerHTML = '';
        if (this.elements.welcomeMessage) {
            this.elements.welcomeMessage.style.display = 'none';
        }
        const chat = this.chats[this.currentChatId];
        if (chat.messages.length === 0) {
            if (this.elements.welcomeMessage) {
                this.elements.welcomeMessage.style.display = 'block';
            }
        } else {
            chat.messages.forEach(msg => {
                this.addMessageToUI(msg.text, msg.type, msg.id, true);
            });
        }
        this.updateChatsList();
        this.scrollToBottom();
    }
    async sendMessage() {
        const message = this.elements.messageInput.value.trim();
        if (!message) return;
        this.removeAllContinueButtons();
        this.interruptedMessageId = null;
        if (!this.userProfile) {
            this.addMessageToUI('Пожалуйста, создайте профиль для использования нейросети', 'ai');
            this.showEditProfileModal();
            return;
        }
        if (!this.apiKey) {
            this.addMessageToUI('Пожалуйста, настройте API ключ в настройках', 'ai');
            this.showPersonalizationModal();
            return;
        }
        if (window.characterManager) {
            window.characterManager.onUserMessage(message);
        }
        this.lastPrompt = message;
        this.partialResponse = '';
        this.elements.messageInput.value = '';
        this.adjustTextareaHeight();
        this.addMessageToUI(message, 'user');
        const loadingId = 'loading_' + Date.now();
        this.showTypingIndicator(loadingId);
        this.isGenerating = true;
        this.updateSendButtonState();
        this.generationController = new AbortController();
        try {
            const response = await this.callGeminiAPI(message, this.generationController.signal);
            this.hideTypingIndicator(loadingId);
            this.isGenerating = false;
            this.updateSendButtonState();
            this.addMessageToUI(response, 'ai');
        } catch (error) {
            this.hideTypingIndicator(loadingId);
            this.isGenerating = false;
            this.updateSendButtonState();
            if (error.name === 'AbortError') {
                const currentMessageEl = document.querySelector(`[data-id="${loadingId}"]`);
                if (currentMessageEl) {
                    this.interruptedMessageId = loadingId;
                    currentMessageEl.classList.add('interrupted');
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
                console.error('Ошибка при отправке сообщения:', error);
                this.addMessageToUI(`Ошибка: ${error.message}`, 'ai');
            }
        }
    }
    removeAllContinueButtons() {
        document.querySelectorAll('.continue-generation-btn-inline').forEach(btn => {
            btn.remove();
        });
        document.querySelectorAll('.message.interrupted').forEach(msg => {
            msg.classList.remove('interrupted');
        });
        document.querySelectorAll('.typing-indicator').forEach(indicator => {
            const text = indicator.querySelector('.typing-text');
            if (text && text.textContent.includes('прервана')) {
                indicator.remove();
            }
        });
    }
    stopGeneration() {
        if (this.isGenerating && this.generationController) {
            this.generationController.abort();
            this.isGenerating = false;
            this.updateSendButtonState();
            if (window.characterManager) {
                window.characterManager.onGenerationStop();
            }
            const loadingElements = document.querySelectorAll('.typing-indicator');
            if (loadingElements.length > 0) {
                const loadingElement = loadingElements[loadingElements.length - 1];
                if (loadingElement && loadingElement.closest('.message')) {
                    const messageEl = loadingElement.closest('.message');
                    const messageId = messageEl.dataset.id || 'interrupted_' + Date.now();
                    this.interruptedMessageId = messageId;
                    messageEl.classList.add('interrupted');
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
        const targetMessageId = messageId || this.interruptedMessageId;
        if (!targetMessageId) return;
        const messageEl = document.querySelector(`[data-id="${targetMessageId}"]`);
        if (messageEl) {
            const continueBtn = messageEl.querySelector('.continue-generation-btn-inline');
            if (continueBtn) continueBtn.remove();
            messageEl.classList.remove('interrupted');
        }
        const oldIndicator = document.querySelector(`[data-id="${targetMessageId}"] .typing-indicator`);
        if (oldIndicator) oldIndicator.remove();
        if (window.characterManager) {
            window.characterManager.onGenerationStart();
        }
        const newLoadingId = 'loading_' + Date.now();
        const loadingEl = this.showTypingIndicator(newLoadingId, targetMessageId);
        this.isGenerating = true;
        this.updateSendButtonState();
        this.generationController = new AbortController();
        this.callGeminiAPI(this.lastPrompt, this.generationController.signal)
            .then(response => {
                this.hideTypingIndicator(newLoadingId);
                this.isGenerating = false;
                this.updateSendButtonState();
                const targetMessage = document.querySelector(`[data-id="${targetMessageId}"]`);
                if (targetMessage) {
                    const indicator = targetMessage.querySelector('.typing-indicator');
                    if (indicator) indicator.remove();
                    const newMessageEl = this.addMessageToUI(response, 'ai');
                    newMessageEl.dataset.id = targetMessageId;
                    targetMessage.remove();
                } else {
                    this.addMessageToUI(response, 'ai');
                }
                this.interruptedMessageId = null;
            })
            .catch(error => {
                this.hideTypingIndicator(newLoadingId);
                this.isGenerating = false;
                this.updateSendButtonState();
                if (error.name === 'AbortError') {
                    const currentMessageEl = document.querySelector(`[data-id="${targetMessageId}"]`);
                    if (currentMessageEl) {
                        currentMessageEl.classList.add('interrupted');
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
            this.elements.sendIcon.style.display = 'none';
            this.elements.stopIcon.style.display = 'block';
            this.elements.sendBtn.classList.add('generating');
            this.elements.sendBtn.title = 'Остановить генерацию';
        } else {
            this.elements.sendIcon.style.display = 'block';
            this.elements.stopIcon.style.display = 'none';
            this.elements.sendBtn.classList.remove('generating');
            this.elements.sendBtn.title = 'Отправить';
        }
    }
    async callGeminiAPI(prompt, signal) {
        const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
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
        if (this.customPrompt) {
            systemPrompt += '\n\n' + this.customPrompt;
        }
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
                maxOutputTokens: 4096,
                stopSequences: ["\n\n", "###", "---"]
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
                const isTruncated = this.checkIfTruncated(responseText);
                if (isTruncated) {
                    responseText += "\n\n⚠️ *Ответ был обрезан из-за ограничения длины.*";
                }
                if (window.characterManager) {
                    window.characterManager.onAIResponse(responseText);
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
                const simpleError = error.message.split(':')[0];
                throw new Error(`Ошибка: ${simpleError}`);
            }
        }
    }
    checkIfTruncated(text) {
        const lastChar = text.trim().slice(-1);
        const endingChars = ['.', '!', '?', ':', ';', ')', ']', '}'];
        if (!endingChars.includes(lastChar) && text.length > 100) {
            return true;
        }
        const words = text.trim().split(' ');
        const lastWord = words[words.length - 1];
        if (lastWord.length < 3 && text.length > 500) {
            return true;
        }
        const lines = text.split('\n');
        const lastLine = lines[lines.length - 1];
        if (lastLine.length > 0 && lastLine.length < 20 && text.length > 1000) {
            return true;
        }
        return false;
    }
    addMessageToUI(text, type = 'ai', messageId = null, fromHistory = false) {
        if (!fromHistory) {
            this.saveMessageToChat(text, type, messageId);
        }
        if (this.elements.welcomeMessage && this.elements.welcomeMessage.style.display !== 'none') {
            this.elements.welcomeMessage.style.display = 'none';
        }
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}-message new-message`;
        if (messageId) {
            messageEl.dataset.id = messageId;
        }
        if (type === 'ai') {
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
        this.elements.messagesContainer.appendChild(messageEl);
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
        if (this.chats[this.currentChatId].messages.length === 1 && type === 'user') {
            this.chats[this.currentChatId].name = text.length > 30 ? 
                text.substring(0, 27) + '...' : text;
        }
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
        const messageElement = document.querySelector(`[data-id="${messageId}"]`);
        if (!messageElement) return;
        if (!messageElement.classList.contains('ai-message')) {
            console.warn('Копирование разрешено только для AI сообщений');
            return;
        }
        const messageText = messageElement.querySelector('.message-text');
        if (!messageText) return;
        const originalUserSelect = messageText.style.userSelect;
        messageText.style.userSelect = 'text';
        const textToCopy = messageText.textContent || messageText.innerText;
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
            messageText.style.userSelect = originalUserSelect;
        }
    }
    regenerateMessage(messageId) {
        const chat = this.chats[this.currentChatId];
        if (!chat) return;
        const messageIndex = chat.messages.findIndex(msg => msg.id === messageId);
        if (messageIndex === -1) return;
        let userMessageIndex = -1;
        for (let i = messageIndex; i >= 0; i--) {
            if (chat.messages[i].type === 'user') {
                userMessageIndex = i;
                break;
            }
        }
        if (userMessageIndex === -1) return;
        const userMessage = chat.messages[userMessageIndex].text;
        chat.messages.splice(userMessageIndex + 1);
        this.saveData();
        this.loadCurrentChat();
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
        const sortedChats = Object.values(this.chats).sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.created) - new Date(a.created);
        });
        sortedChats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${chat.id === this.currentChatId ? 'active' : ''} ${chat.pinned ? 'pinned' : ''}`;
            chatItem.dataset.chatId = chat.id;
            const lastMessage = chat.messages.length > 0 ? 
                chat.messages[chat.messages.length - 1].text : 'Нет сообщений';
            const preview = lastMessage.length > 40 ? 
                lastMessage.substring(0, 37) + '...' : lastMessage;
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
        const avatarColor = this.generateAvatarColor(this.userProfile.username);
        this.elements.profileSettingsAvatar.style.background = avatarColor;
        this.elements.profileSettingsAvatar.textContent = this.userProfile.username.charAt(0).toUpperCase();
        this.elements.profileSettingsUsername.textContent = this.userProfile.username;
        if (this.apiKey) {
            const maskedKey = '••••••••••••' + this.apiKey.slice(-4);
            this.elements.profileApiKey.textContent = `API ключ: ${maskedKey}`;
        } else {
            this.elements.profileApiKey.textContent = 'API ключ: не установлен';
        }
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
        if (!apiKey.includes('••••')) {
            this.apiKey = apiKey;
        }
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
        if (this.isRecording) {
            this.stopVoiceRecognition();
            return;
        }
        if (this.hasMicPermission) {
            this.startRecording();
        } else {
            if (typeof navigator.permissions !== 'undefined') {
                navigator.permissions.query({ name: 'microphone' }).then(permissionStatus => {
                    if (permissionStatus.state === 'granted') {
                        this.hasMicPermission = true;
                        this.saveData();
                        this.startRecording();
                    } else if (permissionStatus.state === 'prompt') {
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
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
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
        document.documentElement.style.setProperty('--primary-bg', '#0a0a0a');
        document.documentElement.style.setProperty('--secondary-bg', '#141414');
        document.documentElement.style.setProperty('--primary-text', '#ffffff');
    }
}