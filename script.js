// CYBER SCOUT - Advanced Intelligence Platform
// Real-time Intelligence Gathering System

// Глобальные переменные
let currentTarget = null;
let scanInProgress = false;
let terminalHistory = [];
let scanCount = 0;
let progressInterval = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('CYBER SCOUT v4.2 Initialized');
    
    initTerminal();
    updateTime();
    loadDatabaseInfo();
    setupEventListeners();
    
    // Показываем приветственное сообщение
    setTimeout(() => {
        terminalWrite('$ Initializing system components... OK', 'system');
        terminalWrite('$ Loading intelligence modules... OK', 'system');
        terminalWrite('$ Connecting to databases... OK', 'system');
        terminalWrite('$ System ready for operations', 'success');
        terminalWrite('$ Type "help" for available commands', 'info');
    }, 1000);
    
    // Обновляем время каждую секунду
    setInterval(updateTime, 1000);
});

// Инициализация терминала
function initTerminal() {
    const terminal = document.getElementById('terminalOutput');
    terminal.innerHTML = '';
    
    const welcome = `
<span class="prompt">$</span> ██████╗██╗   ██╗██████╗ ███████╗██████╗ 
<span class="prompt">$</span> ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗
<span class="prompt">$</span> ██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝
<span class="prompt">$</span> ██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗
<span class="prompt">$</span> ╚██████╗   ██║   ██████╔╝███████╗██║  ██║
<span class="prompt">$</span>  ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝
<span class="prompt">$</span> 
<span class="prompt">$</span> Advanced Intelligence Platform v4.2
<span class="prompt">$</span> ========================================
<span class="prompt">$</span> System initialized... Type 'help' for commands
`;
    
    terminal.innerHTML = welcome;
}

// Обновление времени
function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ru-RU', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('currentTime').textContent = timeStr;
}

// Загрузка информации о базе данных
function loadDatabaseInfo() {
    // Информация будет загружена из data.js
    document.getElementById('dbSize').textContent = 'Loading...';
    
    setTimeout(() => {
        if (typeof CyberDatabase !== 'undefined') {
            const totalRecords = CyberDatabase.users.length + 
                               CyberDatabase.breaches.length + 
                               CyberDatabase.phones.length;
            document.getElementById('dbSize').textContent = `${totalRecords.toLocaleString()} records`;
        } else {
            document.getElementById('dbSize').textContent = '2.7B records';
        }
    }, 500);
}

// Настройка слушателей событий
function setupEventListeners() {
    // Переключение вкладок
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            switchTab(tabId);
        });
    });
    
    // Горячие клавиши
    document.addEventListener('keydown', function(e) {
        // Ctrl + Enter - запуск полного сканирования
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            startFullScan();
        }
        
        // Ctrl + L - очистка терминала
        if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            clearTerminal();
        }
        
        // Tab - автодополнение
        if (e.key === 'Tab') {
            e.preventDefault();
            autoComplete();
        }
    });
    
    // Фокус на поле ввода терминала
    document.getElementById('terminalInput').focus();
}

// Переключение вкладок
function switchTab(tabId) {
    // Обновление активной вкладки
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
    
    // Показ соответствующего контента
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabId}-tab`).classList.add('active');
}

// Запись в терминал
function terminalWrite(message, type = 'normal') {
    const terminal = document.getElementById('terminalOutput');
    const prompt = '<span class="prompt">$</span> ';
    
    let formattedMessage = message;
    if (type === 'success') {
        formattedMessage = `<span style="color: #00ff41;">${message}</span>`;
    } else if (type === 'error') {
        formattedMessage = `<span style="color: #ff003c;">${message}</span>`;
    } else if (type === 'warning') {
        formattedMessage = `<span style="color: #ffd300;">${message}</span>`;
    } else if (type === 'info') {
        formattedMessage = `<span style="color: #0088ff;">${message}</span>`;
    } else if (type === 'system') {
        formattedMessage = `<span style="color: #9d00ff;">${message}</span>`;
    }
    
    terminal.innerHTML += prompt + formattedMessage + '\n';
    terminal.scrollTop = terminal.scrollHeight;
    
    // Сохраняем в историю
    terminalHistory.push(message);
    if (terminalHistory.length > 1000) {
        terminalHistory.shift();
    }
}

// Очистка терминала
function clearTerminal() {
    document.getElementById('terminalOutput').innerHTML = '';
    terminalWrite('Terminal cleared', 'system');
}

// Копирование терминала
function copyTerminal() {
    const terminal = document.getElementById('terminalOutput');
    const text = terminal.textContent;
    
    navigator.clipboard.writeText(text)
        .then(() => {
            terminalWrite('Terminal output copied to clipboard', 'success');
        })
        .catch(() => {
            terminalWrite('Failed to copy terminal output', 'error');
        });
}

// Переключение режима терминала
function toggleTerminal() {
    const terminal = document.querySelector('.terminal-container');
    terminal.classList.toggle('maximized');
}

// Обработка нажатия Enter в терминале
function handleTerminalEnter(event) {
    if (event.key === 'Enter') {
        executeCommand();
    }
}

// Выполнение команды
function executeCommand() {
    const input = document.getElementById('terminalInput');
    const command = input.value.trim();
    
    if (!command) return;
    
    // Отображаем команду в терминале
    terminalWrite(`root@cyber:~# ${command}`, 'normal');
    
    // Обработка команд
    processCommand(command.toLowerCase());
    
    // Очищаем поле ввода
    input.value = '';
    
    // Возвращаем фокус
    input.focus();
}

// Обработка команд
function processCommand(command) {
    const args = command.split(' ');
    const cmd = args[0];
    
    switch(cmd) {
        case 'help':
            showHelp();
            break;
        case 'scan':
            if (args[1]) {
                startTargetScan(args[1]);
            } else {
                startFullScan();
            }
            break;
        case 'clear':
            clearTerminal();
            break;
        case 'status':
            showStatus();
            break;
        case 'search':
            if (args[1]) {
                searchDatabase(args.slice(1).join(' '));
            } else {
                terminalWrite('Usage: search [query]', 'error');
            }
            break;
        case 'dbinfo':
            showDatabaseInfo();
            break;
        case 'export':
            generateReport();
            break;
        case 'geo':
            if (args[1]) {
                geoLocateTarget(args[1]);
            } else {
                terminalWrite('Usage: geo [ip/phone]', 'error');
            }
            break;
        case 'breach':
            checkBreachCommand(args.slice(1).join(' '));
            break;
        case 'social':
            scanSocial();
            break;
        case 'network':
            networkScan();
            break;
        case 'relatives':
            findRelatives();
            break;
        case 'passwords':
            checkPasswords();
            break;
        case 'documents':
            scanDocuments();
            break;
        default:
            terminalWrite(`Command not found: ${cmd}`, 'error');
            terminalWrite('Type "help" for available commands', 'info');
    }
}

// Показать справку
function showHelp() {
    terminalWrite('Available commands:', 'info');
    terminalWrite('  scan [target]      - Start intelligence scan', 'normal');
    terminalWrite('  search [query]     - Search in database', 'normal');
    terminalWrite('  breach [email/phone] - Check for data breaches', 'normal');
    terminalWrite('  geo [ip/phone]     - Geolocation lookup', 'normal');
    terminalWrite('  social             - Scan social networks', 'normal');
    terminalWrite('  network            - Network analysis', 'normal');
    terminalWrite('  relatives          - Find relatives', 'normal');
    terminalWrite('  passwords          - Password audit', 'normal');
    terminalWrite('  documents          - Document search', 'normal');
    terminalWrite('  status             - System status', 'normal');
    terminalWrite('  dbinfo             - Database information', 'normal');
    terminalWrite('  export             - Generate report', 'normal');
    terminalWrite('  clear              - Clear terminal', 'normal');
    terminalWrite('  help               - Show this help', 'normal');
}

// Показать статус системы
function showStatus() {
    terminalWrite('System Status:', 'info');
    terminalWrite(`  Database: ${document.getElementById('dbSize').textContent}`, 'normal');
    terminalWrite(`  Scans Today: ${scanCount}`, 'normal');
    terminalWrite('  Connection: Secure', 'success');
    terminalWrite('  Response Time: < 1.2s', 'normal');
    terminalWrite('  Uptime: 99.8%', 'success');
}

// Показать информацию о базе данных
function showDatabaseInfo() {
    if (typeof CyberDatabase !== 'undefined') {
        terminalWrite('Database Information:', 'info');
        terminalWrite(`  Users: ${CyberDatabase.users.length.toLocaleString()} records`, 'normal');
        terminalWrite(`  Breaches: ${CyberDatabase.breaches.length.toLocaleString()} records`, 'normal');
        terminalWrite(`  Phones: ${CyberDatabase.phones.length.toLocaleString()} records`, 'normal');
        terminalWrite(`  Last Update: Today 04:30`, 'normal');
    } else {
        terminalWrite('Database not loaded', 'error');
    }
}

// Поиск в базе данных
function searchDatabase(query) {
    if (!query || query.length < 2) {
        terminalWrite('Query too short. Minimum 2 characters required.', 'error');
        return;
    }
    
    terminalWrite(`Searching for "${query}"...`, 'system');
    startProgress('Searching databases', 70);
    
    setTimeout(() => {
        let results = [];
        
        // Ищем в базе данных
        if (typeof CyberDatabase !== 'undefined') {
            // Поиск по пользователям
            CyberDatabase.users.forEach(user => {
                if (JSON.stringify(user).toLowerCase().includes(query.toLowerCase())) {
                    results.push({ type: 'user', data: user });
                }
            });
            
            // Поиск по утечкам
            CyberDatabase.breaches.forEach(breach => {
                if (JSON.stringify(breach).toLowerCase().includes(query.toLowerCase())) {
                    results.push({ type: 'breach', data: breach });
                }
            });
            
            // Поиск по телефонам
            CyberDatabase.phones.forEach(phone => {
                if (JSON.stringify(phone).toLowerCase().includes(query.toLowerCase())) {
                    results.push({ type: 'phone', data: phone });
                }
            });
        }
        
        if (results.length > 0) {
            stopProgress();
            terminalWrite(`Found ${results.length} results:`, 'success');
            
            results.slice(0, 5).forEach(result => {
                if (result.type === 'user') {
                    terminalWrite(`  User: ${result.data.username} | ${result.data.email}`, 'normal');
                } else if (result.type === 'breach') {
                    terminalWrite(`  Breach: ${result.data.email} | ${result.data.source}`, 'warning');
                } else if (result.type === 'phone') {
                    terminalWrite(`  Phone: ${result.data.number} | ${result.data.owner}`, 'normal');
                }
            });
            
            if (results.length > 5) {
                terminalWrite(`  ... and ${results.length - 5} more results`, 'info');
            }
        } else {
            stopProgress();
            terminalWrite('No results found', 'warning');
        }
    }, 1500);
}

// Проверка утечек
function checkBreachCommand(query) {
    if (!query) {
        terminalWrite('Usage: breach [email/phone]', 'error');
        return;
    }
    
    terminalWrite(`Checking breaches for: ${query}`, 'system');
    startProgress('Querying breach databases', 80);
    
    setTimeout(() => {
        let found = false;
        
        if (typeof CyberDatabase !== 'undefined') {
            // Ищем в утечках
            CyberDatabase.breaches.forEach(breach => {
                if (breach.email === query || breach.phone === query) {
                    found = true;
                    terminalWrite(`FOUND in breach: ${breach.source}`, 'error');
                    terminalWrite(`  Date: ${breach.date}`, 'normal');
                    terminalWrite(`  Data: ${breach.data}`, 'normal');
                }
            });
        }
        
        if (!found) {
            terminalWrite('No breaches found', 'success');
        }
        
        stopProgress();
    }, 2000);
}

// Геолокация цели
function geoLocateTarget(target) {
    terminalWrite(`Geolocating: ${target}`, 'system');
    startProgress('Tracking location', 60);
    
    setTimeout(() => {
        // Генерируем случайные координаты
        const cities = [
            { city: 'Moscow', country: 'Russia', lat: '55.7558° N', lon: '37.6173° E', isp: 'Rostelecom' },
            { city: 'Saint Petersburg', country: 'Russia', lat: '59.9343° N', lon: '30.3351° E', isp: 'ER-Telecom' },
            { city: 'Kyiv', country: 'Ukraine', lat: '50.4501° N', lon: '30.5234° E', isp: 'Kyivstar' },
            { city: 'Minsk', country: 'Belarus', lat: '53.9045° N', lon: '27.5615° E', isp: 'Beltelecom' },
            { city: 'Astana', country: 'Kazakhstan', lat: '51.1694° N', lon: '71.4491° E', isp: 'Kazakhtelecom' }
        ];
        
        const location = cities[Math.floor(Math.random() * cities.length)];
        
        terminalWrite('Location found:', 'success');
        terminalWrite(`  City: ${location.city}`, 'normal');
        terminalWrite(`  Country: ${location.country}`, 'normal');
        terminalWrite(`  Coordinates: ${location.lat}, ${location.lon}`, 'normal');
        terminalWrite(`  ISP: ${location.isp}`, 'normal');
        terminalWrite(`  Accuracy: ±50 meters`, 'info');
        
        stopProgress();
    }, 1800);
}

// ================== ОСНОВНЫЕ ФУНКЦИИ ==================

// Запуск полного сканирования
function startFullScan() {
    if (scanInProgress) {
        terminalWrite('Scan already in progress', 'warning');
        return;
    }
    
    // Получаем данные из полей ввода
    const username = document.getElementById('inputUsername').value.trim();
    const email = document.getElementById('inputEmail').value.trim();
    const phone = document.getElementById('inputPhone').value.trim();
    const telegram = document.getElementById('inputTelegram').value.trim();
    const vk = document.getElementById('inputVK').value.trim();
    
    if (!username && !email && !phone && !telegram && !vk) {
        terminalWrite('Please enter at least one search parameter', 'error');
        return;
    }
    
    // Устанавливаем цель
    currentTarget = {
        username: username || 'Unknown',
        email: email || 'Unknown',
        phone: phone || 'Unknown',
        telegram: telegram || 'Unknown',
        vk: vk || 'Unknown',
        timestamp: new Date().toISOString()
    };
    
    // Начинаем сканирование
    scanInProgress = true;
    scanCount++;
    document.getElementById('scanCount').textContent = scanCount;
    
    terminalWrite('========== STARTING FULL INTELLIGENCE SCAN ==========', 'system');
    terminalWrite(`Target: ${username || email || phone || telegram || vk}`, 'info');
    terminalWrite(`Time: ${new Date().toLocaleTimeString()}`, 'info');
    terminalWrite('====================================================', 'system');
    
    startProgress('Initializing scan', 100);
    
    // Симуляция процесса сканирования
    simulateScanProcess();
}

// Симуляция процесса сканирования
function simulateScanProcess() {
    const steps = [
        { delay: 500, message: 'Connecting to intelligence network...', progress: 10 },
        { delay: 800, message: 'Querying user databases...', progress: 20 },
        { delay: 1200, message: 'Searching social networks...', progress: 30 },
        { delay: 900, message: 'Analyzing public records...', progress: 40 },
        { delay: 1500, message: 'Checking breach databases...', progress: 50 },
        { delay: 1100, message: 'Geolocation tracking...', progress: 60 },
        { delay: 1300, message: 'Network analysis...', progress: 70 },
        { delay: 1000, message: 'Aggregating results...', progress: 80 },
        { delay: 1400, message: 'Generating report...', progress: 90 },
        { delay: 500, message: 'Scan complete!', progress: 100 }
    ];
    
    let currentStep = 0;
    
    function executeStep() {
        if (currentStep >= steps.length) {
            completeScan();
            return;
        }
        
        const step = steps[currentStep];
        
        setTimeout(() => {
            terminalWrite(step.message, 'system');
            updateProgress(step.progress);
            currentStep++;
            executeStep();
        }, step.delay);
    }
    
    executeStep();
}

// Завершение сканирования
function completeScan() {
    stopProgress();
    scanInProgress = false;
    
    // Генерируем результаты
    generateResults();
    
    terminalWrite('====================================================', 'system');
    terminalWrite('SCAN COMPLETED SUCCESSFULLY', 'success');
    terminalWrite('Results have been updated in the panels', 'info');
    terminalWrite('Type "export" to generate full report', 'info');
}

// Генерация результатов
function generateResults() {
    if (!currentTarget) return;
    
    // Генерация персональных данных
    generatePersonalData();
    
    // Генерация данных соцсетей
    generateSocialData();
    
    // Генерация контактов
    generateContactsData();
    
    // Генерация документов
    generateDocumentsData();
}

// Генерация персональных данных
function generatePersonalData() {
    const data = [
        { label: 'Full Name:', value: generateRandomName() },
        { label: 'Birth Date:', value: `${Math.floor(Math.random() * 28) + 1}.${Math.floor(Math.random() * 12) + 1}.${1980 + Math.floor(Math.random() * 30)}` },
        { label: 'Address:', value: generateRandomAddress() },
        { label: 'Passport:', value: `${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 900000) + 100000}` },
        { label: 'IPN:', value: `${Math.floor(Math.random() * 9000000000) + 1000000000}` },
        { label: 'Phone:', value: currentTarget.phone !== 'Unknown' ? currentTarget.phone : generateRandomPhone() },
        { label: 'Email:', value: currentTarget.email !== 'Unknown' ? currentTarget.email : generateRandomEmail() }
    ];
    
    const container = document.getElementById('personalData');
    container.innerHTML = '';
    
    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'data-item';
        div.innerHTML = `
            <span class="data-label">${item.label}</span>
            <span class="data-value">${item.value}</span>
        `;
        container.appendChild(div);
    });
}

// Генерация данных соцсетей
function generateSocialData() {
    const networks = [
        { name: 'VKontakte', icon: 'fab fa-vk', found: Math.random() > 0.2 },
        { name: 'Telegram', icon: 'fab fa-telegram', found: Math.random() > 0.1 },
        { name: 'Instagram', icon: 'fab fa-instagram', found: Math.random() > 0.3 },
        { name: 'Facebook', icon: 'fab fa-facebook', found: Math.random() > 0.4 },
        { name: 'Twitter', icon: 'fab fa-twitter', found: Math.random() > 0.5 },
        { name: 'Odnoklassniki', icon: 'fas fa-users', found: Math.random() > 0.6 },
        { name: 'GitHub', icon: 'fab fa-github', found: Math.random() > 0.7 },
        { name: 'LinkedIn', icon: 'fab fa-linkedin', found: Math.random() > 0.4 }
    ];
    
    const container = document.getElementById('socialData');
    container.innerHTML = '';
    
    networks.forEach(network => {
        if (network.found) {
            const div = document.createElement('div');
            div.className = 'social-item';
            div.innerHTML = `
                <i class="${network.icon}"></i>
                <span>${network.name}</span>
                <small>Profile found</small>
            `;
            container.appendChild(div);
        }
    });
    
    if (container.children.length === 0) {
        container.innerHTML = `
            <div class="social-item empty">
                <i class="fas fa-search"></i>
                <p>No social profiles found</p>
            </div>
        `;
    }
}

// Генерация контактов
function generateContactsData() {
    const contacts = [];
    const count = Math.floor(Math.random() * 5) + 2;
    
    for (let i = 0; i < count; i++) {
        contacts.push({
            name: generateRandomName(),
            relation: ['Relative', 'Friend', 'Colleague', 'Neighbor'][Math.floor(Math.random() * 4)],
            phone: generateRandomPhone()
        });
    }
    
    const container = document.getElementById('contactsData');
    container.innerHTML = '';
    
    contacts.forEach(contact => {
        const div = document.createElement('div');
        div.className = 'contact-item';
        div.innerHTML = `
            <strong>${contact.name}</strong>
            <div>${contact.relation} • ${contact.phone}</div>
        `;
        container.appendChild(div);
    });
}

// Генерация документов
function generateDocumentsData() {
    const documents = [];
    
    if (Math.random() > 0.3) documents.push('Passport scan.pdf');
    if (Math.random() > 0.4) documents.push('Driver license.jpg');
    if (Math.random() > 0.5) documents.push('Utility bill.docx');
    if (Math.random() > 0.6) documents.push('Bank statement.pdf');
    if (Math.random() > 0.7) documents.push('Employment contract.pdf');
    
    const container = document.getElementById('documentsData');
    container.innerHTML = '';
    
    if (documents.length > 0) {
        documents.forEach(doc => {
            const div = document.createElement('div');
            div.className = 'document-item';
            div.innerHTML = `
                <i class="fas fa-file-pdf"></i>
                <span>${doc}</span>
                <small>${Math.floor(Math.random() * 2) + 1} MB</small>
            `;
            container.appendChild(div);
        });
    } else {
        container.innerHTML = `
            <div class="document-item empty">
                No documents found
            </div>
        `;
    }
}

// ================== БЫСТРЫЕ ФУНКЦИИ ==================

// Сканирование соцсетей
function scanSocial() {
    terminalWrite('Starting social network scan...', 'system');
    startProgress('Scanning social networks', 60);
    
    setTimeout(() => {
        terminalWrite('Scanning VKontakte... Found profile', 'success');
        terminalWrite('Scanning Telegram... Found account', 'success');
        terminalWrite('Scanning Instagram... Profile private', 'warning');
        terminalWrite('Scanning Facebook... Found 3 accounts', 'success');
        terminalWrite('Scanning Odnoklassniki... Found profile', 'success');
        
        stopProgress();
        terminalWrite('Social scan completed', 'info');
        
        // Обновляем вкладку соцсетей
        switchTab('social');
    }, 2000);
}

// Проверка утечек
function scanBreaches() {
    const email = document.getElementById('inputEmail').value.trim();
    const phone = document.getElementById('inputPhone').value.trim();
    
    if (!email && !phone) {
        terminalWrite('Please enter email or phone for breach check', 'error');
        return;
    }
    
    terminalWrite(`Checking breaches for ${email || phone}...`, 'system');
    startProgress('Querying breach databases', 70);
    
    setTimeout(() => {
        if (Math.random() > 0.4) {
            const breaches = ['Collection #1', 'AntiPublic', 'VK 2021', 'Facebook 2019'];
            const foundBreaches = breaches.slice(0, Math.floor(Math.random() * 3) + 1);
            
            terminalWrite('BREACHES FOUND:', 'error');
            foundBreaches.forEach(breach => {
                terminalWrite(`  • ${breach} (${2018 + Math.floor(Math.random() * 5)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')})`, 'warning');
            });
        } else {
            terminalWrite('No breaches found', 'success');
        }
        
        stopProgress();
    }, 1800);
}

// Геолокация
function geoLocate() {
    const phone = document.getElementById('inputPhone').value.trim();
    const ip = generateRandomIP();
    
    terminalWrite(`Geolocating ${phone || ip}...`, 'system');
    startProgress('Tracking location', 65);
    
    setTimeout(() => {
        const cities = ['Moscow', 'Saint Petersburg', 'Kyiv', 'Minsk', 'Astana'];
        const city = cities[Math.floor(Math.random() * cities.length)];
        
        terminalWrite('Location identified:', 'success');
        terminalWrite(`  City: ${city}`, 'normal');
        terminalWrite(`  Coordinates: ${55 + Math.random() * 5}° N, ${35 + Math.random() * 10}° E`, 'normal');
        terminalWrite(`  Accuracy: ±${Math.floor(Math.random() * 100) + 20} meters`, 'info');
        
        stopProgress();
    }, 1600);
}

// Сетевой анализ
function networkScan() {
    terminalWrite('Starting network analysis...', 'system');
    startProgress('Scanning network', 75);
    
    setTimeout(() => {
        terminalWrite('Analyzing IP addresses...', 'system');
        terminalWrite('Scanning open ports...', 'system');
        terminalWrite('Checking for vulnerabilities...', 'system');
        
        const ports = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 993, 995, 3306, 3389];
        const openPorts = ports.filter(() => Math.random() > 0.6);
        
        if (openPorts.length > 0) {
            terminalWrite(`Open ports found: ${openPorts.join(', ')}`, 'warning');
        } else {
            terminalWrite('No open ports found', 'success');
        }
        
        if (Math.random() > 0.7) {
            terminalWrite('VULNERABILITY DETECTED: CVE-2024-12345', 'error');
        }
        
        stopProgress();
    }, 2200);
}

// Поиск родственников
function findRelatives() {
    terminalWrite('Searching for relatives...', 'system');
    startProgress('Analyzing family connections', 55);
    
    setTimeout(() => {
        const relatives = [];
        const count = Math.floor(Math.random() * 4) + 1;
        
        for (let i = 0; i < count; i++) {
            relatives.push({
                name: generateRandomName(),
                relation: ['Mother', 'Father', 'Sister', 'Brother', 'Wife', 'Husband'][Math.floor(Math.random() * 6)],
                age: 25 + Math.floor(Math.random() * 50)
            });
        }
        
        terminalWrite('Relatives found:', 'success');
        relatives.forEach(relative => {
            terminalWrite(`  • ${relative.name} (${relative.relation}, ${relative.age} years)`, 'normal');
        });
        
        stopProgress();
        
        // Обновляем вкладку контактов
        switchTab('contacts');
    }, 1900);
}

// Проверка паролей
function checkPasswords() {
    terminalWrite('Starting password audit...', 'system');
    startProgress('Checking password security', 70);
    
    setTimeout(() => {
        terminalWrite('Querying password databases...', 'system');
        terminalWrite('Analyzing password strength...', 'system');
        
        if (Math.random() > 0.5) {
            terminalWrite('WEAK PASSWORDS FOUND:', 'error');
            terminalWrite('  • "password123" - Found in 3 breaches', 'warning');
            terminalWrite('  • "qwerty123" - Found in 2 breaches', 'warning');
            terminalWrite('  • "admin123" - Found in 1 breach', 'warning');
        } else {
            terminalWrite('No weak passwords found', 'success');
        }
        
        stopProgress();
    }, 2100);
}

// Поиск документов
function scanDocuments() {
    terminalWrite('Searching for documents...', 'system');
    startProgress('Scanning document databases', 60);
    
    setTimeout(() => {
        const docs = [];
        if (Math.random() > 0.3) docs.push('Passport');
        if (Math.random() > 0.4) docs.push('Driver License');
        if (Math.random() > 0.5) docs.push('Utility Bill');
        if (Math.random() > 0.6) docs.push('Bank Statement');
        
        if (docs.length > 0) {
            terminalWrite('Documents found:', 'success');
            docs.forEach(doc => {
                terminalWrite(`  • ${doc} (${Math.floor(Math.random() * 2) + 1} MB)`, 'normal');
            });
        } else {
            terminalWrite('No documents found', 'info');
        }
        
        stopProgress();
        
        // Обновляем вкладку документов
        switchTab('documents');
    }, 1700);
}

// Глубокое сканирование
function deepScan() {
    terminalWrite('========== DEEP SCAN INITIATED ==========', 'system');
    terminalWrite('Warning: This scan uses advanced techniques', 'warning');
    terminalWrite('=========================================', 'system');
    
    startFullScan();
}

// Генерация отчета
function generateReport() {
    if (!currentTarget) {
        terminalWrite('No target data available. Run scan first.', 'error');
        return;
    }
    
    terminalWrite('Generating intelligence report...', 'system');
    startProgress('Compiling report', 85);
    
    setTimeout(() => {
        const reportId = `REPORT-${Date.now().toString(36).toUpperCase()}`;
        
        terminalWrite('Report generated successfully:', 'success');
        terminalWrite(`  Report ID: ${reportId}`, 'normal');
        terminalWrite(`  File: intelligence_report_${reportId}.pdf`, 'normal');
        terminalWrite(`  Size: ${Math.floor(Math.random() * 5) + 2} MB`, 'normal');
        terminalWrite('  Download link: [CLICK TO DOWNLOAD]', 'info');
        
        // Создаем ссылку для скачивания
        const blob = new Blob([`Intelligence Report ${reportId}\n\nTarget: ${JSON.stringify(currentTarget, null, 2)}`], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `intelligence_report_${reportId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        stopProgress();
    }, 2500);
}

// Очистка полей ввода
function clearInputs() {
    document.getElementById('inputUsername').value = '';
    document.getElementById('inputEmail').value = '';
    document.getElementById('inputPhone').value = '';
    document.getElementById('inputTelegram').value = '';
    document.getElementById('inputVK').value = '';
    
    terminalWrite('Input fields cleared', 'system');
}

// ================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==================

// Запуск прогресс-бара
function startProgress(message, maxProgress = 100) {
    stopProgress();
    
    document.getElementById('progressText').textContent = message;
    document.querySelector('.progress-fill').style.width = '0%';
    
    let progress = 0;
    progressInterval = setInterval(() => {
        progress += Math.random() * 3;
        if (progress > maxProgress) progress = maxProgress;
        
        document.querySelector('.progress-fill').style.width = progress + '%';
        
        if (progress >= maxProgress) {
            clearInterval(progressInterval);
        }
    }, 100);
}

// Обновление прогресса
function updateProgress(value) {
    document.querySelector('.progress-fill').style.width = value + '%';
    document.getElementById('progressText').textContent = `${value}% complete`;
}

// Остановка прогресс-бара
function stopProgress() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
    document.getElementById('progressText').textContent = 'Ready';
}

// Генерация случайного имени
function generateRandomName() {
    const firstNames = ['Ivan', 'Sergey', 'Alexey', 'Dmitry', 'Andrey', 'Mikhail', 'Vladimir', 'Nikolay'];
    const lastNames = ['Ivanov', 'Petrov', 'Sidorov', 'Smirnov', 'Kuznetsov', 'Popov', 'Volkov', 'Kozlov'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

// Генерация случайного адреса
function generateRandomAddress() {
    const streets = ['Lenina', 'Gagarina', 'Pushkina', 'Lermontova', 'Sovetskaya', 'Kirova', 'Mira', 'Pobedy'];
    const cities = ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Kazan', 'Nizhny Novgorod'];
    return `${Math.floor(Math.random() * 100) + 1} ${streets[Math.floor(Math.random() * streets.length)]} St., ${cities[Math.floor(Math.random() * cities.length)]}`;
}

// Генерация случайного телефона
function generateRandomPhone() {
    return `+7${Math.floor(Math.random() * 9000000000) + 1000000000}`;
}

// Генерация случайного email
function generateRandomEmail() {
    const domains = ['gmail.com', 'mail.ru', 'yandex.ru', 'rambler.ru', 'hotmail.com'];
    const name = ['ivanov', 'petrov', 'sidorov', 'smith', 'johnson'][Math.floor(Math.random() * 5)];
    const year = Math.floor(Math.random() * 30) + 80;
    return `${name}${year}@${domains[Math.floor(Math.random() * domains.length)]}`;
}

// Генерация случайного IP
function generateRandomIP() {
    return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// Автодополнение
function autoComplete() {
    const input = document.getElementById('terminalInput');
    const value = input.value.toLowerCase();
    
    const commands = ['help', 'scan', 'search', 'breach', 'geo', 'social', 'network', 'relatives', 'passwords', 'documents', 'status', 'dbinfo', 'export', 'clear'];
    
    const matches = commands.filter(cmd => cmd.startsWith(value));
    
    if (matches.length === 1) {
        input.value = matches[0];
    } else if (matches.length > 1) {
        terminalWrite('Possible completions:', 'info');
        matches.forEach(cmd => terminalWrite(`  ${cmd}`, 'normal'));
    }
}