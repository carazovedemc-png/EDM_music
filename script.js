document.addEventListener('DOMContentLoaded', function() {
    const output = document.getElementById('output');
    const commandInput = document.getElementById('commandInput');
    const logo = document.getElementById('logo');
    
    let database = [];
    let currentMenu = 'main';
    let searchType = '';
    let currentResults = [];
    let currentResultIndex = -1;
    
    // Запрет копирования
    document.addEventListener('copy', function(e) {
        e.preventDefault();
        showMessage('Система: Копирование запрещено', 'error');
    });
    
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showMessage('Система: Правая кнопка мыши отключена', 'error');
    });
    
    // Инициализация
    setTimeout(() => {
        animateLogo();
        setTimeout(() => {
            showMainMenu();
        }, 2000);
    }, 500);
    
    // Загрузка базы данных ТОЛЬКО из файла
    loadDatabaseFromFile();
    
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
        fetch('data.txt')
            .then(response => {
                if (!response.ok) throw new Error('Файл не найден');
                return response.text();
            })
            .then(data => {
                if (!data.trim()) throw new Error('Файл пуст');
                
                database = parseDatabase(data);
                
                if (database.length === 0) {
                    throw new Error('Нет записей или неверный формат');
                }
                
                showMessage('EDM™ SYSTEM v2.0', '');
                showMessage('Initializing terminal interface...', '');
                showMessage(`База данных загружена: ${database.length > 0 ? '999+' : '0'} записей`, 'success');
            })
            .catch(error => {
                showMessage('EDM™ SYSTEM v2.0', '');
                showMessage('Initializing terminal interface...', '');
                showMessage(`База данных загружена: 0 записей`, 'error');
                showMessage('ОШИБКА: ' + error.message, 'error');
                showMessage('Загрузите файл data.txt с базой данных', 'error');
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
            case 'view_result':
                handleViewResult(command);
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
    
    function showMainMenu() {
        clearOutput();
        currentMenu = 'main';
        
        showMessage('[ ГЛАВНОЕ МЕНЮ ]', '');
        setTimeout(() => showMenuOption('[ 1. ПРОБИВ ]'), 100);
        setTimeout(() => showMenuOption('[ 2. ВЗЛОМ WIFI ]'), 200);
        setTimeout(() => showMenuOption('[ 3. ДОКС ]'), 300);
        setTimeout(() => showMenuOption('[ 4. ТГ АКК СНОС ]'), 400);
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
            'phone': 'Введите номер телефона:',
            'telegram': 'Введите Telegram юзернейм:',
            'vk': 'Введите VK ID:',
            'name': 'Введите ФИО:'
        };
        
        showMessage(prompts[type], '');
        showBackButton();
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
            showMessage('База данных пуста!', 'error');
            return;
        }
        
        showSearchingAnimation();
        
        setTimeout(() => {
            currentResults = searchInDatabase(query, searchType);
            displayResults(currentResults, query);
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
        
        showMessage('Поиск в базе данных', '');
        
        let dots = 0;
        const interval = setInterval(() => {
            dots = (dots + 1) % 4;
            const dotsText = '.'.repeat(dots);
            const lastLine = output.lastElementChild;
            if (lastLine && lastLine.textContent.startsWith('Поиск в базе данных')) {
                lastLine.textContent = 'Поиск в базе данных' + dotsText;
                lastLine.className = 'searching';
            }
        }, 300);
        
        setTimeout(() => clearInterval(interval), 2000);
    }
    
    function displayResults(results, query) {
        clearOutput();
        
        if (results.length === 0) {
            showMessage('Ничего не найдено по запросу: ' + query, 'error');
            showBackButton();
            return;
        }
        
        showMessage('НАЙДЕНО: ' + results.length + ' записей', 'success');
        
        // Показываем только первую запись
        if (results.length > 0) {
            currentResultIndex = 0;
            showResult(results[0]);
        }
        
        if (results.length > 1) {
            setTimeout(() => {
                showMenuOption('[ Далее: введите 2 для просмотра следующей записи ]');
            }, 500);
        }
        
        showBackButton();
    }
    
    function showResult(record) {
        currentMenu = 'view_result';
        
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result';
        
        const basicInfo = `
            <div style="color:#0af;">════════════════════════════════</div>
            <div class="result-data">1. ФИО: ${record.name}</div>
            <div class="result-data">2. Телефон: ${record.phone}</div>
            <div class="result-data">3. Telegram: ${record.telegram}</div>
            <div class="result-data">4. VK: ${record.vk}</div>
            <div class="result-data">5. Адрес: ${record.address}</div>
            <div style="color:#0af;">════════════════════════════════</div>
        `;
        
        const additionalInfoDiv = document.createElement('div');
        additionalInfoDiv.className = 'additional-info';
        additionalInfoDiv.id = 'additional-info';
        additionalInfoDiv.innerHTML = `
            <div class="result-data">6. Дополнительная информация:</div>
            <div class="result-data" style="margin-left:20px;">${record.other}</div>
        `;
        
        resultDiv.innerHTML = basicInfo;
        output.appendChild(resultDiv);
        output.appendChild(additionalInfoDiv);
        
        setTimeout(() => {
            showMenuOption('[ 2. ДОП ИНФА ]');
        }, 300);
    }
    
    function handleViewResult(command) {
        if (command === '1') {
            showProbivMenu();
            return;
        }
        
        if (command === '2') {
            const additionalInfo = document.getElementById('additional-info');
            if (additionalInfo) {
                if (additionalInfo.style.display === 'none' || !additionalInfo.style.display) {
                    additionalInfo.style.display = 'block';
                    showMessage('Дополнительная информация показана', '');
                } else {
                    additionalInfo.style.display = 'none';
                    showMessage('Дополнительная информация скрыта', '');
                }
            }
            return;
        }
    }
    
    function showHackMenu() {
        clearOutput();
        currentMenu = 'hack';
        
        showMessage('[ СИСТЕМА ВЗЛОМА WIFI ]', '');
        showMessage('Введите BSSID сети WiFi:', '');
        showBackButton();
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
        showBackButton();
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
        showBackButton();
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
        
        // Генерируем двоичный код
        let binaryText = '';
        for (let i = 0; i < 150; i++) { // Уменьшил количество строк для мобильных
            let line = '';
            for (let j = 0; j < 40; j++) { // Уменьшил длину строки
                line += Math.round(Math.random()) + ' ';
            }
            binaryText += line + '\n';
        }
        
        hackDiv.textContent = binaryText;
        output.appendChild(hackDiv);
        
        // Анимация появления строк
        const lines = hackDiv.textContent.split('\n');
        hackDiv.innerHTML = '';
        lines.forEach((line, index) => {
            const lineDiv = document.createElement('div');
            lineDiv.className = 'binary-line';
            lineDiv.textContent = line;
            lineDiv.style.animationDelay = (index * 0.05) + 's';
            hackDiv.appendChild(lineDiv);
        });
        
        setTimeout(() => {
            clearOutput();
            showMessage('❌ Взлом не удался', 'error');
            showMessage('Причина: Усиленная защита WPA3', '');
            showMessage('Рекомендация: Используйте физический доступ к маршрутизатору', '');
            showBackButton();
        }, 15000);
    }
    
    function showDoxAnimation() {
        clearOutput();
        showMessage('🔍 Сбор информации...', '');
        
        const hackDiv = document.createElement('div');
        hackDiv.className = 'hack-animation';
        
        let binaryText = '';
        for (let i = 0; i < 100; i++) {
            let line = '';
            for (let j = 0; j < 35; j++) {
                line += Math.round(Math.random()) + ' ';
            }
            binaryText += line + '\n';
        }
        
        hackDiv.textContent = binaryText;
        output.appendChild(hackDiv);
        
        const lines = hackDiv.textContent.split('\n');
        hackDiv.innerHTML = '';
        lines.forEach((line, index) => {
            const lineDiv = document.createElement('div');
            lineDiv.className = 'binary-line';
            lineDiv.textContent = line;
            lineDiv.style.animationDelay = (index * 0.06) + 's';
            hackDiv.appendChild(lineDiv);
        });
        
        setTimeout(() => {
            clearOutput();
            showMessage('❌ Доксинг не удался', 'error');
            showMessage('Причина: Цель использует защищенные каналы', '');
            showMessage('Рекомендация: Недостаточно открытых источников', '');
            showBackButton();
        }, 12000);
    }
    
    function showTgHackAnimation() {
        clearOutput();
        showMessage('⚡ Инициализация атаки на Telegram...', '');
        
        const hackDiv = document.createElement('div');
        hackDiv.className = 'hack-animation';
        
        let codeText = '';
        for (let i = 0; i < 80; i++) {
            let line = '0x';
            for (let j = 0; j < 8; j++) {
                line += Math.floor(Math.random() * 16).toString(16);
            }
            codeText += line + ' ';
            if (i % 8 === 7) codeText += '\n';
        }
        
        hackDiv.textContent = codeText;
        output.appendChild(hackDiv);
        
        const lines = hackDiv.textContent.split('\n');
        hackDiv.innerHTML = '';
        lines.forEach((line, index) => {
            const lineDiv = document.createElement('div');
            lineDiv.className = 'binary-line';
            lineDiv.textContent = line;
            lineDiv.style.animationDelay = (index * 0.07) + 's';
            hackDiv.appendChild(lineDiv);
        });
        
        setTimeout(() => {
            clearOutput();
            showMessage('❌ Снос аккаунта не удался', 'error');
            showMessage('Причина: Двухфакторная аутентификация', '');
            showMessage('Рекомендация: Требуется доступ к резервным кодам', '');
            showBackButton();
        }, 10000);
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
    
    function showBackButton() {
        const backBtn = document.createElement('div');
        backBtn.className = 'back-btn';
        backBtn.textContent = '[ 1. НАЗАД ]';
        backBtn.style.animationDelay = '0.5s';
        output.appendChild(backBtn);
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