class CharacterManager {
    constructor(app) {
        this.app = app;
        this.speechSynthesis = window.speechSynthesis;
        this.currentUtterance = null;
        this.isSpeaking = false;
        this.isVoiceEnabled = true;
        this.isAnimationsEnabled = true;
        this.isCharacterVisible = true;
        this.characterName = 'AI-тян';
        this.characterStyle = 'anime';
        this.voiceSpeed = 1.0;
        this.voicePitch = 1.0;
        this.currentExpression = 'idle';
        this.spine = null;
        this.canvas = null;
        this.context = null;
        this.renderer = null;
        this.skeleton = null;
        this.skeletonData = null;
        this.state = null;
        this.stateData = null;
        this.isLoaded = false;
        this.modelScale = 0.8;
        this.animationSpeed = 1.0;
        this.rendererType = 'webgl';
        this.autoIdleAnimations = true;
        this.debugMode = false;
        this.highlightColor = '#8a2be2';
        this.currentAnimation = 'idle';
        this.currentEmotion = 'neutral';
        this.isThinking = false;
        this.elements = {};
        this.idleTimer = null;
        this.bubbleTimer = null;
        this.availableAnimations = [];
        this.emotionAnimations = {
            'happy': ['smile', 'happy', 'joy'],
            'sad': ['sad', 'cry', 'disappointed'],
            'angry': ['angry', 'rage', 'frustrated'],
            'surprise': ['surprise', 'shock', 'amazed'],
            'thinking': ['think', 'ponder', 'concentrate'],
            'love': ['love', 'heart', 'affection']
        };
        this.poseAnimations = {
            'idle': ['idle', 'breathing', 'stand'],
            'talk': ['talk', 'speak', 'conversation'],
            'listen': ['listen', 'attention', 'focus'],
            'think': ['think', 'ponder', 'concentrate'],
            'wave': ['wave', 'hello', 'greet'],
            'dance': ['dance', 'celebrate', 'party']
        };
        this.init();
    }
    init() {
        console.log('CharacterManager: Инициализация');
        this.initElements();
        this.bindEvents();
        this.loadSettings();
        this.setupCanvas();
        this.showLoadingModal('Инициализация Spine runtime...');
    }
    initElements() {
        this.elements = {
            characterScene: document.getElementById('character-scene'),
            spineCanvas: document.getElementById('spine-canvas'),
            showCharacterBtn: document.getElementById('show-character-btn'),
            speechBubble: document.getElementById('speech-bubble'),
            bubbleText: document.getElementById('bubble-text'),
            characterStatus: document.getElementById('character-status'),
            charToggleVoice: document.getElementById('char-toggle-voice'),
            charToggleAnim: document.getElementById('char-toggle-anim'),
            charSettings: document.getElementById('char-settings'),
            charHide: document.getElementById('char-hide'),
            emotionBtns: document.querySelectorAll('.emotion-btn'),
            poseBtns: document.querySelectorAll('.pose-btn'),
            characterSettingsModal: document.getElementById('character-settings-modal'),
            closeCharacterSettings: document.getElementById('close-character-settings'),
            modelLoadingModal: document.getElementById('model-loading-modal'),
            modelPathInput: document.getElementById('model-path-input'),
            animationScaleSlider: document.getElementById('animation-scale-slider'),
            animationScaleValue: document.getElementById('animation-scale-value'),
            animationSpeedSlider: document.getElementById('animation-speed-slider'),
            animationSpeedValue: document.getElementById('animation-speed-value'),
            rendererSelect: document.getElementById('renderer-select'),
            autoIdleCheckbox: document.getElementById('auto-idle-checkbox'),
            characterColorPicker: document.getElementById('character-color-picker'),
            colorPresets: document.querySelectorAll('.color-preset'),
            saveCharacterSettings: document.getElementById('save-character-settings'),
            testAnimationsBtn: document.getElementById('test-animations-btn'),
            resetCharacterSettings: document.getElementById('reset-character-settings'),
            debugStats: document.getElementById('debug-stats'),
            debugBonesBtn: document.getElementById('debug-bones-btn'),
            debugSlotsBtn: document.getElementById('debug-slots-btn'),
            debugHitboxesBtn: document.getElementById('debug-hitboxes-btn'),
            loadingText: document.getElementById('loading-text'),
            loadingProgressBar: document.getElementById('loading-progress-bar'),
            loadingProgressText: document.getElementById('loading-progress-text'),
            loadingDetails: document.getElementById('loading-details')
        };
    }
    bindEvents() {
        this.elements.charToggleVoice.addEventListener('click', () => this.toggleVoice());
        this.elements.charToggleAnim.addEventListener('click', () => this.toggleAnimations());
        this.elements.charSettings.addEventListener('click', () => this.showSettings());
        this.elements.charHide.addEventListener('click', () => this.hideCharacter());
        this.elements.showCharacterBtn.addEventListener('click', () => this.showCharacter());
        this.elements.spineCanvas.addEventListener('click', (e) => this.onCanvasClick(e));
        this.elements.emotionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const emotion = btn.dataset.emotion;
                this.setEmotion(emotion);
            });
        });
        this.elements.poseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const pose = btn.dataset.pose;
                this.setPose(pose);
            });
        });
        this.elements.closeCharacterSettings.addEventListener('click', () => this.hideSettings());
        this.elements.saveCharacterSettings.addEventListener('click', () => this.saveSettings());
        this.elements.testAnimationsBtn.addEventListener('click', () => this.testAllAnimations());
        this.elements.resetCharacterSettings.addEventListener('click', () => this.resetSettings());
        this.elements.animationScaleSlider.addEventListener('input', (e) => {
            this.modelScale = parseFloat(e.target.value);
            this.elements.animationScaleValue.textContent = this.modelScale.toFixed(1) + 'x';
            if (this.skeleton) {
                this.skeleton.scaleX = this.skeleton.scaleY = this.modelScale;
            }
        });
        this.elements.animationSpeedSlider.addEventListener('input', (e) => {
            this.animationSpeed = parseFloat(e.target.value);
            this.elements.animationSpeedValue.textContent = this.animationSpeed.toFixed(1) + 'x';
            if (this.state) {
                this.state.timeScale = this.animationSpeed;
            }
        });
        this.elements.autoIdleCheckbox.addEventListener('change', (e) => {
            this.autoIdleAnimations = e.target.checked;
            if (this.autoIdleAnimations) {
                this.startIdleAnimations();
            } else {
                this.stopIdleAnimations();
            }
        });
        this.elements.characterColorPicker.addEventListener('input', (e) => {
            this.highlightColor = e.target.value;
            this.updateHighlightColor();
        });
        this.elements.colorPresets.forEach(preset => {
            preset.addEventListener('click', () => {
                const color = preset.dataset.color;
                this.highlightColor = color;
                this.elements.characterColorPicker.value = color;
                this.updateHighlightColor();
                this.elements.colorPresets.forEach(p => p.classList.remove('active'));
                preset.classList.add('active');
            });
        });
        this.elements.debugBonesBtn.addEventListener('click', () => this.toggleDebugBones());
        this.elements.debugSlotsBtn.addEventListener('click', () => this.toggleDebugSlots());
        this.elements.debugHitboxesBtn.addEventListener('click', () => this.toggleDebugHitboxes());
        this.elements.characterSettingsModal.addEventListener('click', (e) => {
            if (e.target === this.elements.characterSettingsModal) {
                this.hideSettings();
            }
        });
    }
    loadSettings() {
        this.isVoiceEnabled = localStorage.getItem('spine_voice_enabled') !== 'false';
        this.isAnimationsEnabled = localStorage.getItem('spine_animations_enabled') !== 'false';
        this.isCharacterVisible = localStorage.getItem('spine_visible') !== 'false';
        this.characterName = localStorage.getItem('spine_character_name') || 'AI-тян';
        this.modelScale = parseFloat(localStorage.getItem('spine_model_scale')) || 0.8;
        this.animationSpeed = parseFloat(localStorage.getItem('spine_animation_speed')) || 1.0;
        this.rendererType = localStorage.getItem('spine_renderer_type') || 'webgl';
        this.autoIdleAnimations = localStorage.getItem('spine_auto_idle') !== 'false';
        this.highlightColor = localStorage.getItem('spine_highlight_color') || '#8a2be2';
        this.applySettings();
    }
    saveSettings() {
        localStorage.setItem('spine_voice_enabled', this.isVoiceEnabled);
        localStorage.setItem('spine_animations_enabled', this.isAnimationsEnabled);
        localStorage.setItem('spine_visible', this.isCharacterVisible);
        localStorage.setItem('spine_character_name', this.characterName);
        localStorage.setItem('spine_model_scale', this.modelScale);
        localStorage.setItem('spine_animation_speed', this.animationSpeed);
        localStorage.setItem('spine_renderer_type', this.rendererType);
        localStorage.setItem('spine_auto_idle', this.autoIdleAnimations);
        localStorage.setItem('spine_highlight_color', this.highlightColor);
        this.applySettings();
        this.hideSettings();
        this.app.showNotification('Настройки персонажа сохранены', 'success');
        const newPath = this.elements.modelPathInput.value;
        if (newPath && newPath !== this.currentModelPath) {
            this.loadSpineModel(newPath);
        }
    }
    applySettings() {
        this.elements.modelPathInput.value = localStorage.getItem('spine_model_path') || 'assets/spine/character/character.json';
        this.elements.animationScaleSlider.value = this.modelScale;
        this.elements.animationScaleValue.textContent = this.modelScale.toFixed(1) + 'x';
        this.elements.animationSpeedSlider.value = this.animationSpeed;
        this.elements.animationSpeedValue.textContent = this.animationSpeed.toFixed(1) + 'x';
        this.elements.rendererSelect.value = this.rendererType;
        this.elements.autoIdleCheckbox.checked = this.autoIdleAnimations;
        this.elements.characterColorPicker.value = this.highlightColor;
        this.updateControlButtons();
        if (this.isCharacterVisible) {
            this.showCharacter();
        } else {
            this.hideCharacter();
        }
        this.updateHighlightColor();
    }
    setupCanvas() {
        this.canvas = this.elements.spineCanvas;
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        const gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        if (!gl && this.rendererType === 'webgl') {
            console.warn('WebGL не поддерживается, переключаемся на Canvas');
            this.rendererType = 'canvas';
            this.elements.rendererSelect.value = 'canvas';
        }
    }
    async loadSpineModel(modelPath = null) {
        const path = modelPath || this.elements.modelPathInput.value;
        this.currentModelPath = path;
        console.log(`CharacterManager: Загрузка Spine модели из ${path}`);
        this.showLoadingModal('Загрузка Spine модели...');
        try {
            this.updateLoadingProgress(10, 'Загрузка JSON данных...');
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Не удалось загрузить модель: ${response.status} ${response.statusText}`);
            }
            const jsonData = await response.json();
            this.updateLoadingProgress(30, 'Парсинг данных Spine...');
            const assetPath = path.substring(0, path.lastIndexOf('/') + 1);
            const textureLoader = new spine.TextureLoader();
            const atlasLoader = new spine.AtlasAttachmentLoader(textureLoader);
            const skeletonJson = new spine.SkeletonJson(atlasLoader);
            skeletonJson.scale = this.modelScale;
            this.skeletonData = skeletonJson.readSkeletonData(jsonData);
            if (!this.skeletonData) {
                throw new Error('Не удалось прочитать данные скелета');
            }
            this.updateLoadingProgress(50, 'Создание скелета...');
            this.skeleton = new spine.Skeleton(this.skeletonData);
            this.skeleton.scaleX = this.skeleton.scaleY = this.modelScale;
            this.skeleton.setToSetupPose();
            this.skeleton.updateWorldTransform();
            this.stateData = new spine.AnimationStateData(this.skeletonData);
            this.state = new spine.AnimationState(this.stateData);
            this.state.timeScale = this.animationSpeed;
            this.availableAnimations = this.skeletonData.animations.map(anim => anim.name);
            console.log('Доступные анимации:', this.availableAnimations);
            this.updateLoadingProgress(70, 'Создание рендерера...');
            this.createRenderer();
            const defaultAnim = this.findAnimation(['idle', 'Idle', 'stand', 'Stand']);
            if (defaultAnim) {
                this.setAnimation(defaultAnim, true);
            }
            this.updateLoadingProgress(90, 'Финальная настройка...');
            this.startRenderLoop();
            if (this.autoIdleAnimations) {
                this.startIdleAnimations();
            }
            this.isLoaded = true;
            this.updateStatus('Модель загружена', 'success');
            this.updateDebugStats();
            this.updateLoadingProgress(100, 'Готово!');
            setTimeout(() => {
                this.hideLoadingModal();
                this.showBubble('Привет! Я готов к общению!', 3000);
                this.setEmotion('happy');
            }, 1000);
            console.log('CharacterManager: Spine модель успешно загружена');
        } catch (error) {
            console.error('CharacterManager: Ошибка загрузки Spine модели:', error);
            this.updateStatus(`Ошибка: ${error.message}`, 'error');
            this.showBubble('Не удалось загрузить модель :(', 3000);
            this.showDemoMode();
        }
    }
    createRenderer() {
        if (this.rendererType === 'webgl') {
            const gl = this.canvas.getContext('webgl', {
                alpha: true,
                premultipliedAlpha: true,
                antialias: true,
                preserveDrawingBuffer: false
            }) || this.canvas.getContext('experimental-webgl');
            if (!gl) {
                console.warn('WebGL не доступен, используем Canvas');
                this.rendererType = 'canvas';
                this.createRenderer();
                return;
            }
            this.renderer = new spine.webgl.SceneRenderer(this.canvas, gl);
            this.context = gl;
        } else {
            this.context = this.canvas.getContext('2d');
            if (!this.context) {
                throw new Error('Не удалось создать Canvas 2D контекст');
            }
            console.warn('Canvas рендерер требует spine-canvas.js runtime');
            this.showBubble('Требуется spine-canvas.js для Canvas рендера', 3000);
            this.drawPlaceholder();
        }
    }
    startRenderLoop() {
        const render = () => {
            if (!this.isLoaded || !this.skeleton || !this.state) {
                requestAnimationFrame(render);
                return;
            }
            if (this.rendererType === 'webgl' && this.renderer) {
                const gl = this.context;
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                const delta = 1/60;
                this.state.update(delta);
                this.state.apply(this.skeleton);
                this.skeleton.updateWorldTransform();
                this.renderer.begin();
                this.renderer.drawSkeleton(this.skeleton, true);
                this.renderer.end();
            } else if (this.context && this.context.clearRect) {
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.drawPlaceholder();
            }
            requestAnimationFrame(render);
        };
        render();
    }
    drawPlaceholder() {
        const ctx = this.context;
        const width = this.canvas.width;
        const height = this.canvas.height;
        ctx.fillStyle = 'rgba(20, 20, 20, 0.9)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#8a2be2';
        ctx.font = '16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('2D Spine Модель', width / 2, height / 2 - 30);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText('Загрузите свою модель в assets/spine/', width / 2, height / 2);
        ctx.fillText('character.json', width / 2, height / 2 + 20);
        ctx.fillStyle = 'rgba(138, 43, 226, 0.2)';
        ctx.beginPath();
        ctx.arc(width / 2, height / 2 - 60, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(width / 2 - 15, height / 2 - 30, 30, 60);
        ctx.fillRect(width / 2 - 35, height / 2 - 30, 20, 10);
        ctx.fillRect(width / 2 + 15, height / 2 - 30, 20, 10);
        ctx.fillRect(width / 2 - 15, height / 2 + 30, 15, 40);
        ctx.fillRect(width / 2, height / 2 + 30, 15, 40);
    }
    showDemoMode() {
        this.isLoaded = false;
        this.updateStatus('Демо-режим', 'warning');
        this.showBubble('Используется демо-режим. Загрузите модель Spine.', 4000);
        setTimeout(() => {
            this.hideLoadingModal();
        }, 2000);
    }
    findAnimation(possibleNames) {
        if (!this.availableAnimations || this.availableAnimations.length === 0) {
            return null;
        }
        for (const name of possibleNames) {
            const found = this.availableAnimations.find(anim => 
                anim.toLowerCase().includes(name.toLowerCase())
            );
            if (found) return found;
        }
        return this.availableAnimations[0];
    }
    setAnimation(animationName, loop = true) {
        if (!this.state || !this.skeletonData) {
            console.warn('Не могу установить анимацию: модель не загружена');
            return;
        }
        const animation = this.skeletonData.findAnimation(animationName);
        if (!animation) {
            console.warn(`Анимация "${animationName}" не найдена`);
            return;
        }
        this.currentAnimation = animationName;
        this.state.setAnimation(0, animation, loop);
        console.log(`Установлена анимация: ${animationName} (loop: ${loop})`);
    }
    setEmotion(emotion) {
        this.currentEmotion = emotion;
        const possibleAnimations = this.emotionAnimations[emotion] || [emotion];
        const animation = this.findAnimation(possibleAnimations);
        if (animation) {
            this.setAnimation(animation, false);
            setTimeout(() => {
                if (this.currentAnimation !== 'idle' && !this.isSpeaking && !this.isThinking) {
                    this.setAnimation('idle', true);
                }
            }, 2000);
            this.showBubble(this.getEmotionPhrase(emotion), 2000);
        }
        this.elements.emotionBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.emotion === emotion) {
                btn.classList.add('active');
            }
        });
    }
    setPose(pose) {
        const possibleAnimations = this.poseAnimations[pose] || [pose];
        const animation = this.findAnimation(possibleAnimations);
        if (animation) {
            this.setAnimation(animation, pose === 'idle' || pose === 'dance');
            this.elements.poseBtns.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.pose === pose) {
                    btn.classList.add('active');
                }
            });
        }
    }
    startIdleAnimations() {
        if (this.idleTimer) clearInterval(this.idleTimer);
        this.idleTimer = setInterval(() => {
            if (!this.isLoaded || this.isSpeaking || this.isThinking || 
                !this.autoIdleAnimations || Math.random() > 0.3) {
                return;
            }
            const idleAnimations = ['blink', 'breathe', 'look_around', 'stretch', 'shift_weight'];
            const randomAnim = idleAnimations[Math.floor(Math.random() * idleAnimations.length)];
            const animation = this.findAnimation([randomAnim]);
            if (animation) {
                this.state.setAnimation(0, animation, false);
                setTimeout(() => {
                    if (this.currentAnimation === randomAnim) {
                        this.setAnimation('idle', true);
                    }
                }, 1000);
            }
        }, 5000);
    }
    stopIdleAnimations() {
        if (this.idleTimer) {
            clearInterval(this.idleTimer);
            this.idleTimer = null;
        }
    }
    onUserMessage(message) {
        if (!this.isLoaded) return;
        this.isThinking = true;
        this.setAnimation('think', true);
        this.showBubble('Думаю над ответом...', 2000);
        if (this.containsPositiveWords(message)) {
            this.setEmotion('happy');
        } else if (this.containsQuestionWords(message)) {
            this.setEmotion('thinking');
        }
    }
    onAIResponse(response) {
        if (!this.isLoaded) return;
        this.isThinking = false;
        this.isSpeaking = true;
        const talkAnim = this.findAnimation(['talk', 'speak', 'mouth_move']);
        if (talkAnim) {
            this.setAnimation(talkAnim, true);
        }
        const shortResponse = this.truncateText(response, 150);
        this.showBubble(shortResponse, 5000);
        if (this.isVoiceEnabled) {
            const firstSentence = this.extractFirstSentence(response);
            this.speakText(firstSentence);
        }
        setTimeout(() => {
            this.isSpeaking = false;
            if (!this.isThinking) {
                this.setAnimation('idle', true);
                if (Math.random() > 0.5) {
                    const randomEmotion = ['happy', 'thinking'][Math.floor(Math.random() * 2)];
                    this.setEmotion(randomEmotion);
                }
            }
        }, 3000);
    }
    onGenerationStart() {
        if (!this.isLoaded) return;
        this.isThinking = true;
        this.setAnimation('think', true);
        this.showBubble('Генерирую ответ...', 2000);
    }
    onGenerationStop() {
        if (!this.isLoaded) return;
        this.isThinking = false;
        this.isSpeaking = false;
        this.setAnimation('idle', true);
        this.showBubble('Генерация остановлена', 2000);
        this.setEmotion('sad');
    }
    showBubble(text, duration = 3000) {
        this.elements.bubbleText.textContent = text;
        this.elements.speechBubble.classList.add('show');
        clearTimeout(this.bubbleTimer);
        this.bubbleTimer = setTimeout(() => {
            this.elements.speechBubble.classList.remove('show');
        }, duration);
    }
    speakText(text) {
        if (!this.isVoiceEnabled || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ru-RU';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        const voices = speechSynthesis.getVoices();
        const russianVoice = voices.find(v => v.lang.startsWith('ru'));
        if (russianVoice) utterance.voice = russianVoice;
        utterance.onstart = () => {
            console.log('Начало озвучки:', text);
        };
        utterance.onend = () => {
            console.log('Окончание озвучки');
            this.isSpeaking = false;
            if (!this.isThinking) {
                this.setAnimation('idle', true);
            }
        };
        window.speechSynthesis.speak(utterance);
    }
    toggleVoice() {
        this.isVoiceEnabled = !this.isVoiceEnabled;
        this.updateControlButtons();
        if (!this.isVoiceEnabled) {
            window.speechSynthesis.cancel();
        }
        this.app.showNotification(
            this.isVoiceEnabled ? 'Голос включен' : 'Голос выключен',
            'info'
        );
    }
    toggleAnimations() {
        this.isAnimationsEnabled = !this.isAnimationsEnabled;
        this.updateControlButtons();
        if (this.isAnimationsEnabled && this.isLoaded) {
            this.setAnimation(this.currentAnimation, true);
        } else if (!this.isAnimationsEnabled && this.state) {
            this.state.timeScale = 0;
        }
        this.app.showNotification(
            this.isAnimationsEnabled ? 'Анимации включены' : 'Анимации выключены',
            'info'
        );
    }
    hideCharacter() {
        this.isCharacterVisible = false;
        this.elements.characterScene.classList.add('hidden');
        this.elements.showCharacterBtn.classList.add('visible');
        this.app.showNotification('Персонаж скрыт', 'info');
    }
    showCharacter() {
        this.isCharacterVisible = true;
        this.elements.characterScene.classList.remove('hidden');
        this.elements.showCharacterBtn.classList.remove('visible');
        this.app.showNotification('Персонаж показан', 'info');
    }
    showSettings() {
        this.elements.characterSettingsModal.style.display = 'flex';
    }
    hideSettings() {
        this.elements.characterSettingsModal.style.display = 'none';
    }
    showLoadingModal(text = 'Загрузка...') {
        this.elements.loadingText.textContent = text;
        this.elements.modelLoadingModal.style.display = 'flex';
    }
    hideLoadingModal() {
        this.elements.modelLoadingModal.style.display = 'none';
    }
    updateLoadingProgress(percent, details = '') {
        this.elements.loadingProgressBar.style.width = percent + '%';
        this.elements.loadingProgressText.textContent = percent + '%';
        if (details) {
            this.elements.loadingDetails.textContent = details;
        }
    }
    updateStatus(text, type = 'info') {
        this.elements.characterStatus.innerHTML = `
            <i class="fas fa-circle" style="color: ${this.getStatusColor(type)}; font-size: 8px;"></i>
            <span>${text}</span>
        `;
        this.elements.characterStatus.className = `character-status ${type}`;
    }
    updateControlButtons() {
        const voiceIcon = this.elements.charToggleVoice.querySelector('i');
        if (this.isVoiceEnabled) {
            this.elements.charToggleVoice.classList.add('active');
            voiceIcon.className = 'fas fa-volume-up';
        } else {
            this.elements.charToggleVoice.classList.remove('active');
            voiceIcon.className = 'fas fa-volume-mute';
        }
        const animIcon = this.elements.charToggleAnim.querySelector('i');
        if (this.isAnimationsEnabled) {
            this.elements.charToggleAnim.classList.add('active');
            animIcon.className = 'fas fa-play';
        } else {
            this.elements.charToggleAnim.classList.remove('active');
            animIcon.className = 'fas fa-pause';
        }
    }
    updateHighlightColor() {
        document.documentElement.style.setProperty('--accent-color', this.highlightColor);
        this.elements.colorPresets.forEach(preset => {
            preset.classList.remove('active');
            if (preset.dataset.color === this.highlightColor) {
                preset.classList.add('active');
            }
        });
    }
    updateDebugStats() {
        if (!this.skeletonData) return;
        const stats = `
Анимации: ${this.availableAnimations.length}
Кости: ${this.skeletonData.bones.length}
Слоты: ${this.skeletonData.slots.length}
Кожа: ${this.skeletonData.skins.length}
События: ${this.skeletonData.events.length}
IK ограничения: ${this.skeletonData.ikConstraints.length}
Трансформ ограничения: ${this.skeletonData.transformConstraints.length}
Масштаб: ${this.modelScale}x
Скорость: ${this.animationSpeed}x
        `.trim();
        this.elements.debugStats.textContent = stats;
    }
    testAllAnimations() {
        if (!this.availableAnimations || this.availableAnimations.length === 0) {
            this.showBubble('Нет доступных анимаций для теста', 2000);
            return;
        }
        let index = 0;
        const testNextAnimation = () => {
            if (index >= this.availableAnimations.length) {
                this.setAnimation('idle', true);
                this.showBubble('Тест анимаций завершен!', 2000);
                return;
            }
            const animName = this.availableAnimations[index];
            this.setAnimation(animName, false);
            this.showBubble(`Анимация: ${animName}`, 1000);
            index++;
            setTimeout(testNextAnimation, 1500);
        };
        this.showBubble('Начинаю тест всех анимаций...', 1000);
        setTimeout(testNextAnimation, 1500);
    }
    resetSettings() {
        if (confirm('Сбросить все настройки персонажа к значениям по умолчанию?')) {
            localStorage.removeItem('spine_voice_enabled');
            localStorage.removeItem('spine_animations_enabled');
            localStorage.removeItem('spine_visible');
            localStorage.removeItem('spine_character_name');
            localStorage.removeItem('spine_model_scale');
            localStorage.removeItem('spine_animation_speed');
            localStorage.removeItem('spine_renderer_type');
            localStorage.removeItem('spine_auto_idle');
            localStorage.removeItem('spine_highlight_color');
            this.loadSettings();
            this.showBubble('Настройки сброшены!', 2000);
            this.setEmotion('happy');
        }
    }
    toggleDebugBones() {
        this.debugMode = !this.debugMode;
        this.elements.debugBonesBtn.classList.toggle('active', this.debugMode);
        if (this.renderer && this.renderer.skeletonDebugRenderer) {
            this.renderer.skeletonDebugRenderer.drawBones = this.debugMode;
        }
        this.showBubble(this.debugMode ? 'Кости показаны' : 'Кости скрыты', 1500);
    }
    toggleDebugSlots() {
        this.showBubble('Функция в разработке', 1500);
    }
    toggleDebugHitboxes() {
        this.showBubble('Функция в разработке', 1500);
    }
    onCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        if (distance < 100) {
            const reactions = [
                'Привет!',
                'Чем могу помочь?',
                'Я слушаю!',
                'Готов к общению!',
                'Нажмите на поле ввода!'
            ];
            const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
            this.showBubble(randomReaction, 2000);
            this.setEmotion('happy');
        }
    }
    getStatusColor(type) {
        switch (type) {
            case 'success': return '#10b981';
            case 'error': return '#ef4444';
            case 'warning': return '#f59e0b';
            default: return '#3b82f6';
        }
    }
    getEmotionPhrase(emotion) {
        const phrases = {
            'happy': ['Рада общению!', 'Отлично!', 'Здорово!'],
            'sad': ['Грустно...', 'Ой...', 'Печалька'],
            'angry': ['Сержусь!', 'Не нравится!', 'Агрр!'],
            'surprise': ['Ого!', 'Удивительно!', 'Вау!'],
            'thinking': ['Думаю...', 'Хмм...', 'Интересно...'],
            'love': ['Обожаю!', 'Люблю!', 'Ня!']
        };
        const list = phrases[emotion] || ['Привет!'];
        return list[Math.floor(Math.random() * list.length)];
    }
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }
    extractFirstSentence(text) {
        const match = text.match(/[^.!?]+[.!?]+/);
        return match ? match[0] : text.substring(0, 100);
    }
    containsPositiveWords(text) {
        const words = ['отлично', 'хорошо', 'спасибо', 'отличн', 'хорош', 'благодар', 'супер', 'класс'];
        return words.some(word => text.toLowerCase().includes(word));
    }
    containsQuestionWords(text) {
        const words = ['как', 'что', 'где', 'когда', 'почему', 'зачем', '?'];
        return words.some(word => text.toLowerCase().includes(word));
    }
}