class ConsoleAI {
    constructor() {
        this.apiKey = null;
        this.currentChatId = 'default';
        this.chats = {};
        this.init();
    }

    init() {
        this.tg = window.Telegram.WebApp;
        this.tg.expand();
        this.loadData();
        this.initUI();
        this.loadCurrentChat();
    }

    initUI() {
        this.output = document.getElementById('console-output');
        this.input = document.getElementById('command-input');
        this.sendBtn = document.getElementById('send-btn');
        this.settingsBtn = document.getElementById('settings-btn');
        this.menuBtn = document.getElementById('menu-btn');
        this.settingsModal = document.getElementById('settings-modal');
        this.chatsModal = document.getElementById('chats-modal');
        this.closeSettings = document.getElementById('close-settings');
        this.closeChats = document.getElementById('close-chats');
        this.applyApiBtn = document.getElementById('apply-api');
        this.apiKeyInput = document.getElementById('api-key');
        this.apiStatus = document.getElementById('api-status');
        this.chatsList = document.getElementById('chats-list');
        this.newChatBtn = document.getElementById('new-chat');

        this.sendBtn.addEventListener('click', () => this.processCommand());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.processCommand();
        });

        this.settingsBtn.addEventListener('click', () => this.showSettings());
        this.menuBtn.addEventListener('click', () => this.showChats());
        this.closeSettings.addEventListener('click', () => this.hideSettings());
        this.closeChats.addEventListener('click', () => this.hideChats());
        this.applyApiBtn.addEventListener('click', () => this.saveApiKey());
        this.newChatBtn.addEventListener('click', () => this.createNewChat());

        if (this.apiKey) {
            this.apiKeyInput.value = '••••••••' + this.apiKey.slice(-4);
        }
        this.updateChatsList();
    }

    loadData() {
        const savedApiKey = localStorage.getItem('console_ai_api_key');
        if (savedApiKey) this.apiKey = savedApiKey;

        const savedChats = localStorage.getItem('console_ai_chats');
        if (savedChats) this.chats = JSON.parse(savedChats);

        const savedChatId = localStorage.getItem('console_ai_current_chat');
        if (savedChatId) this.currentChatId = savedChatId;
    }

    saveData() {
        if (this.apiKey) localStorage.setItem('console_ai_api_key', this.apiKey);
        localStorage.setItem('console_ai_chats', JSON.stringify(this.chats));
        localStorage.setItem('console_ai_current_chat', this.currentChatId);
    }

    loadCurrentChat() {
        if (!this.chats[this.currentChatId]) {
            this.chats[this.currentChatId] = {
                id: this.currentChatId,
                created: new Date().toISOString(),
                messages: []
            };
            this.saveData();
        }
        this.output.innerHTML = '';
        this.addLine('Console AI v1.1', 'system');
        this.addLine('Обновлено: Gemini 2.5 Flash /help', 'system');
        const chat = this.chats[this.currentChatId];
        chat.messages.forEach(msg => this.addLine(msg.text, msg.type, true));
    }

    addLine(text, type = 'system', fromHistory = false) {
        const line = document.createElement('div');
        line.className = 'console-line';
        const prompt = document.createElement('span');
        prompt.className = 'prompt';
        switch(type) {
            case 'user': prompt.textContent = '>>>'; line.style.color = '#ffffff'; break;
            case 'ai': prompt.textContent = 'AI:'; line.style.color = '#00ff00'; break;
            case 'error': prompt.textContent = '!'; line.style.color = '#ff4444'; break;
            default: prompt.textContent = '$'; line.style.color = '#cccccc';
        }
        line.appendChild(prompt);
        line.appendChild(document.createTextNode(' ' + text));
        this.output.appendChild(line);
        if (!fromHistory) this.saveToChat(text, type);
        this.output.scrollTop = this.output.scrollHeight;
    }

    saveToChat(text, type) {
        if (!this.chats[this.currentChatId]) {
            this.chats[this.currentChatId] = {
                id: this.currentChatId,
                created: new Date().toISOString(),
                messages: []
            };
        }
        this.chats[this.currentChatId].messages.push({
            text, type, timestamp: new Date().toISOString()
        });
        if (this.chats[this.currentChatId].messages.length > 100) {
            this.chats[this.currentChatId].messages = this.chats[this.currentChatId].messages.slice(-100);
        }
        this.saveData();
        this.updateChatsList();
    }

    async processCommand() {
        const command = this.input.value.trim();
        if (!command) return;
        this.input.value = '';
        this.addLine(command, 'user');
        if (command.startsWith('/')) {
            this.handleSystemCommand(command);
            return;
        }
        await this.handleAIRequest(command);
    }

    handleSystemCommand(command) {
        const [cmd, ...args] = command.slice(1).split(' ');
        switch(cmd.toLowerCase()) {
            case 'help':
                this.addLine('Команды: /help, /clear, /new, /chats, /version, /api set KEY', 'system');
                this.addLine('Просто введите вопрос для AI.', 'system');
                break;
            case 'clear':
                this.clearChat();
                break;
            case 'new':
                this.createNewChat();
                break;
            case 'api':
                if (args[0] === 'set' && args[1]) {
                    this.apiKey = args[1];
                    this.saveData();
                    this.addLine('API ключ сохранен', 'system');
                } else {
                    this.addLine('Использование: /api set YOUR_API_KEY', 'error');
                }
                break;
            case 'chats':
                this.showChats();
                break;
            case 'version':
                this.addLine('Console AI v1.1 (Gemini 2.5 Flash)', 'system');
                break;
            default:
                this.addLine(`Неизвестная команда. /help`, 'error');
        }
    }

    showHelp() {
        const helpText = [
            'Доступные команды:',
            '/help - Показать справку',
            '/clear - Очистить текущий чат',
            '/new - Создать новый чат',
            '/chats - Показать список чатов',
            '/version - Показать версию',
            '/api set KEY - Установить API ключ',
            '',
            'Для работы с AI просто введите ваш вопрос без слеша.'
        ];
        helpText.forEach(line => this.addLine(line.trim(), 'system'));
    }

    clearChat() {
        if (this.chats[this.currentChatId]) {
            this.chats[this.currentChatId].messages = [];
            this.saveData();
        }
        this.loadCurrentChat();
        this.addLine('Чат очищен', 'system');
    }

    async handleAIRequest(prompt) {
        if (!this.apiKey) {
            this.addLine('Ошибка: API ключ не установлен. Введите /api set YOUR_KEY или используйте настройки', 'error');
            return;
        }
        // Индикатор загрузки
        this.addLine('Отправка запроса к Gemini...', 'system');
        try {
            const response = await this.callGeminiAPI(prompt);
            this.addLine(response, 'ai');
        } catch (error) {
            console.error('Ошибка в handleAIRequest:', error);
            this.addLine(`Ошибка: ${error.message}`, 'error');
        }
    }

    async callGeminiAPI(prompt) {
        // Ключевые изменения: новая модель и передача ключа в заголовке
        const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
        const requestBody = {
            contents: [{
                parts: [{ text: prompt }]
            }]
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': this.apiKey // Ключ передается здесь, а не в URL
                },
                body: JSON.stringify(requestBody)
            });

            // Обработка HTTP-ошибок (400, 403, 404 и т.д.)
            if (!response.ok) {
                let errorDetail = `HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorDetail += `: ${JSON.stringify(errorData.error || errorData)}`;
                } catch (e) {
                    // Если ответ не JSON, читаем как текст
                    const text = await response.text();
                    if (text) errorDetail += ` - ${text.substring(0, 100)}`;
                }
                throw new Error(`Сервер вернул ошибку: ${errorDetail}`);
            }

            const data = await response.json();
            // Проверяем структуру ответа
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Неожиданный формат ответа от AI.');
            }
        } catch (error) {
            // Обработка сетевых ошибок и ошибок парсинга
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Сетевая ошибка. Проверьте подключение.');
            }
            // Пробрасываем уже обработанные ошибки дальше
            throw error;
        }
    }

    showSettings() {
        this.settingsModal.style.display = 'flex';
        this.apiKeyInput.value = this.apiKey ? '••••••••' + this.apiKey.slice(-4) : '';
    }

    hideSettings() {
        this.settingsModal.style.display = 'none';
        this.apiStatus.textContent = '';
        this.apiStatus.className = 'status';
    }

    saveApiKey() {
        const key = this.apiKeyInput.value.trim();
        if (!key) {
            this.showStatus('Введите API ключ', 'error');
            return;
        }
        // Если ключ замаскирован, не меняем его
        if (key.startsWith('••••••••') && this.apiKey) {
            this.showStatus('Ключ уже сохранен', 'success');
            return;
        }
        this.apiKey = key;
        this.saveData();
        this.showStatus('API ключ успешно сохранен!', 'success');
        setTimeout(() => {
            this.apiKeyInput.value = '••••••••' + key.slice(-4);
        }, 100);
    }

    showStatus(message, type) {
        this.apiStatus.textContent = message;
        this.apiStatus.className = `status ${type}`;
    }

    showChats() {
        this.updateChatsList();
        this.chatsModal.style.display = 'flex';
    }

    hideChatats() {
        this.chatsModal.style.display = 'none';
    }

    updateChatsList() {
        this.chatsList.innerHTML = '';
        Object.values(this.chats)
            .sort((a, b) => new Date(b.created) - new Date(a.created))
            .forEach(chat => {
                const chatItem = document.createElement('div');
                chatItem.className = `chat-item ${chat.id === this.currentChatId ? 'active' : ''}`;
                chatItem.addEventListener('click', () => this.switchChat(chat.id));
                const date = new Date(chat.created).toLocaleDateString('ru-RU', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                });
                const lastMessage = chat.messages.length > 0 
                    ? chat.messages[chat.messages.length - 1].text
                    : 'Пустой чат';
                const preview = lastMessage.length > 50 
                    ? lastMessage.substring(0, 47) + '...'
                    : lastMessage;
                chatItem.innerHTML = `<div class="chat-date">${date}</div><div class="chat-preview">${preview}</div>`;
                this.chatsList.appendChild(chatItem);
            });
    }

    switchChat(chatId) {
        this.currentChatId = chatId;
        this.saveData();
        this.hideChatats();
        this.loadCurrentChat();
    }

    createNewChat() {
        const chatId = 'chat_' + Date.now();
        this.currentChatId = chatId;
        this.chats[chatId] = {
            id: chatId,
            created: new Date().toISOString(),
            messages: []
        };
        this.saveData();
        this.hideChatats();
        this.loadCurrentChat();
        this.addLine('Новый чат создан', 'system');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new ConsoleAI();
});