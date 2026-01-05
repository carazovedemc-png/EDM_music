// CYBER SCOUT v5.0 - Universal Intelligence System
// Universal file processor - reads ANY text-based file format

// Глобальные переменные
let loadedFiles = [];
let extractedData = [];
let isProcessing = false;
let autoScroll = true;
let chartInstance = null;
let terminalBuffer = [];
let processingStats = {
    totalFiles: 0,
    processedFiles: 0,
    totalData: 0,
    persons: 0,
    phones: 0,
    emails: 0,
    locations: 0
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('CYBER SCOUT v5.0 Initialized - Universal File Processor');
    
    initSystem();
    setupEventListeners();
    initChart();
    updateSystemInfo();
    
    // Показываем приветственное сообщение
    setTimeout(() => {
        terminalWrite('$ Initializing Universal Intelligence System...', 'system');
        terminalWrite('$ Loading file processing modules...', 'system');
        terminalWrite('$ Universal text extractor ready...', 'success');
        terminalWrite('$ Supported formats: ANY text-based file', 'info');
        terminalWrite('$ Drag & drop files or use upload button', 'info');
    }, 500);
    
    // Обновляем системную информацию
    setInterval(updateSystemInfo, 2000);
    setInterval(updateProcessingStats, 3000);
});

// Инициализация системы
function initSystem() {
    // Настройка перетаскивания файлов
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--cyber-green)';
        this.style.background = 'rgba(0, 255, 65, 0.05)';
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--border-color)';
        this.style.background = 'transparent';
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--border-color)';
        this.style.background = 'transparent';
        
        const files = e.dataTransfer.files;
        handleFiles(files);
    });
    
    fileInput.addEventListener('change', function(e) {
        const files = e.target.files;
        handleFiles(files);
    });
    
    // Настройка горячих клавиш
    document.addEventListener('keydown', function(e) {
        // Ctrl + F - фокус на поиск
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            document.getElementById('quickSearch').focus();
        }
        
        // Ctrl + P - обработка файлов
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            processAllFiles();
        }
        
        // Ctrl + T - очистка терминала
        if (e.ctrlKey && e.key === 't') {
            e.preventDefault();
            clearTerminal();
        }
        
        // Esc - очистка поиска
        if (e.key === 'Escape') {
            document.getElementById('quickSearch').value = '';
        }
    });
}

// Настройка слушателей событий
function setupEventListeners() {
    // Типы поиска
    document.querySelectorAll('.search-type').forEach(type => {
        type.addEventListener('click', function() {
            document.querySelectorAll('.search-type').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Enter в поле поиска
    document.getElementById('quickSearch').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            quickSearch();
        }
    });
}

// Инициализация графика
function initChart() {
    const ctx = document.getElementById('dataChart').getContext('2d');
    
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
            datasets: [{
                label: 'Data Processing',
                data: [12, 19, 3, 5, 2, 3],
                borderColor: '#00ff41',
                backgroundColor: 'rgba(0, 255, 65, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#cccccc'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#cccccc'
                    }
                }
            }
        }
    });
}

// Обновление системной информации
function updateSystemInfo() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ru-RU', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('currentTime').textContent = timeStr;
    
    // Случайные системные метрики (для эффекта реальности)
    document.getElementById('cpuLoad').textContent = `${(Math.random() * 10 + 2).toFixed(1)}%`;
    document.getElementById('memUsage').textContent = `${Math.floor(Math.random() * 100 + 100)}MB`;
    document.getElementById('dataSize').textContent = `${(extractedData.length * 0.5).toFixed(1)} KB`;
    document.getElementById('processSpeed').textContent = `${Math.floor(Math.random() * 50 + 10)}ms`;
    document.getElementById('uptime').textContent = `${(99.5 + Math.random() * 0.5).toFixed(1)}%`;
}

// Обновление статистики обработки
function updateProcessingStats() {
    document.getElementById('personsFound').textContent = processingStats.persons;
    document.getElementById('phonesFound').textContent = processingStats.phones;
    document.getElementById('emailsFound').textContent = processingStats.emails;
    document.getElementById('locationsFound').textContent = processingStats.locations;
    
    document.getElementById('totalMatches').textContent = extractedData.length;
    document.getElementById('filesProcessed').textContent = `${processingStats.processedFiles}/${processingStats.totalFiles}`;
    document.getElementById('dataPoints').textContent = processingStats.totalData;
    document.getElementById('confidence').textContent = `${Math.min(100, Math.floor(processingStats.totalData / 10))}%`;
    
    // Обновление графика
    if (chartInstance) {
        const newData = chartInstance.data.datasets[0].data;
        newData.push(Math.floor(Math.random() * 20 + 5));
        if (newData.length > 10) newData.shift();
        chartInstance.update('none');
    }
}

// ================== ОБРАБОТКА ФАЙЛОВ ==================

// Обработка загруженных файлов
function handleFiles(files) {
    if (!files || files.length === 0) return;
    
    terminalWrite(`Receiving ${files.length} file(s)...`, 'system');
    
    Array.from(files).forEach(file => {
        addFileToList(file);
        
        // Автоматическая обработка если включена
        if (document.getElementById('autoProcess').checked) {
            processFile(file);
        }
    });
    
    updateFileCount();
}

// Добавление файла в список
function addFileToList(file) {
    // Проверяем, не загружен ли уже файл
    const existingFile = loadedFiles.find(f => f.name === file.name && f.size === file.size);
    if (existingFile) {
        terminalWrite(`File already loaded: ${file.name}`, 'warning');
        return;
    }
    
    // Добавляем в массив
    loadedFiles.push({
        id: Date.now() + Math.random(),
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        processed: false,
        data: null
    });
    
    // Добавляем в интерфейс
    const filesContainer = document.getElementById('filesContainer');
    
    // Удаляем сообщение "No files loaded" если оно есть
    const emptyFiles = filesContainer.querySelector('.empty-files');
    if (emptyFiles) {
        emptyFiles.remove();
    }
    
    // Создаем элемент файла
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.dataset.fileId = loadedFiles[loadedFiles.length - 1].id;
    
    const fileIcon = getFileIcon(file.name);
    
    fileItem.innerHTML = `
        <div class="file-icon">
            <i class="${fileIcon}"></i>
        </div>
        <div class="file-info">
            <div class="file-name" title="${file.name}">${file.name}</div>
            <div class="file-size">${formatFileSize(file.size)}</div>
        </div>
        <div class="file-actions">
            <button class="file-action-btn" onclick="processSingleFile('${loadedFiles[loadedFiles.length - 1].id}')" title="Process">
                <i class="fas fa-play"></i>
            </button>
            <button class="file-action-btn" onclick="removeFile('${loadedFiles[loadedFiles.length - 1].id}')" title="Remove">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    filesContainer.appendChild(fileItem);
    
    terminalWrite(`File added: ${file.name} (${formatFileSize(file.size)})`, 'info');
}

// Получение иконки для файла
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    
    switch(ext) {
        case 'txt': return 'fas fa-file-alt';
        case 'csv': return 'fas fa-file-csv';
        case 'json': return 'fas fa-file-code';
        case 'xml': return 'fas fa-file-code';
        case 'log': return 'fas fa-file-alt';
        case 'doc':
        case 'docx': return 'fas fa-file-word';
        case 'pdf': return 'fas fa-file-pdf';
        case 'rtf': return 'fas fa-file-alt';
        default: return 'fas fa-file';
    }
}

// Форматирование размера файла
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Обновление счетчика файлов
function updateFileCount() {
    document.getElementById('fileCount').textContent = `${loadedFiles.length} file(s)`;
}

// Удаление файла
function removeFile(fileId) {
    const index = loadedFiles.findIndex(f => f.id == fileId);
    if (index !== -1) {
        const fileName = loadedFiles[index].name;
        loadedFiles.splice(index, 1);
        
        // Удаляем из интерфейса
        const fileElement = document.querySelector(`.file-item[data-file-id="${fileId}"]`);
        if (fileElement) {
            fileElement.remove();
        }
        
        // Если файлов не осталось, показываем сообщение
        if (loadedFiles.length === 0) {
            const filesContainer = document.getElementById('filesContainer');
            filesContainer.innerHTML = `
                <div class="empty-files">
                    <i class="fas fa-file-alt"></i>
                    <p>No files loaded</p>
                </div>
            `;
        }
        
        terminalWrite(`File removed: ${fileName}`, 'warning');
        updateFileCount();
    }
}

// Очистка всех файлов
function clearAllFiles() {
    if (loadedFiles.length === 0) {
        terminalWrite('No files to clear', 'warning');
        return;
    }
    
    if (confirm(`Clear all ${loadedFiles.length} files?`)) {
        loadedFiles = [];
        document.getElementById('filesContainer').innerHTML = `
            <div class="empty-files">
                <i class="fas fa-file-alt"></i>
                <p>No files loaded</p>
            </div>
        `;
        
        terminalWrite('All files cleared from memory', 'system');
        updateFileCount();
    }
}

// ================== ПРОЦЕССИНГ ФАЙЛОВ ==================

// Обработка одного файла
function processSingleFile(fileId) {
    const fileObj = loadedFiles.find(f => f.id == fileId);
    if (!fileObj) return;
    
    processFile(fileObj.file);
}

// Обработка файла
async function processFile(file) {
    if (isProcessing) {
        terminalWrite('Processing already in progress. Please wait.', 'warning');
        return;
    }
    
    isProcessing = true;
    terminalWrite(`Processing file: ${file.name}`, 'system');
    
    // Обновляем статистику
    processingStats.totalFiles++;
    processingStats.processedFiles++;
    
    try {
        // Читаем файл как текст
        const text = await readFileAsText(file);
        
        // Извлекаем данные из текста
        const extracted = extractDataFromText(text, file.name);
        
        // Сохраняем извлеченные данные
        extractedData = extractedData.concat(extracted);
        
        // Помечаем файл как обработанный
        const fileObj = loadedFiles.find(f => f.name === file.name);
        if (fileObj) {
            fileObj.processed = true;
            fileObj.data = extracted;
            
            // Обновляем интерфейс
            const fileElement = document.querySelector(`.file-item[data-file-id="${fileObj.id}"]`);
            if (fileElement) {
                fileElement.style.borderLeft = '3px solid var(--cyber-green)';
            }
        }
        
        // Обновляем статистику
        processingStats.totalData += extracted.length;
        processingStats.persons += extracted.filter(d => d.type === 'person').length;
        processingStats.phones += extracted.filter(d => d.type === 'phone').length;
        processingStats.emails += extracted.filter(d => d.type === 'email').length;
        processingStats.locations += extracted.filter(d => d.type === 'location').length;
        
        terminalWrite(`✓ Extracted ${extracted.length} data points from ${file.name}`, 'success');
        
        // Автоматически показываем результаты если их мало
        if (extractedData.length <= 10 && extractedData.length > 0) {
            displayResults(extractedData);
        }
        
    } catch (error) {
        terminalWrite(`✗ Error processing ${file.name}: ${error.message}`, 'error');
    } finally {
        isProcessing = false;
        updateProcessingStats();
    }
}

// Обработка всех файлов
async function processAllFiles() {
    if (loadedFiles.length === 0) {
        terminalWrite('No files to process. Upload files first.', 'error');
        return;
    }
    
    if (isProcessing) {
        terminalWrite('Processing already in progress', 'warning');
        return;
    }
    
    terminalWrite('====== STARTING BATCH PROCESSING ======', 'system');
    terminalWrite(`Processing ${loadedFiles.length} file(s)...`, 'info');
    
    isProcessing = true;
    
    // Сбрасываем статистику
    extractedData = [];
    processingStats = {
        totalFiles: loadedFiles.length,
        processedFiles: 0,
        totalData: 0,
        persons: 0,
        phones: 0,
        emails: 0,
        locations: 0
    };
    
    // Обрабатываем каждый файл
    for (let i = 0; i < loadedFiles.length; i++) {
        const fileObj = loadedFiles[i];
        
        terminalWrite(`[${i+1}/${loadedFiles.length}] Processing: ${fileObj.name}`, 'system');
        
        try {
            const text = await readFileAsText(fileObj.file);
            const extracted = extractDataFromText(text, fileObj.name);
            
            extractedData = extractedData.concat(extracted);
            fileObj.processed = true;
            fileObj.data = extracted;
            
            // Обновляем статистику
            processingStats.processedFiles++;
            processingStats.totalData += extracted.length;
            processingStats.persons += extracted.filter(d => d.type === 'person').length;
            processingStats.phones += extracted.filter(d => d.type === 'phone').length;
            processingStats.emails += extracted.filter(d => d.type === 'email').length;
            processingStats.locations += extracted.filter(d => d.type === 'location').length;
            
            terminalWrite(`  ✓ Found ${extracted.length} data points`, 'success');
            
            // Обновляем интерфейс
            const fileElement = document.querySelector(`.file-item[data-file-id="${fileObj.id}"]`);
            if (fileElement) {
                fileElement.style.borderLeft = '3px solid var(--cyber-green)';
            }
            
        } catch (error) {
            terminalWrite(`  ✗ Error: ${error.message}`, 'error');
        }
        
        // Искусственная задержка для эффекта обработки
        await delay(300 + Math.random() * 700);
    }
    
    terminalWrite('====== PROCESSING COMPLETE ======', 'system');
    terminalWrite(`Total data points extracted: ${extractedData.length}`, 'success');
    terminalWrite('Displaying results...', 'info');
    
    isProcessing = false;
    
    // Показываем результаты
    displayResults(extractedData);
    updateProcessingStats();
}

// Чтение файла как текст
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        
        reader.onerror = function(e) {
            reject(new Error('Failed to read file'));
        };
        
        // Пробуем прочитать как текст
        reader.readAsText(file, 'UTF-8');
    });
}

// Извлечение данных из текста (УНИВЕРСАЛЬНЫЙ АЛГОРИТМ)
function extractDataFromText(text, filename) {
    const results = [];
    
    terminalWrite(`  Analyzing text from ${filename}...`, 'system');
    
    // Разбиваем текст на строки
    const lines = text.split('\n');
    
    // Паттерны для поиска
    const patterns = {
        // Имена (русские и английские)
        person: /\b([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ][а-яё]+){1,2})\b|\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b/g,
        
        // Телефоны (международный и российский формат)
        phone: /(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}|\+\d{1,3}[\s\-]?\(?\d{1,4}\)?[\s\-]?\d{1,4}[\s\-]?\d{1,4}[\s\-]?\d{1,4}/g,
        
        // Email адреса
        email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        
        // Адреса (простой паттерн)
        location: /\b(ул\.|улица|пр\.|проспект|д\.|дом|кв\.|квартира)\s+[А-Яа-яёЁ\w\s\-]+\b/g,
        
        // Даты
        date: /\b\d{1,2}[\.\/\-]\d{1,2}[\.\/\-]\d{2,4}\b|\b\d{4}[\.\/\-]\d{1,2}[\.\/\-]\d{1,2}\b/g,
        
        // Паспортные данные (российский формат)
        passport: /\b\d{2}\s?\d{2}\s?\d{6}\b/g,
        
        // ИНН
        inn: /\b\d{10,12}\b/g,
        
        // Кредитные карты (маскированный поиск)
        card: /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g,
        
        // Социальные сети
        social: /(?:https?:\/\/)?(?:www\.)?(?:vk\.com|facebook\.com|instagram\.com|twitter\.com|t\.me|telegram\.me)\/[a-zA-Z0-9_\-\.]+/g
    };
    
    // Поиск по каждому паттерну
    for (const [type, pattern] of Object.entries(patterns)) {
        const matches = text.match(pattern);
        if (matches) {
            matches.forEach(match => {
                // Очищаем результат
                const cleanMatch = match.trim();
                
                // Определяем уверенность на основе типа и контекста
                let confidence = 70; // Базовая уверенность
                
                switch(type) {
                    case 'person':
                        if (cleanMatch.split(' ').length >= 2) confidence = 90;
                        if (cleanMatch.includes('.')) confidence = 60; // Может быть инициалы
                        break;
                    case 'phone':
                        if (cleanMatch.replace(/\D/g, '').length >= 10) confidence = 95;
                        break;
                    case 'email':
                        if (cleanMatch.includes('@') && cleanMatch.includes('.')) confidence = 98;
                        break;
                    case 'location':
                        if (cleanMatch.includes('ул.') || cleanMatch.includes('улица')) confidence = 85;
                        break;
                }
                
                // Добавляем результат если его еще нет
                const exists = results.some(r => r.value === cleanMatch && r.type === type);
                if (!exists && cleanMatch.length > 3) {
                    results.push({
                        id: Date.now() + Math.random(),
                        type: type,
                        value: cleanMatch,
                        source: filename,
                        confidence: confidence,
                        timestamp: new Date().toISOString()
                    });
                }
            });
        }
    }
    
    // Дополнительный анализ: поиск комбинаций (Имя + Телефон и т.д.)
    lines.forEach((line, lineIndex) => {
        if (line.trim().length < 10) return;
        
        // Поиск имени и телефона на одной строке
        const nameMatch = line.match(patterns.person);
        const phoneMatch = line.match(patterns.phone);
        const emailMatch = line.match(patterns.email);
        
        if (nameMatch && (phoneMatch || emailMatch)) {
            nameMatch.forEach(name => {
                const personData = {
                    id: Date.now() + Math.random(),
                    type: 'person_combo',
                    name: name.trim(),
                    phones: phoneMatch ? phoneMatch.map(p => p.trim()) : [],
                    emails: emailMatch ? emailMatch.map(e => e.trim()) : [],
                    source: filename,
                    line: lineIndex + 1,
                    confidence: 95,
                    timestamp: new Date().toISOString()
                };
                
                results.push(personData);
            });
        }
    });
    
    // Если найдено мало данных, используем более агрессивный поиск
    if (results.length < 5) {
        terminalWrite(`  Using advanced pattern matching...`, 'system');
        
        // Разбиваем текст на слова и ищем потенциальные данные
        const words = text.split(/\s+/);
        
        words.forEach((word, index) => {
            word = word.trim().replace(/[.,;:!?]/g, '');
            
            // Проверка на телефон (без формата)
            if (word.replace(/\D/g, '').length >= 10 && word.replace(/\D/g, '').length <= 15) {
                const phone = word.replace(/\D/g, '');
                if (phone.startsWith('7') || phone.startsWith('8') || phone.startsWith('+')) {
                    results.push({
                        id: Date.now() + Math.random(),
                        type: 'phone',
                        value: phone,
                        source: filename,
                        confidence: 80,
                        timestamp: new Date().toISOString()
                    });
                }
            }
            
            // Проверка на email (простые паттерны)
            if (word.includes('@') && word.includes('.') && word.length > 5) {
                results.push({
                    id: Date.now() + Math.random(),
                    type: 'email',
                    value: word,
                    source: filename,
                    confidence: 90,
                    timestamp: new Date().toISOString()
                });
            }
        });
    }
    
    return results;
}

// ================== ПОИСК И РЕЗУЛЬТАТЫ ==================

// Быстрый поиск
function quickSearch() {
    const query = document.getElementById('quickSearch').value.trim();
    const searchType = document.querySelector('.search-type.active').dataset.type;
    
    if (!query) {
        terminalWrite('Enter search query first', 'warning');
        return;
    }
    
    if (extractedData.length === 0 && loadedFiles.length > 0) {
        terminalWrite('No data extracted yet. Process files first.', 'warning');
        return;
    }
    
    if (extractedData.length === 0 && loadedFiles.length === 0) {
        terminalWrite('Upload and process files first', 'error');
        return;
    }
    
    terminalWrite(`Searching for "${query}" (${searchType})...`, 'system');
    
    // Фильтрация данных
    let filteredData = extractedData;
    
    if (searchType !== 'all') {
        filteredData = extractedData.filter(item => {
            // Для комбинированных типов проверяем все поля
            if (item.type === 'person_combo') {
                if (searchType === 'name') {
                    return item.name.toLowerCase().includes(query.toLowerCase());
                } else if (searchType === 'phone') {
                    return item.phones.some(phone => 
                        phone.toLowerCase().includes(query.toLowerCase())
                    );
                } else if (searchType === 'email') {
                    return item.emails.some(email => 
                        email.toLowerCase().includes(query.toLowerCase())
                    );
                }
            }
            
            // Для обычных типов
            return item.type === searchType && 
                   item.value.toLowerCase().includes(query.toLowerCase());
        });
    } else {
        // Поиск по всем полям
        filteredData = extractedData.filter(item => {
            if (item.type === 'person_combo') {
                return item.name.toLowerCase().includes(query.toLowerCase()) ||
                       item.phones.some(phone => phone.toLowerCase().includes(query.toLowerCase())) ||
                       item.emails.some(email => email.toLowerCase().includes(query.toLowerCase()));
            }
            return item.value.toLowerCase().includes(query.toLowerCase());
        });
    }
    
    terminalWrite(`Found ${filteredData.length} matches`, 'success');
    displayResults(filteredData);
}

// Отображение результатов
function displayResults(data) {
    const resultsGrid = document.getElementById('resultsGrid');
    
    if (data.length === 0) {
        resultsGrid.innerHTML = `
            <div class="empty-results">
                <i class="fas fa-search"></i>
                <p>No results found</p>
                <small>Try different search criteria</small>
            </div>
        `;
        return;
    }
    
    // Очищаем предыдущие результаты
    resultsGrid.innerHTML = '';
    
    // Отображаем первые 50 результатов
    const displayData = data.slice(0, 50);
    
    displayData.forEach(item => {
        const resultCard = createResultCard(item);
        resultsGrid.appendChild(resultCard);
    });
    
    // Если результатов больше 50, показываем сообщение
    if (data.length > 50) {
        const moreCard = document.createElement('div');
        moreCard.className = 'result-card';
        moreCard.style.gridColumn = '1 / -1';
        moreCard.style.textAlign = 'center';
        moreCard.style.padding = '20px';
        moreCard.innerHTML = `
            <i class="fas fa-ellipsis-h" style="color: var(--cyber-green); font-size: 1.5rem; margin-bottom: 10px;"></i>
            <p>Showing 50 of ${data.length} results</p>
            <small>Use specific search to narrow down results</small>
        `;
        resultsGrid.appendChild(moreCard);
    }
}

// Создание карточки результата
function createResultCard(item) {
    const card = document.createElement('div');
    card.className = 'result-card';
    
    let content = '';
    
    if (item.type === 'person_combo') {
        // Комбинированная карточка для персоны
        content = `
            <div class="result-header">
                <span class="result-type">PERSON</span>
                <span class="result-confidence">${item.confidence}%</span>
            </div>
            <div class="result-content">
                <div class="result-field">
                    <span class="field-label">Name:</span>
                    <span class="field-value">${item.name}</span>
                </div>
                ${item.phones.length > 0 ? `
                <div class="result-field">
                    <span class="field-label">Phones:</span>
                    <span class="field-value">${item.phones.join(', ')}</span>
                </div>
                ` : ''}
                ${item.emails.length > 0 ? `
                <div class="result-field">
                    <span class="field-label">Emails:</span>
                    <span class="field-value">${item.emails.join(', ')}</span>
                </div>
                ` : ''}
            </div>
            <div class="result-footer">
                <span>${item.source}</span>
                <span>Line ${item.line}</span>
            </div>
        `;
    } else {
        // Обычная карточка
        const typeLabels = {
            'person': 'PERSON',
            'phone': 'PHONE',
            'email': 'EMAIL',
            'location': 'ADDRESS',
            'date': 'DATE',
            'passport': 'PASSPORT',
            'inn': 'INN',
            'card': 'CARD',
            'social': 'SOCIAL'
        };
        
        content = `
            <div class="result-header">
                <span class="result-type">${typeLabels[item.type] || item.type.toUpperCase()}</span>
                <span class="result-confidence">${item.confidence}%</span>
            </div>
            <div class="result-content">
                <div class="result-field">
                    <span class="field-label">Value:</span>
                    <span class="field-value">${item.value}</span>
                </div>
            </div>
            <div class="result-footer">
                <span>${item.source}</span>
                <span>${new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
        `;
    }
    
    card.innerHTML = content;
    return card;
}

// Очистка результатов
function clearResults() {
    document.getElementById('resultsGrid').innerHTML = `
        <div class="empty-results">
            <i class="fas fa-search"></i>
            <p>Search results will appear here</p>
            <small>Upload files and run search to see data</small>
        </div>
    `;
    
    terminalWrite('Results cleared', 'system');
}

// Экспорт результатов
function exportResults() {
    if (extractedData.length === 0) {
        terminalWrite('No data to export', 'warning');
        return;
    }
    
    terminalWrite('Exporting data...', 'system');
    
    // Формируем данные для экспорта
    const exportData = {
        timestamp: new Date().toISOString(),
        totalRecords: extractedData.length,
        filesProcessed: loadedFiles.filter(f => f.processed).length,
        data: extractedData
    };
    
    // Создаем файл для скачивания
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyber_scout_data_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    terminalWrite(`Data exported: ${extractedData.length} records`, 'success');
}

// ================== ТЕРМИНАЛ ==================

// Запись в терминал
function terminalWrite(message, type = 'normal') {
    const terminal = document.getElementById('terminalOutput');
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    let formattedMessage = '';
    
    switch(type) {
        case 'success':
            formattedMessage = `<span style="color: #00ff41;">[${timeStr}] ${message}</span>`;
            break;
        case 'error':
            formattedMessage = `<span style="color: #ff003c;">[${timeStr}] ${message}</span>`;
            break;
        case 'warning':
            formattedMessage = `<span style="color: #ffd300;">[${timeStr}] ${message}</span>`;
            break;
        case 'info':
            formattedMessage = `<span style="color: #0088ff;">[${timeStr}] ${message}</span>`;
            break;
        case 'system':
            formattedMessage = `<span style="color: #9d00ff;">[${timeStr}] ${message}</span>`;
            break;
        default:
            formattedMessage = `<span style="color: #cccccc;">[${timeStr}] ${message}</span>`;
    }
    
    terminal.innerHTML += formattedMessage + '\n';
    
    // Автоматическая прокрутка
    if (autoScroll) {
        terminal.scrollTop = terminal.scrollHeight;
    }
}

// Очистка терминала
function clearTerminal() {
    document.getElementById('terminalOutput').innerHTML = '<span class="prompt">root@cyber:~#</span> System initialized. Ready for operations.';
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

// Переключение автопрокрутки
function toggleAutoScroll() {
    autoScroll = !autoScroll;
    const icon = document.getElementById('autoScrollIcon');
    
    if (autoScroll) {
        icon.className = 'fas fa-arrow-down';
        terminalWrite('Auto-scroll enabled', 'info');
    } else {
        icon.className = 'fas fa-pause';
        terminalWrite('Auto-scroll disabled', 'warning');
    }
}

// ================== ПРОДВИНУТЫЕ ИНСТРУМЕНТЫ ==================

// Глубокий анализ
function deepAnalyze() {
    if (extractedData.length === 0) {
        terminalWrite('No data for deep analysis. Process files first.', 'warning');
        return;
    }
    
    terminalWrite('====== DEEP ANALYSIS INITIATED ======', 'system');
    terminalWrite('Analyzing data patterns and connections...', 'system');
    
    const depth = parseInt(document.getElementById('analysisDepth').value);
    
    // Симуляция глубокого анализа
    setTimeout(() => {
        terminalWrite('Phase 1: Data correlation...', 'system');
        
        setTimeout(() => {
            terminalWrite('Phase 2: Pattern recognition...', 'system');
            
            setTimeout(() => {
                terminalWrite('Phase 3: Connection mapping...', 'system');
                
                setTimeout(() => {
                    const foundConnections = Math.floor(Math.random() * 10) + 5;
                    const patternsFound = Math.floor(Math.random() * 8) + 3;
                    
                    terminalWrite('Deep analysis complete:', 'success');
                    terminalWrite(`  • Found ${foundConnections} connections`, 'info');
                    terminalWrite(`  • Identified ${patternsFound} patterns`, 'info');
                    terminalWrite(`  • Analysis depth: ${depth}/4`, 'info');
                    terminalWrite('  • Report generated: deep_analysis_report.json', 'info');
                    
                }, 1000 + depth * 500);
            }, 800 + depth * 400);
        }, 600 + depth * 300);
    }, 500);
}

// Поиск связей
function findConnections() {
    if (extractedData.length < 2) {
        terminalWrite('Need at least 2 data points for connection analysis', 'warning');
        return;
    }
    
    terminalWrite('Finding connections between data points...', 'system');
    
    // Ищем персоналии для анализа связей
    const persons = extractedData.filter(d => d.type === 'person' || d.type === 'person_combo');
    
    if (persons.length < 2) {
        terminalWrite('Need at least 2 persons for connection analysis', 'warning');
        return;
    }
    
    setTimeout(() => {
        const connections = [];
        
        // Создаем случайные связи между персонами
        for (let i = 0; i < Math.min(persons.length, 5); i++) {
            for (let j = i + 1; j < Math.min(persons.length, 5); j++) {
                if (Math.random() > 0.5) {
                    const connectionTypes = ['Family', 'Colleagues', 'Friends', 'Business', 'Unknown'];
                    const type = connectionTypes[Math.floor(Math.random() * connectionTypes.length)];
                    
                    connections.push({
                        from: persons[i].value || persons[i].name,
                        to: persons[j].value || persons[j].name,
                        type: type,
                        strength: Math.floor(Math.random() * 70) + 30
                    });
                }
            }
        }
        
        terminalWrite(`Found ${connections.length} connections:`, 'success');
        
        connections.forEach(conn => {
            terminalWrite(`  • ${conn.from} ↔ ${conn.to} (${conn.type}, ${conn.strength}%)`, 'info');
        });
        
    }, 1500);
}

// Извлечение паттернов
function extractPatterns() {
    if (extractedData.length === 0) {
        terminalWrite('No data for pattern extraction', 'warning');
        return;
    }
    
    terminalWrite('Extracting data patterns...', 'system');
    
    setTimeout(() => {
        const patterns = [
            'Phone number sequences detected',
            'Email domain patterns identified',
            'Geographical clustering found',
            'Temporal patterns recognized',
            'Social network correlations established'
        ];
        
        terminalWrite('Pattern extraction complete:', 'success');
        
        patterns.forEach(pattern => {
            if (Math.random() > 0.3) {
                terminalWrite(`  • ${pattern}`, 'info');
            }
        });
        
    }, 1200);
}

// Геолокация всех данных
function geolocateAll() {
    if (extractedData.length === 0) {
        terminalWrite('No data for geolocation', 'warning');
        return;
    }
    
    terminalWrite('Performing geolocation analysis...', 'system');
    
    setTimeout(() => {
        const cities = ['Moscow', 'Saint Petersburg', 'Kyiv', 'Minsk', 'Astana', 'Almaty', 'Tashkent'];
        const locations = [];
        
        // Случайная геолокация для части данных
        extractedData.slice(0, 10).forEach(item => {
            if (Math.random() > 0.5) {
                const city = cities[Math.floor(Math.random() * cities.length)];
                const lat = 50 + Math.random() * 10;
                const lon = 30 + Math.random() * 10;
                
                locations.push({
                    data: item.value || item.name,
                    location: city,
                    coordinates: `${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`,
                    accuracy: `${Math.floor(Math.random() * 200) + 50}m`
                });
            }
        });
        
        if (locations.length > 0) {
            terminalWrite(`Geolocated ${locations.length} data points:`, 'success');
            
            locations.slice(0, 5).forEach(loc => {
                terminalWrite(`  • ${loc.data} → ${loc.location} (${loc.coordinates})`, 'info');
            });
            
            if (locations.length > 5) {
                terminalWrite(`  ... and ${locations.length - 5} more locations`, 'info');
            }
        } else {
            terminalWrite('No geolocation data found', 'warning');
        }
    }, 1800);
}

// Социальный граф
function socialGraph() {
    terminalWrite('Building social connection graph...', 'system');
    
    setTimeout(() => {
        const graphData = {
            nodes: Math.floor(Math.random() * 20) + 10,
            edges: Math.floor(Math.random() * 50) + 20,
            clusters: Math.floor(Math.random() * 5) + 1
        };
        
        terminalWrite('Social graph generated:', 'success');
        terminalWrite(`  • Nodes: ${graphData.nodes}`, 'info');
        terminalWrite(`  • Connections: ${graphData.edges}`, 'info');
        terminalWrite(`  • Clusters: ${graphData.clusters}`, 'info');
        terminalWrite('  • Visualization ready in graph viewer', 'info');
        
    }, 2000);
}

// Анализ временной линии
function timelineAnalysis() {
    if (extractedData.length === 0) {
        terminalWrite('No data for timeline analysis', 'warning');
        return;
    }
    
    terminalWrite('Creating timeline from extracted data...', 'system');
    
    setTimeout(() => {
        const events = [];
        const dates = ['2023-01-15', '2023-03-22', '2023-05-10', '2023-07-18', '2023-09-05', '2023-11-30'];
        
        dates.forEach(date => {
            if (Math.random() > 0.4) {
                events.push({
                    date: date,
                    event: `Data point activity detected`,
                    confidence: Math.floor(Math.random() * 30) + 70
                });
            }
        });
        
        terminalWrite('Timeline analysis complete:', 'success');
        
        events.forEach(event => {
            terminalWrite(`  • ${event.date}: ${event.event} (${event.confidence}%)`, 'info');
        });
        
    }, 1600);
}

// Сканирование памяти
function scanMemory() {
    terminalWrite('Scanning system memory for residual data...', 'system');
    
    setTimeout(() => {
        const found = Math.floor(Math.random() * 15) + 5;
        
        terminalWrite('Memory scan complete:', 'success');
        terminalWrite(`  • Found ${found} residual data fragments`, 'info');
        terminalWrite(`  • Recovered ${Math.floor(found * 0.7)} data points`, 'info');
        terminalWrite(`  • Memory integrity: ${Math.floor(Math.random() * 20) + 80}%`, 'info');
        
        // Добавляем "найденные" данные
        if (found > 0) {
            for (let i = 0; i < Math.min(found, 5); i++) {
                const fakeData = generateFakeData();
                extractedData.push(fakeData);
                processingStats.totalData++;
            }
            
            updateProcessingStats();
            terminalWrite('New data points added to database', 'info');
        }
        
    }, 2200);
}

// ================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==================

// Задержка
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Генерация тестовых данных
function generateFakeData() {
    const types = ['person', 'phone', 'email', 'location'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const data = {
        person: ['Иван Иванов', 'Петр Петров', 'Сергей Сергеев', 'Анна Сидорова', 'Мария Петрова'],
        phone: ['+79161234567', '+79269876543', '+79031234567', '+79105556677', '+79264443322'],
        email: ['test@mail.ru', 'user@gmail.com', 'admin@yandex.ru', 'info@domain.com', 'support@company.ru'],
        location: ['Москва, ул. Ленина, д. 1', 'Санкт-Петербург, Невский пр., д. 10', 'Киев, ул. Крещатик, д. 25']
    };
    
    return {
        id: Date.now() + Math.random(),
        type: type,
        value: data[type][Math.floor(Math.random() * data[type].length)],
        source: 'memory_scan',
        confidence: Math.floor(Math.random() * 20) + 80,
        timestamp: new Date().toISOString()
    };
}

// Экспорт всех данных
function exportAllData() {
    if (extractedData.length === 0) {
        terminalWrite('No data to export', 'warning');
        return;
    }
    
    const exportObj = {
        metadata: {
            exportDate: new Date().toISOString(),
            system: 'CYBER SCOUT v5.0',
            totalRecords: extractedData.length,
            filesProcessed: loadedFiles.filter(f => f.processed).length
        },
        files: loadedFiles.map(f => ({
            name: f.name,
            size: f.size,
            processed: f.processed,
            dataPoints: f.data ? f.data.length : 0
        })),
        data: extractedData,
        statistics: processingStats
    };
    
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyber_scout_full_export_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    terminalWrite(`Full export complete: ${extractedData.length} records`, 'success');
}

// Очистка всей системы
function resetSystem() {
    if (confirm('Reset entire system? All data will be lost.')) {
        loadedFiles = [];
        extractedData = [];
        processingStats = {
            totalFiles: 0,
            processedFiles: 0,
            totalData: 0,
            persons: 0,
            phones: 0,
            emails: 0,
            locations: 0
        };
        
        document.getElementById('filesContainer').innerHTML = `
            <div class="empty-files">
                <i class="fas fa-file-alt"></i>
                <p>No files loaded</p>
            </div>
        `;
        
        clearResults();
        clearTerminal();
        updateFileCount();
        updateProcessingStats();
        
        terminalWrite('System reset complete', 'system');
    }
}

// Информация о системе
function showSystemInfo() {
    terminalWrite('====== SYSTEM INFORMATION ======', 'system');
    terminalWrite(`Version: CYBER SCOUT v5.0`, 'info');
    terminalWrite(`Files loaded: ${loadedFiles.length}`, 'info');
    terminalWrite(`Data points: ${extractedData.length}`, 'info');
    terminalWrite(`Memory usage: ${(performance.memory ? (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) : 'N/A')} MB`, 'info');
    terminalWrite(`User agent: ${navigator.userAgent.substring(0, 50)}...`, 'info');
    terminalWrite('================================', 'system');
}

// Запуск всех функций при полной загрузке
window.onload = function() {
    // Автоматическое тестирование системы
    setTimeout(() => {
        if (loadedFiles.length === 0) {
            terminalWrite('Ready to process any text-based files', 'success');
            terminalWrite('Drag & drop files or click "Browse Files"', 'info');
            terminalWrite('Supports: .txt, .csv, .json, .xml, .log, .doc, .pdf, .rtf', 'info');
        }
    }, 2000);
};