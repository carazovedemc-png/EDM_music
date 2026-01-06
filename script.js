document.addEventListener('DOMContentLoaded', function() {
    const output = document.getElementById('output');
    const commandInput = document.getElementById('commandInput');
    const logo = document.getElementById('logo');
    
    let database = [];
    let currentMenu = 'main';
    let searchType = '';
    let currentResults = [];
    let currentResultIndex = -1;
    let menuItemCount = 0; // Счетчик пунктов меню
    
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
                    // Разбираем дополнительную информацию
                    const otherParts = parts.slice(5);
                    const otherInfo = [];
                    
                    otherParts.forEach(info => {
                        const infoParts = info.split(':').map(p => p.trim());
                        if (infoParts.length >= 2) {
                            otherInfo.push({
                                key: infoParts[0],
                                value: infoParts.slice(1).join(':')
                            });
                        }
                    });
                    
                    records.push({
                        name: parts[0],
                        phone: parts[1],
                        telegram: parts[2],
                        vk: parts[3],
                        address: parts[4],
                        other: otherInfo
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
        menuItemCount = 0; // Сбрасываем счетчик
        
        showMessage('[ ГЛАВНОЕ МЕНЮ ]', '');
        showMenuOption('[ 1. ПРОБИВ ]');
        showMenuOption('[ 2. ВЗЛОМ WIFI ]');
        showMenuOption('[ 3. ДОКС ]');
        showMenuOption('[ 4. ТГ АКК СНОС ]');
    }
    
    function showProbivMenu() {
        clearOutput();
        currentMenu = 'probiv';
        menuItemCount = 0; // Сбрасываем счетчик
        
        showMessage('[ СИСТЕМА ПРОБИВА ]', '');
        showMessage('Выберите тип поиска:', '');
        
        showMenuOption('1. По номеру телефона');
        showMenuOption('2. По Telegram юзернейму');
        showMenuOption('3. По VK ID');
        showMenuOption('4. По ФИО');
        showBackButton(); // Теперь будет [5. НАЗАД]
    }
    
    function handleProbivMenu(command) {
        // Получаем номер для кнопки "Назад" из текущего количества пунктов меню
        const backCommand = (menuItemCount + 1).toString();
        
        if (command === backCommand) {
            showMainMenu();
            return;
        }
        
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
            default:
                showMessage(`Введите цифру от 1 до ${backCommand}`, 'error');
        }
    }
    
    function startSearch(type) {
        clearOutput();
        currentMenu = 'search';
        searchType = type;
        menuItemCount = 0; // Сбрасываем счетчик
        
        const prompts = {
            'phone': 'Введите номер телефона:',
            'telegram': 'Введите Telegram юзернейм:',
            'vk': 'Введите VK ID:',
            'name': 'Введите ФИО:'
        };
        
        showMessage(prompts[type], '');
        showBackButton(); // Будет [1. НАЗАД] так как только один пункт
    }
    
    function handleSearch(query) {
        // Проверяем, не является ли команда кнопкой "Назад"
        const backCommand = (menuItemCount + 1).toString();
        if (query === backCommand) {
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
        }, 1500); // Уменьшил время анимации
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
        
        setTimeout(() => clearInterval(interval), 1500);
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
    }
    
    function showResult(record) {
        currentMenu = 'view_result';
        menuItemCount = 1; // Уже есть один пункт (доп. инфа)
        
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
        
        let additionalHTML = '<div style="color:#0af;">════════════════════════════════</div>';
        additionalHTML += '<div class="result-data">ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ:</div>';
        
        if (record.other && record.other.length > 0) {
            record.other.forEach((item, index) => {
                additionalHTML += `<div class="result-data">${index + 1}. ${item.key}: ${item.value}</div>`;
            });
        } else {
            additionalHTML += '<div class="result-data">Нет дополнительной информации</div>';
        }
        
        additionalHTML += '<div style="color:#0af;">════════════════════════════════</div>';
        
        additionalInfoDiv.innerHTML = additionalHTML;
        
        resultDiv.innerHTML = basicInfo;
        output.appendChild(resultDiv);
        output.appendChild(additionalInfoDiv);
        
        showMenuOption('[ 2. ДОП ИНФА ]');
        showBackButton(); // Будет [3. НАЗАД]
    }
    
    function handleViewResult(command) {
        const backCommand = (menuItemCount + 1).toString();
        
        if (command === backCommand) {
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
        menuItemCount = 0;
        
        showMessage('[ СИСТЕМА ВЗЛОМА WIFI ]', '');
        showMessage('Введите BSSID сети WiFi:', '');
        showBackButton();
    }
    
    function handleHack(bssid) {
        const backCommand = (menuItemCount + 1).toString();
        
        if (bssid === backCommand) {
            showMainMenu();
            return;
        }
        
        showBinaryAnimation('Взлом WiFi...', 5000); // Уменьшил время до 5 секунд
    }
    
    function showDoxMenu() {
        clearOutput();
        currentMenu = 'dox';
        menuItemCount = 0;
        
        showMessage('[ СИСТЕМА ДОКСИНГА ]', '');
        showMessage('Введите данные цели:', '');
        showBackButton();
    }
    
    function handleDox(data) {
        const backCommand = (menuItemCount + 1).toString();
        
        if (data === backCommand) {
            showMainMenu();
            return;
        }
        
        showBinaryAnimation('Доксинг цели...', 5000); // Уменьшил время до 5 секунд
    }
    
    function showTgHackMenu() {
        clearOutput();
        currentMenu = 'tghack';
        menuItemCount = 0;
        
        showMessage('[ СИСТЕМА СНОСА ТГ АККАУНТОВ ]', '');
        showMessage('Введите username или номер телефона:', '');
        showBackButton();
    }
    
    function handleTgHack(target) {
        const backCommand = (menuItemCount + 1).toString();
        
        if (target === backCommand) {
            showMainMenu();
            return;
        }
        
        showBinaryAnimation('Снос Telegram аккаунта...', 5000); // Уменьшил время до 5 секунд
    }
    
    function showBinaryAnimation(message, duration) {
        clearOutput();
        showMessage('🚀 ' + message, '');
        
        // Создаем контейнер для анимации
        const hackContainer = document.createElement('div');
        hackContainer.className = 'hack-container';
        
        const binaryStream = document.createElement('div');
        binaryStream.className = 'binary-stream';
        
        // Генерируем двоичный код - УПРОЩЕННАЯ ВЕРСИЯ
        let binaryText = '';
        // Значительно уменьшаем количество строк
        for (let i = 0; i < 50; i++) {
            let line = '';
            for (let j = 0; j < 60; j++) {
                line += Math.round(Math.random());
            }
            binaryText += line + '\n';
        }
        
        // Используем один текстовый блок вместо тысяч span'ов
        binaryStream.textContent = binaryText;
        
        hackContainer.appendChild(binaryStream);
        output.appendChild(hackContainer);
        
        // Показываем сообщение сразу, а не после долгой задержки
        setTimeout(() => {
            clearOutput();
            showMessage('❌ Операция не удалась', 'error');
            showMessage('Причина: Защита системы слишком сильна', '');
            showMessage('Рекомендация: Попробуйте другой метод', '');
            showBackButton();
        }, duration);
    }
    
    function showMenuOption(text) {
        const option = document.createElement('div');
        option.className = 'menu-item';
        option.textContent = text;
        option.style.animationDelay = '0s';
        option.style.animation = 'typewrite 0.3s steps(20) forwards';
        option.style.color = '#0af';
        output.appendChild(option);
        
        // Увеличиваем счетчик пунктов меню
        menuItemCount++;
        scrollToBottom();
    }
    
    function showBackButton() {
        const backBtn = document.createElement('div');
        backBtn.className = 'back-btn';
        // Используем динамический номер на основе текущего количества пунктов
        const backNumber = menuItemCount + 1;
        backBtn.textContent = `[ ${backNumber}. НАЗАД ]`;
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