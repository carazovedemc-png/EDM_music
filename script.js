const { useState, useEffect, useRef } = React;

const apiKey = ""; // Эдем, вставь сюда свой ключ!

const Icon = ({ name, size = 24, className = "" }) => {
    const icons = {
        Back: <path d="M19 12H5m7-7-7 7 7 7"/>,
        User: <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>,
        Flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>,
        Water: <path d="M7 16.3c2.2 0 4-1.8 4-4 0-3.3-4-6-4-6s-4 2.7-4 6c0 2.2 1.8 4 4 4Z"/><path d="M17 14c1.1 0 2-.9 2-2 0-1.6-2-3-2-3s-2 1.4-2 3c0 1.1.9 2 2 2Z"/><path d="M15 20c1.1 0 2-.9 2-2 0-1.6-2-3-2-3s-2 1.4-2 3c0 1.1.9 2 2 2Z"/>,
        Steps: <path d="M4 16v-2.3C4 11.5 5.8 10 8 10c1.2 0 2.3.5 3 1.3.7-.8 1.8-1.3 3-1.3 2.2 0 4 1.5 4 3.7V16"/><path d="M4 20h16"/><path d="M16 4h.01"/><path d="M8 4h.01"/><path d="M12 6h.01"/>,
        Camera: <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>,
        X: <path d="M18 6 6 18M6 6l12 12"/>,
        History: <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>
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
    const [loading, setLoading] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const saved = localStorage.getItem('edm_fit_pro_v1');
        if (saved) { setProfile(JSON.parse(saved)); setView('home'); }
    }, []);

    const startCamera = async () => {
        setView('camera');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (e) { alert("Камера недоступна"); setView('home'); }
    };

    const takePhoto = () => {
        const cvs = canvasRef.current;
        const vid = videoRef.current;
        cvs.width = vid.videoWidth;
        cvs.height = vid.videoHeight;
        cvs.getContext('2d').drawImage(vid, 0, 0);
        const img = cvs.toDataURL('image/png');
        setCapturedImage(img);
        if (vid.srcObject) vid.srcObject.getTracks().forEach(t => t.stop());
        processWithAI(img);
    };

    const processWithAI = async (imgData) => {
        setLoading(true);
        setView('analysis');
        try {
            const prompt = "Analyze food image. Return ONLY JSON: {name, calories, protein, fat, carbs, weight}. No text around.";
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: "image/png", data: imgData.split(',')[1] } }] }]
                })
            });
            const data = await response.json();
            const cleanJson = data.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
            setAnalysis(JSON.parse(cleanJson));
        } catch (e) { setAnalysis({ name: "Ошибка", calories: 0, protein: 0, fat: 0, carbs: 0, weight: 0 }); }
        finally { setLoading(false); }
    };

    if (view === 'onboarding') return (
        <div className="h-screen flex flex-col items-center justify-center p-10 page-transition">
            <div className="liquid-bg"></div>
            <div className="w-24 h-24 bg-blue-600 rounded-[30px] flex items-center justify-center shadow-2xl mb-12 border border-white/20">
                <Icon name="Flame" size={48} className="text-white" />
            </div>
            <h1 className="text-5xl font-black italic tracking-tighter mb-4 text-center">EDM™ FIT</h1>
            <p className="text-slate-400 mb-12 font-medium">Симферополь • Премиум ИИ</p>
            <form onSubmit={(e) => { e.preventDefault(); localStorage.setItem('edm_fit_pro_v1', JSON.stringify(profile)); setView('home'); }} className="w-full max-w-sm space-y-4">
                <input className="w-full glass rounded-3xl p-6 outline-none font-bold" placeholder="Имя" onChange={e => setProfile({...profile, name: e.target.value})} required />
                <input className="w-full glass rounded-3xl p-6 outline-none font-bold" type="number" placeholder="Вес (кг)" onChange={e => setProfile({...profile, weight: e.target.value})} required />
                <button className="w-full bg-white text-black py-6 rounded-3xl font-black text-xl shadow-2xl active:scale-95 transition-all">СОЗДАТЬ АККАУНТ</button>
            </form>
        </div>
    );

    return (
        <div className="h-screen flex flex-col page-transition relative">
            <div className="liquid-bg"></div>
            <header className="p-6 flex justify-between items-center glass sticky top-0 z-50">
                <span className="font-black italic text-2xl tracking-tighter text-blue-500">EDM™ FIT</span>
                <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center border border-white/10 shadow-lg"><Icon name="User" size={20} /></div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 pb-32 hide-scroll">
                {view === 'home' && (
                    <div className="space-y-6">
                        <div className="glass rounded-[45px] p-10 relative overflow-hidden shadow-2xl border border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Всего сегодня</p>
                            <h2 className="text-6xl font-[900] tracking-tighter">
                                {history.reduce((a, b) => a + b.calories, 0)}
                                <span className="text-xl font-normal text-slate-600 ml-3 italic">/ {profile.dailyGoal}</span>
                            </h2>
                            <div className="w-full h-2 bg-white/5 rounded-full mt-10 overflow-hidden">
                                <div className="h-full bg-blue-500 shadow-[0_0_20px_#3b82f6]" style={{ width: `${Math.min((history.reduce((a, b) => a + b.calories, 0) / profile.dailyGoal) * 100, 100)}%` }}></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass rounded-[35px] p-8 h-48 flex flex-col justify-between shadow-xl">
                                <Icon name="Water" className="text-cyan-400" size={32} />
                                <div><p className="text-3xl font-black">1250 мл</p><p className="text-[10px] font-bold text-slate-500 uppercase">Вода</p></div>
                            </div>
                            <div className="glass rounded-[35px] p-8 h-48 flex flex-col justify-between shadow-xl">
                                <Icon name="Steps" className="text-emerald-400" size={32} />
                                <div><p className="text-3xl font-black">6,842</p><p className="text-[10px] font-bold text-slate-500 uppercase">Шаги</p></div>
                            </div>
                        </div>
                        <div className="space-y-4 pt-4">
                           <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Последние приемы</h3>
                           {history.map(item => (
                               <div key={item.id} className="glass p-4 rounded-3xl flex items-center gap-4 animate-slideUp">
                                   <img src={item.img} className="w-16 h-16 rounded-2xl object-cover" />
                                   <div className="flex-1">
                                       <p className="font-black italic uppercase text-sm">{item.name}</p>
                                       <p className="text-xs text-slate-500">{item.weight}г • {item.calories} ккал</p>
                                   </div>
                                   <p className="font-black text-blue-500">+{item.calories}</p>
                               </div>
                           ))}
                        </div>
                    </div>
                )}

                {view === 'analysis' && analysis && (
                    <div className="space-y-6 page-transition">
                        <div className="glass rounded-[40px] aspect-square overflow-hidden relative shadow-inner">
                            <img src={capturedImage} className="w-full h-full object-cover" />
                            {loading && (
                                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="font-black italic ai-pulse">ИИ АНАЛИЗИРУЕТ...</p>
                                </div>
                            )}
                        </div>
                        {!loading && (
                            <div className="glass rounded-[40px] p-8 space-y-6 border border-white/10">
                                <div className="flex justify-between items-start">
                                    <div><h2 className="text-3xl font-black italic uppercase tracking-tighter text-blue-400">{analysis.name}</h2><p className="text-slate-500 font-bold">{analysis.weight} грамм</p></div>
                                    <p className="text-5xl font-black">{analysis.calories} <span className="text-sm font-normal text-slate-500 uppercase">ккал</span></p>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {[['Б', analysis.protein], ['Ж', analysis.fat], ['У', analysis.carbs]].map(([l, v]) => (
                                        <div key={l} className="bg-white/5 p-4 rounded-3xl text-center border border-white/5">
                                            <p className="text-[10px] font-black text-slate-600 mb-1">{l}</p>
                                            <p className="font-black text-xl">{v}г</p>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => { setHistory([{...analysis, id: Date.now(), img: capturedImage}, ...history]); setView('home'); }} className="w-full bg-blue-600 py-6 rounded-3xl font-black text-lg active:scale-95 transition-all shadow-xl">ДОБАВИТЬ В ДНЕВНИК</button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {view === 'camera' && (
                <div className="fixed inset-0 bg-black z-[100] flex flex-col">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none rounded-[60px]"></div>
                    <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center gap-10">
                        <button onClick={() => setView('home')} className="p-5 glass rounded-full"><Icon name="X" /></button>
                        <button onClick={takePhoto} className="w-24 h-24 shutter-btn rounded-full active:scale-90 transition-all border-[8px] border-black/20"></button>
                        <div className="w-14"></div>
                    </div>
                </div>
            )}

            {view === 'home' && (
                <nav className="fixed bottom-10 left-8 right-8 glass rounded-[40px] p-4 flex justify-between items-center px-12 z-40 border border-white/10 shadow-2xl">
                    <Icon name="History" size={28} className="text-slate-600" />
                    <div onClick={startCamera} className="w-20 h-20 bg-white text-black rounded-[30px] flex items-center justify-center -mt-20 shadow-2xl border-[8px] border-[#020617] active:scale-90 transition-all cursor-pointer">
                        <Icon name="Camera" size={36} />
                    </div>
                    <Icon name="User" size={28} className="text-slate-600" />
                </nav>
            )}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
