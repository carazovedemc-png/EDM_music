import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Plus, History, PieChart, Utensils, X, Check, Loader2, 
  ChevronLeft, Settings, Flame, Droplets, Footprints, User, 
  Scale, Ruler, Target, Dumbbell, Bluetooth, Save
} from 'lucide-react';

// Конфигурация API
const apiKey = "";
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";

const App = () => {
  // State: Auth & Profile
  const [user, setUser] = useState(null); // Если null - показываем регистрацию
  const [profile, setProfile] = useState({
    name: '',
    weight: '',
    height: '',
    goal: 'weight_loss', // weight_loss, muscle_gain, maintenance
    dailyGoal: 2500,
    waterGoal: 2000,
    strength: { benchPress: 0, deadlift: 0, squat: 0 }
  });

  // State: App Logic
  const [view, setView] = useState('home'); // home, camera, results, history, profile, onboarding, water_modal
  const [history, setHistory] = useState([]);
  const [waterIntake, setWaterIntake] = useState(0);
  const [steps, setSteps] = useState(0);
  const [loading, setLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [waterInput, setWaterInput] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Стили "Жидкого стекла"
  const glassStyle = "bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl";
  const cardStyle = "bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px]";

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
    // Проверка сохраненного профиля
    const saved = localStorage.getItem('edm_fit_profile');
    if (saved) {
      setProfile(JSON.parse(saved));
      setUser(true);
    } else {
      setView('onboarding');
    }
  }, []);

  const saveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem('edm_fit_profile', JSON.stringify(profile));
    setUser(true);
    setView('home');
  };

  const handleWaterAdd = () => {
    const val = parseInt(waterInput);
    if (val > 0) {
      setWaterIntake(prev => prev + val);
      setWaterInput('');
      setView('home');
    }
  };

  const startCamera = async () => {
    setView('camera');
    setError(null);
    try {
      const constraints = { 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: false 
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", true); // Важно для iOS
        videoRef.current.play();
      }
    } catch (err) {
      console.error(err);
      setError("Камера недоступна. Убедитесь, что дали разрешение в настройках Telegram.");
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedImage(dataUrl);
      
      const stream = video.srcObject;
      if (stream) stream.getTracks().forEach(track => track.stop());
      
      handleProcessImage(dataUrl);
    }
  };

  const handleProcessImage = async (image) => {
    setLoading(true);
    setView('results');
    try {
      const prompt = "Analyze food image. JSON only: {name, calories, protein, fat, carbs, weight}";
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: "image/png", data: image.split(',')[1] } }] }]
        })
      });
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      setAnalysisResult(JSON.parse(text.replace(/```json|```/g, '')));
    } catch (err) {
      setError("ИИ не смог распознать фото. Попробуйте еще раз.");
    } finally {
      setLoading(false);
    }
  };

  // Компоненты экранов
  if (view === 'onboarding') {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white p-8 flex flex-col justify-center">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter mb-2 italic">EDM™ FIT</h1>
          <p className="text-slate-400">Добро пожаловать. Настроим твой профиль.</p>
        </div>
        <form onSubmit={saveProfile} className="space-y-4">
          <div className={`${cardStyle} p-4 flex items-center gap-3`}>
            <User className="text-blue-400" size={20} />
            <input 
              className="bg-transparent border-none outline-none w-full" 
              placeholder="Твоё имя" 
              required
              value={profile.name}
              onChange={e => setProfile({...profile, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className={`${cardStyle} p-4 flex items-center gap-3`}>
              <Scale className="text-orange-400" size={20} />
              <input 
                type="number" className="bg-transparent border-none outline-none w-full" 
                placeholder="Вес (кг)" required
                value={profile.weight}
                onChange={e => setProfile({...profile, weight: e.target.value})}
              />
            </div>
            <div className={`${cardStyle} p-4 flex items-center gap-3`}>
              <Ruler className="text-green-400" size={20} />
              <input 
                type="number" className="bg-transparent border-none outline-none w-full" 
                placeholder="Рост (см)" required
                value={profile.height}
                onChange={e => setProfile({...profile, height: e.target.value})}
              />
            </div>
          </div>
          <div className={`${cardStyle} p-4`}>
            <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Твоя цель</label>
            <select 
              className="bg-transparent w-full outline-none font-bold"
              value={profile.goal}
              onChange={e => setProfile({...profile, goal: e.target.value})}
            >
              <option value="weight_loss" className="bg-[#0f172a]">Похудение</option>
              <option value="maintenance" className="bg-[#0f172a]">Поддержание</option>
              <option value="muscle_gain" className="bg-[#0f172a]">Набор массы</option>
            </select>
          </div>
          <button type="submit" className="w-full py-5 bg-white text-black rounded-[24px] font-black text-lg shadow-2xl active:scale-95 transition-all">
            НАЧАТЬ ПУТЬ
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_rgba(30,58,138,0.3)_0%,_transparent_50%)]"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 px-6 py-5 flex justify-between items-center bg-black/20 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          {view !== 'home' && (
            <button onClick={() => setView('home')} className="p-2 rounded-xl bg-white/5 border border-white/10">
              <ChevronLeft size={20} />
            </button>
          )}
          <span className="text-xl font-black italic tracking-tighter">EDM™ FIT</span>
        </div>
        <button onClick={() => setView('profile')} className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-500 flex items-center justify-center border-2 border-white/20">
          <User size={20} />
        </button>
      </header>

      <main className="px-6 py-6 pb-32">
        {view === 'home' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Calories Card */}
            <div className={`${glassStyle} rounded-[40px] p-8 relative overflow-hidden`}>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Калории</h3>
                  <div className="text-5xl font-black mt-1">
                    {history.reduce((s, i) => s + i.calories, 0)}
                    <span className="text-lg text-slate-500 font-normal ml-2">/ {profile.dailyGoal}</span>
                  </div>
                </div>
                <div className="bg-orange-500/20 p-3 rounded-2xl">
                  <Flame size={28} className="text-orange-500" />
                </div>
              </div>
              <div className="mt-8 h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-700"
                  style={{ width: `${Math.min((history.reduce((s, i) => s + i.calories, 0)/profile.dailyGoal)*100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`${cardStyle} p-6 flex flex-col justify-between h-40 relative overflow-hidden group`}>
                <div className="flex justify-between items-center">
                  <div className="p-2 bg-blue-500/20 rounded-xl"><Droplets size={20} className="text-blue-400" /></div>
                  <button onClick={() => setView('water_modal')} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                    <Plus size={16} />
                  </button>
                </div>
                <div>
                  <div className="text-2xl font-black">{waterIntake} <span className="text-xs text-slate-500">мл</span></div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Вода сегодня</div>
                </div>
              </div>

              <div className={`${cardStyle} p-6 flex flex-col justify-between h-40`}>
                <div className="flex justify-between items-center">
                  <div className="p-2 bg-green-500/20 rounded-xl"><Footprints size={20} className="text-green-400" /></div>
                  <div className="text-[10px] text-green-400 font-bold">LIVE</div>
                </div>
                <div>
                  <div className="text-2xl font-black">{steps}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Шаги (Mi Band)</div>
                </div>
              </div>
            </div>

            {/* Recent Food */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-black text-lg">ПИТАНИЕ</h4>
                <button onClick={() => setView('history')} className="text-xs font-bold text-blue-400">ВЕСЬ СПИСОК</button>
              </div>
              {history.length === 0 ? (
                <div className="p-10 border-2 border-dashed border-white/5 rounded-[32px] text-center opacity-30">
                  <Utensils className="mx-auto mb-2" />
                  <p className="text-sm">Пока пусто</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.slice(0, 3).map(item => (
                    <div key={item.id} className={`${cardStyle} p-4 flex items-center gap-4`}>
                      <img src={item.image} className="w-12 h-12 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate">{item.name}</div>
                        <div className="text-[10px] text-slate-500 uppercase">{item.weight}г • {item.date}</div>
                      </div>
                      <div className="font-black text-blue-400">{item.calories}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {view === 'water_modal' && (
          <div className="fixed inset-0 z-50 bg-[#020617]/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
            <div className={`${glassStyle} w-full rounded-[40px] p-8 max-w-sm`}>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black italic">ДОБАВИТЬ ВОДУ</h3>
                <button onClick={() => setView('home')} className="p-2"><X /></button>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-4">
                  <input 
                    type="number" 
                    value={waterInput}
                    onChange={e => setWaterInput(e.target.value)}
                    className="bg-transparent text-6xl font-black w-32 text-center outline-none border-b-2 border-blue-500/50"
                    placeholder="250"
                    autoFocus
                  />
                  <span className="text-2xl font-bold text-slate-500">мл</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[250, 500, 1000].map(v => (
                    <button key={v} onClick={() => setWaterInput(v.toString())} className="py-3 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10">
                      +{v}
                    </button>
                  ))}
                </div>
                <button onClick={handleWaterAdd} className="w-full py-5 bg-blue-600 rounded-[24px] font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                  СОХРАНИТЬ
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'profile' && (
          <div className="animate-in slide-in-from-right duration-300 space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-purple-500 border-4 border-white/10 flex items-center justify-center">
                <User size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase italic">{profile.name}</h2>
                <p className="text-slate-500">Вес: {profile.weight} кг • Рост: {profile.height} см</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className={`${cardStyle} p-4 text-left group`}>
                <Target size={20} className="text-red-400 mb-2" />
                <div className="text-xs font-bold text-slate-500 uppercase">Цель</div>
                <div className="font-black">2500 ккал</div>
              </button>
              <button onClick={() => setView('connections')} className={`${cardStyle} p-4 text-left`}>
                <Bluetooth size={20} className="text-blue-400 mb-2" />
                <div className="text-xs font-bold text-slate-500 uppercase">Часы</div>
                <div className="font-black text-xs">Подключить Mi Band</div>
              </button>
            </div>

            <div className={`${glassStyle} rounded-[32px] p-6`}>
              <h3 className="text-sm font-black mb-4 flex items-center gap-2"><Dumbbell size={16} /> СИЛОВЫЕ ПОКАЗАТЕЛИ</h3>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Жим лежа</span>
                  <span className="font-black">{profile.strength.benchPress} кг</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Становая тяга</span>
                  <span className="font-black">{profile.strength.deadlift} кг</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Присед</span>
                  <span className="font-black">{profile.strength.squat} кг</span>
                </div>
              </div>
              <button className="w-full mt-4 py-3 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest">Изменить данные</button>
            </div>

            <button 
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              className="w-full py-4 text-red-500 font-bold text-sm bg-red-500/10 rounded-[24px]"
            >
              ВЫЙТИ ИЗ АККАУНТА
            </button>
          </div>
        )}

        {view === 'connections' && (
          <div className="animate-in fade-in duration-300 space-y-6">
            <h2 className="text-2xl font-black italic">ПОДКЛЮЧЕНИЯ</h2>
            <div className="space-y-4">
              {['Mi Band 7/8', 'Apple Watch', 'Samsung Gear', 'Huawei Band'].map(brand => (
                <div key={brand} className={`${cardStyle} p-6 flex justify-between items-center`}>
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center"><Bluetooth size={20}/></div>
                     <span className="font-bold">{brand}</span>
                   </div>
                   <button className="px-4 py-2 bg-blue-600 rounded-full text-[10px] font-black uppercase">Поиск</button>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 text-center">Для интеграции требуется разрешение на доступ к Bluetooth в браузере или приложении Telegram.</p>
          </div>
        )}

        {view === 'camera' && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="p-6 flex justify-between items-center relative z-10">
              <button onClick={() => setView('home')} className="p-3 rounded-full bg-white/10 backdrop-blur-md">
                <ChevronLeft size={24} />
              </button>
              <span className="font-black text-sm tracking-widest uppercase italic">AI SCANNER</span>
              <div className="w-10"></div>
            </div>
            <div className="flex-1 relative overflow-hidden flex items-center justify-center">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 border-[40px] border-black/30 pointer-events-none rounded-[60px]">
                <div className="w-full h-full border-2 border-white/20 rounded-[20px] relative">
                   <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-blue-500/50 shadow-[0_0_15px_blue] animate-pulse"></div>
                </div>
              </div>
              {error && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-10 text-center">
                  <div className="space-y-4">
                    <p className="text-red-400 font-bold">{error}</p>
                    <button onClick={() => setView('home')} className="px-6 py-2 bg-white text-black rounded-full font-bold">Назад</button>
                  </div>
                </div>
              )}
            </div>
            <div className="p-12 flex justify-center items-center bg-black">
              <button 
                onClick={capturePhoto}
                className="w-20 h-20 rounded-full border-[6px] border-white p-1 active:scale-90 transition-all shadow-[0_0_20px_white]"
              >
                <div className="w-full h-full bg-white rounded-full"></div>
              </button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {view === 'results' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
            <div className={`relative rounded-[40px] overflow-hidden aspect-square ${glassStyle}`}>
              <img src={capturedImage} className="w-full h-full object-cover" />
              {loading && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center">
                  <Loader2 className="animate-spin text-blue-500 mb-4" size={50} />
                  <p className="font-black italic tracking-widest animate-pulse">АНАЛИЗ EDM™ AI...</p>
                </div>
              )}
            </div>
            {analysisResult && (
               <div className={`${glassStyle} rounded-[40px] p-8 space-y-6`}>
                 <div className="flex justify-between items-start">
                   <div>
                     <h2 className="text-3xl font-black italic">{analysisResult.name}</h2>
                     <p className="text-slate-500 font-bold">{analysisResult.weight} г</p>
                   </div>
                   <div className="text-4xl font-black text-blue-500">{analysisResult.calories}</div>
                 </div>
                 <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/5 p-4 rounded-3xl border border-white/10 text-center">
                      <div className="text-[10px] font-black text-slate-500 mb-1">БЕЛКИ</div>
                      <div className="text-xl font-black">{analysisResult.protein}г</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-3xl border border-white/10 text-center">
                      <div className="text-[10px] font-black text-slate-500 mb-1">ЖИРЫ</div>
                      <div className="text-xl font-black">{analysisResult.fat}г</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-3xl border border-white/10 text-center">
                      <div className="text-[10px] font-black text-slate-500 mb-1">УГЛЕВ.</div>
                      <div className="text-xl font-black">{analysisResult.carbs}г</div>
                    </div>
                 </div>
                 <button 
                  onClick={() => {
                    setHistory([{...analysisResult, id: Date.now(), image: capturedImage, date: 'Сегодня'}, ...history]);
                    setView('home');
                  }}
                  className="w-full py-5 bg-white text-black rounded-[24px] font-black text-lg shadow-2xl"
                 >
                   ДОБАВИТЬ В ДНЕВНИК
                 </button>
               </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Navigation */}
      {view === 'home' && (
        <nav className="fixed bottom-6 left-6 right-6 z-40">
          <div className={`${glassStyle} rounded-[32px] p-2 flex justify-between items-center px-6 py-3`}>
            <button className="flex flex-col items-center gap-1 text-blue-500">
              <PieChart size={24} />
              <span className="text-[9px] font-black italic">EDM™</span>
            </button>
            <button 
              onClick={startCamera}
              className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center -mt-12 border-[8px] border-[#020617] shadow-xl active:scale-90 transition-transform"
            >
              <Camera size={28} />
            </button>
            <button onClick={() => setView('profile')} className="flex flex-col items-center gap-1 text-slate-500">
              <User size={24} />
              <span className="text-[9px] font-black italic">ПРОФИЛЬ</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default App;