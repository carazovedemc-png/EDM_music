const { useState, useEffect, useRef } = React;

// --- КОНФИГУРАЦИЯ ---
const apiKey = ""; // Эдем, вставь свой ключ Gemini сюда!

// Компонент иконок на базе SVG путей для максимальной стабильности
const Icon = ({ name, size = 24, className = "" }) => {
    const icons = {
        Back: <path d="M19 12H5m7-7-7 7 7 7"/>,
        User: <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>,
        Flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>,
        Water: <path d="M7 16.3c2.2 0 4-1.8 4-4 0-3.3-4-6-4-6s-4 2.7-4 6c0 2.2 1.8 4 4 4Z"/><path d="M17 14c1.1 0 2-.9 2-2 0-1.6-2-3-2-3s-2 1.4-2 3c0 1.1.9 2 2 2Z"/><path d="M15 20c1.1 0 2-.9 2-2 0-1.6-2-3-2-3s-2 1.4-2 3c0 1.1.9 2 2 2Z"/>,
        Steps: <path d="M4 16v-2.3C4 11.5 5.8 10 8 10c1.2 0 2.3.5 3 1.3.7-.8 1.8-1.3 3-1.3 2.2 0 4 1.5 4 3.7V16"/><path d="M4 20h16"/><path d="M16 4h.01"/><path d="M8 4h.01"/><path d="M12 6h.01"/>,
        Camera: <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>,
        History: <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>,
        X: <path d="M18 6 6 18M6 6l12 12"/>,
        Plus: <path d="M12 5v14M5 12h14"/>,
        Chart: <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
    };
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {icons[name] || icons['X']}
        </svg>
    );
};

const App = () => {
    const [view, setView] = useState('onboarding');
    const [profile, setProfile] = useState({ name: '', weight: '', dailyGoal: 2400 });
    const [history, setHistory] = useState([]);
    const [water, setWater] = useState(0);
    const [loading, setLoading] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [showWaterModal, setShowWaterModal] = useState(false);
    const [waterInput, setWaterInput] = useState('');

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Инициализация при загрузке
    useEffect(() => {
        const saved = localStorage.getItem('edm_fit_v2_user');
        if (saved) {
            setProfile(JSON.parse(saved));
            setView('home');
        }
    }, []);

    const handleStart = (e) => {
        e.preventDefault();
        localStorage.setItem('edm_fit_v2_user', JSON.stringify(profile));
        setView('home');
    };

    const startCamera = async () => {
        setView('camera');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' }, 
                audio: false 
            });
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (e) {
            alert("Камера недоступна. Проверьте разрешения в браузере.");
            setView('home');
        }
    };

    const takePhoto = () => {
        const cvs = canvasRef.current;
        const vid = videoRef.current;
        cvs.width = vid.videoWidth;
        cvs.height = vid.videoHeight;
        cvs.getContext('2d').drawImage(vid, 0, 0);
        const img = cvs.toDataURL('image/png');
        setCapturedImage(img);
        
        // Останавливаем стрим камеры
        if (vid.srcObject) vid.srcObject.getTracks().forEach(t => t.stop());
        
        processImage(img);
    };

    const processImage = async (imgData) => {
        setLoading(true);
        setView('analysis');
        try {
            const prompt = "Analyze the food in this image. Return ONLY a valid JSON object with these keys: name, calories, protein, fat, carbs, weight. Do not add markdown.";
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: "image/png", data: imgData.split(',')[1] } }] }]
                })
            });
            const data = await response.json();
            const textResult = data.candidates[0].content.parts[0].text;
            const cleanJson = textResult.replace(/```json|```/g, '').trim();
            setAnalysis(JSON.parse(cleanJson));
        } catch (e) {
            console.error(e);
            setAnalysis({ name: "Ошибка распознавания", calories: 0, protein: 0, fat: 0, carbs: 0, weight: 0 });
        } finally {
            setLoading(false);
        }
    };

    // --- РЕНДЕРИНГ ЭКРАНОВ ---

    if (view === 'onboarding') return (
        <div className="h-screen flex flex-col items-center justify-center p-8 page-transition">
            <div className="liquid-bg"></div>
            <div className="w-24 h-24 bg-blue-600 rounded-[30px] flex items-center justify-center shadow-2xl shadow-blue-500/40 mb-10">
                <Icon name="Flame" size={48} className="text-white" />
            </div>
            <h1 className="text-4xl font-[900] italic tracking-tighter mb-2">EDM™ FIT</h1>
            <p className="text-slate-400 font-medium mb-10 text-center">Ваш персональный ИИ для контроля питания</p>
            <form onSubmit={handleStart} className="w-full space-y-4">
                <div className="glass rounded-2xl p-4">
                    <input className="w-full bg-transparent outline-none font-bold" placeholder="Имя" onChange={e => setProfile({...profile, name: e.target.value})} required />
                </div>
                <div className="glass rounded-2xl p-4">
                    <input className="w-full bg-transparent outline-none font-bold" type="number" placeholder="Вес (кг)" onChange={e => setProfile({...profile, weight: e.target.value})} required />
                </div>
                <button className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg active:scale-95 transition-all">СОЗДАТЬ ПРОФИЛЬ</button>
            </form>
        </div>
    );

    return (
        <div className="h-screen flex flex-col page-transition relative">
            <div className="liquid-bg"></div>
            
            {/* Header */}
            <header className="p-6 flex justify-between items-center glass sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    {view !== 'home' && (
                        <button onClick={() => setView('home')} className="active:scale-90 transition-all">
                            <Icon name="Back" size={28} />
                        </button>
                    )}
                    <span className="font-[900] italic text-2xl tracking-tighter">EDM™ FIT</span>
                </div>
                <button onClick={() => setView('profile')} className="w-10 h-10 glass rounded-full flex items-center justify-center active:scale-90 transition-all">
                    <Icon name="User" size={20} />
                </button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-6 pb-32 hide-scroll">
                {view === 'home' && (
                    <div className="space-y-6">
                        {/* Calories Progress */}
                        <div className="glass rounded-[40px] p-8 relative overflow-hidden">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Всего за день</p>
                                    <h2 className="text-5xl font-[900] mt-2 tracking-tighter">
                                        {history.reduce((acc, curr) => acc + curr.calories, 0)}
                                        <span className="text-lg font-normal text-slate-600 ml-2">/ {profile.dailyGoal}</span>
                                    </h2>
                                </div>
                                <div className="text-blue-500 bg-blue-500/10 p-4 rounded-3xl"><Icon name="Flame" size={32} /></div>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full mt-8 overflow-hidden">
                                <div className="h-full bg-blue-500 shadow-[0_0_15px_#3b82f6]" 
                                     style={{ width: `${Math.min((history.reduce((a, b) => a + b.calories, 0) / profile.dailyGoal) * 100, 100)}%` }}></div>
                            </div>
                        </div>

                        {/* Two Columns Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass rounded-[32px] p-6 h-44 flex flex-col justify-between relative">
                                <div className="flex justify-between items-center">
                                    <Icon name="Water" className="text-cyan-400" />
                                    <button onClick={() => setShowWaterModal(true)} className="w-8 h-8 glass rounded-xl flex items-center justify-center">+</button>
                                </div>
                                <div>
                                    <p className="text-3xl font-black">{water} мл</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Вода</p>
                                </div>
                            </div>
                            <div className="glass rounded-[32px] p-6 h-44 flex flex-col justify-between">
                                <Icon name="Steps" className="text-emerald-400" />
                                <div>
                                    <p className="text-3xl font-black">4,812</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Шаги (Apple Health)</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Entries */}
                        <div className="pt-4 space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Сегодняшние приемы</h3>
                            {history.length === 0 ? (
                                <div className="text-center py-10 opacity-20 italic">Нет записей</div>
                            ) : (
                                history.map(item => (
                                    <div key={item.id} className="glass p-4 rounded-3xl flex items-center gap-4">
                                        <img src={item.img} className="w-14 h-14 rounded-2xl object-cover" />
                                        <div className="flex-1">
                                            <p className="font-bold">{item.name}</p>
                                            <p className="text-xs text-slate-500">{item.weight}г • {item.calories} ккал</p>
                                        </div>
                                        <p className="font-black text-blue-400">+{item.calories}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {view === 'analysis' && (
                    <div className="space-y-6">
                        <div className="glass rounded-[40px] aspect-square overflow-hidden relative shadow-2xl">
                            <img src={capturedImage} className="w-full h-full object-cover" />
                            {loading && (
                                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="font-black italic tracking-widest text-sm ai-pulse uppercase">Анализ ИИ...</p>
                                </div>
                            )}
                        </div>
                        {analysis && (
                            <div className="glass rounded-[40px] p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-3xl font-black italic uppercase tracking-tighter">{analysis.name}</h2>
                                        <p className="text-slate-500 font-bold">{analysis.weight} грамм</p>
                                    </div>
                                    <p className="text-4xl font-black text-blue-500">{analysis.calories}</p>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {[['Б', analysis.protein], ['Ж', analysis.fat], ['У', analysis.carbs]].map(([l, v]) => (
                                        <div key={l} className="bg-white/5 p-4 rounded-3xl text-center">
                                            <p className="text-[10px] font-black text-slate-500 mb-1">{l}</p>
                                            <p className="font-black text-xl">{v}г</p>
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => { setHistory([{...analysis, id: Date.now(), img: capturedImage}, ...history]); setView('home'); }}
                                    className="w-full bg-white text-black py-5 rounded-3xl font-black shadow-xl active:scale-95 transition-all"
                                >
                                    ДОБАВИТЬ В ДНЕВНИК
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {view === 'profile' && (
                    <div className="space-y-8 p-4">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 glass rounded-full flex items-center justify-center border-4 border-blue-600/20 shadow-2xl">
                                <Icon name="User" size={40} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter">{profile.name}</h2>
                                <p className="text-slate-500 font-bold">Текущий вес: {profile.weight} кг</p>
                            </div>
                        </div>
                        <div className="glass rounded-[32px] p-6 space-y-4">
                            <div className="flex justify-between font-bold"><span>Дневная норма</span><span className="text-blue-500">{profile.dailyGoal} ккал</span></div>
                            <div className="flex justify-between font-bold"><span>Устройство</span><span className="text-emerald-500">Mi Band 8 Connect</span></div>
                        </div>
                        <button onClick={() => { localStorage.clear(); window.location.reload(); }} 
                                className="w-full py-4 text-red-500 font-bold text-xs bg-red-500/10 rounded-2xl uppercase tracking-widest mt-10">
                            Очистить все данные
                        </button>
                    </div>
                )}
            </main>

            {/* Camera View Overlay */}
            {view === 'camera' && (
                <div className="fixed inset-0 bg-black z-[60] flex flex-col">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none rounded-[60px]">
                        <div className="w-full h-full border-2 border-white/20 rounded-2xl relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-blue-500/30 rounded-3xl"></div>
                        </div>
                    </div>
                    <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center gap-10">
                        <button onClick={() => setView('home')} className="p-4 glass rounded-full"><Icon name="X" /></button>
                        <button onClick={takePhoto} className="w-20 h-20 shutter-btn rounded-full active:scale-90 transition-all"></button>
                        <div className="w-12"></div>
                    </div>
                </div>
            )}

            {/* Bottom Navigation */}
            {view === 'home' && (
                <nav className="fixed bottom-8 left-8 right-8 glass rounded-[35px] p-3 flex justify-between items-center px-8 z-40">
                    <button className="text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"><Icon name="Chart" size={28} /></button>
                    <button onClick={startCamera} className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center -mt-14 shadow-2xl border-[6px] border-[#020617] active:scale-90 transition-all">
                        <Icon name="Camera" size={30} />
                    </button>
                    <button className="text-slate-500 opacity-50"><Icon name="History" size={28} /></button>
                </nav>
            )}

            {/* Water Entry Modal */}
            {showWaterModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-8 page-transition">
                    <div className="glass w-full rounded-[40px] p-8">
                        <h3 className="text-2xl font-black italic mb-8">Добавить воду</h3>
                        <div className="flex justify-center items-baseline gap-2 mb-10">
                            <input type="number" 
                                   className="bg-transparent text-6xl font-black w-32 text-center outline-none border-b-2 border-blue-500" 
                                   placeholder="250" 
                                   autoFocus 
                                   onChange={e => setWaterInput(e.target.value)} />
                            <span className="text-xl font-bold text-slate-500 uppercase">МЛ</span>
                        </div>
                        <button onClick={() => { setWater(water + (parseInt(waterInput) || 250)); setShowWaterModal(false); }} 
                                className="w-full bg-blue-600 py-5 rounded-3xl font-black shadow-lg shadow-blue-500/30 active:scale-95 transition-all">ДОБАВИТЬ</button>
                        <button onClick={() => setShowWaterModal(false)} className="w-full mt-4 py-2 text-slate-500 font-bold">ОТМЕНА</button>
                    </div>
                </div>
            )}
            
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
