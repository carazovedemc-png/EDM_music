// OS-01 SCOUT v3.0
// Cyber Intelligence System for OS-01 Simulation
// All data generated locally - No backend required

// Инициализация Telegram Web App
if (typeof Telegram !== 'undefined') {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    Telegram.WebApp.setHeaderColor('#0a0a0a');
    Telegram.WebApp.setBackgroundColor('#050505');
    Telegram.WebApp.enableClosingConfirmation();
}

// Глобальное состояние приложения
const OS01State = {
    target: null,
    scans: [],
    breaches: [],
    networkData: [],
    reports: [],
    currentTab: 'target'
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('OS-01 SCOUT v3.0 Initialized');
    console.log('Mode: Simulation | Environment: OS-01');
    
    initNavigation();
    initEventListeners();
    updateStatusDisplay();
    
    // Анимация пульсации
    setInterval(() => {
        document.querySelectorAll('.pulse-dot').forEach(dot => {
            dot.style.animation = 'none';
            setTimeout(() => {
                dot.style.animation = `pulse 2s infinite`;
            }, 10);
        });
    }, 5000);
});

// Инициализация навигации
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            switchTab(tabId);
        });
    });
    
    // Инициализация инструментов сети
    document.querySelectorAll('.tool').forEach(tool => {
        tool.addEventListener('click', function() {
            document.querySelectorAll('.tool').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Инициализация опций сканирования
    document.querySelectorAll('.scan-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.scan-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Инициализация опций отчетов
    document.querySelectorAll('.report-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.report-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Инициализация слушателей событий
function initEventListeners() {
    // Обработка Enter в полях ввода
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const tabId = OS01State.currentTab;
                if (tabId === 'target') setTarget();
                else if (tabId === 'osint') startOSINTScan();
                else if (tabId === 'breach') checkBreach();
                else if (tabId === 'geo') geoLocate();
                else if (tabId === 'network') startNetworkScan();
            }
        });
    });
    
    // Горячие клавиши
    document.addEventListener('keydown', function(e) {
        // Ctrl+Shift+S - Сохранить отчет
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            saveReport();
        }
        // Ctrl+Shift+C - Очистить все
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            clearAllData();
        }
    });
}

// Переключение вкладок
function switchTab(tabId) {
    // Обновить навигацию
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.nav-item[data-tab="${tabId}"]`).classList.add('active');
    
    // Скрыть все вкладки
    document.querySelectorAll('.cyber-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Показать выбранную вкладку
    document.getElementById(`${tabId}-tab`).classList.add('active');
    
    // Обновить состояние
    OS01State.currentTab = tabId;
    
    // Обновить превью цели
    if (OS01State.target) {
        updateTargetPreview();
    }
}

// Обновление дисплея статуса
function updateStatusDisplay() {
    const statusText = document.querySelector('.progress-text');
    if (statusText) {
        const statuses = [
            'СИСТЕМА ГОТОВА',
            'СКАНИРУЮ БАЗЫ ДАННЫХ',
            'АНАЛИЗИРУЮ СЕТЬ',
            'ПРОВЕРЯЮ УЯЗВИМОСТИ',
            'СОБИРАЮ OSINT ДАННЫЕ'
        ];
        let i = 0;
        setInterval(() => {
            statusText.textContent = statuses[i];
            i = (i + 1) % statuses.length;
        }, 3000);
    }
}

// ================== ФУНКЦИИ ЦЕЛИ ==================
function setTarget() {
    const username = document.getElementById('targetUsername').value.trim();
    const email = document.getElementById('targetEmail').value.trim();
    const phone = document.getElementById('targetPhone').value.trim();
    const socialId = document.getElementById('targetSocialId').value.trim();
    
    if (!username && !email && !phone && !socialId) {
        showNotification('ВВЕДИТЕ ХОТЯ БЫ ОДИН ПАРАМЕТР ЦЕЛИ', 'warning');
        return;
    }
    
    // Создание цели
    OS01State.target = {
        id: 'TARGET-' + Date.now().toString(36).toUpperCase(),
        username: username || 'N/A',
        email: email || 'N/A',
        phone: phone || 'N/A',
        socialId: socialId || 'N/A',
        timestamp: new Date().toISOString(),
        status: 'ACTIVE'
    };
    
    // Анимация установки цели
    const button = document.querySelector('.cyber-button.primary');
    button.innerHTML = '<i class="fas fa-check"></i> ЦЕЛЬ УСТАНОВЛЕНА';
    button.style.background = 'var(--gradient-primary)';
    
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-bullseye"></i> УСТАНОВИТЬ ЦЕЛЬ';
    }, 2000);
    
    // Обновить превью
    updateTargetPreview();
    
    showNotification(`ЦЕЛЬ УСТАНОВЛЕНА: ${username || email || phone || socialId}`, 'success');
    
    // Автоматически перейти к OSINT
    setTimeout(() => switchTab('osint'), 1000);
}

function updateTargetPreview() {
    const preview = document.getElementById('targetPreview');
    if (!preview || !OS01State.target) return;
    
    const content = preview.querySelector('.preview-content');
    content.innerHTML = `
        <div style="width: 100%;">
            <div class="preview-item">
                <span class="preview-label">ID ЦЕЛИ:</span>
                <span class="preview-value">${OS01State.target.id}</span>
            </div>
            <div class="preview-item">
                <span class="preview-label">USERNAME:</span>
                <span class="preview-value">${OS01State.target.username}</span>
            </div>
            <div class="preview-item">
                <span class="preview-label">EMAIL:</span>
                <span class="preview-value">${OS01State.target.email}</span>
            </div>
            <div class="preview-item">
                <span class="preview-label">ТЕЛЕФОН:</span>
                <span class="preview-value">${OS01State.target.phone}</span>
            </div>
            <div class="preview-item">
                <span class="preview-label">SOCIAL ID:</span>
                <span class="preview-value">${OS01State.target.socialId}</span>
            </div>
            <div class="preview-item">
                <span class="preview-label">СТАТУС:</span>
                <span class="preview-value" style="color: var(--cyber-primary);">АКТИВНА</span>
            </div>
        </div>
    `;
}

function clearTarget() {
    OS01State.target = null;
    document.getElementById('targetUsername').value = '';
    document.getElementById('targetEmail').value = '';
    document.getElementById('targetPhone').value = '';
    document.getElementById('targetSocialId').value = '';
    
    const preview = document.getElementById('targetPreview');
    if (preview) {
        preview.querySelector('.preview-content').innerHTML = `
            <div class="preview-item">
                <span class="preview-label">СТАТУС:</span>
                <span class="preview-value inactive">ЦЕЛЬ НЕ ОПРЕДЕЛЕНА</span>
            </div>
        `;
    }
    
    showNotification('ЦЕЛЬ ОЧИЩЕНА', 'info');
}

// ================== OSINT СКАН ==================
async function startOSINTScan() {
    if (!OS01State.target) {
        showNotification('СНАЧАЛА УСТАНОВИТЕ ЦЕЛЬ', 'warning');
        switchTab('target');
        return;
    }
    
    // Получить выбранные опции
    const selectedOption = document.querySelector('.scan-option.active');
    const scanType = selectedOption ? selectedOption.dataset.scan : 'all';
    
    // Запуск анимации прогресса
    const progressBar = document.getElementById('scanProgress');
    const statusText = document.getElementById('scanStatus');
    const resultsGrid = document.getElementById('osintResults');
    
    progressBar.style.width = '0%';
    statusText.textContent = 'ПОДГОТОВКА СКАНЕРА...';
    
    // Очистить предыдущие результаты
    resultsGrid.innerHTML = '';
    
    // Симуляция сканирования
    const steps = [
        {progress: 10, status: 'ПОДКЛЮЧЕНИЕ К БАЗАМ ДАННЫХ...'},
        {progress: 25, status: 'СКАНИРОВАНИЕ СОЦИАЛЬНЫХ СЕТЕЙ...'},
        {progress: 45, status: 'ПОИСК ПУБЛИЧНОЙ ИНФОРМАЦИИ...'},
        {progress: 65, status: 'АНАЛИЗ МЕТАДАННЫХ...'},
        {progress: 85, status: 'СБОР ФОТОГРАФИЙ И ВИДЕО...'},
        {progress: 100, status: 'СКАН ЗАВЕРШЕН'}
    ];
    
    for (let step of steps) {
        await simulateDelay(800 + Math.random() * 1200);
        progressBar.style.width = step.progress + '%';
        statusText.textContent = step.status;
        
        // Добавляем точки в конце статуса для анимации
        let dots = '';
        const interval = setInterval(() => {
            dots = dots.length < 3 ? dots + '.' : '';
            statusText.textContent = step.status + dots;
        }, 300);
        
        await simulateDelay(800);
        clearInterval(interval);
    }
    
    // Генерация результатов
    const results = generateOSINTResults(scanType);
    displayOSINTResults(results);
    
    // Сохранить скан в историю
    OS01State.scans.push({
        type: scanType,
        target: OS01State.target,
        results: results,
        timestamp: new Date().toISOString()
    });
    
    showNotification(`OSINT СКАН ЗАВЕРШЕН: ${results.length} РЕЗУЛЬТАТОВ`, 'success');
}

function generateOSINTResults(scanType) {
    const networks = {
        social: ['VKontakte', 'Telegram', 'Instagram'],
        telegram: ['Telegram'],
        instagram: ['Instagram'],
        github: ['GitHub'],
        all: ['VKontakte', 'Telegram', 'Instagram', 'GitHub', 'Facebook', 'Twitter', 'LinkedIn', 'TikTok']
    };
    
    const targetNetworks = networks[scanType] || networks.all;
    const results = [];
    
    targetNetworks.forEach(network => {
        // Симуляция вероятности находки
        if (Math.random() > 0.3) {
            const resultTypes = ['profile', 'photo', 'video', 'friend', 'group', 'message'];
            const type = resultTypes[Math.floor(Math.random() * resultTypes.length)];
            
            results.push({
                network: network,
                type: type,
                confidence: Math.floor(Math.random() * 40) + 60, // 60-100%
                details: generateNetworkDetails(network, type)
            });
        }
    });
    
    return results;
}

function generateNetworkDetails(network, type) {
    const details = {
        'VKontakte': {
            profile: `https://vk.com/id${Math.floor(Math.random() * 99999999)}`,
            photo: `${Math.floor(Math.random() * 50)} публичных фото`,
            video: `${Math.floor(Math.random() * 20)} видео`,
            friend: `${Math.floor(Math.random() * 500)} друзей`,
            group: `${Math.floor(Math.random() * 50)} групп`,
            message: 'Сообщения доступны (симуляция)'
        },
        'Telegram': {
            profile: `@user_${Math.random().toString(36).substr(2, 8)}`,
            photo: 'Фото профиля найдено',
            video: 'Медиафайлы доступны',
            friend: 'Контакты синхронизированы',
            group: `${Math.floor(Math.random() * 30)} чатов/каналов`,
            message: 'История сообщений (симуляция)'
        },
        'Instagram': {
            profile: `https://instagram.com/user_${Math.floor(Math.random() * 9999)}`,
            photo: `${Math.floor(Math.random() * 300)} постов`,
            video: `${Math.floor(Math.random() * 50)} историй`,
            friend: `${Math.floor(Math.random() * 1000)} подписчиков`,
            group: 'Прямые сообщения',
            message: 'Комментарии и лайки'
        }
    };
    
    return details[network]?.[type] || 'Данные найдены';
}

function displayOSINTResults(results) {
    const resultsGrid = document.getElementById('osintResults');
    
    if (results.length === 0) {
        resultsGrid.innerHTML = `
            <div class="empty-results">
                <i class="fas fa-ban"></i>
                <p>НИЧЕГО НЕ НАЙДЕНО</p>
                <small>Попробуйте другой метод сканирования</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    results.forEach(result => {
        const confidenceColor = result.confidence > 80 ? 'var(--cyber-primary)' : 
                               result.confidence > 60 ? 'var(--cyber-warning)' : 
                               'var(--cyber-danger)';
        
        html += `
            <div class="scan-result-card">
                <div class="result-header">
                    <div class="network-icon">
                        <i class="fab fa-${result.network.toLowerCase()}"></i>
                        <span>${result.network}</span>
                    </div>
                    <div class="confidence" style="color: ${confidenceColor}">
                        ${result.confidence}%
                    </div>
                </div>
                <div class="result-type">
                    <i class="fas fa-${getResultIcon(result.type)}"></i>
                    ${result.type.toUpperCase()}
                </div>
                <div class="result-details">
                    ${result.details}
                </div>
                <div class="result-timestamp">
                    ${new Date().toLocaleTimeString()}
                </div>
            </div>
        `;
    });
    
    // Добавляем стили для карточек результатов
    const style = document.createElement('style');
    style.textContent = `
        .scan-result-card {
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 15px;
            transition: all 0.3s ease;
        }
        .scan-result-card:hover {
            border-color: var(--cyber-primary);
            transform: translateY(-3px);
        }
        .result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .network-icon {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: bold;
        }
        .network-icon i {
            font-size: 1.2rem;
            color: var(--cyber-primary);
        }
        .confidence {
            font-weight: bold;
            font-size: 0.9rem;
        }
        .result-type {
            background: rgba(0, 255, 157, 0.1);
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 0.8rem;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            margin-bottom: 10px;
        }
        .result-details {
            color: var(--text-secondary);
            font-size: 0.9rem;
            margin-bottom: 10px;
            word-break: break-all;
        }
        .result-timestamp {
            font-size: 0.7rem;
            color: var(--text-secondary);
            text-align: right;
        }
    `;
    document.head.appendChild(style);
    
    resultsGrid.innerHTML = html;
}

function getResultIcon(type) {
    const icons = {
        'profile': 'user',
        'photo': 'camera',
        'video': 'video',
        'friend': 'user-friends',
        'group': 'users',
        'message': 'comment-alt'
    };
    return icons[type] || 'info-circle';
}

// ================== ПРОВЕРКА БАЗ ДАННЫХ ==================
function checkBreach() {
    const query = document.getElementById('breachQuery').value.trim();
    if (!query) {
        showNotification('ВВЕДИТЕ ДАННЫЕ ДЛЯ ПРОВЕРКИ', 'warning');
        return;
    }
    
    const resultsDiv = document.querySelector('.breach-result-content');
    resultsDiv.innerHTML = `
        <div class="breach-loading">
            <div class="loading-spinner"></div>
            <p>ПРОВЕРКА БАЗ ДАННЫХ...</p>
        </div>
    `;
    
    // Добавляем стили для загрузки
    const style = document.createElement('style');
    style.textContent = `
        .breach-loading {
            text-align: center;
            padding: 40px;
        }
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--border-color);
            border-top: 3px solid var(--cyber-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    // Симуляция проверки
    setTimeout(() => {
        const isFound = Math.random() > 0.5;
        const breachCount = isFound ? Math.floor(Math.random() * 5) + 1 : 0;
        
        if (isFound) {
            const breaches = [];
            const breachNames = ['Collection #1', 'AntiPublic', 'VK 2021', 'Telegram Scrape', 'Russian Leaks'];
            
            for (let i = 0; i < breachCount; i++) {
                breaches.push({
                    name: breachNames[i] || `Breach ${i+1}`,
                    date: `202${Math.floor(Math.random() * 4)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
                    records: Math.floor(Math.random() * 900000000) + 100000000
                });
            }
            
            displayBreachResults(true, breaches, query);
            OS01State.breaches.push({
                query: query,
                found: true,
                breaches: breaches,
                timestamp: new Date().toISOString()
            });
            
            showNotification(`НАЙДЕНО В ${breachCount} БАЗАХ ДАННЫХ`, 'danger');
        } else {
            displayBreachResults(false, [], query);
            showNotification('В БАЗАХ ДАННЫХ НЕ НАЙДЕНО', 'success');
        }
    }, 2000 + Math.random() * 2000);
}

function displayBreachResults(found, breaches, query) {
    const resultsDiv = document.querySelector('.breach-result-content');
    
    if (!found) {
        resultsDiv.innerHTML = `
            <div class="no-breach-found">
                <i class="fas fa-shield-alt" style="font-size: 3rem; color: var(--cyber-primary); margin-bottom: 15px;"></i>
                <h4>БЕЗОПАСНО</h4>
                <p>Запрос: <strong>${query}</strong></p>
                <p>Не найден в известных утечках баз данных</p>
                <small class="simulation-note">Симуляция OS-01</small>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="breach-found">
            <div class="breach-alert">
                <i class="fas fa-skull-crossbones"></i>
                <h4 style="color: var(--cyber-danger);">ОБНАРУЖЕНА УТЕЧКА!</h4>
                <p>Запрос: <strong>${query}</strong></p>
                <p>Найден в ${breaches.length} базах данных</p>
            </div>
            <div class="breach-list">
    `;
    
    breaches.forEach(breach => {
        html += `
            <div class="breach-item">
                <div class="breach-name">
                    <i class="fas fa-database"></i>
                    <span>${breach.name}</span>
                </div>
                <div class="breach-info">
                    <span>Дата: ${breach.date}</span>
                    <span>Записей: ${(breach.records / 1000000).toFixed(1)}M</span>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
            <div class="breach-recommendation">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Рекомендуется сменить пароли и включить 2FA</p>
            </div>
            <small class="simulation-note">Симуляция OS-01 - Данные сгенерированы локально</small>
        </div>
    `;
    
    resultsDiv.innerHTML = html;
    
    // Добавляем стили
    const style = document.createElement('style');
    style.textContent = `
        .breach-found {
            animation: fadeIn 0.5s ease;
        }
        .breach-alert {
            text-align: center;
            padding: 20px;
            background: rgba(255, 0, 64, 0.1);
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid var(--cyber-danger);
        }
        .breach-alert i {
            font-size: 2rem;
            color: var(--cyber-danger);
            margin-bottom: 10px;
        }
        .breach-list {
            margin: 20px 0;
        }
        .breach-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 5px;
            margin-bottom: 10px;
            border-left: 3px solid var(--cyber-danger);
        }
        .breach-name {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: bold;
        }
        .breach-name i {
            color: var(--cyber-primary);
        }
        .breach-info {
            display: flex;
            gap: 15px;
            font-size: 0.9rem;
            color: var(--text-secondary);
        }
        .breach-recommendation {
            background: rgba(255, 170, 0, 0.1);
            padding: 15px;
            border-radius: 5px;
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 20px 0;
            border: 1px solid var(--cyber-warning);
        }
        .breach-recommendation i {
            color: var(--cyber-warning);
        }
        .simulation-note {
            display: block;
            text-align: center;
            color: var(--text-secondary);
            font-size: 0.8rem;
            margin-top: 15px;
        }
        .no-breach-found {
            text-align: center;
            padding: 40px;
        }
    `;
    document.head.appendChild(style);
}

// ================== ГЕОЛОКАЦИЯ ==================
function geoLocate() {
    const ipInput = document.getElementById('ipAddress').value.trim();
    const ip = ipInput || generateRandomIP();
    
    // Обновить поля ввода
    document.getElementById('ipAddress').value = ip;
    
    // Симуляция геолокации
    const locations = [
        {city: 'МОСКВА', country: 'RUSSIA', lat: '55.7558° N', lon: '37.6173° E', isp: 'ROSTELECOM', tz: 'UTC+3'},
        {city: 'САНКТ-ПЕТЕРБУРГ', country: 'RUSSIA', lat: '59.9343° N', lon: '30.3351° E', isp: 'ER-TELECOM', tz: 'UTC+3'},
        {city: 'КИЕВ', country: 'UKRAINE', lat: '50.4501° N', lon: '30.5234° E', isp: 'KYIVSTAR', tz: 'UTC+2'},
        {city: 'МИНСК', country: 'BELARUS', lat: '53.9045° N', lon: '27.5615° E', isp: 'BELTELECOM', tz: 'UTC+3'},
        {city: 'АСТАНА', country: 'KAZAKHSTAN', lat: '51.1694° N', lon: '71.4491° E', isp: 'KAZAKHTELECOM', tz: 'UTC+6'}
    ];
    
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    // Обновить интерфейс
    document.getElementById('geoLat').textContent = location.lat;
    document.getElementById('geoLon').textContent = location.lon;
    document.getElementById('ispInfo').textContent = location.isp;
    document.getElementById('cityInfo').textContent = location.city;
    document.getElementById('countryInfo').textContent = location.country;
    document.getElementById('timezoneInfo').textContent = location.tz;
    
    // Анимация точки на карте
    const mapPoints = document.querySelectorAll('.map-point');
    mapPoints.forEach(point => point.style.display = 'none');
    
    const newPoint = document.createElement('div');
    newPoint.className = 'map-point';
    newPoint.style.cssText = `
        position: absolute;
        top: ${30 + Math.random() * 40}%;
        left: ${20 + Math.random() * 60}%;
        transform: translate(-50%, -50%);
    `;
    newPoint.innerHTML = `
        <div class="point-pulse"></div>
        <div class="point-label">${location.city}</div>
    `;
    
    document.querySelector('.map-placeholder').appendChild(newPoint);
    
    showNotification(`ГЕОЛОКАЦИЯ: ${location.city}, ${location.country}`, 'info');
}

function generateRandomIP() {
    return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// ================== СЕТЕВОЙ АНАЛИЗ ==================
function startNetworkScan() {
    const target = document.getElementById('networkTarget').value.trim();
    const tool = document.querySelector('.tool.active');
    const toolType = tool ? tool.dataset.tool : 'portscan';
    
    if (!target) {
        showNotification('ВВЕДИТЕ ЦЕЛЬ ДЛЯ СКАНИРОВАНИЯ', 'warning');
        return;
    }
    
    // Добавить команду в терминал
    addTerminalOutput(`> СКАНИРОВАНИЕ: ${target}`);
    addTerminalOutput(`> ИНСТРУМЕНТ: ${toolType.toUpperCase()}`);
    addTerminalOutput(`> ВРЕМЯ: ${new Date().toLocaleTimeString()}`);
    addTerminalOutput('================================');
    
    // Симуляция сканирования
    setTimeout(() => {
        const results = simulateNetworkScan(target, toolType);
        results.forEach(line => addTerminalOutput(line));
        
        // Сохранить в историю
        OS01State.networkData.push({
            target: target,
            tool: toolType,
            results: results,
            timestamp: new Date().toISOString()
        });
        
        showNotification(`СЕТЕВОЕ СКАНИРОВАНИЕ ЗАВЕРШЕНО`, 'success');
    }, 1000);
}

function simulateNetworkScan(target, toolType) {
    const results = [];
    
    if (toolType === 'portscan') {
        results.push('[*] Начинаю сканирование портов...');
        results.push('[*] Определяю активные хосты...');
        
        const ports = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 993, 995, 3306, 3389, 8080];
        ports.forEach(port => {
            if (Math.random() > 0.6) {
                results.push(`[+] Порт ${port}/tcp ОТКРЫТ`);
            }
        });
        
        results.push(`[*] Сканирование завершено: ${ports.filter(() => Math.random() > 0.6).length} открытых портов`);
    } 
    else if (toolType === 'whois') {
        results.push('[*] Запрос WHOIS информации...');
        results.push(`Домен: ${target}`);
        results.push(`Регистратор: REGISTRAR-RU (SIMULATED)`);
        results.push(`Дата создания: 202${Math.floor(Math.random() * 4)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`);
        results.push(`Дата окончания: 202${Math.floor(Math.random() * 4) + 4}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`);
        results.push(`NS серверы: ns1.${target}, ns2.${target}`);
    }
    else if (toolType === 'dns') {
        results.push('[*] DNS запросы...');
        results.push(`A запись: 192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`);
        results.push(`MX запись: mail.${target}`);
        results.push(`TXT запись: "v=spf1 include:${target} ~all"`);
        results.push(`CNAME: www.${target} -> ${target}`);
    }
    else if (toolType === 'ping') {
        results.push('[*] Ping sweep сети...');
        for (let i = 1; i <= 10; i++) {
            const ip = `192.168.1.${i}`;
            if (Math.random() > 0.3) {
                results.push(`[+] ${ip} активен (${Math.floor(Math.random() * 100) + 1}ms)`);
            }
        }
    }
    
    results.push('================================');
    results.push('[*] СИМУЛЯЦИЯ OS-01: Все данные сгенерированы локально');
    results.push('[*] Реальные системы не сканировались');
    
    return results;
}

function addTerminalOutput(text) {
    const terminal = document.getElementById('terminalOutput');
    terminal.textContent += '\n' + text;
    terminal.scrollTop = terminal.scrollHeight;
}

function clearTerminal() {
    document.getElementById('terminalOutput').textContent = `OS-01 NETWORK ANALYZER v2.1
================================
Система готова к сканированию.
Введите цель и выберите инструмент.
================================
> SYSTEM: SIMULATION MODE ACTIVE
> Все операции выполняются локально
> Данные генерируются в симуляции OS-01
================================`;
}

function copyTerminal() {
    const terminal = document.getElementById('terminalOutput');
    navigator.clipboard.writeText(terminal.textContent)
        .then(() => showNotification('ТЕРМИНАЛ СКОПИРОВАН В БУФЕР', 'success'))
        .catch(() => showNotification('ОШИБКА КОПИРОВАНИЯ', 'danger'));
}

// ================== ОТЧЕТЫ ==================
function generateReport() {
    if (!OS01State.target && OS01State.scans.length === 0 && OS01State.breaches.length === 0) {
        showNotification('НЕТ ДАННЫХ ДЛЯ ОТЧЕТА', 'warning');
        return;
    }
    
    const preview = document.getElementById('reportPreview');
    preview.innerHTML = `
        <div class="report-generating">
            <div class="report-spinner"></div>
            <p>ГЕНЕРАЦИЯ ОТЧЕТА...</p>
        </div>
    `;
    
    // Добавляем стили
    const style = document.createElement('style');
    style.textContent = `
        .report-generating {
            text-align: center;
            padding: 40px;
        }
        .report-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid var(--border-color);
            border-top: 3px solid var(--cyber-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
    `;
    document.head.appendChild(style);
    
    // Симуляция генерации отчета
    setTimeout(() => {
        const report = createReport();
        preview.innerHTML = report;
        
        // Сохранить отчет в историю
        OS01State.reports.push({
            content: report,
            timestamp: new Date().toISOString(),
            type: 'full'
        });
        
        showNotification('ОТЧЕТ СГЕНЕРИРОВАН', 'success');
    }, 2000);
}

function createReport() {
    const reportId = `REPORT-${Date.now().toString(36).toUpperCase()}`;
    let html = `
        <div class="report-content">
            <div class="report-header" style="border-bottom: 2px solid var(--cyber-primary); padding-bottom: 15px; margin-bottom: 20px;">
                <h3 style="color: var(--cyber-primary);">OS-01 SCOUT INTELLIGENCE REPORT</h3>
                <p style="color: var(--text-secondary);">ID: ${reportId} | ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="report-section">
                <h4 style="color: var(--cyber-secondary); margin-bottom: 10px;">
                    <i class="fas fa-crosshairs"></i> ЦЕЛЬ ОПЕРАЦИИ
                </h4>
                ${OS01State.target ? `
                    <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 5px;">
                        <p><strong>ID:</strong> ${OS01State.target.id}</p>
                        <p><strong>Username:</strong> ${OS01State.target.username}</p>
                        <p><strong>Email:</strong> ${OS01State.target.email}</p>
                        <p><strong>Phone:</strong> ${OS01State.target.phone}</p>
                        <p><strong>Social ID:</strong> ${OS01State.target.socialId}</p>
                    </div>
                ` : '<p>Цель не установлена</p>'}
            </div>
    `;
    
    if (OS01State.scans.length > 0) {
        html += `
            <div class="report-section">
                <h4 style="color: var(--cyber-secondary); margin: 20px 0 10px;">
                    <i class="fas fa-search"></i> OSINT СКАНЫ (${OS01State.scans.length})
                </h4>
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 5px;">
        `;
        
        OS01State.scans.forEach((scan, index) => {
            html += `
                <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid var(--border-color);">
                    <p><strong>Скан #${index + 1}:</strong> ${scan.type.toUpperCase()} - ${new Date(scan.timestamp).toLocaleString()}</p>
                    <p><small>Результатов: ${scan.results ? scan.results.length : 0}</small></p>
                </div>
            `;
        });
        
        html += `</div></div>`;
    }
    
    if (OS01State.breaches.length > 0) {
        html += `
            <div class="report-section">
                <h4 style="color: var(--cyber-danger); margin: 20px 0 10px;">
                    <i class="fas fa-database"></i> УТЕЧКИ ДАННЫХ (${OS01State.breaches.length})
                </h4>
                <div style="background: rgba(255,0,64,0.1); padding: 15px; border-radius: 5px; border: 1px solid var(--cyber-danger);">
        `;
        
        OS01State.breaches.forEach((breach, index) => {
            html += `
                <div style="margin-bottom: 10px;">
                    <p><strong>Проверка #${index + 1}:</strong> ${breach.query}</p>
                    <p><strong>Результат:</strong> ${breach.found ? 'НАЙДЕНО' : 'НЕ НАЙДЕНО'}</p>
                    ${breach.breaches ? `<p><small>Баз данных: ${breach.breaches.length}</small></p>` : ''}
                </div>
            `;
        });
        
        html += `</div></div>`;
    }
    
    if (OS01State.networkData.length > 0) {
        html += `
            <div class="report-section">
                <h4 style="color: var(--cyber-warning); margin: 20px 0 10px;">
                    <i class="fas fa-network-wired"></i> СЕТЕВОЙ АНАЛИЗ (${OS01State.networkData.length})
                </h4>
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 5px;">
        `;
        
        OS01State.networkData.forEach((scan, index) => {
            html += `
                <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid var(--border-color);">
                    <p><strong>Сканирование #${index + 1}:</strong> ${scan.target}</p>
                    <p><small>Инструмент: ${scan.tool}</small></p>
                </div>
            `;
        });
        
        html += `</div></div>`;
    }
    
    html += `
            <div class="report-footer" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--border-color);">
                <h4 style="color: var(--cyber-primary);">ВЫВОДЫ И РЕКОМЕНДАЦИИ</h4>
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 5px;">
                    <p>1. Все данные собраны в симуляции OS-01</p>
                    <p>2. Реальные системы не сканировались</p>
                    <p>3. Данные сгенерированы локально для обучения</p>
                    <p>4. Используйте сложные пароли и 2FA</p>
                    <p>5. Регулярно обновляйте ПО и системы</p>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: rgba(0,0,0,0.5); border-radius: 5px; text-align: center;">
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">
                        <i class="fas fa-exclamation-triangle"></i>
                        ОТЧЕТ СГЕНЕРИРОВАН В СИМУЛЯЦИИ OS-01
                    </p>
                    <p style="color: var(--text-secondary); font-size: 0.8rem;">
                        Все операции выполнены локально | Образовательная цель | Ω-01 System
                    </p>
                </div>
            </div>
        </div>
    `;
    
    return html;
}

function saveReport() {
    const preview = document.getElementById('reportPreview');
    if (!preview || preview.textContent.includes('ОТЧЕТ БУДЕТ СГЕНЕРИРОВАН')) {
        showNotification('СНАЧАЛА СГЕНЕРИРУЙТЕ ОТЧЕТ', 'warning');
        return;
    }
    
    // Создаем файл для скачивания
    const blob = new Blob([`
        <!DOCTYPE html>
        <html>
        <head>
            <title>OS-01 Scout Report</title>
            <meta charset="UTF-8">
            <style>
                body { 
                    font-family: 'Courier New', monospace;
                    background: #0a0a0a;
                    color: #ffffff;
                    padding: 20px;
                    line-height: 1.6;
                }
                .header { 
                    border-bottom: 2px solid #00ff9d;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                h1 { color: #00ff9d; }
                h2 { color: #00ccff; }
                h3 { color: #ffaa00; }
                h4 { color: #9d00ff; }
                .section { 
                    background: rgba(0,0,0,0.3);
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    border: 1px solid #222;
                }
                .danger { 
                    background: rgba(255,0,64,0.1);
                    border-color: #ff0040;
                }
                .warning { 
                    background: rgba(255,170,0,0.1);
                    border-color: #ffaa00;
                }
                .footer { 
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #222;
                    text-align: center;
                    color: #666;
                    font-size: 0.8rem;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>OS-01 SCOUT INTELLIGENCE REPORT</h1>
                <p>Generated: ${new Date().toLocaleString()}</p>
                <p>ID: REPORT-${Date.now().toString(36).toUpperCase()}</p>
            </div>
            ${preview.innerHTML}
            <div class="footer">
                <p>Ω-01 SIMULATION ENVIRONMENT | LOCAL DATA ONLY | EDUCATIONAL PURPOSES</p>
                <p>All data generated locally in browser | No real systems were accessed</p>
            </div>
        </body>
        </html>
    `], { type: 'text/html' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `os-01-report-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('ОТЧЕТ СОХРАНЕН ЛОКАЛЬНО', 'success');
}

function clearAllData() {
    if (confirm('ВЫ УВЕРЕНЫ? ВСЕ ДАННЫЕ БУДУТ УДАЛЕНЫ БЕЗ ВОЗМОЖНОСТИ ВОССТАНОВЛЕНИЯ.')) {
        // Сброс состояния
        OS01State.target = null;
        OS01State.scans = [];
        OS01State.breaches = [];
        OS01State.networkData = [];
        OS01State.reports = [];
        
        // Очистка полей ввода
        document.querySelectorAll('input').forEach(input => {
            if (input.type !== 'button') input.value = '';
        });
        
        // Очистка результатов
        document.getElementById('targetPreview').querySelector('.preview-content').innerHTML = `
            <div class="preview-item">
                <span class="preview-label">СТАТУС:</span>
                <span class="preview-value inactive">ЦЕЛЬ НЕ ОПРЕДЕЛЕНА</span>
            </div>
        `;
        
        document.getElementById('osintResults').innerHTML = `
            <div class="empty-results">
                <i class="fas fa-database"></i>
                <p>РЕЗУЛЬТАТЫ СКАНА БУДУТ ОТОБРАЖЕНЫ ЗДЕСЬ</p>
            </div>
        `;
        
        document.querySelector('.breach-result-content').innerHTML = `
            <div class="no-breach">
                <i class="fas fa-shield-alt"></i>
                <p>ВВЕДИТЕ ДАННЫЕ ДЛЯ ПРОВЕРКИ В БАЗАХ</p>
            </div>
        `;
        
        clearTerminal();
        
        document.getElementById('reportPreview').innerHTML = `
            <div class="preview-empty">
                <i class="fas fa-file-invoice"></i>
                <p>ОТЧЕТ БУДЕТ СГЕНЕРИРОВАН ЗДЕСЬ</p>
                <small>Все данные сохраняются только локально в браузере</small>
            </div>
        `;
        
        // Сброс прогресса
        document.getElementById('scanProgress').style.width = '0%';
        document.getElementById('scanStatus').textContent = 'СКАНЕР ГОТОВ';
        
        showNotification('ВСЕ ДАННЫЕ ОЧИЩЕНЫ', 'info');
    }
}

// ================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==================
function simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showNotification(message, type = 'info') {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = 'cyber-notification';
    
    const icons = {
        'success': 'check-circle',
        'error': 'times-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle',
        'danger': 'skull-crossbones'
    };
    
    const colors = {
        'success': 'var(--cyber-primary)',
        'error': 'var(--cyber-danger)',
        'warning': 'var(--cyber-warning)',
        'info': 'var(--cyber-secondary)',
        'danger': 'var(--cyber-danger)'
    };
    
    notification.innerHTML = `
        <div class="notification-content" style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(10,10,10,0.95);
            border: 1px solid ${colors[type]};
            border-left: 4px solid ${colors[type]};
            padding: 15px;
            border-radius: 5px;
            z-index: 10000;
            min-width: 300px;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
            animation: slideIn 0.3s ease;
        ">
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-${icons[type]}" style="color: ${colors[type]}; font-size: 1.2rem;"></i>
                <span style="font-weight: bold; color: var(--text-primary);">${message}</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
    
    // Добавляем анимации
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Инициализация карты геолокации
function initMap() {
    // Случайное расположение точек при загрузке
    const points = document.querySelectorAll('.map-point');
    points.forEach(point => {
        point.style.top = `${20 + Math.random() * 60}%`;
        point.style.left = `${20 + Math.random() * 60}%`;
    });
}

// Запуск инициализации карты после загрузки
setTimeout(initMap, 1000);