// EDM Music App - Основной скрипт
// Часть 1: Инициализация и базовые функции

// Конфигурация приложения
const CONFIG = {
    appName: "EDM Music",
    version: "1.0.0",
    telegramChannel: "https://t.me/EDM_tm",
    supportContact: "@EDEM_CR",
    termsUrl: "https://telegra.ph/POLZOVATELSKOE-SOGLASHENIE-po-ispolzovaniyu-programm-11-06",
    
    // Музыкальные источники (используем кэшированные демо1-треки)
    musicSources: [
        {
            name: "EDM Hits",
            url: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3",
            image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        },
        {
            name: "Chill Vibes",
            url: "https://assets.mixkit.co/music/preview/mixkit-driving-ambition-32.mp3",
            image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        },
        {
            name: "Synthwave",
            url: "https://assets.mixkit.co/music/preview/mixkit-deep-urban-623.mp3",
            image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        },
        {
            name: "Ambient",
            url: "https://assets.mixkit.co/music/preview/mixkit-relaxation-time-117.mp3",
            image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        },
        {
            name: "Summer Mix",
            url: "https://assets.mixkit.co/music/preview/mixkit-summer-bossa-482.mp3",
            image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        },
        {
            name: "Night Drive",
            url: "https://assets.mixkit.co/music/preview/mixkit-nightlife-56.mp3",
            image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        }
    ]
};

// Состояние приложения
const AppState = {
    // Пользователь
    user: {
        isLoggedIn: false,
        username: null,
        avatar: null,
        token: null
    },
    
    // Музыка
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    isMuted: false,
    
    // Режимы
    shuffle: false,
    repeat: false,
    
    // Коллекции
    favorites: [],
    history: [],
    playlists: [],
    queue: [],
    
    // Настройки
    settings: {
        theme: 'auto',
        wifiOnly: false,
        notifications: true,
        autoDownload: false,
        quality: 'high'
    },
    
    // UI состояние
    activeFilter: 'all',
    searchQuery: '',
    currentPage: 1,
    activeModal: null,
    contextMenu: {
        visible: false,
        trackId: null,
        x: 0,
        y: 0
    },
    
    // Временные данные
    sleepTimer: null,
    audioVisualizer: null
};

// DOM элементы
const Elements = {
    // Аудио элементы
    audioPlayer: document.getElementById('audioPlayer'),
    backgroundAudio: document.getElementById('backgroundAudio'),
    
    // Основные контейнеры
    appContainer: document.querySelector('.app-container'),
    mainContent: document.querySelector('.main-content'),
    
    // Верхняя панель
    searchToggle: document.getElementById('searchToggle'),
    profileBtn: document.getElementById('profileBtn'),
    searchContainer: document.getElementById('searchContainer'),
    searchInput: document.getElementById('searchInput'),
    searchActionBtn: document.getElementById('searchActionBtn'),
    searchCloseBtn: document.getElementById('searchCloseBtn'),
    
    // Фильтры
    filterChips: document.querySelectorAll('.filter-chip'),
    filtersModal: document.getElementById('filtersModal'),
    closeFiltersModal: document.getElementById('closeFiltersModal'),
    
    // Треки
    tracksGrid: document.getElementById('tracksGrid'),
    refreshRecommendations: document.getElementById('refreshRecommendations'),
    
    // Плеер
    miniPlayer: document.getElementById('miniPlayer'),
    playerThumbnail: document.getElementById('playerThumbnail'),
    playerTrackTitle: document.getElementById('playerTrackTitle'),
    playerTrackArtist: document.getElementById('playerTrackArtist'),
    miniFavoriteBtn: document.getElementById('miniFavoriteBtn'),
    miniPlayBtn: document.getElementById('miniPlayBtn'),
    expandPlayerBtn: document.getElementById('expandPlayerBtn'),
    
    // Полноэкранный плеер
    fullscreenPlayer: document.getElementById('fullscreenPlayer'),
    closeFullscreenPlayer: document.getElementById('closeFullscreenPlayer'),
    playerBackground: document.getElementById('playerBackground'),
    albumArtImage: document.getElementById('albumArtImage'),
    fullscreenTrackTitle: document.getElementById('fullscreenTrackTitle'),
    fullscreenTrackArtist: document.getElementById('fullscreenTrackArtist'),
    fullscreenPlayBtn: document.getElementById('fullscreenPlayBtn'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    repeatBtn: document.getElementById('repeatBtn'),
    progressBar: document.getElementById('progressBar'),
    progressFill: document.getElementById('progressFill'),
    currentTime: document.getElementById('currentTime'),
    totalTime: document.getElementById('totalTime'),
    fullscreenFavoriteBtn: document.getElementById('fullscreenFavoriteBtn'),
    playerMenuBtn: document.getElementById('playerMenuBtn'),
    
    // Навигация
    navItems: document.querySelectorAll('.nav-item'),
    
    // Модальные окна
    profileModal: document.getElementById('profileModal'),
    closeProfileModal: document.getElementById('closeProfileModal'),
    settingsModal: document.getElementById('settingsModal'),
    closeSettingsModal: document.getElementById('closeSettingsModal'),
    equalizerModal: document.getElementById('equalizerModal'),
    closeEqualizerModal: document.getElementById('closeEqualizerModal'),
    
    // Формы
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    authTabs: document.querySelectorAll('.auth-tab'),
    editProfileForm: document.getElementById('editProfileForm'),
    
    // UI элементы
    profileInfoSection: document.getElementById('profileInfoSection'),
    authSection: document.getElementById('authSection'),
    profileUsername: document.getElementById('profileUsername'),
    profileAvatar: document.getElementById('profileAvatar'),
    logoutBtn: document.getElementById('logoutBtn'),
    
    // Настройки
    themeSelect: document.getElementById('themeSelect'),
    wifiOnlyToggle: document.getElementById('wifiOnlyToggle'),
    notificationsToggle: document.getElementById('notificationsToggle'),
    autoDownloadToggle: document.getElementById('autoDownloadToggle'),
    termsBtn: document.getElementById('termsBtn'),
    footerTermsBtn: document.getElementById('footerTermsBtn'),
    clearCacheBtn: document.getElementById('clearCacheBtn'),
    aboutBtn: document.getElementById('aboutBtn'),
    
    // Эквалайзер
    eqSliders: document.querySelectorAll('.eq-slider'),
    presetButtons: document.querySelectorAll('.preset-btn'),
    
    // Футер
    telegramChannelBtn: document.getElementById('telegramChannelBtn'),
    
    // Дополнительные элементы
    loadingOverlay: document.getElementById('loadingOverlay'),
    toastContainer: document.getElementById('toastContainer'),
    contextMenu: document.getElementById('contextMenu'),
    playerMenu: document.getElementById('playerMenu'),
    aboutModal: document.getElementById('aboutModal'),
    closeAboutModal: document.getElementById('closeAboutModal'),
    editProfileModal: document.getElementById('editProfileModal'),
    closeEditProfileModal: document.getElementById('closeEditProfileModal'),
    cancelEditProfile: document.getElementById('cancelEditProfile'),
    
    // Флоатинг меню
    floatingMenuBtn: document.getElementById('floatingMenuBtn'),
    floatingMenu: document.getElementById('floatingMenu'),
    
    // Пагинация
    paginationContainer: document.getElementById('paginationContainer'),
    paginationPrev: document.getElementById('paginationPrev'),
    paginationNext: document.getElementById('paginationNext'),
    pageNumbers: document.querySelectorAll('.page-number'),
    
    // Визуализация
    audioVisualizer: document.getElementById('audioVisualizer'),
    particles: document.getElementById('particles')
};

// Музыкальная библиотека (демо данные)
const MusicLibrary = [
    {
        id: 1,
        title: "Neon Dreams",
        artist: "Synthwave Pro",
        duration: 245,
        url: CONFIG.musicSources[0].url,
        image: CONFIG.musicSources[0].image,
        genre: "electronic",
        mood: "energetic",
        year: 2024,
        plays: 1250,
        likes: 320
    },
    {
        id: 2,
        title: "Ocean Breeze",
        artist: "Chill Collective",
        duration: 312,
        url: CONFIG.musicSources[1].url,
        image: CONFIG.musicSources[1].image,
        genre: "ambient",
        mood: "calm",
        year: 2024,
        plays: 980,
        likes: 245
    },
    {
        id: 3,
        title: "Midnight Drive",
        artist: "Retro Future",
        duration: 238,
        url: CONFIG.musicSources[2].url,
        image: CONFIG.musicSources[2].image,
        genre: "synthwave",
        mood: "mix",
        year: 2024,
        plays: 1560,
        likes: 410
    },
    {
        id: 4,
        title: "Starlight",
        artist: "Cosmic Sound",
        duration: 305,
        url: CONFIG.musicSources[3].url,
        image: CONFIG.musicSources[3].image,
        genre: "ambient",
        mood: "calm",
        year: 2024,
        plays: 890,
        likes: 210
    },
    {
        id: 5,
        title: "Summer Vibes",
        artist: "Tropical Beats",
        duration: 262,
        url: CONFIG.musicSources[4].url,
        image: CONFIG.musicSources[4].image,
        genre: "house",
        mood: "energetic",
        year: 2024,
        plays: 2100,
        likes: 520
    },
    {
        id: 6,
        title: "City Lights",
        artist: "Urban Flow",
        duration: 295,
        url: CONFIG.musicSources[5].url,
        image: CONFIG.musicSources[5].image,
        genre: "techno",
        mood: "energetic",
        year: 2024,
        plays: 1750,
        likes: 430
    },
    {
        id: 7,
        title: "Desert Wind",
        artist: "Nomadic Sound",
        duration: 328,
        url: "https://assets.mixkit.co/music/preview/mixkit-ambient-horror-436.mp3",
        image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        genre: "world",
        mood: "calm",
        year: 2024,
        plays: 720,
        likes: 180
    },
    {
        id: 8,
        title: "Digital Love",
        artist: "EDM Masters",
        duration: 285,
        url: "https://assets.mixkit.co/music/preview/mixkit-driving-ambition-32.mp3",
        image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        genre: "edm",
        mood: "energetic",
        year: 2024,
        plays: 1950,
        likes: 490
    }
];

// Инициализация приложения
function initApp() {
    console.log("Инициализация EDM Music App...");
    
    // Загружаем состояние из localStorage
    loadAppState();
    
    // Настраиваем аудио плеер
    setupAudioPlayer();
    
    // Инициализируем UI
    setupUI();
    
    // Загружаем музыку
    loadMusic();
    
    // Настраиваем обработчики событий
    setupEventListeners();
    
    // Создаем частицы
    createParticles();
    
    // Показываем приветственное сообщение
    setTimeout(() => {
        showToast("Добро пожаловать в EDM Music! 🎵", "info");
    }, 1000);
    
    console.log("Приложение инициализировано!");
}

// Загрузка состояния из localStorage
function loadAppState() {
    try {
        // Загружаем пользователя
        const savedUser = localStorage.getItem('edm_user');
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            if (userData && userData.token) {
                AppState.user = userData;
                updateUserUI();
            }
        }
        
        // Загружаем избранное
        const savedFavorites = localStorage.getItem('edm_favorites');
        if (savedFavorites) {
            AppState.favorites = JSON.parse(savedFavorites);
        }
        
        // Загружаем историю
        const savedHistory = localStorage.getItem('edm_history');
        if (savedHistory) {
            AppState.history = JSON.parse(savedHistory);
        }
        
        // Загружаем плейлисты
        const savedPlaylists = localStorage.getItem('edm_playlists');
        if (savedPlaylists) {
            AppState.playlists = JSON.parse(savedPlaylists);
        }
        
        // Загружаем настройки
        const savedSettings = localStorage.getItem('edm_settings');
        if (savedSettings) {
            AppState.settings = JSON.parse(savedSettings);
        }
        
        // Загружаем текущий трек
        const savedCurrentTrack = localStorage.getItem('edm_current_track');
        if (savedCurrentTrack) {
            AppState.currentTrack = JSON.parse(savedCurrentTrack);
        }
        
        // Загружаем громкость
        const savedVolume = localStorage.getItem('edm_volume');
        if (savedVolume) {
            AppState.volume = parseFloat(savedVolume);
            Elements.audioPlayer.volume = AppState.volume;
        }
        
        // Загружаем состояние плеера
        const savedPlayerState = localStorage.getItem('edm_player_state');
        if (savedPlayerState) {
            const playerState = JSON.parse(savedPlayerState);
            AppState.isPlaying = playerState.isPlaying;
            AppState.currentTime = playerState.currentTime;
        }
        
        console.log("Состояние загружено из localStorage");
    } catch (error) {
        console.error("Ошибка загрузки состояния:", error);
        showToast("Ошибка загрузки данных", "error");
    }
}

// Сохранение состояния в localStorage
function saveAppState() {
    try {
        // Сохраняем пользователя
        localStorage.setItem('edm_user', JSON.stringify(AppState.user));
        
        // Сохраняем избранное
        localStorage.setItem('edm_favorites', JSON.stringify(AppState.favorites));
        
        // Сохраняем историю
        localStorage.setItem('edm_history', JSON.stringify(AppState.history));
        
        // Сохраняем плейлисты
        localStorage.setItem('edm_playlists', JSON.stringify(AppState.playlists));
        
        // Сохраняем настройки
        localStorage.setItem('edm_settings', JSON.stringify(AppState.settings));
        
        // Сохраняем текущий трек
        localStorage.setItem('edm_current_track', JSON.stringify(AppState.currentTrack));
        
        // Сохраняем громкость
        localStorage.setItem('edm_volume', AppState.volume.toString());
        
        // Сохраняем состояние плеера
        localStorage.setItem('edm_player_state', JSON.stringify({
            isPlaying: AppState.isPlaying,
            currentTime: AppState.currentTime
        }));
        
        console.log("Состояние сохранено в localStorage");
    } catch (error) {
        console.error("Ошибка сохранения состояния:", error);
    }
}

// Настройка аудио плеера
function setupAudioPlayer() {
    Elements.audioPlayer.volume = AppState.volume;
    
    // События аудио плеера
    Elements.audioPlayer.addEventListener('timeupdate', updateAudioProgress);
    Elements.audioPlayer.addEventListener('loadedmetadata', updateAudioDuration);
    Elements.audioPlayer.addEventListener('ended', handleAudioEnd);
    Elements.audioPlayer.addEventListener('error', handleAudioError);
    Elements.audioPlayer.addEventListener('play', handleAudioPlay);
    Elements.audioPlayer.addEventListener('pause', handleAudioPause);
    
    // Восстанавливаем воспроизведение, если было приостановлено
    if (AppState.currentTrack && AppState.isPlaying) {
        setTimeout(() => {
            Elements.audioPlayer.src = AppState.currentTrack.url;
            Elements.audioPlayer.currentTime = AppState.currentTime;
            Elements.audioPlayer.play().catch(console.error);
        }, 500);
    }
}

// Настройка UI
function setupUI() {
    // Обновляем настройки
    updateSettingsUI();
    
    // Обновляем UI пользователя
    updateUserUI();
    
    // Обновляем кнопки плеера
    updatePlayerButtons();
    
    // Скрываем загрузку
    Elements.loadingOverlay.style.display = 'none';
}

// Загрузка музыки
function loadMusic() {
    console.log("Загрузка музыки...");
    
    // Очищаем сетку треков
    Elements.tracksGrid.innerHTML = '';
    
    // Фильтруем треки
    let filteredTracks = MusicLibrary;
    
    // Применяем активный фильтр
    if (AppState.activeFilter && AppState.activeFilter !== 'all') {
        filteredTracks = filteredTracks.filter(track => {
            if (AppState.activeFilter === 'trending') return track.plays > 1000;
            if (AppState.activeFilter === 'new') return track.year === 2024;
            if (AppState.activeFilter === 'energetic') return track.mood === 'energetic';
            if (AppState.activeFilter === 'chill') return track.mood === 'calm';
            if (AppState.activeFilter === 'mix') return track.mood === 'mix';
            return true;
        });
    }
    
    // Применяем поисковый запрос
    if (AppState.searchQuery) {
        const query = AppState.searchQuery.toLowerCase();
        filteredTracks = filteredTracks.filter(track =>
            track.title.toLowerCase().includes(query) ||
            track.artist.toLowerCase().includes(query) ||
            track.genre.toLowerCase().includes(query)
        );
    }
    
    // Отображаем треки
    filteredTracks.forEach((track, index) => {
        const trackElement = createTrackElement(track);
        Elements.tracksGrid.appendChild(trackElement);
        
        // Добавляем анимацию задержки
        setTimeout(() => {
            trackElement.classList.add('fade-in');
        }, index * 100);
    });
    
    console.log(`Загружено ${filteredTracks.length} треков`);
}

// Создание элемента трека
function createTrackElement(track) {
    const isFavorite = AppState.favorites.some(fav => fav.id === track.id);
    const isPlaying = AppState.currentTrack && AppState.currentTrack.id === track.id;
    
    const trackElement = document.createElement('div');
    trackElement.className = `track-card ${isPlaying ? 'playing' : ''}`;
    trackElement.dataset.id = track.id;
    
    trackElement.innerHTML = `
        <div class="track-image-placeholder">
            <i class="fas fa-music"></i>
        </div>
        <div class="track-info">
            <h3 class="track-title">${track.title}</h3>
            <p class="track-artist">${track.artist}</p>
            <div class="track-meta">
                <span class="track-duration">${formatTime(track.duration)}</span>
                <div class="track-actions">
                    <button class="track-action-btn favorite-btn ${isFavorite ? 'active' : ''}" 
                            data-id="${track.id}">
                        <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                    <button class="track-action-btn play-btn" data-id="${track.id}">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Обработчики событий для трека
    const playBtn = trackElement.querySelector('.play-btn');
    const favoriteBtn = trackElement.querySelector('.favorite-btn');
    
    playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playTrack(track);
    });
    
    favoriteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(track.id);
    });
    
    trackElement.addEventListener('click', (e) => {
        if (!playBtn.contains(e.target) && !favoriteBtn.contains(e.target)) {
            playTrack(track);
        }
    });
    
    // Контекстное меню
    trackElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e, track);
    });
    
    return trackElement;
}

// Форматирование времени
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Показать контекстное меню
function showContextMenu(event, track) {
    event.preventDefault();
    
    AppState.contextMenu = {
        visible: true,
        trackId: track.id,
        x: event.clientX,
        y: event.clientY
    };
    
    // Позиционируем меню
    Elements.contextMenu.style.left = `${event.clientX}px`;
    Elements.contextMenu.style.top = `${event.clientY}px`;
    Elements.contextMenu.classList.add('active');
    
    // Обновляем элементы меню
    const isFavorite = AppState.favorites.some(fav => fav.id === track.id);
    const favoriteItem = Elements.contextMenu.querySelector('[data-action="add-to-favorites"]');
    
    if (favoriteItem) {
        favoriteItem.innerHTML = `
            <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
            ${isFavorite ? 'Удалить из избранного' : 'В избранное'}
        `;
    }
    
    // Закрываем меню при клике вне
    setTimeout(() => {
        document.addEventListener('click', closeContextMenu);
    }, 100);
}

// Закрыть контекстное меню
function closeContextMenu() {
    AppState.contextMenu.visible = false;
    Elements.contextMenu.classList.remove('active');
    document.removeEventListener('click', closeContextMenu);
}

// Показать уведомление
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas fa-${icons[type] || 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    Elements.toastContainer.appendChild(toast);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Создание частиц
function createParticles() {
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle();
    }
}

// Создание одной частицы
function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Случайные параметры
    const size = Math.random() * 20 + 5;
    const posX = Math.random() * 100;
    const delay = Math.random() * 15;
    const duration = Math.random() * 10 + 15;
    const opacity = Math.random() * 0.3 + 0.1;
    
    // Случайный цвет из градиента
    const colors = [
        'rgba(109, 40, 217, VAR_OPACITY)',
        'rgba(236, 72, 153, VAR_OPACITY)',
        'rgba(249, 115, 22, VAR_OPACITY)',
        'rgba(245, 158, 11, VAR_OPACITY)',
        'rgba(16, 185, 129, VAR_OPACITY)',
        'rgba(59, 130, 246, VAR_OPACITY)'
    ];
    
    const color = colors[Math.floor(Math.random() * colors.length)].replace('VAR_OPACITY', opacity);
    
    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${posX}%;
        top: -${size}px;
        background: ${color};
        border-radius: 50%;
        animation: floatParticle ${duration}s linear infinite ${delay}s;
        pointer-events: none;
    `;
    
    Elements.particles.appendChild(particle);
    
    // Удаляем частицу после анимации и создаем новую
    setTimeout(() => {
        particle.remove();
        createParticle();
    }, (duration + delay) * 1000);
}

// Добавляем CSS анимацию для частиц
const style = document.createElement('style');
style.textContent = `
    @keyframes floatParticle {
        0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) translateX(${Math.random() * 100 - 50}px) rotate(${Math.random() * 360}deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// EDM Music App - Основной скрипт
// Часть 2: Управление музыкой и плеером

// Воспроизведение трека
function playTrack(track) {
    console.log("Воспроизведение трека:", track.title);
    
    // Обновляем текущий трек
    AppState.currentTrack = track;
    
    // Устанавливаем источник аудио
    Elements.audioPlayer.src = track.url;
    
    // Обновляем UI
    updatePlayerUI(track);
    
    // Показываем мини    -плеер
    Elements.miniPlayer.classList.remove('hidden');
    
    // Воспроизводим
    Elements.audioPlayer.play().then(() => {
        AppState.isPlaying = true;
        updatePlayerButtons();
        
        // Добавляем в историю
        addToHistory(track);
        
        // Показываем визуализацию
        Elements.audioVisualizer.classList.add('active');
        
        // Показываем уведомление
        if (AppState.settings.notifications) {
            showToast(`Сейчас играет: ${track.title}`, 'info');
        }
        
        // Обновляем статистику
        updateTrackStats(track.id);
        
        // Сохраняем состояние
        saveAppState();
        
        console.log("Трек начал воспроизведение");
    }).catch(error => {
        console.error("Ошибка воспроизведения:", error);
        showToast("Ошибка воспроизведения трека", 'error');
    });
}

// Обновление UI плеера
function updatePlayerUI(track) {
    // Нижний плеер
    Elements.playerTrackTitle.textContent = track.title;
    Elements.playerTrackArtist.textContent = track.artist;
    
    // Обновляем иконку избранного
    const isFavorite = AppState.favorites.some(fav => fav.id === track.id);
    Elements.miniFavoriteBtn.innerHTML = `<i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>`;
    Elements.fullscreenFavoriteBtn.innerHTML = `<i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>`;
    
    // Полноэкранный плеер
    Elements.fullscreenTrackTitle.textContent = track.title;
    Elements.fullscreenTrackArtist.textContent = track.artist;
    
    // Обложка альбома
    if (track.image) {
        Elements.albumArtImage.src = track.image;
        Elements.albumArtImage.style.display = 'block';
        Elements.playerBackground.style.backgroundImage = `url(${track.image})`;
        
        // Загружаем изображение для мини-плеера
        Elements.playerThumbnail.innerHTML = `<img src="${track.image}" alt="${track.title}">`;
    } else {
        Elements.albumArtImage.style.display = 'none';
        Elements.playerBackground.style.background = 'var(--gradient-primary)';
        Elements.playerThumbnail.innerHTML = `<i class="fas fa-music"></i>`;
    }
    
    // Обновляем карточки треков
    updateTrackCards();
}

// Обновление карточек треков
function updateTrackCards() {
    document.querySelectorAll('.track-card').forEach(card => {
        const trackId = parseInt(card.dataset.id);
        const isPlaying = AppState.currentTrack && AppState.currentTrack.id === trackId;
        
        // Обновляем класс playing
        card.classList.toggle('playing', isPlaying);
        
        // Обновляем кнопку избранного
        const favoriteBtn = card.querySelector('.favorite-btn');
        if (favoriteBtn) {
            const isFavorite = AppState.favorites.some(fav => fav.id === trackId);
            favoriteBtn.classList.toggle('active', isFavorite);
            favoriteBtn.innerHTML = `<i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>`;
        }
        
        // Обновляем кнопку воспроизведения
        const playBtn = card.querySelector('.play-btn');
        if (playBtn && isPlaying) {
            playBtn.innerHTML = `<i class="fas fa-${AppState.isPlaying ? 'pause' : 'play'}"></i>`;
        } else if (playBtn) {
            playBtn.innerHTML = `<i class="fas fa-play"></i>`;
        }
    });
}

// Переключение воспроизведения/паузы
function togglePlayPause() {
    if (!AppState.currentTrack) {
        // Если нет текущего трека, воспроизводим первый
        playTrack(MusicLibrary[0]);
        return;
    }
    
    if (AppState.isPlaying) {
        pauseAudio();
    } else {
        resumeAudio();
    }
}

// Пауза аудио
function pauseAudio() {
    Elements.audioPlayer.pause();
    AppState.isPlaying = false;
    updatePlayerButtons();
    
    // Скрываем визуализацию
    Elements.audioVisualizer.classList.remove('active');
    
    console.log("Воспроизведение приостановлено");
}

// Возобновление воспроизведения
function resumeAudio() {
    Elements.audioPlayer.play().then(() => {
        AppState.isPlaying = true;
        updatePlayerButtons();
        
        // Показываем визуализацию
        Elements.audioVisualizer.classList.add('active');
        
        console.log("Воспроизведение возобновлено");
    }).catch(error => {
        console.error("Ошибка возобновления:", error);
        showToast("Ошибка воспроизведения", 'error');
    });
}

// Обновление кнопок плеера
function updatePlayerButtons() {
    const playIcon = AppState.isPlaying ? 'fa-pause' : 'fa-play';
    
    // Мини-плеер
    Elements.miniPlayBtn.innerHTML = `<i class="fas ${playIcon}"></i>`;
    
    // Полноэкранный плеер
    Elements.fullscreenPlayBtn.innerHTML = `<i class="fas ${playIcon}"></i>`;
    
    // Кнопки навигации
    Elements.shuffleBtn.classList.toggle('active', AppState.shuffle);
    Elements.repeatBtn.classList.toggle('active', AppState.repeat);
    
    console.log("Кнопки плеера обновлены");
}

// Обновление прогресса аудио
function updateAudioProgress() {
    if (!isNaN(Elements.audioPlayer.duration)) {
        AppState.currentTime = Elements.audioPlayer.currentTime;
        AppState.duration = Elements.audioPlayer.duration;
        
        const progressPercent = (AppState.currentTime / AppState.duration) * 100;
        Elements.progressFill.style.width = `${progressPercent}%`;
        
        // Обновляем время
        Elements.currentTime.textContent = formatTime(AppState.currentTime);
        Elements.totalTime.textContent = formatTime(AppState.duration);
        
        // Обновляем визуализацию
        updateAudioVisualizer();
    }
}

// Обновление длительности аудио
function updateAudioDuration() {
    AppState.duration = Elements.audioPlayer.duration;
    Elements.totalTime.textContent = formatTime(AppState.duration);
}

// Обработка окончания трека
function handleAudioEnd() {
    console.log("Трек завершен");
    
    if (AppState.repeat) {
        // Повтор текущего трека
        Elements.audioPlayer.currentTime = 0;
        Elements.audioPlayer.play();
    } else {
        // Следующий трек
        playNextTrack();
    }
}

// Обработка ошибки аудио
function handleAudioError(error) {
    console.error("Ошибка аудио:", error);
    showToast("Ошибка загрузки аудио", 'error');
    
    // Пробуем следующий трек
    setTimeout(playNextTrack, 1000);
}

// Обработка начала воспроизведения
function handleAudioPlay() {
    console.log("Аудио началось");
    AppState.isPlaying = true;
    updatePlayerButtons();
}

// Обработка паузы
function handleAudioPause() {
    console.log("Аудио приостановлено");
    AppState.isPlaying = false;
    updatePlayerButtons();
}

// Переключение избранного
function toggleFavorite(trackId) {
    const track = MusicLibrary.find(t => t.id === trackId);
    if (!track) return;
    
    const isFavorite = AppState.favorites.some(fav => fav.id === trackId);
    
    if (isFavorite) {
        // Удаляем из избранного
        AppState.favorites = AppState.favorites.filter(fav => fav.id !== trackId);
        showToast("Удалено из избранного", 'info');
    } else {
        // Добавляем в избранное
        AppState.favorites.push(track);
        showToast("Добавлено в избранное", 'success');
        
        // Анимация сердечка
        const heartIcon = document.querySelector(`[data-id="${trackId}"] .favorite-btn i`);
        if (heartIcon) {
            heartIcon.classList.add('heart-beat');
            setTimeout(() => heartIcon.classList.remove('heart-beat'), 500);
        }
    }
    
    // Обновляем UI
    updateFavoriteButtons(trackId);
    updateUserStats();
    saveAppState();
    
    console.log("Избранное обновлено");
}

// Обновление кнопок избранного
function updateFavoriteButtons(trackId) {
    const isFavorite = AppState.favorites.some(fav => fav.id === trackId);
    
    // Мини-плеер
    Elements.miniFavoriteBtn.innerHTML = `<i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>`;
    
    // Полноэкранный плеер
    Elements.fullscreenFavoriteBtn.innerHTML = `<i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>`;
    
    // Карточки треков
    document.querySelectorAll(`[data-id="${trackId}"] .favorite-btn`).forEach(btn => {
        btn.classList.toggle('active', isFavorite);
        btn.innerHTML = `<i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>`;
    });
    
    // Контекстное меню
    if (AppState.contextMenu.trackId === trackId) {
        const contextFavoriteBtn = Elements.contextMenu.querySelector('[data-action="add-to-favorites"]');
        if (contextFavoriteBtn) {
            contextFavoriteBtn.innerHTML = `
                <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                ${isFavorite ? 'Удалить из избранного' : 'В избранное'}
            `;
        }
    }
}

// Добавление в историю
function addToHistory(track) {
    // Удаляем трек, если он уже есть в истории
    AppState.history = AppState.history.filter(item => item.id !== track.id);
    
    // Добавляем в начало
    AppState.history.unshift({
        ...track,
        playedAt: new Date().toISOString(),
        playCount: (track.playCount || 0) + 1
    });
    
    // Ограничиваем размер истории
    if (AppState.history.length > 50) {
        AppState.history = AppState.history.slice(0, 50);
    }
    
    // Сохраняем
    saveAppState();
    
    console.log("Добавлено в историю:", track.title);
}

// Обновление статистики трека
function updateTrackStats(trackId) {
    const track = MusicLibrary.find(t => t.id === trackId);
    if (track) {
        track.plays = (track.plays || 0) + 1;
        
        // Можно сохранить статистику в localStorage
        const statsKey = `edm_stats_${trackId}`;
        const trackStats = JSON.parse(localStorage.getItem(statsKey) || '{"plays": 0, "lastPlayed": null}');
        trackStats.plays = (trackStats.plays || 0) + 1;
        trackStats.lastPlayed = new Date().toISOString();
        localStorage.setItem(statsKey, JSON.stringify(trackStats));
        
        console.log("Статистика обновлена для трека:", trackId);
    }
}

// Воспроизведение предыдущего трека
function playPreviousTrack() {
    if (!AppState.currentTrack) return;
    
    const currentIndex = MusicLibrary.findIndex(track => track.id === AppState.currentTrack.id);
    let previousIndex = currentIndex - 1;
    
    if (previousIndex < 0) {
        previousIndex = MusicLibrary.length - 1;
    }
    
    playTrack(MusicLibrary[previousIndex]);
}

// Воспроизведение следующего трека
function playNextTrack() {
    if (!AppState.currentTrack) return;
    
    let nextTrack;
    
    if (AppState.shuffle) {
        // Случайный трек (исключая текущий)
        const availableTracks = MusicLibrary.filter(track => track.id !== AppState.currentTrack.id);
        const randomIndex = Math.floor(Math.random() * availableTracks.length);
        nextTrack = availableTracks[randomIndex];
    } else {
        // Следующий по порядку
        const currentIndex = MusicLibrary.findIndex(track => track.id === AppState.currentTrack.id);
        let nextIndex = currentIndex + 1;
        
        if (nextIndex >= MusicLibrary.length) {
            if (AppState.repeat) {
                nextIndex = 0;
            } else {
                // Останавливаем воспроизведение
                AppState.currentTrack = null;
                AppState.isPlaying = false;
                updatePlayerButtons();
                Elements.miniPlayer.classList.add('hidden');
                showToast("Плейлист завершен", 'info');
                return;
            }
        }
        
        nextTrack = MusicLibrary[nextIndex];
    }
    
    playTrack(nextTrack);
}

// Переключение режима перемешивания
function toggleShuffle() {
    AppState.shuffle = !AppState.shuffle;
    Elements.shuffleBtn.classList.toggle('active', AppState.shuffle);
    
    const message = AppState.shuffle ? 'Перемешивание включено' : 'Перемешивание выключено';
    showToast(message, 'info');
    
    saveAppState();
    console.log("Режим перемешивания:", AppState.shuffle ? 'включен' : 'выключен');
}

// Переключение режима повтора
function toggleRepeat() {
    AppState.repeat = !AppState.repeat;
    Elements.repeatBtn.classList.toggle('active', AppState.repeat);
    
    const message = AppState.repeat ? 'Повтор включен' : 'Повтор выключен';
    showToast(message, 'info');
    
    saveAppState();
    console.log("Режим повтора:", AppState.repeat ? 'включен' : 'выключен');
}

// Обновление визуализации аудио
function updateAudioVisualizer() {
    if (!AppState.isPlaying || !Elements.audioVisualizer.classList.contains('active')) return;
    
    const bars = Elements.audioVisualizer.querySelectorAll('.visualizer-bar');
    bars.forEach((bar, index) => {
        // Простая анимация на основе времени
        const time = Date.now() / 1000;
        const height = 10 + Math.sin(time * 2 + index) * 20;
        bar.style.height = `${Math.max(10, height)}px`;
    });
}

// Перемотка аудио
function seekAudio(event) {
    if (!AppState.currentTrack) return;
    
    const progressBar = event.currentTarget;
    const clickPosition = event.offsetX;
    const progressBarWidth = progressBar.clientWidth;
    const seekTime = (clickPosition / progressBarWidth) * AppState.duration;
    
    Elements.audioPlayer.currentTime = seekTime;
    
    console.log("Перемотка к:", formatTime(seekTime));
}

// Открытие полноэкранного плеера
function openFullscreenPlayer() {
    if (!AppState.currentTrack) return;
    
    Elements.fullscreenPlayer.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Обновляем UI
    updatePlayerUI(AppState.currentTrack);
    
    console.log("Полноэкранный плеер открыт");
}

// Закрытие полноэкранного плеера
function closeFullscreenPlayer() {
    Elements.fullscreenPlayer.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    console.log("Полноэкранный плеер закрыт");
}

// Установка громкости
function setVolume(volume) {
    AppState.volume = Math.max(0, Math.min(1, volume));
    Elements.audioPlayer.volume = AppState.volume;
    
    // Обновляем UI громкости
    updateVolumeUI();
    
    // Сохраняем
    saveAppState();
    
    console.log("Громкость установлена:", Math.round(AppState.volume * 100) + '%');
}

// Обновление UI громкости
function updateVolumeUI() {
    // Обновляем иконки
    const volume = AppState.volume;
    const isMuted = AppState.isMuted || volume === 0;
    
    if (isMuted) {
        // Показываем иконку mute
        document.getElementById('volumeMuteIcon').style.opacity = '1';
        document.getElementById('volumeMuteIcon').style.transform = 'scale(1)';
        document.getElementById('volumeLowIcon').style.opacity = '0';
        document.getElementById('volumeHighIcon').style.opacity = '0';
    } else if (volume < 0.3) {
        // Показываем иконку low
        document.getElementById('volumeMuteIcon').style.opacity = '0';
        document.getElementById('volumeLowIcon').style.opacity = '1';
        document.getElementById('volumeLowIcon').style.transform = 'scale(1)';
        document.getElementById('volumeHighIcon').style.opacity = '0';
    } else {
        // Показываем иконку high
        document.getElementById('volumeMuteIcon').style.opacity = '0';
        document.getElementById('volumeLowIcon').style.opacity = '0';
        document.getElementById('volumeHighIcon').style.opacity = '1';
        document.getElementById('volumeHighIcon').style.transform = 'scale(1)';
    }
    
    // Обновляем слайдер
    if (Elements.volumeSlider) {
        Elements.volumeSlider.value = volume * 100;
    }
    
    if (document.getElementById('volumeSliderFull')) {
        document.getElementById('volumeSliderFull').value = volume * 100;
        document.getElementById('volumePercentage').textContent = `${Math.round(volume * 100)}%`;
    }
}

// Переключение режима mute
function toggleMute() {
    AppState.isMuted = !AppState.isMuted;
    
    if (AppState.isMuted) {
        Elements.audioPlayer.volume = 0;
    } else {
        Elements.audioPlayer.volume = AppState.volume;
    }
    
    updateVolumeUI();
    showToast(AppState.isMuted ? 'Звук выключен' : 'Звук включен', 'info');
    
    console.log("Режим mute:", AppState.isMuted ? 'включен' : 'выключен');
}

// Применение фильтра
function applyFilter(filter) {
    AppState.activeFilter = AppState.activeFilter === filter ? 'all' : filter;
    
    // Обновляем кнопки фильтров
    Elements.filterChips.forEach(chip => {
        chip.classList.toggle('active', chip.dataset.filter === AppState.activeFilter);
    });
    
    // Загружаем музыку с новым фильтром
    loadMusic();
    
    if (AppState.activeFilter !== 'all') {
        showToast(`Фильтр применен: ${getFilterName(AppState.activeFilter)}`, 'info');
    }
    
    console.log("Применен фильтр:", AppState.activeFilter);
}

// Получение названия фильтра
function getFilterName(filter) {
    const names = {
        trending: 'Тренды',
        new: 'Новинки',
        energetic: 'Энергия',
        chill: 'Чилл',
        mix: 'Микс',
        all: 'Все'
    };
    return names[filter] || filter;
}

// Поиск музыки
function performSearch() {
    AppState.searchQuery = Elements.searchInput.value.trim();
    
    // Скрываем поисковую строку
    Elements.searchContainer.classList.remove('active');
    
    // Загружаем музыку с поисковым запросом
    loadMusic();
    
    if (AppState.searchQuery) {
        showToast(`Поиск: "${AppState.searchQuery}"`, 'info');
    }
    
    console.log("Выполнен поиск:", AppState.searchQuery);
}

// Обновление статистики пользователя
function updateUserStats() {
    // Обновляем счетчики в профиле
    if (AppState.user.isLoggedIn) {
        document.getElementById('statsFavorites').textContent = AppState.favorites.length;
        document.getElementById('statsListened').textContent = AppState.history.length;
        
        // Подсчитываем общее время прослушивания
        const totalSeconds = AppState.history.reduce((total, track) => total + (track.duration || 0), 0);
        const totalHours = Math.floor(totalSeconds / 3600);
        document.getElementById('statsTime').textContent = totalHours;
    }
}

// Показать/скрыть поисковую строку
function toggleSearch() {
    Elements.searchContainer.classList.toggle('active');
    
    if (Elements.searchContainer.classList.contains('active')) {
        Elements.searchInput.focus();
    } else {
        Elements.searchInput.value = '';
        AppState.searchQuery = '';
        loadMusic();
    }
    
    console.log("Поисковая строка:", Elements.searchContainer.classList.contains('active') ? 'открыта' : 'закрыта');
}

// EDM Music App - Основной скрипт
// Часть 3: Управление пользователем и аутентификация

// Обновление UI пользователя
function updateUserUI() {
    if (AppState.user.isLoggedIn) {
        // Показываем информацию профиля
        Elements.profileInfoSection.style.display = 'block';
        Elements.authSection.style.display = 'none';
        
        // Обновляем данные пользователя
        Elements.profileUsername.textContent = AppState.user.username || 'Пользователь';
        
        // Обновляем аватар
        if (AppState.user.avatar) {
            Elements.profileAvatar.innerHTML = `<img src="${AppState.user.avatar}" alt="${AppState.user.username}">`;
        } else {
            Elements.profileAvatar.innerHTML = `<i class="fas fa-user"></i>`;
        }
        
        // Обновляем статистику
        updateUserStats();
        
        // Обновляем кнопку профиля в хедере
        Elements.profileBtn.innerHTML = `<i class="fas fa-user-check"></i>`;
    } else {
        // Показываем форму авторизации
        Elements.profileInfoSection.style.display = 'none';
        Elements.authSection.style.display = 'block';
        
        // Сбрасываем формы
        Elements.loginForm.reset();
        Elements.registerForm.reset();
        
        // Активируем вкладку входа
        switchAuthTab('login');
        
        // Обновляем кнопку профиля в хедере
        Elements.profileBtn.innerHTML = `<i class="fas fa-user"></i>`;
    }
    
    console.log("UI пользователя обновлен");
}

// Переключение вкладок авторизации
function switchAuthTab(tab) {
    // Обновляем кнопки вкладок
    Elements.authTabs.forEach(authTab => {
        authTab.classList.toggle('active', authTab.dataset.tab === tab);
    });
    
    // Показываем/скрываем формы
    Elements.loginForm.classList.toggle('active', tab === 'login');
    Elements.registerForm.classList.toggle('active', tab === 'register');
    
    console.log("Переключена вкладка:", tab);
}

// Регистрация пользователя
function registerUser(username, password, avatar = null) {
    // Проверяем данные
    if (!username || !password) {
        showToast("Заполните все обязательные поля", "error");
        return false;
    }
    
    if (username.length < 3) {
        showToast("Имя пользователя должно быть не менее 3 символов", "error");
        return false;
    }
    
    if (password.length < 6) {
        showToast("Пароль должен быть не менее 6 символов", "error");
        return false;
    }
    
    // Проверяем, существует ли пользователь
    const existingUsers = JSON.parse(localStorage.getItem('edm_users') || '[]');
    const userExists = existingUsers.some(user => user.username === username);
    
    if (userExists) {
        showToast("Пользователь с таким именем уже существует", "error");
        return false;
    }
    
    // Создаем нового пользователя
    const newUser = {
        username: username.trim(),
        password: btoa(password), // Простое шифрование (в реальном приложении используйте хэширование)
        avatar: avatar || null,
        createdAt: new Date().toISOString(),
        token: generateToken()
    };
    
    // Добавляем пользователя в хранилище
    existingUsers.push(newUser);
    localStorage.setItem('edm_users', JSON.stringify(existingUsers));
    
    // Авторизуем пользователя
    AppState.user = {
        isLoggedIn: true,
        username: newUser.username,
        avatar: newUser.avatar,
        token: newUser.token
    };
    
    // Сохраняем состояние
    saveAppState();
    
    // Обновляем UI
    updateUserUI();
    
    // Показываем уведомление
    showToast("Регистрация успешна! Добро пожаловать, " + username + "! 🎉", "success");
    
    // Закрываем модальное окно
    closeModal(Elements.profileModal);
    
    console.log("Зарегистрирован новый пользователь:", username);
    return true;
}

// Вход пользователя
function loginUser(username, password) {
    // Проверяем данные
    if (!username || !password) {
        showToast("Заполните все поля", "error");
        return false;
    }
    
    // Ищем пользователя
    const existingUsers = JSON.parse(localStorage.getItem('edm_users') || '[]');
    const user = existingUsers.find(user => 
        user.username === username.trim() && 
        user.password === btoa(password)
    );
    
    if (!user) {
        showToast("Неверное имя пользователя или пароль", "error");
        return false;
    }
    
    // Авторизуем пользователя
    AppState.user = {
        isLoggedIn: true,
        username: user.username,
        avatar: user.avatar,
        token: user.token || generateToken()
    };
    
    // Обновляем токен в хранилище
    user.token = AppState.user.token;
    localStorage.setItem('edm_users', JSON.stringify(existingUsers));
    
    // Сохраняем состояние
    saveAppState();
    
    // Обновляем UI
    updateUserUI();
    
    // Показываем уведомление
    showToast("Добро пожаловать, " + username + "! 👋", "success");
    
    // Закрываем модальное окно
    closeModal(Elements.profileModal);
    
    console.log("Пользователь вошел в систему:", username);
    return true;
}

// Выход пользователя
function logoutUser() {
    // Сбрасываем состояние пользователя
    AppState.user = {
        isLoggedIn: false,
        username: null,
        avatar: null,
        token: null
    };
    
    // Сохраняем состояние
    saveAppState();
    
    // Обновляем UI
    updateUserUI();
    
    // Показываем уведомление
    showToast("Вы вышли из системы", "info");
    
    console.log("Пользователь вышел из системы");
}

// Генерация токена
function generateToken() {
    return 'token_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
}

// Редактирование профиля
function editProfile(username, avatar, currentPassword, newPassword) {
    // Проверяем авторизацию
    if (!AppState.user.isLoggedIn) {
        showToast("Вы не авторизованы", "error");
        return false;
    }
    
    // Ищем пользователя
    const existingUsers = JSON.parse(localStorage.getItem('edm_users') || '[]');
    const userIndex = existingUsers.findIndex(user => user.username === AppState.user.username);
    
    if (userIndex === -1) {
        showToast("Пользователь не найден", "error");
        return false;
    }
    
    const user = existingUsers[userIndex];
    
    // Проверяем текущий пароль
    if (user.password !== btoa(currentPassword)) {
        showToast("Неверный текущий пароль", "error");
        return false;
    }
    
    // Проверяем новое имя пользователя
    if (username && username !== user.username) {
        // Проверяем, не занято ли имя
        const usernameExists = existingUsers.some(u => u.username === username && u !== user);
        if (usernameExists) {
            showToast("Имя пользователя уже занято", "error");
            return false;
        }
        
        if (username.length < 3) {
            showToast("Имя пользователя должно быть не менее 3 символов", "error");
            return false;
        }
        
        user.username = username.trim();
        AppState.user.username = username.trim();
    }
    
    // Обновляем аватар
    if (avatar) {
        user.avatar = avatar;
        AppState.user.avatar = avatar;
    }
    
    // Обновляем пароль (если указан новый)
    if (newPassword && newPassword.length > 0) {
        if (newPassword.length < 6) {
            showToast("Новый пароль должен быть не менее 6 символов", "error");
            return false;
        }
        
        user.password = btoa(newPassword);
    }
    
    // Сохраняем изменения
    existingUsers[userIndex] = user;
    localStorage.setItem('edm_users', JSON.stringify(existingUsers));
    
    // Сохраняем состояние
    saveAppState();
    
    // Обновляем UI
    updateUserUI();
    
    // Показываем уведомление
    showToast("Профиль успешно обновлен! ✅", "success");
    
    // Закрываем модальное окно
    closeModal(Elements.editProfileModal);
    
    console.log("Профиль обновлен:", user.username);
    return true;
}

// Управление модальными окнами
function openModal(modal) {
    if (AppState.activeModal) {
        closeModal(AppState.activeModal);
    }
    
    AppState.activeModal = modal;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    console.log("Открыто модальное окно:", modal.id);
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    AppState.activeModal = null;
    
    console.log("Закрыто модальное окно:", modal.id);
}

function closeAllModals() {
    document.querySelectorAll('.modal-overlay.active').forEach(modal => {
        closeModal(modal);
    });
}

// Обновление настроек UI
function updateSettingsUI() {
    // Тема
    Elements.themeSelect.value = AppState.settings.theme;
    
    // Переключатели
    Elements.wifiOnlyToggle.checked = AppState.settings.wifiOnly;
    Elements.notificationsToggle.checked = AppState.settings.notifications;
    Elements.autoDownloadToggle.checked = AppState.settings.autoDownload;
    
    console.log("Настройки UI обновлены");
}

// Применение настроек
function applySettings() {
    // Тема
    AppState.settings.theme = Elements.themeSelect.value;
    applyTheme(AppState.settings.theme);
    
    // Переключатели
    AppState.settings.wifiOnly = Elements.wifiOnlyToggle.checked;
    AppState.settings.notifications = Elements.notificationsToggle.checked;
    AppState.settings.autoDownload = Elements.autoDownloadToggle.checked;
    
    // Сохраняем настройки
    saveAppState();
    
    // Показываем уведомление
    showToast("Настройки сохранены", "success");
    
    console.log("Настройки применены:", AppState.settings);
}

// Применение темы
function applyTheme(theme) {
    const body = document.body;
    
    // Удаляем предыдущие классы темы
    body.classList.remove('theme-light', 'theme-dark', 'theme-gradient');
    
    if (theme === 'light') {
        body.classList.add('theme-light');
    } else if (theme === 'dark') {
        body.classList.add('theme-dark');
    } else if (theme === 'gradient') {
        body.classList.add('theme-gradient');
    } else {
        // Авто-тема (следует системной)
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            body.classList.add('theme-dark');
        } else {
            body.classList.add('theme-light');
        }
    }
    
    console.log("Применена тема:", theme);
}

// Очистка кэша
function clearCache() {
    // Очищаем localStorage (кроме пользовательских данных)
    const user = localStorage.getItem('edm_user');
    const users = localStorage.getItem('edm_users');
    
    localStorage.clear();
    
    // Восстанавливаем пользовательские данные
    if (user) localStorage.setItem('edm_user', user);
    if (users) localStorage.setItem('edm_users', users);
    
    // Сбрасываем состояние приложения
    AppState.favorites = [];
    AppState.history = [];
    AppState.playlists = [];
    AppState.currentTrack = null;
    AppState.isPlaying = false;
    
    // Перезагружаем музыку
    loadMusic();
    
    // Показываем уведомление
    showToast("Кэш успешно очищен", "success");
    
    console.log("Кэш очищен");
}

// Открытие пользовательского соглашения
function openTerms() {
    window.open(CONFIG.termsUrl, '_blank');
    console.log("Открыто пользовательское соглашение");
}

// Открытие Telegram канала
function openTelegramChannel() {
    window.open(CONFIG.telegramChannel, '_blank');
    console.log("Открыт Telegram канал");
}

// Управление эквалайзером
function setupEqualizer() {
    // Загружаем настройки эквалайзера
    const savedEQ = localStorage.getItem('edm_equalizer');
    if (savedEQ) {
        const eqSettings = JSON.parse(savedEQ);
        Elements.eqSliders.forEach(slider => {
            const band = slider.dataset.band;
            if (eqSettings[band]) {
                slider.value = eqSettings[band];
            }
        });
    }
    
    console.log("Эквалайзер настроен");
}

function applyEqualizerPreset(preset) {
    const presets = {
        flat: { '60hz': 0, '230hz': 0, '910hz': 0, '4khz': 0, '14khz': 0 },
        bass: { '60hz': 8, '230hz': 6, '910hz': 0, '4khz': -2, '14khz': -4 },
        treble: { '60hz': -4, '230hz': -2, '910hz': 0, '4khz': 6, '14khz': 8 },
        vocal: { '60hz': -2, '230hz': 2, '910hz': 4, '4khz': 6, '14khz': 2 }
    };
    
    if (presets[preset]) {
        // Применяем пресет
        Elements.eqSliders.forEach(slider => {
            const band = slider.dataset.band;
            if (presets[preset][band] !== undefined) {
                slider.value = presets[preset][band];
            }
        });
        
        // Обновляем активную кнопку
        Elements.presetButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.preset === preset);
        });
        
        // Сохраняем настройки
        saveEqualizerSettings();
        
        showToast(`Применен пресет: ${preset}`, 'info');
        
        console.log("Применен пресет эквалайзера:", preset);
    }
}

function saveEqualizerSettings() {
    const eqSettings = {};
    Elements.eqSliders.forEach(slider => {
        eqSettings[slider.dataset.band] = parseInt(slider.value);
    });
    
    localStorage.setItem('edm_equalizer', JSON.stringify(eqSettings));
    console.log("Настройки эквалайзера сохранены");
}

// Управление флоатинг меню
function toggleFloatingMenu() {
    Elements.floatingMenu.classList.toggle('active');
    
    if (Elements.floatingMenu.classList.contains('active')) {
        // Закрываем при клике вне меню
        setTimeout(() => {
            document.addEventListener('click', closeFloatingMenuOutside);
        }, 100);
    }
    
    console.log("Флоатинг меню:", Elements.floatingMenu.classList.contains('active') ? 'открыто' : 'закрыто');
}

function closeFloatingMenu() {
    Elements.floatingMenu.classList.remove('active');
    document.removeEventListener('click', closeFloatingMenuOutside);
}

function closeFloatingMenuOutside(event) {
    if (!Elements.floatingMenu.contains(event.target) && !Elements.floatingMenuBtn.contains(event.target)) {
        closeFloatingMenu();
    }
}

// Управление меню плеера
function togglePlayerMenu(event) {
    event.stopPropagation();
    
    Elements.playerMenu.classList.toggle('active');
    
    if (Elements.playerMenu.classList.contains('active')) {
        // Позиционируем меню
        const rect = Elements.playerMenuBtn.getBoundingClientRect();
        Elements.playerMenu.style.top = `${rect.bottom + 10}px`;
        Elements.playerMenu.style.right = `${window.innerWidth - rect.right}px`;
        
        // Закрываем при клике вне меню
        setTimeout(() => {
            document.addEventListener('click', closePlayerMenuOutside);
        }, 100);
    }
    
    console.log("Меню плеера:", Elements.playerMenu.classList.contains('active') ? 'открыто' : 'закрыто');
}

function closePlayerMenu() {
    Elements.playerMenu.classList.remove('active');
    document.removeEventListener('click', closePlayerMenuOutside);
}

function closePlayerMenuOutside(event) {
    if (!Elements.playerMenu.contains(event.target) && !Elements.playerMenuBtn.contains(event.target)) {
        closePlayerMenu();
    }
}

// EDM Music App - Основной скрипт
// Часть 4: Обработчики событий

// Настройка обработчиков событий
function setupEventListeners() {
    console.log("Настройка обработчиков событий...");
    
    // Поиск
    Elements.searchToggle.addEventListener('click', toggleSearch);
    Elements.searchActionBtn.addEventListener('click', performSearch);
    Elements.searchCloseBtn.addEventListener('click', toggleSearch);
    Elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Профиль
    Elements.profileBtn.addEventListener('click', () => openModal(Elements.profileModal));
    Elements.closeProfileModal.addEventListener('click', () => closeModal(Elements.profileModal));
    
    // Навигация
    Elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const page = e.currentTarget.dataset.page;
            navigateToPage(page);
        });
    });
    
    // Фильтры
    Elements.filterChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            const filter = e.currentTarget.dataset.filter;
            applyFilter(filter);
        });
    });
    
    // Кнопка обновления рекомендаций
    Elements.refreshRecommendations.addEventListener('click', () => {
        loadMusic();
        showToast("Рекомендации обновлены", "info");
    });
    
    // Мини-плеер
    Elements.miniPlayBtn.addEventListener('click', togglePlayPause);
    Elements.miniFavoriteBtn.addEventListener('click', () => {
        if (AppState.currentTrack) {
            toggleFavorite(AppState.currentTrack.id);
        }
    });
    Elements.expandPlayerBtn.addEventListener('click', openFullscreenPlayer);
    
    // Полноэкранный плеер
    Elements.closeFullscreenPlayer.addEventListener('click', closeFullscreenPlayer);
    Elements.fullscreenPlayBtn.addEventListener('click', togglePlayPause);
    Elements.prevBtn.addEventListener('click', playPreviousTrack);
    Elements.nextBtn.addEventListener('click', playNextTrack);
    Elements.shuffleBtn.addEventListener('click', toggleShuffle);
    Elements.repeatBtn.addEventListener('click', toggleRepeat);
    Elements.fullscreenFavoriteBtn.addEventListener('click', () => {
        if (AppState.currentTrack) {
            toggleFavorite(AppState.currentTrack.id);
        }
    });
    Elements.playerMenuBtn.addEventListener('click', togglePlayerMenu);
    
    // Прогресс бар
    Elements.progressBar.addEventListener('click', seekAudio);
    
    // Авторизация
    Elements.authTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.currentTarget.dataset.tab;
            switchAuthTab(tabName);
        });
    });
    
    Elements.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        loginUser(username, password);
    });
    
    Elements.registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const avatar = document.getElementById('registerAvatar').value;
        registerUser(username, password, avatar);
    });
    
    Elements.logoutBtn.addEventListener('click', logoutUser);
    
    // Редактирование профиля
    Elements.editProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('editUsername').value;
        const avatar = document.getElementById('editAvatar').value;
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (newPassword && newPassword !== confirmPassword) {
            showToast("Пароли не совпадают", "error");
            return;
        }
        
        editProfile(username, avatar, currentPassword, newPassword);
    });
    
    Elements.cancelEditProfile.addEventListener('click', () => {
        closeModal(Elements.editProfileModal);
    });
    
    // Кнопки профиля
    document.getElementById('editProfileBtn').addEventListener('click', () => {
        closeModal(Elements.profileModal);
        openModal(Elements.editProfileModal);
        
        // Заполняем форму текущими данными
        document.getElementById('editUsername').value = AppState.user.username || '';
        document.getElementById('editAvatar').value = AppState.user.avatar || '';
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    });
    
    document.getElementById('telegramChannelBtn').addEventListener('click', openTelegramChannel);
    
    // Настройки
    Elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === Elements.settingsModal) {
            closeModal(Elements.settingsModal);
        }
    });
    
    document.getElementById('closeSettingsModal').addEventListener('click', () => {
        closeModal(Elements.settingsModal);
        applySettings();
    });
    
    Elements.termsBtn.addEventListener('click', openTerms);
    Elements.footerTermsBtn.addEventListener('click', openTerms);
    Elements.clearCacheBtn.addEventListener('click', clearCache);
    Elements.aboutBtn.addEventListener('click', () => openModal(Elements.aboutModal));
    Elements.closeAboutModal.addEventListener('click', () => closeModal(Elements.aboutModal));
    
    // Эквалайзер
    Elements.closeEqualizerModal.addEventListener('click', () => closeModal(Elements.equalizerModal));
    
    Elements.presetButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const preset = e.currentTarget.dataset.preset;
            applyEqualizerPreset(preset);
        });
    });
    
    Elements.eqSliders.forEach(slider => {
        slider.addEventListener('input', saveEqualizerSettings);
    });
    
    // Модальные окна (закрытие по клику вне)
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
    
    // Контекстное меню
    Elements.contextMenu.querySelectorAll('.context-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;
            handleContextAction(action);
            closeContextMenu();
        });
    });
    
    // Меню плеера
    Elements.playerMenu.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;
            handlePlayerMenuAction(action);
            closePlayerMenu();
        });
    });
    
    // Флоатинг меню
    Elements.floatingMenuBtn.addEventListener('click', toggleFloatingMenu);
    Elements.floatingMenu.querySelectorAll('.floating-menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;
            handleFloatingMenuAction(action);
            closeFloatingMenu();
        });
    });
    
    // Пагинация
    Elements.paginationPrev.addEventListener('click', () => {
        if (AppState.currentPage > 1) {
            AppState.currentPage--;
            updatePagination();
        }
    });
    
    Elements.paginationNext.addEventListener('click', () => {
        AppState.currentPage++;
        updatePagination();
    });
    
    Elements.pageNumbers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = parseInt(e.currentTarget.dataset.page);
            AppState.currentPage = page;
            updatePagination();
        });
    });
    
    // Глобальные события
    document.addEventListener('keydown', handleKeyPress);
    window.addEventListener('beforeunload', saveAppState);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    console.log("Обработчики событий настроены");
}

// Навигация по страницам
function navigateToPage(page) {
    console.log("Навигация на страницу:", page);
    
    // Обновляем активную кнопку навигации
    Elements.navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });
    
    // Показываем/скрываем элементы в зависимости от страницы
    switch (page) {
        case 'home':
            Elements.mainContent.style.display = 'block';
            Elements.paginationContainer.style.display = 'none';
            loadMusic();
            break;
            
        case 'explore':
            Elements.mainContent.style.display = 'block';
            Elements.paginationContainer.style.display = 'flex';
            showExplorePage();
            break;
            
        case 'library':
            showLibraryPage();
            break;
            
        case 'favorites':
            showFavoritesPage();
            break;
    }
}

// Показать страницу исследования
function showExplorePage() {
    // Загружаем все треки с пагинацией
    loadMusicWithPagination();
    
    // Показываем пагинацию
    Elements.paginationContainer.style.display = 'flex';
    updatePagination();
}

// Показать страницу библиотеки
function showLibraryPage() {
    const content = `
        <div class="library-page">
            <div class="section-header">
                <h2 class="section-title">
                    <i class="fas fa-music"></i> Моя библиотека
                </h2>
            </div>
            
            <div class="library-sections">
                <div class="library-section">
                    <h3><i class="fas fa-history"></i> Недавно прослушанное</h3>
                    <div class="history-list">
                        ${AppState.history.slice(0, 5).map(track => `
                            <div class="history-item" data-id="${track.id}">
                                <img src="${track.image || ''}" alt="${track.title}" 
                                     onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%236d28d9%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2230%22>♪</text></svg>'">
                                <div class="history-info">
                                    <h4>${track.title}</h4>
                                    <p>${track.artist}</p>
                                </div>
                                <button class="history-play-btn" data-id="${track.id}">
                                    <i class="fas fa-play"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="library-section">
                    <h3><i class="fas fa-list-music"></i> Мои плейлисты</h3>
                    <div class="playlists-list">
                        ${AppState.playlists.length > 0 ? 
                            AppState.playlists.map(playlist => `
                                <div class="playlist-item" data-id="${playlist.id}">
                                    <div class="playlist-icon">
                                        <i class="fas fa-${playlist.icon || 'music'}"></i>
                                    </div>
                                    <div class="playlist-info">
                                        <h4>${playlist.name}</h4>
                                        <p>${playlist.tracks.length} треков</p>
                                    </div>
                                </div>
                            `).join('') :
                            `<p class="empty-message">Плейлистов пока нет</p>`
                        }
                    </div>
                    <button class="create-playlist-btn" id="createPlaylistBtn">
                        <i class="fas fa-plus"></i> Создать плейлист
                    </button>
                </div>
            </div>
        </div>
    `;
    
    Elements.mainContent.innerHTML = content;
    Elements.paginationContainer.style.display = 'none';
    
    // Добавляем обработчики событий
    document.querySelectorAll('.history-play-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const trackId = parseInt(e.currentTarget.dataset.id);
            const track = MusicLibrary.find(t => t.id === trackId);
            if (track) playTrack(track);
        });
    });
    
    document.getElementById('createPlaylistBtn').addEventListener('click', () => {
        const name = prompt("Введите название плейлиста:");
        if (name && name.trim()) {
            createPlaylist(name.trim());
        }
    });
}

// Показать страницу избранного
function showFavoritesPage() {
    if (AppState.favorites.length === 0) {
        Elements.mainContent.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="far fa-heart"></i>
                </div>
                <h2>Нет избранных треков</h2>
                <p>Добавляйте треки в избранное, нажав на сердечко</p>
            </div>
        `;
    } else {
        Elements.mainContent.innerHTML = `
            <div class="favorites-page">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-heart"></i> Избранное (${AppState.favorites.length})
                    </h2>
                </div>
                
                <div class="favorites-grid">
                    ${AppState.favorites.map(track => `
                        <div class="track-card" data-id="${track.id}">
                            <div class="track-image-placeholder">
                                <i class="fas fa-music"></i>
                            </div>
                            <div class="track-info">
                                <h3 class="track-title">${track.title}</h3>
                                <p class="track-artist">${track.artist}</p>
                                <div class="track-meta">
                                    <span class="track-duration">${formatTime(track.duration)}</span>
                                    <div class="track-actions">
                                        <button class="track-action-btn favorite-btn active" data-id="${track.id}">
                                            <i class="fas fa-heart"></i>
                                        </button>
                                        <button class="track-action-btn play-btn" data-id="${track.id}">
                                            <i class="fas fa-play"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Добавляем обработчики событий
        document.querySelectorAll('.favorites-grid .play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const trackId = parseInt(e.currentTarget.dataset.id);
                const track = MusicLibrary.find(t => t.id === trackId);
                if (track) playTrack(track);
            });
        });
        
        document.querySelectorAll('.favorites-grid .favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const trackId = parseInt(e.currentTarget.dataset.id);
                toggleFavorite(trackId);
            });
        });
    }
    
    Elements.paginationContainer.style.display = 'none';
}

// Загрузка музыки с пагинацией
function loadMusicWithPagination() {
    const itemsPerPage = 8;
    const startIndex = (AppState.currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    // Фильтруем треки
    let filteredTracks = MusicLibrary;
    
    if (AppState.activeFilter && AppState.activeFilter !== 'all') {
        filteredTracks = filteredTracks.filter(track => {
            if (AppState.activeFilter === 'trending') return track.plays > 1000;
            if (AppState.activeFilter === 'new') return track.year === 2024;
            if (AppState.activeFilter === 'energetic') return track.mood === 'energetic';
            if (AppState.activeFilter === 'chill') return track.mood === 'calm';
            if (AppState.activeFilter === 'mix') return track.mood === 'mix';
            return true;
        });
    }
    
    if (AppState.searchQuery) {
        const query = AppState.searchQuery.toLowerCase();
        filteredTracks = filteredTracks.filter(track =>
            track.title.toLowerCase().includes(query) ||
            track.artist.toLowerCase().includes(query) ||
            track.genre.toLowerCase().includes(query)
        );
    }
    
    const totalPages = Math.ceil(filteredTracks.length / itemsPerPage);
    const pageTracks = filteredTracks.slice(startIndex, endIndex);
    
    // Отображаем треки
    Elements.tracksGrid.innerHTML = '';
    pageTracks.forEach((track, index) => {
        const trackElement = createTrackElement(track);
        Elements.tracksGrid.appendChild(trackElement);
        
        setTimeout(() => {
            trackElement.classList.add('fade-in');
        }, index * 100);
    });
    
    // Обновляем пагинацию
    updatePaginationUI(totalPages);
}

// Обновление пагинации
function updatePagination() {
    loadMusicWithPagination();
}

function updatePaginationUI(totalPages) {
    // Обновляем кнопки
    Elements.paginationPrev.disabled = AppState.currentPage === 1;
    Elements.paginationNext.disabled = AppState.currentPage === totalPages;
    
    // Обновляем номера страниц
    Elements.pageNumbers.forEach((btn, index) => {
        const pageNum = index + 1;
        btn.style.display = pageNum <= totalPages ? 'flex' : 'none';
        btn.classList.toggle('active', pageNum === AppState.currentPage);
    });
    
    // Показываем/скрываем контейнер
    Elements.paginationContainer.style.display = totalPages > 1 ? 'flex' : 'none';
}

// Обработка действий контекстного меню
function handleContextAction(action) {
    if (!AppState.contextMenu.trackId) return;
    
    const trackId = AppState.contextMenu.trackId;
    const track = MusicLibrary.find(t => t.id === trackId);
    
    if (!track) return;
    
    switch (action) {
        case 'play':
            playTrack(track);
            break;
            
        case 'add-to-favorites':
            toggleFavorite(trackId);
            break;
            
        case 'add-to-playlist':
            showAddToPlaylistModal(trackId);
            break;
            
        case 'share':
            shareTrack(track);
            break;
            
        case 'download':
            downloadTrack(track);
            break;
            
        case 'view-details':
            showTrackDetails(track);
            break;
    }
}

// Обработка действий меню плеера
function handlePlayerMenuAction(action) {
    switch (action) {
        case 'add-to-queue':
            if (AppState.currentTrack) {
                addToQueue(AppState.currentTrack);
                showToast("Добавлено в очередь", "info");
            }
            break;
            
        case 'view-album':
            showToast("Функция в разработке", "info");
            break;
            
        case 'view-artist':
            showToast("Функция в разработке", "info");
            break;
            
        case 'sleep-timer':
            showSleepTimerModal();
            break;
            
        case 'equalizer':
            openModal(Elements.equalizerModal);
            break;
    }
}

// Обработка действий флоатинг меню
function handleFloatingMenuAction(action) {
    switch (action) {
        case 'settings':
            openModal(Elements.settingsModal);
            break;
            
        case 'equalizer':
            openModal(Elements.equalizerModal);
            break;
            
        case 'sleep-timer':
            showSleepTimerModal();
            break;
            
        case 'queue':
            showQueueModal();
            break;
            
        case 'stats':
            showStatsModal();
            break;
            
        case 'about':
            openModal(Elements.aboutModal);
            break;
    }
}

// Добавление в очередь
function addToQueue(track) {
    AppState.queue.push(track);
    console.log("Добавлено в очередь:", track.title);
}

// Показать модальное окно таймера сна
function showSleepTimerModal() {
    // Создаем модальное окно
    const modalHTML = `
        <div class="modal-overlay active" id="sleepTimerModal">
            <div class="modal-content glass-effect">
                <div class="modal-header">
                    <h2><i class="fas fa-clock"></i> Таймер сна</h2>
                    <button class="modal-close" id="closeSleepTimerModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="timer-options">
                        ${[5, 15, 30, 45, 60].map(minutes => `
                            <button class="timer-option" data-minutes="${minutes}">
                                ${minutes} минут
                            </button>
                        `).join('')}
                        <button class="timer-option" data-minutes="0">
                            Выключить
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Добавляем в DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Настраиваем обработчики
    const modal = document.getElementById('sleepTimerModal');
    const closeBtn = document.getElementById('closeSleepTimerModal');
    
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    document.querySelectorAll('.timer-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const minutes = parseInt(e.currentTarget.dataset.minutes);
            setSleepTimer(minutes);
            modal.remove();
        });
    });
}

// Установка таймера сна
function setSleepTimer(minutes) {
    if (AppState.sleepTimer) {
        clearTimeout(AppState.sleepTimer);
        AppState.sleepTimer = null;
    }
    
    if (minutes > 0) {
        const ms = minutes * 60 * 1000;
        AppState.sleepTimer = setTimeout(() => {
            pauseAudio();
            showToast("Таймер сна: воспроизведение остановлено", "info");
            AppState.sleepTimer = null;
        }, ms);
        
        showToast(`Таймер сна установлен на ${minutes} минут`, "success");
        console.log("Таймер сна установлен на", minutes, "минут");
    } else {
        showToast("Таймер сна выключен", "info");
        console.log("Таймер сна выключен");
    }
}

// EDM Music App - Основной скрипт
// Часть 5: Дополнительные функции и утилиты

// Показать модальное окно очереди
function showQueueModal() {
    if (AppState.queue.length === 0) {
        showToast("Очередь пуста", "info");
        return;
    }
    
    // Создаем модальное окно
    const modalHTML = `
        <div class="modal-overlay active" id="queueModal">
            <div class="modal-content glass-effect">
                <div class="modal-header">
                    <h2><i class="fas fa-list-ol"></i> Очередь (${AppState.queue.length})</h2>
                    <button class="modal-close" id="closeQueueModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="queue-list">
                        ${AppState.queue.map((track, index) => `
                            <div class="queue-item" data-index="${index}">
                                <img src="${track.image || ''}" alt="${track.title}"
                                     onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%236d28d9%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2230%22>♪</text></svg>'">
                                <div class="queue-item-info">
                                    <h4 class="queue-item-title">${track.title}</h4>
                                    <p class="queue-item-artist">${track.artist}</p>
                                </div>
                                <span class="queue-item-duration">${formatTime(track.duration)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="queue-actions">
                        <button class="queue-action-btn" id="clearQueueBtn">
                            <i class="fas fa-trash"></i> Очистить очередь
                        </button>
                        <button class="queue-action-btn" id="shuffleQueueBtn">
                            <i class="fas fa-random"></i> Перемешать
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Добавляем в DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Настраиваем обработчики
    const modal = document.getElementById('queueModal');
    const closeBtn = document.getElementById('closeQueueModal');
    const clearBtn = document.getElementById('clearQueueBtn');
    const shuffleBtn = document.getElementById('shuffleQueueBtn');
    
    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    
    clearBtn.addEventListener('click', () => {
        AppState.queue = [];
        showToast("Очередь очищена", "info");
        modal.remove();
    });
    
    shuffleBtn.addEventListener('click', () => {
        shuffleArray(AppState.queue);
        showToast("Очередь перемешана", "info");
        modal.remove();
    });
    
    document.querySelectorAll('.queue-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            const track = AppState.queue[index];
            if (track) {
                playTrack(track);
                modal.remove();
            }
        });
    });
}

// Показать модальное окно статистики
function showStatsModal() {
    // Собираем статистику
    const totalPlays = AppState.history.length;
    const totalFavorites = AppState.favorites.length;
    const totalSeconds = AppState.history.reduce((total, track) => total + (track.duration || 0), 0);
    const totalHours = Math.floor(totalSeconds / 3600);
    const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
    
    // Анализируем жанры
    const genreStats = {};
    AppState.history.forEach(track => {
        const genre = track.genre || 'unknown';
        genreStats[genre] = (genreStats[genre] || 0) + 1;
    });
    
    const topGenres = Object.entries(genreStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    // Создаем модальное окно
    const modalHTML = `
        <div class="modal-overlay active" id="statsModal">
            <div class="modal-content glass-effect">
                <div class="modal-header">
                    <h2><i class="fas fa-chart-bar"></i> Статистика</h2>
                    <button class="modal-close" id="closeStatsModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon" style="background: linear-gradient(135deg, #ff6b6b, #ffa8a8);">
                                <i class="fas fa-headphones"></i>
                            </div>
                            <div class="stat-info">
                                <h3>${totalPlays}</h3>
                                <p>Прослушано</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon" style="background: linear-gradient(135deg, #4ecdc4, #44a08d);">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="stat-info">
                                <h3>${totalHours}</h3>
                                <p>Часов музыки</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon" style="background: linear-gradient(135deg, #ffd166, #ff9a76);">
                                <i class="fas fa-heart"></i>
                            </div>
                            <div class="stat-info">
                                <h3>${totalFavorites}</h3>
                                <p>В избранном</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="top-genres">
                        <h3>Любимые жанры</h3>
                        <div class="genres-list">
                            ${topGenres.map(([genre, count]) => `
                                <div class="genre-item">
                                    <span class="genre-name">${getGenreName(genre)}</span>
                                    <span class="genre-count">${count}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Добавляем в DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Настраиваем обработчики
    const modal = document.getElementById('statsModal');
    const closeBtn = document.getElementById('closeStatsModal');
    
    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

// Получение названия жанра
function getGenreName(genre) {
    const names = {
        electronic: "Электроника",
        ambient: "Эмбиент",
        synthwave: "Синтвейв",
        house: "Хаус",
        techno: "Техно",
        world: "World",
        edm: "EDM",
        unknown: "Неизвестно"
    };
    return names[genre] || genre;
}

// Создание плейлиста
function createPlaylist(name) {
    const newPlaylist = {
        id: Date.now(),
        name: name,
        tracks: [],
        icon: 'music',
        createdAt: new Date().toISOString()
    };
    
    AppState.playlists.push(newPlaylist);
    saveAppState();
    
    showToast(`Плейлист "${name}" создан`, "success");
    console.log("Создан плейлист:", name);
    
    // Обновляем UI если открыта страница библиотеки
    if (document.querySelector('.library-page')) {
        showLibraryPage();
    }
}

// Показать модальное окно добавления в плейлист
function showAddToPlaylistModal(trackId) {
    const track = MusicLibrary.find(t => t.id === trackId);
    if (!track) return;
    
    if (AppState.playlists.length === 0) {
        showToast("Сначала создайте плейлист", "info");
        return;
    }
    
    // Создаем модальное окно
    const modalHTML = `
        <div class="modal-overlay active" id="addToPlaylistModal">
            <div class="modal-content glass-effect">
                <div class="modal-header">
                    <h2><i class="fas fa-plus-circle"></i> Добавить в плейлист</h2>
                    <button class="modal-close" id="closeAddToPlaylistModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Выберите плейлист для добавления "${track.title}":</p>
                    <div class="playlists-select-list">
                        ${AppState.playlists.map(playlist => `
                            <div class="playlist-select-item" data-id="${playlist.id}">
                                <div class="playlist-select-icon">
                                    <i class="fas fa-${playlist.icon || 'music'}"></i>
                                </div>
                                <div class="playlist-select-info">
                                    <h4>${playlist.name}</h4>
                                    <p>${playlist.tracks.length} треков</p>
                                </div>
                                <button class="add-to-playlist-btn" data-playlist-id="${playlist.id}">
                                    Добавить
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Добавляем в DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Настраиваем обработчики
    const modal = document.getElementById('addToPlaylistModal');
    const closeBtn = document.getElementById('closeAddToPlaylistModal');
    
    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    
    document.querySelectorAll('.add-to-playlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const playlistId = parseInt(e.currentTarget.dataset.playlistId);
            addTrackToPlaylist(trackId, playlistId);
            modal.remove();
        });
    });
}

// Добавление трека в плейлист
function addTrackToPlaylist(trackId, playlistId) {
    const track = MusicLibrary.find(t => t.id === trackId);
    const playlist = AppState.playlists.find(p => p.id === playlistId);
    
    if (!track || !playlist) return;
    
    // Проверяем, нет ли уже этого трека в плейлисте
    const alreadyAdded = playlist.tracks.some(t => t.id === trackId);
    if (alreadyAdded) {
        showToast("Трек уже в плейлисте", "info");
        return;
    }
    
    // Добавляем трек
    playlist.tracks.push(track);
    saveAppState();
    
    showToast(`Добавлено в "${playlist.name}"`, "success");
    console.log("Трек добавлен в плейлист:", playlist.name);
}

// Поделиться треком
function shareTrack(track) {
    const text = `Слушай "${track.title}" от ${track.artist} в EDM Music! 🎵\n${CONFIG.telegramChannel}`;
    
    if (navigator.share) {
        navigator.share({
            title: track.title,
            text: text,
            url: track.url || CONFIG.telegramChannel
        }).catch(error => {
            console.log('Ошибка sharing:', error);
            copyToClipboard(text);
            showToast("Ссылка скопирована", "info");
        });
    } else {
        copyToClipboard(text);
        showToast("Ссылка скопирована", "info");
    }
    
    console.log("Поделиться треком:", track.title);
}

// Скачать трек
function downloadTrack(track) {
    if (AppState.settings.wifiOnly && !navigator.onLine) {
        showToast("Подключитесь к Wi-Fi для скачивания", "error");
        return;
    }
    
    showToast("Начало загрузки...", "info");
    
    // Создаем временную ссылку для скачивания
    const link = document.createElement('a');
    link.href = track.url;
    link.download = `${track.title} - ${track.artist}.mp3`;
    link.target = '_blank';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
        showToast("Трек загружен", "success");
    }, 2000);
    
    console.log("Скачивание трека:", track.title);
}

// Показать детали трека
function showTrackDetails(track) {
    const modalHTML = `
        <div class="modal-overlay active" id="trackInfoModal">
            <div class="modal-content glass-effect">
                <div class="modal-header">
                    <h2><i class="fas fa-info-circle"></i> О треке</h2>
                    <button class="modal-close" id="closeTrackInfoModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="track-info-content">
                        <div class="track-info-header">
                            <img src="${track.image || ''}" alt="${track.title}" class="track-info-image"
                                 onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%236d28d9%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2230%22>♪</text></svg>'">
                            <div class="track-info-details">
                                <h3 class="track-info-title">${track.title}</h3>
                                <p class="track-info-artist">${track.artist}</p>
                                <div class="track-info-meta">
                                    <span>${track.genre}</span>
                                    <span>${track.year}</span>
                                    <span>${formatTime(track.duration)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="track-info-stats">
                            <div class="track-stat">
                                <div class="track-stat-value">${track.plays || 0}</div>
                                <div class="track-stat-label">Прослушиваний</div>
                            </div>
                            <div class="track-stat">
                                <div class="track-stat-value">${track.likes || 0}</div>
                                <div class="track-stat-label">Лайков</div>
                            </div>
                        </div>
                        
                        <div class="track-actions-full">
                            <button class="track-action-full-btn" data-action="play">
                                <i class="fas fa-play"></i> Воспроизвести
                            </button>
                            <button class="track-action-full-btn" data-action="favorite">
                                <i class="${AppState.favorites.some(f => f.id === track.id) ? 'fas' : 'far'} fa-heart"></i> 
                                ${AppState.favorites.some(f => f.id === track.id) ? 'В избранном' : 'В избранное'}
                            </button>
                            <button class="track-action-full-btn" data-action="share">
                                <i class="fas fa-share-alt"></i> Поделиться
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Добавляем в DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Настраиваем обработчики
    const modal = document.getElementById('trackInfoModal');
    const closeBtn = document.getElementById('closeTrackInfoModal');
    
    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    
    document.querySelectorAll('.track-action-full-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;
            switch (action) {
                case 'play':
                    playTrack(track);
                    break;
                case 'favorite':
                    toggleFavorite(track.id);
                    modal.remove();
                    break;
                case 'share':
                    shareTrack(track);
                    break;
            }
        });
    });
}

// Копирование в буфер обмена
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(() => {
        // Fallback для старых браузеров
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    });
}

// Перемешивание массива
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Обработка нажатий клавиш
function handleKeyPress(e) {
    switch(e.key) {
        case ' ':
            e.preventDefault();
            togglePlayPause();
            break;
            
        case 'ArrowLeft':
            if (e.ctrlKey) {
                e.preventDefault();
                Elements.audioPlayer.currentTime = Math.max(0, Elements.audioPlayer.currentTime - 10);
            }
            break;
            
        case 'ArrowRight':
            if (e.ctrlKey) {
                e.preventDefault();
                Elements.audioPlayer.currentTime = Math.min(Elements.audioPlayer.duration, Elements.audioPlayer.currentTime + 10);
            }
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            setVolume(Math.min(1, AppState.volume + 0.1));
            break;
            
        case 'ArrowDown':
            e.preventDefault();
            setVolume(Math.max(0, AppState.volume - 0.1));
            break;
            
        case 'Escape':
            closeAllModals();
            closeFullscreenPlayer();
            closeContextMenu();
            closePlayerMenu();
            closeFloatingMenu();
            break;
            
        case 'm':
            if (e.ctrlKey) {
                e.preventDefault();
                toggleMute();
            }
            break;
            
        case 'f':
            if (e.ctrlKey) {
                e.preventDefault();
                openFullscreenPlayer();
            }
            break;
    }
}

// Обработка онлайн-статуса
function handleOnlineStatus() {
    if (navigator.onLine) {
        showToast("Подключение восстановлено", "success");
    } else {
        showToast("Отсутствует подключение к интернету", "error");
    }
}

// Предзагрузка изображений
function preloadImages() {
    const imageUrls = [
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    ];
    
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
    
    console.log("Изображения предзагружены");
}

// Обработка ошибок изображений
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%236d28d9"/><text x="50" y="55" text-anchor="middle" fill="white" font-size="30">♪</text></svg>';
    }
}, true);

// Инициализация Service Worker (для PWA)
function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker зарегистрирован:', registration.scope);
        }).catch(error => {
            console.log('Ошибка регистрации ServiceWorker:', error);
        });
    }
}

// Запрос разрешения на уведомления
function requestNotificationPermission() {
    if ("Notification" in window && AppState.settings.notifications) {
        if (Notification.permission === "default") {
            Notification.requestPermission();
        }
    }
}

// Отправка уведомления
function sendNotification(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body });
    }
}

// Анимация загрузки
function showLoading(message = "Загрузка...") {
    Elements.loadingOverlay.style.display = 'flex';
    document.querySelector('.loading-text').textContent = message;
}

function hideLoading() {
    Elements.loadingOverlay.style.display = 'none';
}

// Проверка и обновление состояния
function checkAndUpdateState() {
    // Проверяем авторизацию
    if (AppState.user.isLoggedIn && !AppState.user.token) {
        logoutUser();
    }
    
    // Проверяем настройки
    if (!AppState.settings.theme) {
        AppState.settings.theme = 'auto';
    }
    
    // Сохраняем состояние
    saveAppState();
    
    console.log("Состояние проверено и обновлено");
}

// EDM Music App - Основной скрипт
// Часть 6: Запуск приложения и завершение

// Запуск приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM загружен, запуск приложения...");
    
    // Показываем загрузку
    showLoading("Инициализация приложения...");
    
    // Устанавливаем тему
    applyTheme(AppState.settings.theme || 'auto');
    
    // Инициализируем приложение
    try {
        initApp();
        
        // Скрываем загрузку через секунду (на случай если что-то загружается)
        setTimeout(() => {
            hideLoading();
            
            // Показываем приветственное сообщение для новых пользователей
            if (!AppState.user.isLoggedIn) {
                setTimeout(() => {
                    showToast("Зарегистрируйтесь для сохранения избранного! 🎵", "info");
                }, 2000);
            }
        }, 1000);
        
        // Инициализируем дополнительные функции
        setTimeout(() => {
            initServiceWorker();
            requestNotificationPermission();
            preloadImages();
            checkAndUpdateState();
        }, 500);
        
    } catch (error) {
        console.error("Ошибка инициализации приложения:", error);
        showToast("Ошибка загрузки приложения", "error");
        hideLoading();
    }
});

// Глобальные функции для использования в HTML
window.playTrack = function(trackId) {
    const track = MusicLibrary.find(t => t.id === trackId);
    if (track) playTrack(track);
};

window.toggleFavorite = function(trackId) {
    toggleFavorite(trackId);
};

window.openProfile = function() {
    openModal(Elements.profileModal);
};

window.openSettings = function() {
    openModal(Elements.settingsModal);
};

window.openEqualizer = function() {
    openModal(Elements.equalizerModal);
};

window.shareApp = function() {
    const text = `Слушай музыку в EDM Music! 🎵\n${CONFIG.telegramChannel}`;
    if (navigator.share) {
        navigator.share({
            title: 'EDM Music',
            text: text,
            url: CONFIG.telegramChannel
        });
    } else {
        copyToClipboard(text);
        showToast("Ссылка скопирована", "info");
    }
};

// Глобальные стили для динамических элементов
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    /* Стили для динамически создаваемых элементов */
    .theme-light {
        --text-primary: #1f2937;
        --text-secondary: #4b5563;
        --text-tertiary: #6b7280;
        --bg-primary: #ffffff;
        --bg-secondary: #f9fafb;
        --bg-tertiary: #f3f4f6;
        --glass-bg: rgba(255, 255, 255, 0.7);
        --glass-border: rgba(255, 255, 255, 0.9);
    }
    
    .theme-dark {
        --text-primary: #ffffff;
        --text-secondary: rgba(255, 255, 255, 0.8);
        --text-tertiary: rgba(255, 255, 255, 0.6);
        --bg-primary: #0f172a;
        --bg-secondary: #1e293b;
        --bg-tertiary: #334155;
        --glass-bg: rgba(255, 255, 255, 0.1);
        --glass-border: rgba(255, 255, 255, 0.2);
    }
    
    .theme-gradient {
        background: linear-gradient(135deg, #0f172a, #1e1b4b) !important;
    }
    
    /* Стили для библиотеки */
    .library-page {
        padding: 16px;
    }
    
    .library-sections {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }
    
    .library-section h3 {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--text-primary);
    }
    
    .library-section h3 i {
        color: var(--accent-color);
    }
    
    .history-list, .playlists-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .history-item, .playlist-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-lg);
        cursor: pointer;
        transition: all var(--transition-medium);
    }
    
    .history-item:hover, .playlist-item:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateX(4px);
    }
    
    .history-item img, .playlist-icon {
        width: 50px;
        height: 50px;
        border-radius: var(--radius-md);
        object-fit: cover;
        background: var(--gradient-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
        flex-shrink: 0;
    }
    
    .history-info, .playlist-info {
        flex: 1;
        min-width: 0;
    }
    
    .history-info h4, .playlist-info h4 {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--text-primary);
    }
    
    .history-info p, .playlist-info p {
        font-size: 12px;
        color: var(--text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .history-play-btn {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-full);
        border: none;
        background: var(--gradient-primary);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        transition: all var(--transition-medium);
        flex-shrink: 0;
    }
    
    .history-play-btn:hover {
        transform: scale(1.1);
    }
    
    .empty-message {
        text-align: center;
        padding: 40px 20px;
        color: var(--text-secondary);
        font-style: italic;
    }
    
    .create-playlist-btn {
        width: 100%;
        padding: 14px;
        margin-top: 12px;
        border: none;
        border-radius: var(--radius-md);
        background: var(--gradient-primary);
        color: white;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all var(--transition-medium);
    }
    
    .create-playlist-btn:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }
    
    /* Стили для избранного */
    .favorites-page {
        padding: 16px;
    }
    
    .favorites-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        margin-top: 16px;
    }
    
    @media (max-width: 480px) {
        .favorites-grid {
            grid-template-columns: 1fr;
        }
    }
    
    /* Стили для пустого состояния */
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        text-align: center;
    }
    
    .empty-icon {
        width: 80px;
        height: 80px;
        border-radius: var(--radius-full);
        background: var(--gradient-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 32px;
        margin-bottom: 20px;
    }
    
    .empty-state h2 {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 12px;
        color: var(--text-primary);
    }
    
    .empty-state p {
        font-size: 16px;
        color: var(--text-secondary);
        max-width: 300px;
        line-height: 1.6;
    }
    
    /* Стили для модальных окон */
    .playlists-select-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-height: 300px;
        overflow-y: auto;
    }
    
    .playlist-select-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-lg);
        transition: all var(--transition-medium);
    }
    
    .playlist-select-item:hover {
        background: rgba(255, 255, 255, 0.1);
    }
    
    .playlist-select-icon {
        width: 50px;
        height: 50px;
        border-radius: var(--radius-md);
        background: var(--gradient-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
        flex-shrink: 0;
    }
    
    .playlist-select-info {
        flex: 1;
        min-width: 0;
    }
    
    .playlist-select-info h4 {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 4px;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .playlist-select-info p {
        font-size: 12px;
        color: var(--text-secondary);
    }
    
    .add-to-playlist-btn {
        padding: 8px 16px;
        border: none;
        border-radius: var(--radius-md);
        background: var(--gradient-primary);
        color: white;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--transition-medium);
        white-space: nowrap;
    }
    
    .add-to-playlist-btn:hover {
        transform: scale(1.05);
    }
    
    /* Стили для очереди */
    .queue-list {
        max-height: 400px;
        overflow-y: auto;
        margin-bottom: 20px;
    }
    
    .queue-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        cursor: pointer;
        transition: all var(--transition-fast);
    }
    
    .queue-item:hover {
        background: rgba(255, 255, 255, 0.05);
    }
    
    .queue-item:last-child {
        border-bottom: none;
    }
    
    .queue-item img {
        width: 50px;
        height: 50px;
        border-radius: var(--radius-md);
        object-fit: cover;
        flex-shrink: 0;
    }
    
    .queue-item-info {
        flex: 1;
        min-width: 0;
    }
    
    .queue-item-title {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 4px;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .queue-item-artist {
        font-size: 12px;
        color: var(--text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .queue-item-duration {
        font-size: 12px;
        color: var(--text-tertiary);
        white-space: nowrap;
    }
    
    .queue-actions {
        display: flex;
        gap: 12px;
    }
    
    /* Стили для информации о треке */
    .track-actions-full {
        display: flex;
        gap: 12px;
        margin-top: 20px;
    }
    
    .track-action-full-btn {
        flex: 1;
        padding: 14px;
        border: none;
        border-radius: var(--radius-md);
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-primary);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all var(--transition-medium);
    }
    
    .track-action-full-btn:hover {
        background: rgba(255, 255, 255, 0.1);
    }
    
    .track-action-full-btn[data-action="play"] {
        background: var(--gradient-primary);
        color: white;
    }
    
    /* Анимации */
    @keyframes heartBeat {
        0% { transform: scale(1); }
        25% { transform: scale(1.2); }
        50% { transform: scale(1); }
        75% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    .heart-beat {
        animation: heartBeat 0.5s ease;
    }
    
    /* Адаптивные улучшения */
    @media (max-width: 768px) {
        .track-actions-full {
            flex-direction: column;
        }
        
        .queue-actions {
            flex-direction: column;
        }
    }
    
    @media (max-width: 480px) {
        .modal-content {
            margin: 10px;
            max-height: 85vh;
        }
        
        .track-info-header {
            flex-direction: column;
            text-align: center;
        }
        
        .track-info-image {
            width: 150px;
            height: 150px;
            margin: 0 auto 20px;
        }
    }
    
    /* Улучшения для touch устройств */
    @media (hover: none) {
        button:hover, .track-card:hover, .history-item:hover, .playlist-item:hover {
            transform: none;
        }
        
        button:active, .track-card:active, .history-item:active, .playlist-item:active {
            transform: scale(0.98);
        }
    }
    
    /* Поддержка iOS */
    @supports (-webkit-touch-callout: none) {
        .glass-effect {
            -webkit-backdrop-filter: blur(20px) saturate(180%);
        }
        
        input, button, select, textarea {
            -webkit-appearance: none;
            border-radius: 0;
        }
    }
    
    /* Поддержка dark mode систем */
    @media (prefers-color-scheme: dark) {
        :root {
            --text-primary: #ffffff;
            --text-secondary: rgba(255, 255, 255, 0.8);
            --text-tertiary: rgba(255, 255, 255, 0.6);
            --bg-primary: #0f172a;
            --bg-secondary: #1e293b;
            --bg-tertiary: #334155;
            --glass-bg: rgba(255, 255, 255, 0.1);
            --glass-border: rgba(255, 255, 255, 0.2);
        }
    }
`;
document.head.appendChild(dynamicStyles);

// Глобальный объект для отладки
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.EDM_DEBUG = {
        state: AppState,
        music: MusicLibrary,
        playTrack: playTrack,
        toggleFavorite: toggleFavorite,
        showToast: showToast,
        saveState: saveAppState,
        loadState: loadAppState
    };
    
    console.log("Режим отладки активирован. Используйте window.EDM_DEBUG для доступа к состоянию приложения.");
}

// Финальная инициализация
console.log("EDM Music App готов к работе! 🎵");

// Экспорт глобальных функций
window.initApp = initApp;
window.playTrack = playTrack;
window.toggleFavorite = toggleFavorite;
window.openProfile = () => openModal(Elements.profileModal);
window.openSettings = () => openModal(Elements.settingsModal);
window.openEqualizer = () => openModal(Elements.equalizerModal);
window.shareApp = shareApp;
window.showToast = showToast;

// Сообщение о успешной загрузке
setTimeout(() => {
    console.log("%cEDM Music App успешно загружен! 🎵", "color: #6d28d9; font-size: 16px; font-weight: bold;");
    console.log("%cВерсия: " + CONFIG.version, "color: #ec4899;");
    console.log("%cРазработано для любителей музыки ❤️", "color: #10b981;");
}, 100);