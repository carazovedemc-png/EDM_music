class EDMAIApp {
    constructor() {
        this.apiKey = null;
        this.currentChatId = 'default';
        this.chats = {};
        this.userProfile = null;
        this.isMenuOpen = false;
        this.selectedModel = 'qwen/qwen3.6-plus:free';

        // Голосовой ввод
        this.isRecording = false;
        this.recognition = null;
        this.finalTranscript = '';

        // Остановка генерации
        this.isGenerating = false;
        this.generationController = null;

        // Промпты
        this.customPrompt = '';
        this.communicationStyle = 'normal';
        this.communicationStyles = {
            normal: { name: 'Обычный', prompt: '' },
            professional: { name: 'Профессиональный', prompt: 'Отвечай профессионально, используя деловой стиль общения. Будь конкретным и структурированным.' },
            funny: { name: 'Весёлый', prompt: 'Отвечай весело, с юмором. Используй шутки и забавные примеры.' },
            friendly: { name: 'Дружелюбный', prompt: 'Отвечай дружелюбно и тепло, как хороший друг. Будь поддерживающим.' },
            concise: { name: 'Краткий', prompt: 'Отвечай максимально кратко и по делу. Избегай лишних деталей.' },
            detailed: { name: 'Детальный', prompt: 'Отвечай подробно и детально, раскрывая все аспекты вопроса.' }
        };

        // Файлы
        this.attachedFiles = [];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        // Контекстное меню
        this.contextMenuChatId = null;
        this.touchHoldTimer = null;

        // Просмотр изображений
        this.imageViewerZoom = 1;

        // Настройка marked
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                highlight: function(code, lang) {
                    if (lang && hljs && hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(code, { language: lang }).value;
                        } catch (err) {}
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
            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT' ||
                e.target.classList.contains('message-text') || e.target.closest('.message-text')) {
                return true;
            }
            e.preventDefault();
            return false;
        });

        document.addEventListener('selectstart', (e) => {
            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT' ||
                e.target.classList.contains('message-text') || e.target.closest('.message-text') ||
                e.target.classList.contains('copy-btn') || e.target.closest('.copy-btn')) {
                return true;
            }
            e.preventDefault();
            return false;
        });

        // Telegram Web App
        if (window.Telegram && window.Telegram.WebApp) {
            this.tg = window.Telegram.WebApp;
            this.tg.expand();
            this.tg.enableClosingConfirmation();
            this.tg.setHeaderColor('#050505');
            this.tg.setBackgroundColor('#050505');
        }

        this.loadData();
        this.initUI();
        this.loadCurrentChat();
        this.checkAuth();
        this.initHotkeys();
        this.initSpeechRecognition();
        this.initContextMenu();
        this.initFileUpload();
        this.initImageViewer();
    }

    initUI() {
        this.elements = {
            sideMenu: document.getElementById('side-menu'),
            mainContent: document.querySelector('.main-content'),
            messagesContainer: document.getElementById('messages-container'),
            menuToggle: document.getElementById('menu-toggle'),
            closeMenuBtn: document.getElementById('close-menu-btn'),
            newChatBtnTop: document.getElementById('new-chat-btn-top'),
            clearChatBtn: document.getElementById('clear-chat-btn'),
            messageInput: document.getElementById('message-input'),
            sendBtn: document.getElementById('send-btn'),
            sendIcon: document.getElementById('send-icon'),
            stopIcon: document.getElementById('stop-icon'),
            voiceControlBtn: document.getElementById('voice-control-btn'),
            attachBtn: document.getElementById('attach-btn'),
            fileInput: document.getElementById('file-input'),
            chatsList: document.getElementById('chats-list'),
            chatSearch: document.getElementById('chat-search'),
            chatCount: document.getElementById('chat-count'),
            profilePlaceholder: document.getElementById('profile-placeholder'),
            menuAvatar: document.getElementById('menu-avatar'),
            menuUsername: document.getElementById('menu-username'),
            profileSettingsModal: document.getElementById('profile-settings-modal'),
            editProfileModal: document.getElementById('edit-profile-modal'),
            personalizationModal: document.getElementById('personalization-modal'),
            aboutModal: document.getElementById('about-modal'),
            closeProfileSettings: document.getElementById('close-profile-settings'),
            editProfileBtn: document.getElementById('edit-profile-btn'),
            personalizationBtn: document.getElementById('personalization-btn'),
            termsBtn: document.getElementById('terms-btn'),
            supportBtn: document.getElementById('support-btn'),
            aboutBtn: document.getElementById('about-btn'),
            closeEditProfile: document.getElementById('close-edit-profile'),
            editUsernameInput: document.getElementById('edit-username-input'),
            editApiKeyInput: document.getElementById('edit-api-key-input'),
            editModelSelect: document.getElementById('edit-model-select'),
            toggleApiKeyBtn: document.getElementById('toggle-api-key-btn'),
            saveProfileBtn: document.getElementById('save-profile-btn'),
            logoutProfileBtn: document.getElementById('logout-profile-btn'),
            closePersonalization: document.getElementById('close-personalization'),
            customPromptInput: document.getElementById('custom-prompt-input'),
            profileSettingsAvatar: document.getElementById('profile-settings-avatar'),
            profileSettingsUsername: document.getElementById('profile-settings-username'),
            profileApiKey: document.getElementById('profile-api-key'),
            profileModel: document.getElementById('profile-model'),
            welcomeMessage: document.getElementById('welcome-message'),
            contextMenu: document.getElementById('chat-context-menu'),
            pinChatBtn: document.getElementById('pin-chat-btn'),
            renameChatBtn: document.getElementById('rename-chat-btn'),
            exportChatBtn: document.getElementById('export-chat-btn'),
            deleteChatBtn: document.getElementById('delete-chat-btn'),
            promptStyleBtns: document.querySelectorAll('.prompt-style-btn'),
            filePreviewArea: document.getElementById('file-preview-area'),
            filePreviewContainer: document.getElementById('file-preview-container'),
            clearFilesBtn: document.getElementById('clear-files-btn'),
            closeAbout: document.getElementById('close-about'),
            notificationsContainer: document.getElementById('notifications-container'),
            imageViewerModal: document.getElementById('image-viewer-modal'),
            imageViewerImg: document.getElementById('image-viewer-img'),
            imageViewerClose: document.getElementById('image-viewer-close'),
            imageDownloadBtn: document.getElementById('image-download-btn'),
            imageZoomInBtn: document.getElementById('image-zoom-in-btn'),
            imageZoomOutBtn: document.getElementById('image-zoom-out-btn'),
            imageResetZoomBtn: document.getElementById('image-reset-zoom-btn')
        };

        this.bindEvents();
        this.applySettings();
    }

    bindEvents() {
        // Навигация
        this.elements.menuToggle.addEventListener('click', () => this.toggleMenu());
        this.elements.closeMenuBtn.addEventListener('click', () => this.closeMenu());

        // Отправка и остановка
        this.elements.sendBtn.addEventListener('click', () => {
            if (this.isGenerating) {
                this.stopGeneration();
            } else {
                this.sendMessage();
            }
        });

        // Enter для отправки, Shift+Enter для новой строки
        this.elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.elements.messageInput.addEventListener('input', () => {
            this.adjustTextareaHeight();
        });

        // Чаты
        this.elements.newChatBtnTop.addEventListener('click', () => this.createNewChat());
        this.elements.clearChatBtn.addEventListener('click', () => this.clearCurrentChat());

        // Поиск чатов
        this.elements.chatSearch.addEventListener('input', (e) => {
            this.filterChats(e.target.value);
        });

        // Профиль
        this.elements.profilePlaceholder.addEventListener('click', () => this.showProfileSettingsModal());
        this.elements.editProfileBtn.addEventListener('click', () => this.showEditProfileModal());
        this.elements.personalizationBtn.addEventListener('click', () => this.showPersonalizationModal());
        this.elements.closeProfileSettings.addEventListener('click', () => this.hideProfileSettingsModal());

        // Ссылки
        this.elements.termsBtn.addEventListener('click', () => {
            window.open('https://telegra.ph/POLZOVATELSKOE-SOGLASHENIE-po-ispolzovaniyu-programm-11-06', '_blank');
            this.hideProfileSettingsModal();
        });

        this.elements.supportBtn.addEventListener('click', () => {
            window.open('https://t.me/EDEM_CR', '_blank');
            this.hideProfileSettingsModal();
        });

        this.elements.aboutBtn.addEventListener('click', () => this.showAboutModal());
        this.elements.closeAbout.addEventListener('click', () => this.hideAboutModal());

        // Редактирование профиля
        this.elements.closeEditProfile.addEventListener('click', () => this.hideEditProfileModal());
        this.elements.saveProfileBtn.addEventListener('click', () => this.saveProfile());
        this.elements.logoutProfileBtn.addEventListener('click', () => this.logout());
        this.elements.toggleApiKeyBtn.addEventListener('click', () => this.toggleApiKeyVisibility());

        // Персонализация
        this.elements.closePersonalization.addEventListener('click', () => this.hidePersonalizationModal());
        this.elements.customPromptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.saveCustomPrompt();
            }
        });
        this.elements.customPromptInput.addEventListener('input', () => {
            this.customPrompt = this.elements.customPromptInput.value;
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

        // Файлы
        this.elements.attachBtn.addEventListener('click', () => {
            this.elements.fileInput.click();
        });

        this.elements.clearFilesBtn.addEventListener('click', () => {
            this.clearAttachedFiles();
        });

        // Контекстное меню
        this.elements.pinChatBtn.addEventListener('click', () => this.togglePinChat());
        this.elements.renameChatBtn.addEventListener('click', () => this.renameChat());
        this.elements.exportChatBtn.addEventListener('click', () => this.exportChat());
        this.elements.deleteChatBtn.addEventListener('click', () => this.deleteChat());

        // Закрытие модалок
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
                if (this.isMenuOpen) this.closeMenu();
                if (this.elements.profileSettingsModal.style.display === 'flex') this.hideProfileSettingsModal();
                if (this.elements.editProfileModal.style.display === 'flex') this.hideEditProfileModal();
                if (this.elements.personalizationModal.style.display === 'flex') this.hidePersonalizationModal();
                if (this.elements.aboutModal.style.display === 'flex') this.hideAboutModal();
                if (this.isGenerating) this.stopGeneration();
                this.hideContextMenu();
                this.closeImageViewer();
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
                    this.elements.messageInput.value = this.finalTranscript + interim;
                    this.adjustTextareaHeight();
                }
            };

            this.recognition.onerror = () => {
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

        document.addEventListener('touchend', () => {
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
    }

    initFileUpload() {
        this.elements.fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
            this.elements.fileInput.value = '';
        });

        // Drag & Drop
        const inputSection = document.querySelector('.input-section');
        
        inputSection.addEventListener('dragover', (e) => {
            e.preventDefault();
            inputSection.style.borderColor = 'var(--accent-color)';
        });

        inputSection.addEventListener('dragleave', () => {
            inputSection.style.borderColor = '';
        });

        inputSection.addEventListener('drop', (e) => {
            e.preventDefault();
            inputSection.style.borderColor = '';
            if (e.dataTransfer.files.length) {
                this.handleFileSelect(e.dataTransfer.files);
            }
        });
    }

    initImageViewer() {
        this.elements.imageViewerClose.addEventListener('click', () => this.closeImageViewer());
        this.elements.imageDownloadBtn.addEventListener('click', () => this.downloadImageViewerImage());
        this.elements.imageZoomInBtn.addEventListener('click', () => this.zoomImage(0.2));
        this.elements.imageZoomOutBtn.addEventListener('click', () => this.zoomImage(-0.2));
        this.elements.imageResetZoomBtn.addEventListener('click', () => this.resetImageZoom());

        this.elements.imageViewerModal.addEventListener('click', (e) => {
            if (e.target === this.elements.imageViewerModal) {
                this.closeImageViewer();
            }
        });
    }

    // ===== ЗАГРУЗКА ФАЙЛОВ =====
    handleFileSelect(files) {
        Array.from(files).forEach(file => {
            if (file.size > this.maxFileSize) {
                this.showNotification(`Файл "${file.name}" слишком большой (макс. 10MB)`, 'error');
                return;
            }

            const fileObj = {
                id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                file: file,
                name: file.name,
                size: file.size,
                type: file.type,
                dataUrl: null
            };

            if (this.allowedImageTypes.includes(file.type)) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    fileObj.dataUrl = e.target.result;
                    this.attachedFiles.push(fileObj);
                    this.updateFilePreview();
                };
                reader.readAsDataURL(file);
            } else {
                this.attachedFiles.push(fileObj);
                this.updateFilePreview();
            }
        });
    }

    updateFilePreview() {
        if (this.attachedFiles.length === 0) {
            this.elements.filePreviewArea.style.display = 'none';
            this.elements.filePreviewContainer.innerHTML = '';
            return;
        }

        this.elements.filePreviewArea.style.display = 'block';
        this.elements.filePreviewContainer.innerHTML = '';

        this.attachedFiles.forEach(fileObj => {
            const previewItem = document.createElement('div');
            previewItem.className = 'file-preview-item';

            if (fileObj.dataUrl && fileObj.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = fileObj.dataUrl;
                img.alt = fileObj.name;
                previewItem.appendChild(img);
            } else {
                previewItem.classList.add('file-type');
                const icon = this.getFileIcon(fileObj.type);
                const ext = fileObj.name.split('.').pop().toUpperCase();
                previewItem.innerHTML = `<i class="${icon}"></i><span>${ext}</span>`;
            }

            const removeBtn = document.createElement('button');
            removeBtn.className = 'file-remove-btn';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', () => {
                this.attachedFiles = this.attachedFiles.filter(f => f.id !== fileObj.id);
                this.updateFilePreview();
            });
            previewItem.appendChild(removeBtn);

            this.elements.filePreviewContainer.appendChild(previewItem);
        });
    }

    clearAttachedFiles() {
        this.attachedFiles = [];
        this.updateFilePreview();
    }

    getFileIcon(type) {
        if (type.includes('pdf')) return 'fas fa-file-pdf';
        if (type.includes('word') || type.includes('doc')) return 'fas fa-file-word';
        if (type.includes('text')) return 'fas fa-file-alt';
        if (type.includes('json')) return 'fas fa-file-code';
        if (type.includes('xml')) return 'fas fa-file-code';
        if (type.includes('csv')) return 'fas fa-file-csv';
        return 'fas fa-file';
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    // ===== ПРОСМОТР ИЗОБРАЖЕНИЙ =====
    openImageViewer(imageUrl) {
        this.elements.imageViewerImg.src = imageUrl;
        this.elements.imageViewerModal.classList.add('active');
        this.imageViewerZoom = 1;
        this.elements.imageViewerImg.style.transform = 'scale(1)';
    }

    closeImageViewer() {
        this.elements.imageViewerModal.classList.remove('active');
        this.elements.imageViewerImg.src = '';
    }

    zoomImage(delta) {
        this.imageViewerZoom = Math.max(0.5, Math.min(3, this.imageViewerZoom + delta));
        this.elements.imageViewerImg.style.transform = `scale(${this.imageViewerZoom})`;
    }

    resetImageZoom() {
        this.imageViewerZoom = 1;
        this.elements.imageViewerImg.style.transform = 'scale(1)';
    }

    downloadImageViewerImage() {
        const url = this.elements.imageViewerImg.src;
        if (!url) return;

        const link = document.createElement('a');
        link.href = url;
        link.download = 'image_' + Date.now() + '.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showNotification('Изображение скачано', 'success');
    }

    // ===== НАВИГАЦИЯ =====
    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        this.elements.sideMenu.classList.toggle('active', this.isMenuOpen);
    }

    closeMenu() {
        this.isMenuOpen = false;
        this.elements.sideMenu.classList.remove('active');
    }

    showContextMenu(e, chatItem) {
        e.preventDefault();
        const rect = chatItem.getBoundingClientRect();
        this.elements.contextMenu.style.display = 'flex';
        this.elements.contextMenu.style.top = rect.top + 'px';
        this.elements.contextMenu.style.left = Math.min(rect.left, window.innerWidth - 200) + 'px';

        const chat = this.chats[this.contextMenuChatId];
        if (chat.pinned) {
            this.elements.pinChatBtn.innerHTML = '<i class="fas fa-thumbtack"></i><span>Открепить</span>';
        } else {
            this.elements.pinChatBtn.innerHTML = '<i class="fas fa-thumbtack"></i><span>Закрепить</span>';
        }
    }

    hideContextMenu() {
        this.elements.contextMenu.style.display = 'none';
        this.contextMenuChatId = null;
    }

    // ===== УВЕДОМЛЕНИЯ =====
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        notification.innerHTML = `<i class="${icons[type] || icons.info}"></i><span>${message}</span>`;
        this.elements.notificationsContainer.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ===== ЗАГРУЗКА ДАННЫХ =====
    loadData() {
        this.apiKey = localStorage.getItem('edm_ai_api_key');
        this.selectedModel = localStorage.getItem('edm_ai_model') || 'qwen/qwen3.6-plus:free';

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
    }

    saveData() {
        if (this.apiKey) localStorage.setItem('edm_ai_api_key', this.apiKey);
        localStorage.setItem('edm_ai_model', this.selectedModel);
        localStorage.setItem('edm_ai_chats', JSON.stringify(this.chats));
        localStorage.setItem('edm_ai_current_chat', this.currentChatId);
        if (this.userProfile) localStorage.setItem('edm_ai_profile', JSON.stringify(this.userProfile));
        localStorage.setItem('edm_ai_custom_prompt', this.customPrompt);
        localStorage.setItem('edm_ai_communication_style', this.communicationStyle);
    }

    // ===== АВТОРИЗАЦИЯ =====
    checkAuth() {
        this.updateProfileUI();
    }

    updateProfileUI() {
        const username = this.userProfile ? this.userProfile.username : 'Гость';
        const initial = username.charAt(0).toUpperCase();

        // Меню
        this.elements.menuUsername.textContent = username;
        this.elements.menuAvatar.textContent = initial;

        // Профиль в настройках
        this.elements.profileSettingsAvatar.textContent = initial;
        this.elements.profileSettingsUsername.textContent = username;

        if (this.apiKey) {
            const maskedKey = this.apiKey.substring(0, 10) + '••••••••';
            this.elements.profileApiKey.textContent = 'API: ' + maskedKey;
        } else {
            this.elements.profileApiKey.textContent = 'API ключ: не установлен';
        }

        this.elements.profileModel.textContent = 'Модель: ' + this.selectedModel;

        // Поле ввода
        if (this.userProfile && this.apiKey) {
            this.elements.messageInput.placeholder = 'Введите сообщение...';
        } else {
            this.elements.messageInput.placeholder = 'Настройте профиль для начала работы...';
        }
    }

    // ===== ПРОФИЛЬ =====
    showProfileSettingsModal() {
        this.elements.profileSettingsModal.style.display = 'flex';
    }

    hideProfileSettingsModal() {
        this.elements.profileSettingsModal.style.display = 'none';
    }

    showEditProfileModal() {
        this.hideProfileSettingsModal();
        this.elements.editProfileModal.style.display = 'flex';

        if (this.userProfile) {
            this.elements.editUsernameInput.value = this.userProfile.username || '';
        }
        if (this.apiKey) {
            this.elements.editApiKeyInput.value = this.apiKey;
        }
        this.elements.editModelSelect.value = this.selectedModel;
    }

    hideEditProfileModal() {
        this.elements.editProfileModal.style.display = 'none';
    }

    toggleApiKeyVisibility() {
        const input = this.elements.editApiKeyInput;
        const icon = this.elements.toggleApiKeyBtn.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    async saveProfile() {
        const username = this.elements.editUsernameInput.value.trim();
        const apiKey = this.elements.editApiKeyInput.value.trim();
        const model = this.elements.editModelSelect.value;

        if (!username) {
            this.showNotification('Введите имя пользователя', 'error');
            return;
        }

        if (!apiKey) {
            this.showNotification('Введите API ключ OpenRouter', 'error');
            return;
        }

        this.userProfile = { username: username };
        this.apiKey = apiKey;
        this.selectedModel = model;

        this.saveData();
        this.updateProfileUI();
        this.hideEditProfileModal();
        this.showNotification('Профиль сохранен', 'success');
    }

    logout() {
        this.userProfile = null;
        this.apiKey = null;
        this.saveData();
        this.updateProfileUI();
        this.hideEditProfileModal();
        this.showNotification('Вы вышли из аккаунта', 'info');
    }

    // ===== ПЕРСОНАЛИЗАЦИЯ =====
    showPersonalizationModal() {
        this.hideProfileSettingsModal();
        this.elements.personalizationModal.style.display = 'flex';
        this.elements.customPromptInput.value = this.customPrompt;

        this.elements.promptStyleBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.style === this.communicationStyle);
        });
    }

    hidePersonalizationModal() {
        this.elements.personalizationModal.style.display = 'none';
        this.saveCustomPrompt();
    }

    saveCustomPrompt() {
        this.customPrompt = this.elements.customPromptInput.value;
        this.saveData();
    }

    setCommunicationStyle(style) {
        this.communicationStyle = style;
        this.saveData();

        this.elements.promptStyleBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.style === style);
        });

        const styleName = this.communicationStyles[style].name;
        this.showNotification(`Стиль: ${styleName}`, 'success');
    }

    getSystemPrompt() {
        const stylePrompt = this.communicationStyles[this.communicationStyle]?.prompt || '';
        const customPrompt = this.customPrompt.trim();

        let parts = [];

        if (customPrompt) {
            parts.push(customPrompt);
        }

        if (stylePrompt) {
            parts.push(stylePrompt);
        }

        if (parts.length === 0) {
            parts.push('Вы — полезный ассистент EDM AI. Отвечайте на русском языке.');
        }

        return parts.join('\n\n');
    }

    // ===== О ПРИЛОЖЕНИИ =====
    showAboutModal() {
        this.hideProfileSettingsModal();
        this.elements.aboutModal.style.display = 'flex';
    }

    hideAboutModal() {
        this.elements.aboutModal.style.display = 'none';
    }

    // ===== ЧАТЫ =====
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

    loadCurrentChat() {
        if (!this.chats[this.currentChatId]) {
            this.createNewChat();
            return;
        }

        this.elements.messagesContainer.innerHTML = '';
        this.elements.welcomeMessage.style.display = 'none';

        const chat = this.chats[this.currentChatId];
        if (chat.messages.length === 0) {
            this.elements.welcomeMessage.style.display = 'block';
        } else {
            chat.messages.forEach(msg => {
                this.addMessageToUI(msg.text, msg.type, msg.id, msg.attachments, true);
            });
        }

        this.updateChatsList();
        this.scrollToBottom();
    }

    clearCurrentChat() {
        if (!this.chats[this.currentChatId]) return;
        if (this.chats[this.currentChatId].messages.length === 0) return;

        if (confirm('Очистить все сообщения в этом чате?')) {
            this.chats[this.currentChatId].messages = [];
            this.saveData();
            this.loadCurrentChat();
            this.showNotification('Чат очищен', 'success');
        }
    }

    switchChat(chatId) {
        this.currentChatId = chatId;
        this.saveData();
        this.loadCurrentChat();
        this.closeMenu();
    }

    updateChatsList() {
        const list = this.elements.chatsList;
        list.innerHTML = '';

        const sortedChats = Object.values(this.chats).sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            const timeA = a.messages.length ? new Date(a.messages[a.messages.length - 1].timestamp) : new Date(a.created);
            const timeB = b.messages.length ? new Date(b.messages[b.messages.length - 1].timestamp) : new Date(b.created);
            return timeB - timeA;
        });

        this.elements.chatCount.textContent = sortedChats.length;

        sortedChats.forEach(chat => {
            const item = document.createElement('div');
            item.className = 'chat-item';
            item.dataset.chatId = chat.id;
            if (chat.pinned) item.classList.add('pinned');
            if (chat.id === this.currentChatId) item.classList.add('active');

            const lastMsg = chat.messages.length ? chat.messages[chat.messages.length - 1] : null;
            const preview = lastMsg ? (lastMsg.text.substring(0, 40) + (lastMsg.text.length > 40 ? '...' : '')) : 'Нет сообщений';
            const initial = chat.name.charAt(0).toUpperCase();

            item.innerHTML = `
                <div class="chat-avatar">${initial}</div>
                <div class="chat-info">
                    <div class="chat-name">${chat.name}</div>
                    <div class="chat-preview">${preview}</div>
                </div>
            `;

            item.addEventListener('click', () => this.switchChat(chat.id));
            list.appendChild(item);
        });
    }

    filterChats(query) {
        const items = this.elements.chatsList.querySelectorAll('.chat-item');
        const q = query.toLowerCase();

        items.forEach(item => {
            const name = item.querySelector('.chat-name').textContent.toLowerCase();
            item.style.display = name.includes(q) ? 'flex' : 'none';
        });
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
        const newName = prompt('Новое название чата:', chat.name);
        if (newName && newName.trim() && newName !== chat.name) {
            chat.name = newName.trim();
            this.saveData();
            this.updateChatsList();
            this.showNotification('Чат переименован', 'success');
        }
        this.hideContextMenu();
    }

    exportChat() {
        if (!this.contextMenuChatId) return;
        const chat = this.chats[this.contextMenuChatId];
        if (!chat.messages.length) {
            this.showNotification('Чат пуст', 'warning');
            this.hideContextMenu();
            return;
        }

        let text = `# Чат: ${chat.name}\n# Дата: ${new Date(chat.created).toLocaleString()}\n\n`;
        chat.messages.forEach(msg => {
            const role = msg.type === 'user' ? 'Вы' : 'AI';
            text += `### ${role}:\n${msg.text}\n\n`;
        });

        const blob = new Blob([text], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat_${chat.name}_${Date.now()}.md`;
        a.click();
        URL.revokeObjectURL(url);
        this.showNotification('Чат экспортирован', 'success');
        this.hideContextMenu();
    }

    deleteChat() {
        if (!this.contextMenuChatId) return;

        if (confirm('Удалить этот чат?')) {
            delete this.chats[this.contextMenuChatId];

            if (this.currentChatId === this.contextMenuChatId) {
                const chatIds = Object.keys(this.chats);
                if (chatIds.length > 0) {
                    this.currentChatId = chatIds[0];
                } else {
                    this.createNewChat();
                    return;
                }
            }

            this.saveData();
            this.loadCurrentChat();
            this.showNotification('Чат удален', 'success');
        }
        this.hideContextMenu();
    }

    // ===== ОТПРАВКА СООБЩЕНИЙ =====
    async sendMessage() {
        const message = this.elements.messageInput.value.trim();
        const files = [...this.attachedFiles];

        if (!message && files.length === 0) return;

        if (!this.userProfile) {
            this.showNotification('Создайте профиль для использования', 'error');
            this.showEditProfileModal();
            return;
        }

        if (!this.apiKey) {
            this.showNotification('Установите API ключ OpenRouter', 'error');
            this.showEditProfileModal();
            return;
        }

        this.elements.messageInput.value = '';
        this.adjustTextareaHeight();
        this.clearAttachedFiles();

        // Формируем текст сообщения и вложения
        const attachments = files.map(f => ({
            id: f.id,
            name: f.name,
            type: f.type,
            size: f.size,
            dataUrl: f.dataUrl
        }));

        const messageWithFiles = message;
        this.addMessageToUI(messageWithFiles, 'user', null, attachments);

        // Показываем индикатор загрузки
        const loadingId = 'loading_' + Date.now();
        this.showTypingIndicator(loadingId);

        this.isGenerating = true;
        this.updateSendButtonState();

        try {
            const response = await this.callOpenRouterAPI(messageWithFiles, files);
            this.hideTypingIndicator(loadingId);

            if (response) {
                this.addMessageToUI(response, 'ai');
            }
        } catch (error) {
            this.hideTypingIndicator(loadingId);
            console.error('API Error:', error);
            this.showNotification('Ошибка: ' + error.message, 'error');
            this.addMessageToUI('❌ Произошла ошибка при запросе к API. Проверьте API ключ и подключение.', 'ai');
        }

        this.isGenerating = false;
        this.updateSendButtonState();
    }

    async callOpenRouterAPI(userMessage, files = []) {
        const systemPrompt = this.getSystemPrompt();

        // Формируем content для API
        let content = [];

        // Добавляем изображения
        files.forEach(file => {
            if (file.dataUrl && file.type.startsWith('image/')) {
                content.push({
                    type: 'image_url',
                    image_url: {
                        url: file.dataUrl
                    }
                });
            }
        });

        // Добавляем текстовое сообщение
        let textContent = userMessage;

        // Добавляем информацию о файлах
        const nonImageFiles = files.filter(f => !f.type.startsWith('image/'));
        if (nonImageFiles.length > 0) {
            const fileList = nonImageFiles.map(f => `- ${f.name} (${this.formatFileSize(f.size)})`).join('\n');
            textContent = `[Прикрепленные файлы:]\n${fileList}\n\n${textContent}`;
        }

        if (textContent) {
            content.push({
                type: 'text',
                text: textContent
            });
        }

        // Получаем историю сообщений текущего чата
        const chat = this.chats[this.currentChatId];
        const messagesHistory = chat.messages
            .filter(msg => msg.id && !msg.id.startsWith('loading'))
            .slice(-20) // Последние 20 сообщений
            .map(msg => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.text
            }));

        const messages = [
            { role: 'system', content: systemPrompt },
            ...messagesHistory,
            { role: 'user', content: content.length === 1 && content[0].type === 'text' ? content[0].text : content }
        ];

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'EDM AI',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: this.selectedModel,
                messages: messages,
                stream: true,
                max_tokens: 4096,
                temperature: 0.7
            }),
            signal: this.generationController?.signal
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Ошибка API');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;
                if (!line.startsWith('data: ')) continue;

                try {
                    const data = JSON.parse(line.slice(6));
                    const content = data.choices?.[0]?.delta?.content;
                    if (content) {
                        fullResponse += content;
                    }
                } catch (e) {
                    // Игнорируем ошибки парсинга
                }
            }
        }

        return fullResponse.trim();
    }

    stopGeneration() {
        if (this.generationController) {
            this.generationController.abort();
            this.generationController = null;
        }
        this.isGenerating = false;
        this.updateSendButtonState();
        this.showNotification('Генерация остановлена', 'warning');
    }

    // ===== UI СООБЩЕНИЙ =====
    addMessageToUI(text, type, messageId = null, attachments = null, isLoad = false) {
        const id = messageId || 'msg_' + Date.now();
        const timestamp = new Date().toISOString();

        const messageEl = document.createElement('div');
        messageEl.className = `message ${type === 'user' ? 'user-message' : 'ai-message'}`;
        messageEl.dataset.messageId = id;

        const avatar = type === 'user'
            ? `<div class="message-avatar"><div class="user-avatar">${this.userProfile ? this.userProfile.username.charAt(0).toUpperCase() : 'U'}</div></div>`
            : `<div class="message-avatar"><div class="ai-avatar"><i class="fas fa-bolt"></i></div></div>`;

        let attachmentsHTML = '';
        if (attachments && attachments.length > 0) {
            attachmentsHTML = '<div class="message-attachments">';
            attachments.forEach(att => {
                if (att.dataUrl && att.type.startsWith('image/')) {
                    attachmentsHTML += `
                        <div class="attachment-image" onclick="window.edmApp.openImageViewer('${att.dataUrl}')">
                            <img src="${att.dataUrl}" alt="${att.name}" />
                        </div>
                    `;
                } else {
                    const icon = this.getFileIcon(att.type);
                    attachmentsHTML += `
                        <div class="attachment-file" onclick="window.edmApp.downloadFile('${att.dataUrl}', '${att.name}')">
                            <div class="attachment-icon"><i class="${icon}"></i></div>
                            <div class="attachment-info">
                                <div class="attachment-name">${att.name}</div>
                                <div class="attachment-size">${this.formatFileSize(att.size)}</div>
                            </div>
                            <button class="attachment-download"><i class="fas fa-download"></i></button>
                        </div>
                    `;
                }
            });
            attachmentsHTML += '</div>';
        }

        const renderedText = type === 'ai' ? this.renderMarkdown(text) : this.escapeHtml(text).replace(/\n/g, '<br>');

        const actionsHTML = type === 'ai' && !isLoad
            ? `<div class="message-actions">
                    <button class="msg-action-btn" onclick="window.edmApp.copyMessage('${id}')" title="Копировать">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="msg-action-btn" onclick="window.edmApp.regenerateMessage()" title="Перегенерировать">
                        <i class="fas fa-redo"></i>
                    </button>
                </div>`
            : '';

        messageEl.innerHTML = `
            ${avatar}
            <div class="message-content">
                <div class="message-bubble">
                    ${attachmentsHTML}
                    <div class="message-text" id="${id}">${renderedText}</div>
                </div>
                ${actionsHTML}
            </div>
        `;

        this.elements.messagesContainer.appendChild(messageEl);

        // Сохраняем в чат
        if (!isLoad && this.chats[this.currentChatId]) {
            const msgData = {
                id: id,
                text: text,
                type: type,
                timestamp: timestamp,
                attachments: attachments
            };
            this.chats[this.currentChatId].messages.push(msgData);

            // Автоматическое именование чата
            if (this.chats[this.currentChatId].messages.length === 1 && type === 'user') {
                this.chats[this.currentChatId].name = text.substring(0, 30) + (text.length > 30 ? '...' : '');
            }

            this.saveData();
            this.updateChatsList();
        }

        if (!isLoad) {
            this.scrollToBottom();
        }

        // Подсветка кода
        if (typeof hljs !== 'undefined') {
            messageEl.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }

        return id;
    }

    showTypingIndicator(loadingId) {
        const loadingEl = document.createElement('div');
        loadingEl.className = 'message ai-message';
        loadingEl.id = loadingId;
        loadingEl.innerHTML = `
            <div class="message-avatar">
                <div class="ai-avatar"><i class="fas fa-bolt"></i></div>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                    <div class="typing-text">Думаю...</div>
                </div>
            </div>
        `;
        this.elements.messagesContainer.appendChild(loadingEl);
        this.scrollToBottom();
    }

    hideTypingIndicator(loadingId) {
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();
    }

    renderMarkdown(text) {
        if (typeof marked !== 'undefined') {
            try {
                const rawHtml = marked.parse(text);
                if (typeof DOMPurify !== 'undefined') {
                    return DOMPurify.sanitize(rawHtml);
                }
                return rawHtml;
            } catch (e) {
                return this.escapeHtml(text).replace(/\n/g, '<br>');
            }
        }
        return this.escapeHtml(text).replace(/\n/g, '<br>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    scrollToBottom() {
        setTimeout(() => {
            this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
        }, 100);
    }

    adjustTextareaHeight() {
        const textarea = this.elements.messageInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        this.updateSendButtonState();
    }

    updateSendButtonState() {
        const hasText = this.elements.messageInput.value.trim().length > 0;
        const hasFiles = this.attachedFiles.length > 0;

        if (this.isGenerating) {
            this.elements.sendIcon.style.display = 'none';
            this.elements.stopIcon.style.display = 'block';
            this.elements.sendBtn.classList.add('generating');
        } else {
            this.elements.sendIcon.style.display = 'block';
            this.elements.stopIcon.style.display = 'none';
            this.elements.sendBtn.classList.remove('generating');
        }
    }

    // ===== ДЕЙСТВИЯ С СООБЩЕНИЯМИ =====
    copyMessage(messageId) {
        const el = document.getElementById(messageId);
        if (!el) return;

        const text = el.innerText || el.textContent;
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Скопировано', 'success');
        }).catch(() => {
            this.showNotification('Ошибка копирования', 'error');
        });
    }

    async regenerateMessage() {
        const chat = this.chats[this.currentChatId];
        if (!chat || chat.messages.length < 2) return;

        // Находим последнее сообщение пользователя
        let lastUserMsg = null;
        for (let i = chat.messages.length - 1; i >= 0; i--) {
            if (chat.messages[i].type === 'user') {
                lastUserMsg = chat.messages[i];
                break;
            }
        }

        if (!lastUserMsg) return;

        // Удаляем последнее сообщение AI
        chat.messages.pop();
        this.saveData();

        // Перерисовываем чат
        this.elements.messagesContainer.innerHTML = '';
        chat.messages.forEach(msg => {
            this.addMessageToUI(msg.text, msg.type, msg.id, msg.attachments, true);
        });

        // Отправляем заново
        this.elements.messageInput.value = lastUserMsg.text;
        this.sendMessage();
    }

    downloadFile(dataUrl, filename) {
        if (!dataUrl) return;
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showNotification('Файл скачан', 'success');
    }

    // ===== ПРИМЕНЕНИЕ НАСТРОЕК =====
    applySettings() {
        if (this.elements.customPromptInput) {
            this.elements.customPromptInput.value = this.customPrompt;
        }

        this.elements.promptStyleBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.style === this.communicationStyle);
        });

        this.updateSendButtonState();
    }
}

// Инициализация приложения
window.addEventListener('DOMContentLoaded', () => {
    window.edmApp = new EDMAIApp();
});
