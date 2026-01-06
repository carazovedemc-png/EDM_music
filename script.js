document.addEventListener('DOMContentLoaded', function() {
    const output = document.getElementById('output');
    const commandInput = document.getElementById('commandInput');
    const logo = document.getElementById('logo');
    
    let database = [];
    let currentMenu = 'main';
    let searchType = '';
    
    // Запрет копирования
    document.addEventListener('copy', function(e) {
        e.preventDefault();
        showMessage('Система: Копирование запрещено', 'error');
    });
    
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showMessage('Система: Правая кнопка мыши отключена', 'error');
    });
    
    // Загрузка базы данных ТОЛЬКО из файла
    loadDatabaseFromFile();
    
    // Анимация логотипа
    animateLogo();
    
    // Фокус на поле ввода
    commandInput.focus();
    
    // Обработчик ввода команд
    commandInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const command = this.value.trim();
            this.value = '';
            
            if (command) {
                processCommand(command);
            }
        }
    });
    
    function animateLogo() {
        const lines = logo.textContent.split('\n');
        logo.textContent = '';
        
        lines.forEach((line, index) => {
            setTimeout(() => {
                logo.textContent += line + '\n';
            }, index * 100);
        });
    }
    
    function loadDatabaseFromFile() {
        // Пытаемся загрузить из файла data.txt
        fetch('data.txt')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Файл data.txt не найден');
                }
                return response.text();
            })
            .then(data => {
                if (!data.trim()) {
                    throw new Error('Файл data.txt пуст');
                }
                
                database = parseDatabase(data);
                
                if (database.length === 0) {
                    throw new Error('Нет записей в data.txt или неверный формат');
                }
                
                showMessage('База данных загружена из data.txt: ' + database.length + ' записей', 'success');
            })
            .catch(error => {
                showMessage('ОШИБКА: ' + error.message, 'error');
                showMessage('Загрузите файл data.txt с базой данных в формате:', 'error');
                showMessage('ФИО | Телефон | Telegram | VK | Адрес | Дополнительно', 'error');
                showMessage('Пример: Иванов Иван Иванович | +79161234567 | @ivanov | id123456 | Москва | IP: 192.168.1.1', 'error');
            });
    }
    
    function parseDatabase(data) {
        const lines = data.split('\n');
        const records = [];
        
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('//') && !trimmedLine.startsWith('#') && !trimmedLine.startsWith('<!--')) {
                const parts = trimmedLine.split('|').map(part => part.trim());
                
                if (parts.length >= 5) {
                    records.push({
                        name: parts[0],
                        phone: parts[1],
                        telegram: parts[2],
                        vk: parts[3],
                        address: parts[4],
                        other: parts.slice(5).join(' | ')
                    });
                }
            }
        });
        
        return records;
    }
    
    function processCommand(command) {
        showCommand(command);
        
        switch(currentMenu) {
            case 'main':
                handleMainMenu(command);
                break;
            case 'probiv':
                handleProbivMenu(command);
                break;
            case 'search':
                handleSearch(command);
                break;
            case 'hack':
                handleHack(command);
                break;
            case 'dox':
                handleDox(command);
                break;
            case 'tghack':
                handleTgHack(command);
                break;
        }
        
        scrollToBottom();
    }
    
    function handleMainMenu(command) {
        switch(command) {
            case '1':
                if (database.length === 0) {
                    showMessage('База данных не загружена! Загрузите файл data.txt', 'error');
                    return;
                }
                showProbivMenu();
                break;
            case '2':
                showHackMenu();
                break;
            case '3':
                showDoxMenu();
                break;
            case '4':
                showTgHackMenu();
                break;
            default:
                showMessage('Неизвестная команда. Введите цифру от 1 до 4.', 'error');
        }
    }
    
    function showProbivMenu() {
        clearOutput();
        currentMenu = 'probiv';
        
        showMessage('[ СИСТЕМА ПРОБИВА ]', '');
        showMessage('Выберите тип поиска:', '');
        
        setTimeout(() => showMenuOption('1. По номеру телефона'), 100);
        setTimeout(() => showMenuOption('2. По Telegram юзернейму'), 200);
        setTimeout(() => showMenuOption('3. По VK ID'), 300);
        setTimeout(() => showMenuOption('4. По ФИО'), 400);
        setTimeout(() => showMenuOption('5. Назад'), 500);
    }
    
    function handleProbivMenu(command) {
        switch(command) {
            case '1':
                startSearch('phone');
                break;
            case '2':
                startSearch('telegram');
                break;
            case '3':
                startSearch('vk');
                break;
            case '4':
                startSearch('name');
                break;
            case '5':
                showMainMenu();
                break;
            default:
                showMessage('Введите цифру от 1 до 5', 'error');
        }
    }
    
    function startSearch(type) {
        clearOutput();
        currentMenu = 'search';
        searchType = type;
        
        const prompts = {
            'phone': 'Введите номер телефона (формат: +79161234567):',
            'telegram': 'Введите Telegram юзернейм (формат: @username):',
            'vk': 'Введите VK ID (формат: id123456 или screen_name):',
            'name': 'Введите ФИО (формат: Иванов Иван Иванович):'
        };
        
        showMessage(prompts[type], '');
        setTimeout(() => showMenuOption('1. Назад'), 100);
    }
    
    function handleSearch(query) {
        if (query === '1') {
            showProbivMenu();
            return;
        }
        
        if (!query) {
            showMessage('Введите поисковый запрос', 'error');
            return;
        }
        
        if (database.length === 0) {
            showMessage('База данных пуста! Загрузите data.txt', 'error');
            return;
        }
        
        showSearchingAnimation();
        
        setTimeout(() => {
            const results = searchInDatabase(query, searchType);
            displayResults(results, query);
            
            showMenuOption('1. Назад');
        }, 2000);
    }
    
    function searchInDatabase(query, type) {
        query = query.toLowerCase().trim();
        
        return database.filter(record => {
            switch(type) {
                case 'phone':
                    return record.phone.toLowerCase().includes(query);
                case 'telegram':
                    return record.telegram.toLowerCase().includes(query);
                case 'vk':
                    return record.vk.toLowerCase().includes(query);
                case 'name':
                    return record.name.toLowerCase().includes(query);
                default:
                    return false;
            }
        });
    }
    
    function showSearchingAnimation() {
        clearOutput();
        
        const searchText = 'Поиск в базе данных';
        showMessage(searchText, '');
        
        let dots = 0;
        const interval = setInterval(() => {
            dots = (dots + 1) % 4;
            const dotsText = '.'.repeat(dots);
            const lastLine = output.lastElementChild;
            if (lastLine && lastLine.textContent.startsWith(searchText)) {
                lastLine.textContent = searchText + dotsText;
                lastLine.className = 'searching';
            }
        }, 300);
        
        setTimeout(() => clearInterval(interval), 2000);
    }
    
    function displayResults(results, query) {
        clearOutput();
        
        if (results.length === 0) {
            showMessage('Ничего не найдено по запросу: ' + query, 'error');
            return;
        }
        
        showMessage('НАЙДЕНО: ' + results.length + ' записей', 'success');
        
        results.forEach((record, index) => {
            setTimeout(() => {
                showResult(record);
            }, index * 300);
        });
    }
    
    function showResult(record) {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result';
        resultDiv.innerHTML = `
            <div style="color:#0af;">════════════════════════════════</div>
            <div style="color:#0af;">👤 ${record.name}</div>
            <div style="color:#0af;">📱 Телефон: ${record.phone}</div>
            <div style="color:#0af;">📲 Telegram: ${record.telegram}</div>
            <div style="color:#0af;">🌐 VK: ${record.vk}</div>
            <div style="color:#0af;">📍 Адрес: ${record.address}</div>
            <div style="color:#0af;">📝 Дополнительно: ${record.other}</div>
            <div style="color:#0af;">════════════════════════════════</div>
        `;
        
        output.appendChild(resultDiv);
        scrollToBottom();
    }
    
    function showHackMenu() {
        clearOutput();
        currentMenu = 'hack';
        
        showMessage('[ СИСТЕМА ВЗЛОМА WIFI ]', '');
        showMessage('Введите BSSID сети WiFi:', '');
        setTimeout(() => showMenuOption('1. Назад'), 100);
    }
    
    function handleHack(bssid) {
        if (bssid === '1') {
            showMainMenu();
            return;
        }
        
        showHackAnimation();
    }
    
    function showDoxMenu() {
        clearOutput();
        currentMenu = 'dox';
        
        showMessage('[ СИСТЕМА ДОКСИНГА ]', '');
        showMessage('Введите данные цели:', '');
        setTimeout(() => showMenuOption('1. Назад'), 100);
    }
    
    function handleDox(data) {
        if (data === '1') {
            showMainMenu();
            return;
        }
        
        showDoxAnimation();
    }
    
    function showTgHackMenu() {
        clearOutput();
        currentMenu = 'tghack';
        
        showMessage('[ СИСТЕМА СНОСА ТГ АККАУНТОВ ]', '');
        showMessage('Введите username или номер телефона:', '');
        setTimeout(() => showMenuOption('1. Назад'), 100);
    }
    
    function handleTgHack(target) {
        if (target === '1') {
            showMainMenu();
            return;
        }
        
        showTgHackAnimation();
    }
    
    function showHackAnimation() {
        clearOutput();
        showMessage('🚀 Запуск взлома WiFi...', '');
        
        const hackDiv = document.createElement('div');
        hackDiv.className = 'hack-animation';
        
        let binaryText = '';
        for (let i = 0; i < 500; i++) {
            binaryText += Math.random().toString(2).substring(2, 10) + ' ';
            if (i % 20 === 0) binaryText += '\n';
        }
        
        hackDiv.textContent = binaryText;
        output.appendChild(hackDiv);
        
        setTimeout(() => {
            clearOutput();
            showMessage('❌ Взлом не удался', 'error');
            showMessage('Причина: Усиленная защита WPA3', '');
            showMessage('Рекомендация: Используйте физический доступ к маршрутизатору', '');
            showMenuOption('1. Назад');
        }, 15000);
    }
    
    function showDoxAnimation() {
        clearOutput();
        showMessage('🔍 Сбор информации...', '');
        
        setTimeout(() => {
            showMessage('🌐 Поиск в социальных сетях...', '');
        }, 1000);
        
        setTimeout(() => {
            showMessage('📧 Сканирование почтовых ящиков...', '');
        }, 2000);
        
        setTimeout(() => {
            showMessage('📱 Анализ метаданных...', '');
        }, 3000);
        
        setTimeout(() => {
            clearOutput();
            showMessage('❌ Доксинг не удался', 'error');
            showMessage('Причина: Цель использует защищенные каналы', '');
            showMessage('Рекомендация: Недостаточно открытых источников', '');
            showMenuOption('1. Назад');
        }, 4000);
    }
    
    function showTgHackAnimation() {
        clearOutput();
        showMessage('⚡ Инициализация атаки на Telegram...', '');
        
        const hackDiv = document.createElement('div');
        hackDiv.className = 'hack-animation';
        
        let codeText = '';
        for (let i = 0; i < 300; i++) {
            codeText += '0x' + Math.floor(Math.random() * 65536).toString(16).padStart(4, '0') + ' ';
            if (i % 15 === 0) codeText += '\n';
        }
        
        hackDiv.textContent = codeText;
        output.appendChild(hackDiv);
        
        setTimeout(() => {
            clearOutput();
            showMessage('❌ Снос аккаунта не удался', 'error');
            showMessage('Причина: Двухфакторная аутентификация', '');
            showMessage('Рекомендация: Требуется доступ к резервным кодам', '');
            showMenuOption('1. Назад');
        }, 12000);
    }
    
    function showMainMenu() {
        clearOutput();
        currentMenu = 'main';
        
        showMessage('[ ГЛАВНОЕ МЕНЮ ]', '');
        setTimeout(() => showMenuOption('[ 1. ПРОБИВ ]'), 100);
        setTimeout(() => showMenuOption('[ 2. ВЗЛОМ WIFI ]'), 200);
        setTimeout(() => showMenuOption('[ 3. ДОКС ]'), 300);
        setTimeout(() => showMenuOption('[ 4. ТГ АКК СНОС ]'), 400);
    }
    
    function showMenuOption(text) {
        const option = document.createElement('div');
        option.className = 'menu-item';
        option.textContent = text;
        option.style.animationDelay = '0s';
        option.style.animation = 'typewrite 0.3s steps(20) forwards';
        option.style.color = '#0af';
        output.appendChild(option);
        scrollToBottom();
    }
    
    function showCommand(command) {
        const commandDiv = document.createElement('div');
        commandDiv.className = 'command';
        commandDiv.innerHTML = `<span style="color:#0af">root@edm:~#</span> ${command}`;
        output.appendChild(commandDiv);
    }
    
    function showMessage(text, type) {
        const msgDiv = document.createElement('div');
        if (type === 'error') {
            msgDiv.className = 'error';
        } else if (type === 'success') {
            msgDiv.className = 'success';
        } else {
            msgDiv.style.color = '#0af';
        }
        msgDiv.textContent = text;
        output.appendChild(msgDiv);
    }
    
    function clearOutput() {
        while (output.children.length > 0) {
            output.removeChild(output.firstChild);
        }
    }
    
    function scrollToBottom() {
        setTimeout(() => {
            output.scrollTop = output.scrollHeight;
        }, 10);
    }
});