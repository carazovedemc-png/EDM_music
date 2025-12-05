// EDM Music App - Основной скрипт

// Конфигурация приложения
const CONFIG = {
    telegramChannel: "https://t.me/EDM_tm",
    supportContact: "@EDEM_CR",
    appName: "EDM_Music",
    version: "1.0.0"
};

// Состояние приложения
const state = {
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    isMuted: false,
    shuffle: false,
    repeat: false,
    favorites: JSON.parse(localStorage.getItem('favorites')) || [],
    history: JSON.parse(localStorage.getItem('history')) || [],
    playlists: JSON.parse(localStorage.getItem('playlists')) || [
        { id: 1, name: "Любимые треки", tracks: [], icon: "heart" },
        { id: 2, name: "Энергичные", tracks: [], icon: "fire" },
        { id: 3, name: "Для релакса", tracks: [], icon: "spa" }
    ],
    currentPlaylist: null,
    equalizer: {
        '60hz': 0,
        '230hz': 0,
        '910hz': 0,
        '4khz': 0,
        '14khz': 0
    },
    settings: {
        wifiOnly: false,
        darkMode: localStorage.getItem('darkMode') === 'true',
        notifications: true,
        autoDownload: false
    },
    currentPage: 1,
    totalPages: 4,
    activeFilter: null,
    searchQuery: ""
};

// DOM элементы
const elements = {
    // Аудио
    audioPlayer: document.getElementById('audioPlayer'),
    
    // Кнопки
    playPauseBtn: document.getElementById('playPauseBtn'),
    fullscreenPlayBtn: document.getElementById('fullscreenPlayBtn'),
    prevTrackBtn: document.getElementById('prevTrackBtn'),
    nextTrackBtn: document.getElementById('nextTrackBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    repeatBtn: document.getElementById('repeatBtn'),
    
    // Панель плеера
    playerBar: document.getElementById('playerBar'),
    playerTrackTitle: document.getElementById('playerTrackTitle'),
    playerTrackArtist: document.getElementById('playerTrackArtist'),
    playerAlbumArt: document.getElementById('playerAlbumArt'),
    
    // Полноэкранный плеер
    fullscreenPlayer: document.getElementById('fullscreenPlayer'),
    fullscreenTrackTitle: document.getElementById('fullscreenTrackTitle'),
    fullscreenTrackArtist: document.getElementById('fullscreenTrackArtist'),
    fullscreenAlbumArt: document.getElementById('fullscreenAlbumArt'),
    fullscreenBg: document.getElementById('fullscreenBg'),
    closeFullscreenBtn: document.getElementById('closeFullscreenBtn'),
    fullscreenFavoriteBtn: document.getElementById('fullscreenFavoriteBtn'),
    
    // Прогресс
    progressFill: document.getElementById('progressFill'),
    currentTime: document.getElementById('currentTime'),
    totalTime: document.getElementById('totalTime'),
    
    // Модальные окна
    filterModal: document.getElementById('filterModal'),
    profileModal: document.getElementById('profileModal'),
    equalizerModal: document.getElementById('equalizerModal'),
    settingsModal: document.getElementById('settingsModal'),
    playlistModal: document.getElementById('playlistModal'),
    volumeModal: document.getElementById('volumeModal'),
    historyModal: document.getElementById('historyModal'),
    
    // Кнопки открытия/закрытия
    filterBtn: document.getElementById('filterBtn'),
    closeFilterBtn: document.getElementById('closeFilterBtn'),
    profileBtn: document.getElementById('profileBtn'),
    closeProfileBtn: document.getElementById('closeProfileBtn'),
    equalizerBtn: document.getElementById('equalizerBtn'),
    closeEqualizerBtn: document.getElementById('closeEqualizerBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    closeSettingsBtn: document.getElementById('closeSettingsBtn'),
    closePlaylistBtn: document.getElementById('closePlaylistBtn'),
    closeVolumeBtn: document.getElementById('closeVolumeBtn'),
    closeHistoryBtn: document.getElementById('closeHistoryBtn'),
    closePlayerBtn: document.getElementById('closePlayerBtn'),
    
    // Поиск
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    
    // Избранное
    favoritesBtn: document.getElementById('favoritesBtn'),
    
    // Пагинация
    prevPage: document.getElementById('prevPage'),
    nextPage: document.getElementById('nextPage'),
    pageNumbers: document.querySelectorAll('.page-number'),
    
    // Контейнеры
    tracksContainer: document.getElementById('tracksContainer'),
    historyList: document.getElementById('historyList'),
    playlistList: document.getElementById('playlistList'),
    
    // Настройки
    wifiOnly: document.getElementById('wifiOnly'),
    darkMode: document.getElementById('darkMode'),
    notifications: document.getElementById('notifications'),
    autoDownload: document.getElementById('autoDownload'),
    
    // Эквалайзер
    eqSliders: document.querySelectorAll('.eq-slider'),
    presetButtons: document.querySelectorAll('.preset-btn'),
    
    // Громкость
    volumeSlider: document.getElementById('volumeSlider'),
    volumeIcon: document.getElementById('volumeIcon'),
    
    // Другие
    telegramBtn: document.getElementById('telegramBtn'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    toastContainer: document.getElementById('toastContainer'),
    contextMenu: document.getElementById('contextMenu')
};

// Музыкальная библиотека (демо-треки с внешних источников)
const musicLibrary = [
    {
        id: 1,
        title: "Sunset Vibes",
        artist: "Chillwave Collective",
        duration: "3:45",
        url: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        genre: "chill",
        year: 2023,
        favorite: false
    },
    {
        id: 2,
        title: "Neon Dreams",
        artist: "Synthwave Pro",
        duration: "4:20",
        url: "https://assets.mixkit.co/music/preview/mixkit-driving-ambition-32.mp3",
        image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        genre: "energetic",
        year: 2023,
        favorite: false
    },
    {
        id: 3,
        title: "Midnight City",
        artist: "Retro Future",
        duration: "3:58",
        url: "https://assets.mixkit.co/music/preview/mixkit-deep-urban-623.mp3",
        image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        genre: "mix",
        year: 2023,
        favorite: false
    },
    {
        id: 4,
        title: "Ocean Breeze",
        artist: "Ambient Waves",
        duration: "5:12",
        url: "https://assets.mixkit.co/music/preview/mixkit-relaxation-time-117.mp3",
        image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        genre: "calm",
        year: 2023,
        favorite: false
    },
    {
        id: 5,
        title: "Digital Love",
        artist: "EDM Masters",
        duration: "4:05",
        url: "https://assets.mixkit.co/music/preview/mixkit-summer-bossa-482.mp3",
        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        genre: "energetic",
        year: 2023,
        favorite: false
    },
    {
        id: 6,
        title: "Starry Night",
        artist: "Cosmic Sound",
        duration: "4:30",
        url: "https://assets.mixkit.co/music/preview/mixkit-nightlife-56.mp3",
        image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        genre: "chill",
        year: 2023,
        favorite: false
    },
    {
        id: 7,
        title: "Summer Vibes",
        artist: "Tropical Beats",
        duration: "3:22",
        url: "https://assets.mixkit.co/music/preview/mixkit-summer-tropical-house-108.mp3",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        genre: "energetic",
        year: 2023,
        favorite: false
    },
    {
        id: 8,
        title: "Lost in Space",
        artist: "Astro Sound",
        duration: "4:45",
        url: "https://assets.mixkit.co/music/preview/mixkit-ambient-space-683.mp3",
        image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        genre: "calm",
        year: 2023,
        favorite: false
    }
];

// Инициализация приложения
function initApp() {
    // Загружаем состояние из localStorage
    loadStateFromStorage();
    
    // Устанавливаем тему
    applyTheme();
    
    // Инициализируем аудио плеер
    initAudioPlayer();
    
    // Загружаем треки
    loadTracks();
    
    // Инициализируем UI
    initUI();
    
    // Инициализируем события
    initEvents();
    
    // Скрываем загрузку
    setTimeout(() => {
        elements.loadingOverlay.classList.add('hidden');
    }, 1500);
    
    // Создаем частицы для анимации
    createParticles();
    
    // Показываем приветственное сообщение
    setTimeout(() => {
        showToast('Добро пожаловать в EDM Music!', 'info');
    }, 2000);
}

// Загрузка состояния из localStorage
function loadStateFromStorage() {
    // Загружаем избранное
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
        state.favorites = JSON.parse(savedFavorites);
    }
    
    // Загружаем историю
    const savedHistory = localStorage.getItem('history');
    if (savedHistory) {
        state.history = JSON.parse(savedHistory);
    }
    
    // Загружаем плейлисты
    const savedPlaylists = localStorage.getItem('playlists');
    if (savedPlaylists) {
        state.playlists = JSON.parse(savedPlaylists);
    }
    
    // Загружаем настройки эквалайзера
    const savedEqualizer = localStorage.getItem('equalizer');
    if (savedEqualizer) {
        state.equalizer = JSON.parse(savedEqualizer);
    }
    
    // Загружаем настройки
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
        state.settings = JSON.parse(savedSettings);
    }
    
    // Загружаем громкость
    const savedVolume = localStorage.getItem('volume');
    if (savedVolume) {
        state.volume = parseFloat(savedVolume);
        elements.audioPlayer.volume = state.volume;
    }
    
    // Загружаем состояние воспроизведения
    const savedCurrentTrack = localStorage.getItem('currentTrack');
    if (savedCurrentTrack) {
        state.currentTrack = JSON.parse(savedCurrentTrack);
    }
}

// Сохранение состояния в localStorage
function saveStateToStorage() {
    localStorage.setItem('favorites', JSON.stringify(state.favorites));
    localStorage.setItem('history', JSON.stringify(state.history));
    localStorage.setItem('playlists', JSON.stringify(state.playlists));
    localStorage.setItem('equalizer', JSON.stringify(state.equalizer));
    localStorage.setItem('settings', JSON.stringify(state.settings));
    localStorage.setItem('volume', state.volume.toString());
    localStorage.setItem('currentTrack', JSON.stringify(state.currentTrack));
    localStorage.setItem('darkMode', state.settings.darkMode.toString());
}

// Применение темы
function applyTheme() {
    if (state.settings.darkMode) {
        document.body.classList.add('dark-mode');
        elements.darkMode.checked = true;
    } else {
        document.body.classList.remove('dark-mode');
        elements.darkMode.checked = false;
    }
}

// Инициализация аудио плеера
function initAudioPlayer() {
    elements.audioPlayer.volume = state.volume;
    elements.volumeSlider.value = state.volume * 100;
    
    // Обновление прогресса
    elements.audioPlayer.addEventListener('timeupdate', updateProgress);
    
    // Когда аудио загружено
    elements.audioPlayer.addEventListener('loadedmetadata', () => {
        state.duration = elements.audioPlayer.duration;
        updateTimeDisplay();
    });
    
    // Когда аудио закончилось
    elements.audioPlayer.addEventListener('ended', handleTrackEnd);
    
    // Обработка ошибок
    elements.audioPlayer.addEventListener('error', (e) => {
        console.error('Ошибка загрузки аудио:', e);
        showToast('Ошибка загрузки трека', 'error');
    });
}

// Инициализация UI
function initUI() {
    // Обновляем отображение избранного
    updateFavoritesDisplay();
    
    // Обновляем историю
    updateHistoryDisplay();
    
    // Обновляем плейлисты
    updatePlaylistsDisplay();
    
    // Обновляем настройки
    updateSettingsDisplay();
    
    // Обновляем эквалайзер
    updateEqualizerDisplay();
    
    // Обновляем громкость
    updateVolumeDisplay();
    
    // Обновляем активную страницу
    updatePageDisplay();
}

// Инициализация событий
function initEvents() {
    // Воспроизведение/пауза
    elements.playPauseBtn.addEventListener('click', togglePlayPause);
    elements.fullscreenPlayBtn.addEventListener('click', togglePlayPause);
    
    // Переключение треков
    elements.prevTrackBtn.addEventListener('click', playPreviousTrack);
    elements.nextTrackBtn.addEventListener('click', playNextTrack);
    
    // Режимы
    elements.shuffleBtn.addEventListener('click', toggleShuffle);
    elements.repeatBtn.addEventListener('click', toggleRepeat);
    
    // Полноэкранный плеер
    elements.closeFullscreenBtn.addEventListener('click', closeFullscreenPlayer);
    elements.fullscreenFavoriteBtn.addEventListener('click', toggleFavorite);
    
    // Прогресс бар
    const progressBar = document.querySelector('.progress-bar');
    progressBar.addEventListener('click', seekAudio);
    
    // Модальные окна
    elements.filterBtn.addEventListener('click', () => openModal(elements.filterModal));
    elements.closeFilterBtn.addEventListener('click', () => closeModal(elements.filterModal));
    
    elements.profileBtn.addEventListener('click', () => openModal(elements.profileModal));
    elements.closeProfileBtn.addEventListener('click', () => closeModal(elements.profileModal));
    
    elements.equalizerBtn.addEventListener('click', () => openModal(elements.equalizerModal));
    elements.closeEqualizerBtn.addEventListener('click', () => closeModal(elements.equalizerModal));
    
    elements.settingsBtn.addEventListener('click', () => openModal(elements.settingsModal));
    elements.closeSettingsBtn.addEventListener('click', () => closeModal(elements.settingsModal));
    
    // Закрытие модальных окон по клику вне
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
    
    // Поиск
    elements.searchBtn.addEventListener('click', performSearch);
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Избранное
    elements.favoritesBtn.addEventListener('click', showFavorites);
    
    // Пагинация
    elements.prevPage.addEventListener('click', () => changePage(state.currentPage - 1));
    elements.nextPage.addEventListener('click', () => changePage(state.currentPage + 1));
    
    elements.pageNumbers.forEach(btn => {
        btn.addEventListener('click', () => {
            const page = parseInt(btn.dataset.page);
            changePage(page);
        });
    });
    
    // Фильтры
    document.querySelectorAll('.filter-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            applyFilter(filter);
            closeModal(elements.filterModal);
        });
    });
    
    // Настройки
    elements.wifiOnly.addEventListener('change', (e) => {
        state.settings.wifiOnly = e.target.checked;
        saveStateToStorage();
    });
    
    elements.darkMode.addEventListener('change', (e) => {
        state.settings.darkMode = e.target.checked;
        saveStateToStorage();
        applyTheme();
    });
    
    elements.notifications.addEventListener('change', (e) => {
        state.settings.notifications = e.target.checked;
        saveStateToStorage();
    });
    
    elements.autoDownload.addEventListener('change', (e) => {
        state.settings.autoDownload = e.target.checked;
        saveStateToStorage();
    });
    
    // Эквалайзер
    elements.eqSliders.forEach(slider => {
        slider.addEventListener('input', (e) => {
            const band = e.target.dataset.band;
            const value = parseInt(e.target.value);
            state.equalizer[band] = value;
            saveStateToStorage();
        });
    });
    
    elements.presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = btn.dataset.preset;
            applyEqualizerPreset(preset);
        });
    });
    
    // Громкость
    elements.volumeSlider.addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        setVolume(volume);
    });
    
    elements.closeVolumeBtn.addEventListener('click', () => closeModal(elements.volumeModal));
    
    // Телеграм кнопка
    elements.telegramBtn.addEventListener('click', () => {
        window.open(CONFIG.telegramChannel, '_blank');
    });
    
    // Кнопка закрытия плеера
    elements.closePlayerBtn.addEventListener('click', () => {
        elements.playerBar.classList.add('hidden');
    });
    
    // Обработка контекстного меню
    document.addEventListener('click', (e) => {
        if (!elements.contextMenu.contains(e.target)) {
            elements.contextMenu.classList.remove('active');
        }
    });
    
    // Обработка клавиш
    document.addEventListener('keydown', handleKeyPress);
}

// Загрузка треков
function loadTracks() {
    elements.tracksContainer.innerHTML = '';
    
    let filteredTracks = [...musicLibrary];
    
    // Применяем фильтр
    if (state.activeFilter) {
        filteredTracks = filteredTracks.filter(track => {
            if (state.activeFilter === 'energetic') return track.genre === 'energetic';
            if (state.activeFilter === 'calm') return track.genre === 'calm';
            if (state.activeFilter === 'mix') return track.genre === 'mix';
            if (state.activeFilter === 'new') return track.year === 2023;
            if (state.activeFilter === 'foreign') return track.artist.toLowerCase().includes('foreign');
            return true;
        });
    }
    
    // Применяем поиск
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filteredTracks = filteredTracks.filter(track => 
            track.title.toLowerCase().includes(query) || 
            track.artist.toLowerCase().includes(query)
        );
    }
    
    // Пагинация
    const tracksPerPage = 8;
    const startIndex = (state.currentPage - 1) * tracksPerPage;
    const endIndex = startIndex + tracksPerPage;
    const pageTracks = filteredTracks.slice(startIndex, endIndex);
    
    // Отображаем треки
    pageTracks.forEach(track => {
        const trackCard = createTrackCard(track);
        elements.tracksContainer.appendChild(trackCard);
    });
    
    // Обновляем пагинацию
    updatePagination(filteredTracks.length, tracksPerPage);
}

// Создание карточки трека
function createTrackCard(track) {
    const isFavorite = state.favorites.some(fav => fav.id === track.id);
    const isPlaying = state.currentTrack && state.currentTrack.id === track.id && state.isPlaying;
    
    const card = document.createElement('div');
    card.className = `track-card fade-in ${isPlaying ? 'playing' : ''}`;
    card.dataset.id = track.id;
    
    card.innerHTML = `
        <img src="${track.image}" alt="${track.title}" class="track-image" onerror="this.src='https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'">
        <div class="track-info">
            <h3 class="track-title">${track.title}</h3>
            <p class="track-artist">${track.artist}</p>
            <div class="track-controls">
                <span class="track-duration">${track.duration}</span>
                <div class="track-actions">
                    <button class="track-action-btn favorite-btn ${isFavorite ? 'active' : ''}" 
                            data-id="${track.id}" title="${isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}">
                        <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                    <button class="track-action-btn play-btn" data-id="${track.id}" title="Воспроизвести">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Добавляем обработчики событий
    const playBtn = card.querySelector('.play-btn');
    const favoriteBtn = card.querySelector('.favorite-btn');
    
    playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playTrack(track);
    });
    
    favoriteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavoriteTrack(track.id);
    });
    
    card.addEventListener('click', (e) => {
        if (!playBtn.contains(e.target) && !favoriteBtn.contains(e.target)) {
            playTrack(track);
        }
    });
    
    // Контекстное меню
    card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e, track);
    });
    
    return card;
}

// Воспроизведение трека
function playTrack(track) {
    // Обновляем текущий трек
    state.currentTrack = track;
    
    // Устанавливаем источник аудио
    elements.audioPlayer.src = track.url;
    
    // Обновляем UI
    updatePlayerUI(track);
    
    // Воспроизводим
    elements.audioPlayer.play().then(() => {
        state.isPlaying = true;
        updatePlayButtons();
        
        // Добавляем в историю
        addToHistory(track);
        
        // Показываем нижнюю панель
        elements.playerBar.classList.remove('hidden');
        
        // Обновляем иконку закрытия плеера
        elements.closePlayerBtn.style.display = 'block';
        
        // Показываем уведомление
        if (state.settings.notifications) {
            showToast(`Сейчас играет: ${track.title}`, 'info');
        }
    }).catch(error => {
        console.error('Ошибка воспроизведения:', error);
        showToast('Ошибка воспроизведения трека', 'error');
    });
    
    // Сохраняем состояние
    saveStateToStorage();
}

// Обновление UI плеера
function updatePlayerUI(track) {
    // Нижняя панель
    elements.playerTrackTitle.textContent = track.title;
    elements.playerTrackArtist.textContent = track.artist;
    
    if (track.image) {
        elements.playerAlbumArt.innerHTML = `<img src="${track.image}" alt="${track.title}">`;
    } else {
        elements.playerAlbumArt.innerHTML = '<i class="fas fa-music"></i>';
    }
    
    // Полноэкранный плеер
    elements.fullscreenTrackTitle.textContent = track.title;
    elements.fullscreenTrackArtist.textContent = track.artist;
    
    if (track.image) {
        elements.fullscreenAlbumArt.innerHTML = `<img src="${track.image}" alt="${track.title}">`;
        elements.fullscreenBg.style.backgroundImage = `url(${track.image})`;
    } else {
        elements.fullscreenAlbumArt.innerHTML = '<div class="album-art-placeholder"><i class="fas fa-music"></i></div>';
        elements.fullscreenBg.style.background = 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)';
    }
    
    // Обновляем кнопку избранного
    const isFavorite = state.favorites.some(fav => fav.id === track.id);
    elements.fullscreenFavoriteBtn.innerHTML = isFavorite ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
    
    // Обновляем карточки треков
    updateTrackCards();
}

// Переключение воспроизведения/паузы
function togglePlayPause() {
    if (!state.currentTrack) {
        // Если нет текущего трека, воспроизводим первый
        playTrack(musicLibrary[0]);
        return;
    }
    
    if (state.isPlaying) {
        elements.audioPlayer.pause();
        state.isPlaying = false;
    } else {
        elements.audioPlayer.play().then(() => {
            state.isPlaying = true;
        }).catch(error => {
            console.error('Ошибка воспроизведения:', error);
            showToast('Ошибка воспроизведения', 'error');
        });
    }
    
    updatePlayButtons();
}

// Обновление кнопок воспроизведения
function updatePlayButtons() {
    const playIcon = state.isPlaying ? 'fa-pause' : 'fa-play';
    elements.playPauseBtn.innerHTML = `<i class="fas ${playIcon}"></i>`;
    elements.fullscreenPlayBtn.innerHTML = `<i class="fas ${playIcon}"></i>`;
    
    // Обновляем карточку текущего трека
    updateTrackCards();
}

// Воспроизведение предыдущего трека
function playPreviousTrack() {
    if (!state.currentTrack) return;
    
    const currentIndex = musicLibrary.findIndex(track => track.id === state.currentTrack.id);
    let previousIndex = currentIndex - 1;
    
    if (previousIndex < 0) {
        previousIndex = musicLibrary.length - 1;
    }
    
    playTrack(musicLibrary[previousIndex]);
}

// Воспроизведение следующего трека
function playNextTrack() {
    if (!state.currentTrack) return;
    
    let nextTrack;
    
    if (state.shuffle) {
        // Случайный трек
        const availableTracks = musicLibrary.filter(track => track.id !== state.currentTrack.id);
        const randomIndex = Math.floor(Math.random() * availableTracks.length);
        nextTrack = availableTracks[randomIndex];
    } else {
        // Следующий по порядку
        const currentIndex = musicLibrary.findIndex(track => track.id === state.currentTrack.id);
        let nextIndex = currentIndex + 1;
        
        if (nextIndex >= musicLibrary.length) {
            if (state.repeat) {
                nextIndex = 0;
            } else {
                return;
            }
        }
        
        nextTrack = musicLibrary[nextIndex];
    }
    
    playTrack(nextTrack);
}

// Обработка конца трека
function handleTrackEnd() {
    if (state.repeat) {
        // Повтор текущего трека
        elements.audioPlayer.currentTime = 0;
        elements.audioPlayer.play();
    } else {
        // Следующий трек
        playNextTrack();
    }
}

// Переключение перемешивания
function toggleShuffle() {
    state.shuffle = !state.shuffle;
    elements.shuffleBtn.classList.toggle('active', state.shuffle);
    showToast(state.shuffle ? 'Перемешивание включено' : 'Перемешивание выключено', 'info');
    saveStateToStorage();
}

// Переключение повтора
function toggleRepeat() {
    state.repeat = !state.repeat;
    elements.repeatBtn.classList.toggle('active', state.repeat);
    showToast(state.repeat ? 'Повтор включен' : 'Повтор выключен', 'info');
    saveStateToStorage();
}

// Обновление прогресса
function updateProgress() {
    if (!isNaN(elements.audioPlayer.duration)) {
        state.currentTime = elements.audioPlayer.currentTime;
        state.duration = elements.audioPlayer.duration;
        
        const progressPercent = (state.currentTime / state.duration) * 100;
        elements.progressFill.style.width = `${progressPercent}%`;
        
        updateTimeDisplay();
    }
}

// Обновление отображения времени
function updateTimeDisplay() {
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };
    
    elements.currentTime.textContent = formatTime(state.currentTime);
    elements.totalTime.textContent = formatTime(state.duration);
}

// Перемотка аудио
function seekAudio(e) {
    const progressBar = e.currentTarget;
    const clickPosition = e.offsetX;
    const progressBarWidth = progressBar.clientWidth;
    const seekTime = (clickPosition / progressBarWidth) * state.duration;
    
    elements.audioPlayer.currentTime = seekTime;
}

// Открытие модального окна
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Закрытие модального окна
function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Поиск треков
function performSearch() {
    state.searchQuery = elements.searchInput.value.trim();
    state.currentPage = 1;
    loadTracks();
    
    if (state.searchQuery) {
        showToast(`Найдено треков по запросу "${state.searchQuery}"`, 'info');
    }
}

// Показать избранное
function showFavorites() {
    // Переключаем активную кнопку
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    elements.favoritesBtn.classList.add('active');
    
    // Фильтруем по избранным
    const favoriteTracks = musicLibrary.filter(track => 
        state.favorites.some(fav => fav.id === track.id)
    );
    
    if (favoriteTracks.length === 0) {
        elements.tracksContainer.innerHTML = `
            <div class="empty-state">
                <i class="far fa-heart"></i>
                <h3>Нет избранных треков</h3>
                <p>Добавляйте треки в избранное, нажав на сердечко</p>
            </div>
        `;
    } else {
        elements.tracksContainer.innerHTML = '';
        favoriteTracks.forEach(track => {
            const trackCard = createTrackCard(track);
            elements.tracksContainer.appendChild(trackCard);
        });
    }
    
    // Скрываем пагинацию для избранного
    document.querySelector('.pagination-container').style.display = 'none';
}

// Переключение избранного для трека
function toggleFavoriteTrack(trackId) {
    const track = musicLibrary.find(t => t.id === trackId);
    if (!track) return;
    
    const isFavorite = state.favorites.some(fav => fav.id === trackId);
    
    if (isFavorite) {
        // Удаляем из избранного
        state.favorites = state.favorites.filter(fav => fav.id !== trackId);
        showToast('Удалено из избранного', 'info');
    } else {
        // Добавляем в избранное
        state.favorites.push(track);
        showToast('Добавлено в избранное', 'success');
        
        // Анимация сердечка
        const heartIcon = document.querySelector(`[data-id="${trackId}"] .favorite-btn i`);
        heartIcon.classList.add('heart-beat');
        setTimeout(() => heartIcon.classList.remove('heart-beat'), 500);
    }
    
    // Обновляем UI
    updateFavoritesDisplay();
    saveStateToStorage();
    
    // Обновляем кнопку в полноэкранном плеере
    if (state.currentTrack && state.currentTrack.id === trackId) {
        elements.fullscreenFavoriteBtn.innerHTML = isFavorite ? 
            '<i class="far fa-heart"></i>' : 
            '<i class="fas fa-heart"></i>';
    }
}

// Обновление отображения избранного
function updateFavoritesDisplay() {
    // Обновляем счетчик в профиле
    document.querySelectorAll('.stat-number').forEach(el => {
        if (el.parentElement.querySelector('.stat-label').textContent === 'Избранных') {
            el.textContent = state.favorites.length;
        }
    });
    
    // Обновляем кнопку избранного в навигации
    const heartIcon = elements.favoritesBtn.querySelector('i');
    if (state.favorites.length > 0) {
        heartIcon.classList.remove('far');
        heartIcon.classList.add('fas');
    } else {
        heartIcon.classList.remove('fas');
        heartIcon.classList.add('far');
    }
}

// Добавление в историю
function addToHistory(track) {
    // Удаляем трек, если он уже есть в истории
    state.history = state.history.filter(item => item.id !== track.id);
    
    // Добавляем в начало
    state.history.unshift({
        ...track,
        playedAt: new Date().toISOString()
    });
    
    // Ограничиваем размер истории
    if (state.history.length > 50) {
        state.history = state.history.slice(0, 50);
    }
    
    // Сохраняем и обновляем
    saveStateToStorage();
    updateHistoryDisplay();
}

// Обновление отображения истории
function updateHistoryDisplay() {
    elements.historyList.innerHTML = '';
    
    if (state.history.length === 0) {
        elements.historyList.innerHTML = '<p class="empty-history">История прослушивания пуста</p>';
        return;
    }
    
    state.history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-track';
        historyItem.dataset.id = item.id;
        
        const playedAt = new Date(item.playedAt);
        const timeString = playedAt.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        historyItem.innerHTML = `
            <img src="${item.image}" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'">
            <div class="history-track-info">
                <h4 class="history-track-title">${item.title}</h4>
                <p class="history-track-artist">${item.artist}</p>
            </div>
            <span class="history-track-time">${timeString}</span>
        `;
        
        historyItem.addEventListener('click', () => {
            playTrack(item);
            closeModal(elements.historyModal);
        });
        
        elements.historyList.appendChild(historyItem);
    });
}

// Смена страницы
function changePage(page) {
    if (page < 1 || page > state.totalPages) return;
    
    state.currentPage = page;
    loadTracks();
    updatePageDisplay();
}

// Обновление отображения страницы
function updatePageDisplay() {
    // Обновляем активную кнопку
    elements.pageNumbers.forEach(btn => {
        const pageNum = parseInt(btn.dataset.page);
        btn.classList.toggle('active', pageNum === state.currentPage);
    });
    
    // Обновляем состояние кнопок
    elements.prevPage.disabled = state.currentPage === 1;
    elements.nextPage.disabled = state.currentPage === state.totalPages;
}

// Обновление пагинации
function updatePagination(totalTracks, tracksPerPage) {
    state.totalPages = Math.ceil(totalTracks / tracksPerPage);
    
    // Обновляем кнопки
    elements.pageNumbers.forEach((btn, index) => {
        const pageNum = index + 1;
        btn.style.display = pageNum <= state.totalPages ? 'flex' : 'none';
        btn.disabled = pageNum > state.totalPages;
    });
    
    // Показываем/скрываем контейнер пагинации
    document.querySelector('.pagination-container').style.display = 
        state.totalPages > 1 ? 'flex' : 'none';
}

// Применение фильтра
function applyFilter(filter) {
    state.activeFilter = state.activeFilter === filter ? null : filter;
    state.currentPage = 1;
    loadTracks();
    
    // Обновляем кнопки фильтров
    document.querySelectorAll('.filter-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === state.activeFilter);
    });
    
    if (state.activeFilter) {
        showToast(`Применен фильтр: ${getFilterName(state.activeFilter)}`, 'info');
    } else {
        showToast('Фильтр сброшен', 'info');
    }
}

// Получение названия фильтра
function getFilterName(filter) {
    const names = {
        energetic: 'Энергичный',
        calm: 'Спокойный',
        mix: 'Микс',
        foreign: 'Зарубежные',
        new: 'Новые'
    };
    return names[filter] || filter;
}

// Открытие полноэкранного плеера
function openFullscreenPlayer() {
    elements.fullscreenPlayer.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Закрытие полноэкранного плеера
function closeFullscreenPlayer() {
    elements.fullscreenPlayer.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Переключение избранного
function toggleFavorite() {
    if (!state.currentTrack) return;
    toggleFavoriteTrack(state.currentTrack.id);
}

// Обновление карточек треков
function updateTrackCards() {
    document.querySelectorAll('.track-card').forEach(card => {
        const trackId = parseInt(card.dataset.id);
        const isPlaying = state.currentTrack && state.currentTrack.id === trackId && state.isPlaying;
        
        card.classList.toggle('playing', isPlaying);
        
        // Обновляем кнопку избранного
        const favoriteBtn = card.querySelector('.favorite-btn');
        const isFavorite = state.favorites.some(fav => fav.id === trackId);
        
        if (favoriteBtn) {
            favoriteBtn.classList.toggle('active', isFavorite);
            favoriteBtn.innerHTML = `<i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>`;
        }
    });
}

// Применение пресета эквалайзера
function applyEqualizerPreset(preset) {
    const presets = {
        default: { '60hz': 0, '230hz': 0, '910hz': 0, '4khz': 0, '14khz': 0 },
        bass: { '60hz': 8, '230hz': 6, '910hz': 0, '4khz': -2, '14khz': -4 },
        treble: { '60hz': -4, '230hz': -2, '910hz': 0, '4khz': 6, '14khz': 8 },
        vocal: { '60hz': -2, '230hz': 2, '910hz': 4, '4khz': 6, '14khz': 2 },
        flat: { '60hz': 0, '230hz': 0, '910hz': 0, '4khz': 0, '14khz': 0 }
    };
    
    if (presets[preset]) {
        state.equalizer = { ...presets[preset] };
        updateEqualizerDisplay();
        saveStateToStorage();
        
        // Обновляем активную кнопку пресета
        elements.presetButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.preset === preset);
        });
        
        showToast(`Применен пресет: ${preset}`, 'info');
    }
}

// Обновление отображения эквалайзера
function updateEqualizerDisplay() {
    elements.eqSliders.forEach(slider => {
        const band = slider.dataset.band;
        slider.value = state.equalizer[band];
    });
}

// Установка громкости
function setVolume(volume) {
    state.volume = Math.max(0, Math.min(1, volume));
    elements.audioPlayer.volume = state.volume;
    
    // Обновляем иконку
    updateVolumeIcon();
    
    // Сохраняем
    saveStateToStorage();
}

// Обновление иконки громкости
function updateVolumeIcon() {
    let iconClass = 'fa-volume-up';
    
    if (state.volume === 0 || state.isMuted) {
        iconClass = 'fa-volume-mute';
    } else if (state.volume < 0.3) {
        iconClass = 'fa-volume-off';
    } else if (state.volume < 0.7) {
        iconClass = 'fa-volume-down';
    }
    
    elements.volumeIcon.className = `fas ${iconClass}`;
}

// Обновление отображения громкости
function updateVolumeDisplay() {
    elements.volumeSlider.value = state.volume * 100;
    updateVolumeIcon();
}

// Обновление отображения настроек
function updateSettingsDisplay() {
    elements.wifiOnly.checked = state.settings.wifiOnly;
    elements.darkMode.checked = state.settings.darkMode;
    elements.notifications.checked = state.settings.notifications;
    elements.autoDownload.checked = state.settings.autoDownload;
}

// Обновление отображения плейлистов
function updatePlaylistsDisplay() {
    elements.playlistList.innerHTML = '';
    
    state.playlists.forEach(playlist => {
        const playlistItem = document.createElement('div');
        playlistItem.className = 'playlist-item';
        playlistItem.dataset.id = playlist.id;
        
        playlistItem.innerHTML = `
            <i class="fas fa-${playlist.icon}"></i>
            <span>${playlist.name}</span>
            <span class="playlist-count">${playlist.tracks.length}</span>
        `;
        
        playlistItem.addEventListener('click', () => {
            showToast(`Открыт плейлист: ${playlist.name}`, 'info');
        });
        
        elements.playlistList.appendChild(playlistItem);
    });
}

// Создание частиц для анимации
function createParticles() {
    const container = document.getElementById('particlesContainer');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Случайные параметры
        const size = Math.random() * 20 + 5;
        const posX = Math.random() * 100;
        const delay = Math.random() * 15;
        const duration = Math.random() * 10 + 15;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        
        // Случайный цвет
        const colors = [
            'rgba(74, 107, 255, 0.3)',
            'rgba(108, 92, 231, 0.3)',
            'rgba(0, 206, 201, 0.3)',
            'rgba(255, 118, 117, 0.3)'
        ];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        container.appendChild(particle);
    }
}

// Показать контекстное меню
function showContextMenu(e, track) {
    e.preventDefault();
    
    // Позиционируем меню
    elements.contextMenu.style.left = `${e.pageX}px`;
    elements.contextMenu.style.top = `${e.pageY}px`;
    elements.contextMenu.classList.add('active');
    
    // Обновляем обработчики
    const addToFavoritesBtn = document.getElementById('addToFavoritesContext');
    const addToPlaylistBtn = document.getElementById('addToPlaylistContext');
    const shareBtn = document.getElementById('shareContext');
    const downloadBtn = document.getElementById('downloadContext');
    
    // Удаляем старые обработчики
    const newAddToFavoritesBtn = addToFavoritesBtn.cloneNode(true);
    const newAddToPlaylistBtn = addToPlaylistBtn.cloneNode(true);
    const newShareBtn = shareBtn.cloneNode(true);
    const newDownloadBtn = downloadBtn.cloneNode(true);
    
    addToFavoritesBtn.parentNode.replaceChild(newAddToFavoritesBtn, addToFavoritesBtn);
    addToPlaylistBtn.parentNode.replaceChild(newAddToPlaylistBtn, addToPlaylistBtn);
    shareBtn.parentNode.replaceChild(newShareBtn, shareBtn);
    downloadBtn.parentNode.replaceChild(newDownloadBtn, downloadBtn);
    
    // Добавляем новые обработчики
    newAddToFavoritesBtn.addEventListener('click', () => {
        toggleFavoriteTrack(track.id);
        elements.contextMenu.classList.remove('active');
    });
    
    newAddToPlaylistBtn.addEventListener('click', () => {
        showToast('Функция добавления в плейлист в разработке', 'info');
        elements.contextMenu.classList.remove('active');
    });
    
    newShareBtn.addEventListener('click', () => {
        shareTrack(track);
        elements.contextMenu.classList.remove('active');
    });
    
    newDownloadBtn.addEventListener('click', () => {
        downloadTrack(track);
        elements.contextMenu.classList.remove('active');
    });
}

// Поделиться треком
function shareTrack(track) {
    const text = `Слушай "${track.title}" от ${track.artist} в EDM Music!`;
    
    if (navigator.share) {
        navigator.share({
            title: track.title,
            text: text,
            url: track.url
        }).catch(error => {
            console.log('Ошибка sharing:', error);
            showToast('Ссылка скопирована в буфер обмена', 'info');
            copyToClipboard(text);
        });
    } else {
        copyToClipboard(text);
        showToast('Ссылка скопирована в буфер обмена', 'info');
    }
}

// Скачать трек
function downloadTrack(track) {
    if (state.settings.wifiOnly && !navigator.onLine) {
        showToast('Подключитесь к Wi-Fi для скачивания', 'error');
        return;
    }
    
    showToast('Начало загрузки трека...', 'info');
    
    // Создаем ссылку для скачивания
    const link = document.createElement('a');
    link.href = track.url;
    link.download = `${track.title} - ${track.artist}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
        showToast('Трек загружен', 'success');
    }, 2000);
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

// Показать Toast уведомление
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    // Удаляем toast через 3 секунды
    setTimeout(() => {
        toast.remove();
    }, 3000);
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
                elements.audioPlayer.currentTime -= 10;
            }
            break;
        case 'ArrowRight':
            if (e.ctrlKey) {
                e.preventDefault();
                elements.audioPlayer.currentTime += 10;
            }
            break;
        case 'ArrowUp':
            e.preventDefault();
            setVolume(Math.min(1, state.volume + 0.1));
            break;
        case 'ArrowDown':
            e.preventDefault();
            setVolume(Math.max(0, state.volume - 0.1));
            break;
        case 'Escape':
            if (elements.fullscreenPlayer.classList.contains('active')) {
                closeFullscreenPlayer();
            }
            break;
    }
}

// Открытие плеера на весь экран при клике на нижнюю панель
elements.playerBar.addEventListener('click', () => {
    if (state.currentTrack) {
        openFullscreenPlayer();
    }
});

// Обновление анимированного фона
function updateAnimatedBackground() {
    const colors = [
        ['#ee7752', '#e73c7e', '#23a6d5', '#23d5ab'],
        ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'],
        ['#654ea3', '#da98b4', '#fad0c4', '#a1c4fd'],
        ['#667eea', '#764ba2', '#f093fb', '#f5576c']
    ];
    
    const randomColors = colors[Math.floor(Math.random() * colors.length)];
    const gradient = document.querySelector('.animated-gradient');
    
    gradient.style.background = `linear-gradient(-45deg, ${randomColors[0]}, ${randomColors[1]}, ${randomColors[2]}, ${randomColors[3]})`;
}

// Проверка онлайн-статуса
function checkOnlineStatus() {
    if (!navigator.onLine) {
        showToast('Отсутствует подключение к интернету', 'error');
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    
    // Проверяем онлайн статус
    checkOnlineStatus();
    
    // Слушаем изменения онлайн статуса
    window.addEventListener('online', () => {
        showToast('Подключение восстановлено', 'success');
    });
    
    window.addEventListener('offline', () => {
        showToast('Отсутствует подключение к интернету', 'error');
    });
    
    // Обновляем анимированный фон каждые 30 секунд
    setInterval(updateAnimatedBackground, 30000);
    
    // Предзагрузка изображений для лучшего UX
    preloadImages();
});

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
}

// Функция для создания аудио визуализации (опционально)
function createAudioVisualization() {
    // Эта функция может быть реализована с использованием Web Audio API
    // для создания визуализации звуковых волн
    
    if (!window.AudioContext) {
        return;
    }
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(elements.audioPlayer);
    
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function draw() {
        requestAnimationFrame(draw);
        
        analyser.getByteFrequencyData(dataArray);
        
        // Здесь можно отрисовать визуализацию
        // Например, в элементе с id="visualization"
        const visualization = document.getElementById('visualization');
        if (visualization) {
            // Код для отрисовки визуализации
        }
    }
    
    draw();
}

// Сохранение состояния при закрытии приложения
window.addEventListener('beforeunload', () => {
    saveStateToStorage();
});

// Обработка ошибок изображений
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        e.target.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
    }
}, true);

// Вспомогательная функция для форматирования времени
function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Функция для плавного перехода между треками
function smoothTransition() {
    // Можно реализовать плавное затухание и появление звука
    // при переходе между треками
}

// Инициализация Service Worker для PWA (опционально)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker зарегистрирован:', registration);
        }).catch(error => {
            console.log('Ошибка регистрации ServiceWorker:', error);
        });
    });
}

// Функция для запроса разрешения на уведомления
function requestNotificationPermission() {
    if ("Notification" in window && state.settings.notifications) {
        if (Notification.permission === "default") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    showToast("Уведомления включены", "success");
                }
            });
        }
    }
}

// Функция для отправки уведомления
function sendNotification(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body });
    }
}

// Вызов запроса разрешений при инициализации
requestNotificationPermission();