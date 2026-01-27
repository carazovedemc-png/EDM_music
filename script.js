const { useState, useEffect, useRef } = React;
const { createRoot } = ReactDOM;

// Вставь сюда свой ключ Gemini API
const apiKey = ""; 

// --- КОМПОНЕНТЫ ИКОНОК ---
const Icons = {
    Camera: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>,
    Home: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    User: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    ChevronLeft: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>,
    Plus: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    Droplet: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.74 5.74a8 8 0 1 1-11.48 0l5.74-5.74z"/></svg>,
    Activity: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    Trash: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    Check: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
};

// --- ГЛАВНОЕ ПРИЛОЖЕНИЕ ---
const App = () => {
    // Состояния (State)
    const [view, setView] = useState('loading'); // loading, onboarding, home, camera, analysis, profile
    const [user, setUser] = useState({ name: '', weight: '', height: '', goal: 2500 });
    const [stats, setStats] = useState({ calories: 0, water: 0, steps: 6540 });
    const [history, setHistory] = useState([]);
    const [cameraActive, setCameraActive] = useState(false);
    const [loadingAI, setLoadingAI] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [waterModalOpen, setWaterModalOpen] = useState(false);
    
    // Ссылки на DOM
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // 1. ПРОВЕРКА ПРИ ЗАПУСКЕ
    useEffect(() => {
        const savedUser = localStorage.getItem('edm_user');
        const savedStats = localStorage.getItem('edm_stats');
        const savedHistory = localStorage.getItem('edm_history');

        if (savedUser) {
            setUser(JSON.parse(savedUser));
            if (savedStats) setStats(JSON.parse(savedStats));
            if (savedHistory) setHistory(JSON.parse(savedHistory));
            setView('home');
        } else {
            setView('onboarding');
        }
    }, []);

    // Сохранение данных при изменении
    useEffect(() => {
        if (user.name) localStorage.setItem('edm_user', JSON.stringify(user));
        localStorage.setItem('edm_stats', JSON.stringify(stats));
        localStorage.setItem('edm_history', JSON.stringify(history));
    }, [user, stats, history]);

    // --- ФУНКЦИИ ---

    const handleRegister = (e) => {
        e.preventDefault();
        if (!user.name || !user.weight) return;
        setView('home');
    };

    const startCamera = async () => {
        setView('camera');
        setCameraActive(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
            alert("Ошибка камеры: " + err.message);
            setView('home');
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        }
        setCameraActive(false);
    };

    const takePhoto = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        stopCamera();
        analyzeImage(imageData);
    };

    const analyzeImage = async (base64Image) => {
        setView('analysis');
        setLoadingAI(true);
        setAnalysis(null);

        // Убираем префикс data:image/...
        const cleanBase64 = base64Image.split(',')[1];

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: "Analyze food image. Return JSON ONLY: { \"name\": \"Food Name\", \"calories\": 100, \"protein\": 10, \"fat\": 5, \"carbs\": 20, \"weight\": 100 }" },
                            { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } }
                        ]
                    }]
                })
            });

            const data = await response.json();
            const text = data.candidates[0].content.parts[0].text;
            // Очистка JSON от markdown
            const jsonStr = text.replace(/```json|```/g, '').trim();
            const result = JSON.parse(jsonStr);
            
            setAnalysis({ ...result, image: base64Image });

        } catch (error) {
            console.error(error);
            alert("Ошибка ИИ. Попробуй еще раз.");
            setView('home');
        } finally {
            setLoadingAI(false);
        }
    };

    const saveFood = () => {
        if (!analysis) return;
        setStats(prev => ({ ...prev, calories: prev.calories + analysis.calories }));
        setHistory(prev => [analysis, ...prev]);
        setView('home');
    };

    const addWater = (amount) => {
        setStats(prev => ({ ...prev, water: prev.water + amount }));
        setWaterModalOpen(false);
    };

    // --- РЕНДЕРИНГ ЭКРАНОВ ---

    // 1. ONBOARDING (Регистрация)
    if (view === 'onboarding') {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-8 page-enter relative">
                <div className="liquid-bg"></div>
                <div className="w-24 h-24 glass-panel rounded-full flex items-center justify-center mb-8">
                    <Icons.Activity />
                </div>
                <h1 className="text-4xl font-black italic mb-2 tracking-tighter">EDM™ FIT</h1>
                <p className="text-gray-400 mb-10 text-sm font-bold tracking-widest uppercase">Система контроля</p>
                
                <form onSubmit={handleRegister} className="w-full space-y-4 z-10">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-2">Твое имя</label>
                        <input className="w-full p-4 rounded-2xl outline-none font-bold" 
                               value={user.name} 
                               onChange={e => setUser({...user, name: e.target.value})} 
                               placeholder="Эдем" required />
                    </div>
                    <div className="flex gap-4">
                        <div className="w-1/2 space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-2">Вес (кг)</label>
                            <input type="number" className="w-full p-4 rounded-2xl outline-none font-bold" 
                                   value={user.weight} 
                                   onChange={e => setUser({...user, weight: e.target.value})} 
                                   placeholder="80" required />
                        </div>
                        <div className="w-1/2 space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-2">Рост (см)</label>
                            <input type="number" className="w-full p-4 rounded-2xl outline-none font-bold" 
                                   value={user.height} 
                                   onChange={e => setUser({...user, height: e.target.value})} 
                                   placeholder="180" />
                        </div>
                    </div>
                    <button type="submit" className="w-full btn-primary py-5 rounded-2xl mt-4 text-lg">НАЧАТЬ</button>
                </form>
            </div>
        );
    }

    // 2. CAMERA (Камера)
    if (view === 'camera') {
        return (
            <div className="fixed inset-0 bg-black z-50 flex flex-col">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                <div className="absolute top-0 left-0 right-0 p-6 pt-12 flex justify-between z-10">
                    <button onClick={() => { stopCamera(); setView('home'); }} className="w-12 h-12 glass-panel rounded-full flex items-center justify-center text-white">
                        <Icons.ChevronLeft />
                    </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-10 pb-16 flex justify-center">
                    <button onClick={takePhoto} className="w-20 h-20 rounded-full border-4 border-white bg-white/20 backdrop-blur-md active:scale-90 transition-all"></button>
                </div>
                <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
        );
    }

    // 3. ANALYSIS (Результат ИИ)
    if (view === 'analysis') {
        return (
            <div className="h-screen flex flex-col p-6 page-enter relative overflow-y-auto">
                <div className="liquid-bg"></div>
                
                {/* Header с кнопкой назад */}
                <div className="flex items-center mb-6 pt-4">
                    <button onClick={() => setView('home')} className="w-10 h-10 glass-panel rounded-xl flex items-center justify-center mr-4">
                        <Icons.ChevronLeft />
                    </button>
                    <h2 className="text-xl font-black italic">АНАЛИЗ ЕДЫ</h2>
                </div>

                {loadingAI ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 border-4 border-t-white border-white/10 rounded-full animate-spin"></div>
                        <p className="font-bold tracking-widest animate-pulse">ИИ ДУМАЕТ...</p>
                    </div>
                ) : analysis ? (
                    <div className="space-y-6 pb-20">
                        <div className="w-full aspect-square rounded-[3rem] overflow-hidden glass-panel relative p-2">
                            <img src={analysis.image} className="w-full h-full object-cover rounded-[2.5rem]" />
                        </div>
                        
                        <div className="glass-panel p-8 rounded-[2.5rem]">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-3xl font-black uppercase leading-none mb-2">{analysis.name}</h2>
                                    <p className="text-gray-400 font-bold text-sm">Вес: {analysis.weight}г</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-black">{analysis.calories}</div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase">ККАЛ</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-8">
                                <div className="bg-white/5 rounded-2xl p-3 text-center">
                                    <div className="text-[10px] text-gray-500 font-black mb-1">БЕЛКИ</div>
                                    <div className="font-bold text-lg">{analysis.protein}г</div>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-3 text-center">
                                    <div className="text-[10px] text-gray-500 font-black mb-1">ЖИРЫ</div>
                                    <div className="font-bold text-lg">{analysis.fat}г</div>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-3 text-center">
                                    <div className="text-[10px] text-gray-500 font-black mb-1">УГЛЕВ</div>
                                    <div className="font-bold text-lg">{analysis.carbs}г</div>
                                </div>
                            </div>

                            <button onClick={saveFood} className="w-full btn-primary py-5 rounded-2xl text-lg flex items-center justify-center gap-2">
                                <Icons.Check /> ДОБАВИТЬ
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        );
    }

    // 4. PROFILE (Профиль)
    if (view === 'profile') {
        return (
            <div className="h-screen flex flex-col p-6 page-enter relative">
                <div className="liquid-bg"></div>
                <div className="flex items-center mb-8 pt-4">
                    <button onClick={() => setView('home')} className="w-10 h-10 glass-panel rounded-xl flex items-center justify-center mr-4">
                        <Icons.ChevronLeft />
                    </button>
                    <h2 className="text-xl font-black italic">ПРОФИЛЬ</h2>
                </div>

                <div className="glass-panel p-8 rounded-[30px] text-center mb-6">
                    <div className="w-24 h-24 bg-white text-black rounded-full mx-auto flex items-center justify-center text-4xl font-black mb-4 shadow-xl">
                        {user.name[0]}
                    </div>
                    <h2 className="text-3xl font-black">{user.name}</h2>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">Simferopol Member</p>
                </div>

                <div className="space-y-4">
                    <div className="glass-panel p-6 rounded-3xl flex justify-between items-center">
                        <span className="text-gray-400 font-bold uppercase text-xs">Вес</span>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setUser({...user, weight: Number(user.weight)-1})} className="w-8 h-8 bg-white/10 rounded-full">-</button>
                            <span className="text-2xl font-black">{user.weight}</span>
                            <button onClick={() => setUser({...user, weight: Number(user.weight)+1})} className="w-8 h-8 bg-white/10 rounded-full">+</button>
                        </div>
                    </div>
                    <div className="glass-panel p-6 rounded-3xl flex justify-between items-center">
                        <span className="text-gray-400 font-bold uppercase text-xs">Рост</span>
                        <span className="text-2xl font-black">{user.height} <span className="text-sm font-normal text-gray-500">см</span></span>
                    </div>
                    <div className="glass-panel p-6 rounded-3xl flex justify-between items-center">
                        <span className="text-gray-400 font-bold uppercase text-xs">Цель</span>
                        <span className="text-2xl font-black">{user.goal} <span className="text-sm font-normal text-gray-500">ккал</span></span>
                    </div>
                </div>

                <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="mt-auto w-full py-6 text-red-500 font-black text-sm uppercase tracking-widest bg-white/5 rounded-2xl mb-4">
                    Сбросить данные
                </button>
            </div>
        );
    }

    // 5. HOME (Главная)
    return (
        <div className="h-screen flex flex-col relative overflow-hidden page-enter">
            <div className="liquid-bg"></div>
            
            {/* Header */}
            <div className="px-6 pt-10 pb-4 flex justify-between items-end z-10">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter">EDM™ FIT</h1>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{new Date().toLocaleDateString('ru-RU')}</p>
                </div>
                <button onClick={() => setView('profile')} className="w-12 h-12 glass-panel rounded-2xl flex items-center justify-center active:scale-95 transition-transform">
                    <Icons.User />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar space-y-5">
                
                {/* Main Stats */}
                <div className="glass-panel rounded-[3rem] p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                        <div className="h-full bg-white shadow-[0_0_15px_white]" style={{width: `${(stats.calories / user.goal) * 100}%`}}></div>
                    </div>
                    <div className="flex justify-between items-end mb-2">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Калории</div>
                        <div className="text-xs font-bold text-gray-500">{Math.round((stats.calories / user.goal) * 100)}%</div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-7xl font-black tracking-tighter">{stats.calories}</h2>
                        <span className="text-gray-600 font-bold text-lg">/ {user.goal}</span>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Water */}
                    <div className="glass-panel rounded-[2.5rem] p-6 h-48 flex flex-col justify-between relative" onClick={() => setWaterModalOpen(true)}>
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                            <Icons.Droplet />
                        </div>
                        <div>
                            <div className="text-3xl font-black">{stats.water}</div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase mt-1">Миллилитров</div>
                        </div>
                        <button className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"><Icons.Plus /></button>
                    </div>

                    {/* Steps */}
                    <div className="glass-panel rounded-[2.5rem] p-6 h-48 flex flex-col justify-between">
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
                            <Icons.Activity />
                        </div>
                        <div>
                            <div className="text-3xl font-black">{stats.steps}</div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase mt-1">Шаги (Mi Sync)</div>
                        </div>
                    </div>
                </div>

                {/* History List */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 ml-2">История питания</h3>
                    <div className="space-y-3">
                        {history.length === 0 ? (
                            <div className="glass-panel p-6 rounded-3xl text-center text-gray-500 text-sm font-bold">
                                Список пуст. Нажми на камеру!
                            </div>
                        ) : history.map((item, idx) => (
                            <div key={idx} className="glass-panel p-4 rounded-[20px] flex items-center gap-4">
                                <img src={item.image} className="w-12 h-12 rounded-xl object-cover bg-white/10" />
                                <div className="flex-1">
                                    <div className="font-bold text-sm uppercase">{item.name}</div>
                                    <div className="text-xs text-gray-500">{item.weight}г</div>
                                </div>
                                <div className="font-black">+{item.calories}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-8 left-8 right-8 glass-panel h-20 rounded-[2.5rem] flex items-center justify-around z-40">
                <button className="opacity-50 hover:opacity-100 transition-opacity"><Icons.Home /></button>
                <button onClick={startCamera} className="w-20 h-20 bg-white text-black rounded-[2rem] flex items-center justify-center -mt-12 shadow-[0_10px_30px_rgba(255,255,255,0.3)] border-[8px] border-black transition-transform active:scale-95">
                    <Icons.Camera />
                </button>
                <button onClick={() => setView('profile')} className="opacity-50 hover:opacity-100 transition-opacity"><Icons.User /></button>
            </div>

            {/* Water Modal */}
            {waterModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/80 backdrop-blur-md page-enter">
                    <div className="glass-panel w-full max-w-sm rounded-[3rem] p-8 text-center border border-white/20">
                        <h3 className="text-2xl font-black italic mb-8">ДОБАВИТЬ ВОДУ</h3>
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            {[100, 250, 500].map(amount => (
                                <button key={amount} onClick={() => addWater(amount)} className="py-4 bg-white/5 hover:bg-white text-white hover:text-black rounded-2xl font-black transition-all">
                                    {amount}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setWaterModalOpen(false)} className="py-4 w-full text-gray-500 font-bold text-sm uppercase">Закрыть</button>
                    </div>
                </div>
            )}
            
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

// Запуск
const root = createRoot(document.getElementById('root'));
root.render(<App />);