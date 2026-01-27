const { useState, useEffect, useRef } = React;

// API Ключ для работы ИИ (Gemini)
const apiKey = ""; 

const Icon = ({ name, size = 24, className = "" }) => {
    // Используем встроенные SVG для надежности на всех устройствах
    const icons = {
        Back: <path d="M19 12H5m7-7-7 7 7 7"/>,
        User: <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>,
        Flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>,
        Water: <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>,
        Steps: <path d="M4 16v-2.3C4 11.5 5.8 10 8 10c1.2 0 2.3.5 3 1.3.7-.8 1.8-1.3 3-1.3 2.2 0 4 1.5 4 3.7V16"/><path d="M4 20h16"/>,
        Camera: <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>,
        Plus: <path d="M12 5v14M5 12h14"/>,
        Settings: <path d="M12.22 2h-.44a2 2 0 0 0-2 2l-.28 1.29a7 7 0 0 1-1.31.54L7 5.11a2 2 0 0 0-2.83 0l-.31.31a2 2 0 0 0 0 2.83l.72.72a7 7 0 0 1-.54 1.31L2.78 10.56a2 2 0 0 0-2 2v.44a2 2 0 0 0 2 2l1.29.28a7 7 0 0 1 .54 1.31l-.72.72a2 2 0 0 0 0 2.83l.31.31a2 2 0 0 0 2.83 0l.72-.72a7 7 0 0 1 1.31.54l.28 1.29a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2l.28-1.29a7 7 0 0 1 1.31-.54l.72.72a2 2 0 0 0 2.83 0l.31-.31a2 2 0 0 0 0-2.83l-.72-.72a7 7 0 0 1 .54-1.31l1.29-.28a2 2 0 0 0 2-2v-.44a2 2 0 0 0-2-2l-1.29-.28a7 7 0 0 1-.54-1.31l.72-.72a2 2 0 0 0 0-2.83l-.31-.31a2 2 0 0 0-2.83 0l-.72.72a7 7 0 0 1-1.31-.54L14.22 4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
    };
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {icons[name] || <circle cx="12" cy="12" r="10"/>}
        </svg>
    );
};

const App = () => {
    const [view, setView] = useState('loading');
    const [user, setUser] = useState(null);
    const [regData, setRegData] = useState({ name: '', weight: '', height: '', goal: 'loss' });
    const [waterModal, setWaterModal] = useState(false);
    const [waterInput, setWaterInput] = useState('250');
    const [stats, setStats] = useState({ calories: 0, water: 0, steps: 8432 });
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const saved = localStorage.getItem('edm_fit_user');
        if (saved) {
            setUser(JSON.parse(saved));
            setView('home');
        } else {
            setView('onboarding');
        }
    }, []);

    const saveProfile = (e) => {
        e.preventDefault();
        localStorage.setItem('edm_fit_user', JSON.stringify(regData));
        setUser(regData);
        setView('home');
    };

    const toggleCamera = async (on) => {
        if (on) {
            setCameraActive(true);
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
                });
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (err) {
                console.error("Camera error:", err);
                alert("Ошибка доступа к камере. Проверьте разрешения.");
                setCameraActive(false);
            }
        } else {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
            setCameraActive(false);
        }
    };

    const capturePhoto = async () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
        
        toggleCamera(false);
        setLoading(true);
        setView('analysis');

        try {
            const prompt = "Identify food. Return ONLY JSON: {name: string, calories: number, protein: number, fat: number, carbs: number, weight_estimate: number}. No extra text.";
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: "image/jpeg", data: base64 } }] }]
                })
            });
            const data = await response.json();
            const text = data.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
            const result = JSON.parse(text);
            setAnalysisResult({ ...result, image: canvas.toDataURL('image/jpeg') });
        } catch (e) {
            setAnalysisResult({ name: "Не удалось распознать", calories: 0, protein: 0, fat: 0, carbs: 0, weight_estimate: 0 });
        } finally {
            setLoading(false);
        }
    };

    const addWater = () => {
        const amount = parseInt(waterInput);
        setStats(prev => ({ ...prev, water: prev.water + amount }));
        setWaterModal(false);
    };

    const addToDiary = () => {
        setStats(prev => ({ ...prev, calories: prev.calories + analysisResult.calories }));
        setHistory([analysisResult, ...history]);
        setView('home');
    };

    if (view === 'onboarding') return (
        <div className="h-screen p-8 flex flex-col items-center justify-center page-enter">
            <div className="liquid-bg"></div>
            <div className="w-20 h-20 bg-blue-600 rounded-[25px] flex items-center justify-center mb-8 shadow-2xl border border-white/20">
                <Icon name="Flame" size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter mb-2">EDM™ FIT</h1>
            <p className="text-slate-400 mb-10 text-sm">ПРЕМИУМ КОНТРОЛЬ ФОРМЫ</p>
            
            <form onSubmit={saveProfile} className="w-full space-y-4">
                <input className="w-full liquid-glass rounded-2xl p-5 outline-none font-bold" placeholder="Имя" onChange={e => setRegData({...regData, name: e.target.value})} required />
                <div className="flex gap-4">
                    <input className="w-1/2 liquid-glass rounded-2xl p-5 outline-none font-bold" type="number" placeholder="Вес (кг)" onChange={e => setRegData({...regData, weight: e.target.value})} required />
                    <input className="w-1/2 liquid-glass rounded-2xl p-5 outline-none font-bold" type="number" placeholder="Рост (см)" onChange={e => setRegData({...regData, height: e.target.value})} required />
                </div>
                <button className="w-full btn-primary py-5 rounded-2xl text-lg shadow-xl active-scale">НАЧАТЬ ПУТЬ</button>
            </form>
        </div>
    );

    return (
        <div className="h-screen flex flex-col page-enter overflow-hidden">
            <div className="liquid-bg"></div>
            
            {/* Header */}
            <header className="px-6 pt-12 pb-4 flex justify-between items-center z-10">
                <div>
                    <h2 className="text-2xl font-black italic tracking-tighter text-blue-500">EDM™ FIT</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Симферополь AI</p>
                </div>
                <button onClick={() => setView('profile')} className="w-12 h-12 liquid-glass rounded-2xl flex items-center justify-center border border-white/10 shadow-lg active-scale">
                    <Icon name="User" size={20} />
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-6 pb-32 hide-scroll">
                {view === 'home' && (
                    <div className="space-y-6">
                        {/* Calorie Card */}
                        <div className="liquid-glass rounded-[40px] p-8 mt-4">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Калории сегодня</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-6xl font-black tracking-tighter">{stats.calories}</h3>
                                <span className="text-slate-600 font-bold italic">/ 2400</span>
                            </div>
                            <div className="w-full progress-bar mt-8">
                                <div className="progress-fill" style={{ width: `${Math.min((stats.calories / 2400) * 100, 100)}%` }}></div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="liquid-glass rounded-[35px] p-6 flex flex-col justify-between h-44 relative overflow-hidden">
                                <Icon name="Water" className="text-blue-400 mb-2" />
                                <div>
                                    <p className="text-2xl font-black italic">{stats.water} мл</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Вода</p>
                                </div>
                                <button onClick={() => setWaterModal(true)} className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center active-scale">
                                    <Icon name="Plus" size={18} />
                                </button>
                            </div>
                            <div className="liquid-glass rounded-[35px] p-6 flex flex-col justify-between h-44 relative">
                                <Icon name="Steps" className="text-emerald-400 mb-2" />
                                <div>
                                    <p className="text-2xl font-black italic">{stats.steps.toLocaleString()}</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Шаги (Mi Band)</p>
                                </div>
                                <Icon name="Settings" size={16} className="absolute top-4 right-4 text-slate-600" />
                            </div>
                        </div>

                        {/* Recent Items */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">История за день</h4>
                            {history.length === 0 ? (
                                <div className="p-8 text-center text-slate-600 italic text-sm">Еды пока не было...</div>
                            ) : history.map((item, i) => (
                                <div key={i} className="liquid-glass p-4 rounded-3xl flex items-center gap-4 page-enter">
                                    <img src={item.image} className="w-14 h-14 rounded-2xl object-cover" />
                                    <div className="flex-1">
                                        <p className="font-black italic text-sm uppercase">{item.name}</p>
                                        <p className="text-[10px] text-slate-500 font-bold">{item.weight_estimate}г • Б:{item.protein} Ж:{item.fat} У:{item.carbs}</p>
                                    </div>
                                    <p className="font-black text-blue-500">+{item.calories}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {view === 'analysis' && (
                    <div className="space-y-6 pt-4">
                        <button onClick={() => setView('home')} className="flex items-center gap-2 text-slate-400 font-bold text-sm mb-2 active-scale">
                            <Icon name="Back" size={16} /> НАЗАД
                        </button>
                        <div className="liquid-glass rounded-[40px] overflow-hidden aspect-square relative">
                            {loading ? (
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="text-blue-500 font-black italic text-sm animate-pulse tracking-widest">EDM AI ANALYZING...</p>
                                </div>
                            ) : (
                                <img src={analysisResult?.image} className="w-full h-full object-cover" />
                            )}
                        </div>
                        {analysisResult && !loading && (
                            <div className="liquid-glass rounded-[40px] p-8 space-y-6 page-enter">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-3xl font-black italic text-blue-500 uppercase leading-none">{analysisResult.name}</h3>
                                        <p className="text-slate-500 font-bold mt-2">Порция ~{analysisResult.weight_estimate}г</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-4xl font-black tracking-tighter">{analysisResult.calories}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Ккал</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {[['Белки', analysisResult.protein], ['Жиры', analysisResult.fat], ['Угл', analysisResult.carbs]].map(([l, v]) => (
                                        <div key={l} className="bg-white/5 p-4 rounded-3xl text-center border border-white/5">
                                            <p className="text-[10px] font-black text-slate-500 uppercase mb-1">{l}</p>
                                            <p className="font-black">{v}г</p>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={addToDiary} className="w-full btn-primary py-6 rounded-3xl active-scale shadow-2xl">ДОБАВИТЬ В ДНЕВНИК</button>
                            </div>
                        )}
                    </div>
                )}

                {view === 'profile' && (
                    <div className="space-y-6 pt-4">
                         <button onClick={() => setView('home')} className="flex items-center gap-2 text-slate-400 font-bold text-sm mb-4 active-scale">
                            <Icon name="Back" size={16} /> НАЗАД
                        </button>
                        <div className="liquid-glass rounded-[40px] p-8 text-center">
                            <div className="w-24 h-24 bg-blue-600 rounded-[35px] mx-auto mb-4 flex items-center justify-center text-4xl font-black italic shadow-2xl">
                                {user?.name[0]}
                            </div>
                            <h3 className="text-3xl font-black italic">{user?.name}</h3>
                            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Премиум аккаунт</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="liquid-glass rounded-[30px] p-6">
                                <p className="text-slate-500 font-bold uppercase text-[10px] mb-2">Вес</p>
                                <p className="text-2xl font-black">{user?.weight} кг</p>
                            </div>
                            <div className="liquid-glass rounded-[30px] p-6">
                                <p className="text-slate-500 font-bold uppercase text-[10px] mb-2">Рост</p>
                                <p className="text-2xl font-black">{user?.height} см</p>
                            </div>
                        </div>
                        <button onClick={() => { localStorage.removeItem('edm_fit_user'); setView('onboarding'); }} className="w-full p-6 liquid-glass rounded-3xl text-red-500 font-black italic active-scale">
                            ВЫЙТИ ИЗ АККАУНТА
                        </button>
                    </div>
                )}
            </main>

            {/* Camera Overlay */}
            {cameraActive && (
                <div className="fixed inset-0 bg-black z-[100] flex flex-col">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex flex-col justify-between p-10 pointer-events-none">
                        <div className="flex justify-between items-center pointer-events-auto">
                            <button onClick={() => toggleCamera(false)} className="w-12 h-12 liquid-glass rounded-2xl flex items-center justify-center">
                                <Icon name="Back" />
                            </button>
                        </div>
                        <div className="flex justify-center pb-10 pointer-events-auto">
                            <button onClick={capturePhoto} className="shutter active-scale"></button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Nav */}
            {view === 'home' && !cameraActive && (
                <nav className="fixed bottom-8 left-8 right-8 h-20 liquid-glass rounded-[35px] flex justify-between items-center px-10 z-50 border border-white/10 shadow-2xl">
                    <button className="text-blue-500"><Icon name="Flame" /></button>
                    <div onClick={() => toggleCamera(true)} className="w-20 h-20 bg-white text-black rounded-[28px] -mt-16 shadow-2xl border-[10px] border-[#020617] flex items-center justify-center active-scale cursor-pointer">
                        <Icon name="Camera" size={32} />
                    </div>
                    <button onClick={() => setView('profile')} className="text-slate-600"><Icon name="User" /></button>
                </nav>
            )}

            {/* Water Modal */}
            {waterModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setWaterModal(false)}></div>
                    <div className="liquid-glass w-full max-w-sm rounded-[45px] p-10 relative page-enter">
                        <h4 className="text-2xl font-black italic mb-6 text-center">СКОЛЬКО ВЫПИЛ?</h4>
                        <div className="flex gap-4 mb-8">
                            {[100, 250, 500].map(val => (
                                <button 
                                    key={val} 
                                    onClick={() => setWaterInput(val.toString())}
                                    className={`flex-1 py-4 rounded-2xl font-black transition-all ${waterInput == val ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'}`}
                                >
                                    {val}мл
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-col gap-3">
                            <button onClick={addWater} className="btn-primary py-5 rounded-2xl active-scale">ПОДТВЕРДИТЬ</button>
                            <button onClick={() => setWaterModal(false)} className="py-4 text-slate-500 font-bold active-scale">ОТМЕНА</button>
                        </div>
                    </div>
                </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
