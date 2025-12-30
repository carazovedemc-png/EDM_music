class ConsoleAI {
    constructor() {
        this.apiKey = null;
        this.currentChatId = 'default';
        this.chats = {};
        this.init();
    }

    init() {
        // Инициализация Telegram Web App
        this.tg = window.Telegram.WebApp;
        this.tg.expand();
        
        // Загрузка данных
        this.loadData();
        
        // Инициализация интерфейса
        this.initUI();
        
        // Загрузка текущего чата
        this.loadCurrentChat();
    }

    initUI() {
        // Элементы DOM
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

        // Обработчики событий
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

        // Загрузка API ключа в поле ввода
        if (this.apiKey) {
            this.apiKeyInput.value = '••••••••' + this.apiKey.slice(-4);
        }

        // Заполнение списка чатов
        this.updateChatsList();
    }

    loadData() {
        // Загрузка API ключа
        const savedApiKey = localStorage.getItem('console_ai_api_key');
        if (savedApiKey) {
            this.apiKey = savedApiKey;
        }

        // Загрузка чатов
        const savedChats = localStorage.getItem('console_ai_chats');
        if (savedChats) {
            this.chats = JSON.parse(savedChats);
        }

        // Загрузка текущего ID чата
        const savedChatId = localStorage.getItem('console_ai_current_chat');
        if (savedChatId) {
            this.currentChatId = savedChatId;
        }
    }

    saveData() {
        if (this.apiKey) {
            localStorage.setItem('console_ai_api_key', this.apiKey);
        }
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

        // Очистка вывода
        this.output.innerHTML = '';
        
        // Добавление приветственного сообщения
        this.addLine('Console AI v1.0', 'system');
        this.addLine('Введите /help для списка команд', 'system');
        
        // Загрузка истории чата
        const chat = this.chats[this.currentChatId];
        chat.messages.forEach(msg => {
            this.addLine(msg.text, msg.type, true);
        });
    }

    addLine(text, type = 'system', fromHistory = false) {
        const line = document.createElement('div');
        line.className = 'console-line';
        
        const prompt = document.createElement('span');
        prompt.className = 'prompt';
        
        switch(type) {
            case 'user':
                prompt.textContent = '>>>';
                line.style.color = '#ffffff';
                break;
            case 'ai':
                prompt.textContent = 'AI:';
                line.style.color = '#00ff00';
                break;
            case 'error':
                prompt.textContent = '!';
                line.style.color = '#ff4444';
                break;
            default:
                prompt.textContent = '$';
                line.style.color = '#cccccc';
        }
        
        line.appendChild(prompt);
        line.appendChild(document.createTextNode(' ' + text));
        this.output.appendChild(line);
        
        if (!fromHistory) {
            this.saveToChat(text, type);
        }
        
        // Автопрокрутка
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
            text,
            type,
            timestamp: new Date().toISOString()
        });
        
        // Сохраняем только последние 100 сообщений
        if (this.chats[this.currentChatId].messages.length > 100) {
            this.chats[this.currentChatId].messages = this.chats[this.currentChatId].messages.slice(-100);
        }
        
        this.saveData();
        this.updateChatsList();
    }

    async processCommand() {
        const command = this.input.value.trim();
        if (!command) return;
        
        // Очистка ввода
        this.input.value = '';
        
        // Добавление команды в консоль
        this.addLine(command, 'user');
        
        // Обработка системных команд
        if (command.startsWith('/')) {
            this.handleSystemCommand(command);
            return;
        }
        
        // Обработка запроса к AI
        await this.handleAIRequest(command);
    }

    handleSystemCommand(command) {
        const [cmd, ...args] = command.slice(1).split(' ');
        
        switch(cmd.toLowerCase()) {
            case 'help':
                this.showHelp();
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
                this.addLine('Console AI v1.0', 'system');
                this.addLine('Telegram Mini App', 'system');
                break;
                
            default:
                this.addLine(`Неизвестная команда: ${cmd}. Введите /help для списка команд`, 'error');
        }
    }

    showHelp() {
        const helpText = `
Доступные команды:
/help - Показать эту справку
/clear - Очистить текущий чат
/new - Создать новый чат
/chats - Показать список чатов
/version - Показать версию
/api set KEY - Установить API ключ (альтернатива настройкам)

Для работы с AI просто введите ваш вопрос без слеша.
        `.trim().split('\n');
        
        helpText.forEach(line => {
            this.addLine(line.trim(), 'system');
        });
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
        
        // Показать индикатор загрузки
        const loadingLine = this.addLine('Обработка запроса...', 'system');
        
        try {
            const response = await this.callGeminiAPI(prompt);
            this.addLine(response, 'ai');
        } catch (error) {
            console.error('API Error:', error);
            this.addLine(`Ошибка: ${error.message}`, 'error');
        }
    }

    async callGeminiAPI(prompt) {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5 flash:generateContent?key=${this.apiKey}`;
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        };
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Некорректный ответ от API');
        }
    }

    showSettings() {
        this.settingsModal.style.display = 'flex';
        if (this.apiKey) {
            this.apiKeyInput.value = '••••••••' + this.apiKey.slice(-4);
        } else {
            this.apiKeyInput.value = '';
        }
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
        
        // Очистка поля ввода
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

    hideChats() {
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
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                const lastMessage = chat.messages.length > 0 
                    ? chat.messages[chat.messages.length - 1].text
                    : 'Пустой чат';
                
                const preview = lastMessage.length > 50 
                    ? lastMessage.substring(0, 47) + '...'
                    : lastMessage;
                
                chatItem.innerHTML = `
                    <div class="chat-date">${date}</div>
                    <div class="chat-preview">${preview}</div>
                `;
                
                this.chatsList.appendChild(chatItem);
            });
    }

    switchChat(chatId) {
        this.currentChatId = chatId;
        this.saveData();
        this.hideChats();
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
        this.hideChats();
        this.loadCurrentChat();
        this.addLine('Новый чат создан', 'system');
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ConsoleAI();
});