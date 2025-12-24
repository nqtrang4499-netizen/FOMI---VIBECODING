
import React, { useState, useMemo } from 'react';
import { UserProfile, Region } from '../types';
import { 
  ChevronRight, ChevronLeft, Sparkles, Fish, Drumstick, Leaf, Candy, Scale, Activity, 
  CheckCircle2, Zap, MapPin
} from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

// Fomi Panda - Gấu trắng tai đen
const MASCOT_URL = "https://api.dicebear.com/7.x/big-ears/svg?seed=Fomi&backgroundColor=b6e3f4&skinColor=ffffff&hairColor=000000";

const tasteGroups = [
  {
    title: "Món chính ưu tiên",
    key: "protein",
    items: [
      { id: 'beef', label: 'Thịt bò', icon: <img src="https://cdn-icons-png.flaticon.com/512/1134/1134447.png" className="w-3 h-3 grayscale" /> },
      { id: 'pork', label: 'Thịt heo', icon: <Drumstick size={14} /> },
      { id: 'seafood', label: 'Hải sản', icon: <Fish size={14} /> },
      { id: 'poultry', label: 'Gà/Vịt', icon: <Drumstick size={14} /> },
      { id: 'tofu', label: 'Đồ chay', icon: <Leaf size={14} /> },
    ]
  }
];

const flavorProfiles = [
  { id: 'spicy', label: 'Ăn cay', icon: '🌶️' },
  { id: 'sweet', label: 'Hơi ngọt', icon: <Candy size={14} className="text-pink-400" /> },
  { id: 'light', label: 'Thanh đạm', icon: <Leaf size={14} className="text-green-400" /> },
];

const activityLevels = [
  { id: 'Ít vận động', label: 'Ít vận động', multiplier: 1.2 },
  { id: 'Vận động nhẹ', label: 'Vận động nhẹ', multiplier: 1.375 },
  { id: 'Vận động vừa', label: 'Vận động vừa', multiplier: 1.55 },
  { id: 'Vận động mạnh', label: 'Vận động mạnh', multiplier: 1.725 },
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [useBodyData, setUseBodyData] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [data, setData] = useState<Partial<UserProfile>>({
    region: Region.SOUTH,
    isLactoseIntolerant: false,
    preferences: [],
    flavors: [],
    goal: 'Giữ dáng',
    gender: 'Nam',
    activityLevel: 'Ít vận động'
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const toggleList = (key: keyof UserProfile, id: string) => {
    const current = (data[key] as string[]) || [];
    if (current.includes(id)) {
      setData({ ...data, [key]: current.filter(p => p !== id) });
    } else {
      setData({ ...data, [key]: [...current, id] });
    }
  };

  const bodyAnalysis = useMemo(() => {
    if (!data.weight || !data.height) return null;
    const heightInMeters = data.height / 100;
    const bmiValue = parseFloat((data.weight / (heightInMeters * heightInMeters)).toFixed(1));
    
    let status = '';
    let color = '';
    let advice = '';

    if (bmiValue < 18.5) {
      status = 'Cân nặng thấp (Gầy)';
      color = 'text-blue-500';
      advice = 'Fomi sẽ ưu tiên các món giàu đạm và dinh dưỡng để bạn đạt cân nặng lý tưởng.';
    } else if (bmiValue < 23.0) {
      status = 'Thể trạng bình thường';
      color = 'text-emerald-500';
      advice = 'Chỉ số cơ thể tuyệt vời! Hãy duy trì lối sống lành mạnh này cùng Fomi.';
    } else if (bmiValue < 25.0) {
      status = 'Tiền béo phì (Thừa cân)';
      color = 'text-orange-500';
      advice = 'Bạn đang hơi thừa cân một chút. Fomi sẽ giúp bạn cân bằng lại thực đơn mỗi ngày.';
    } else {
      status = 'Béo phì';
      color = 'text-red-500';
      advice = 'Đừng quá lo lắng, Fomi sẽ thiết kế thực đơn giảm calo nhưng vẫn đảm bảo ngon miệng.';
    }

    return { bmi: bmiValue, status, color, advice };
  }, [data.weight, data.height, data.goal]);

  const calorieGoal = useMemo(() => {
    if (!data.weight || !data.height || !data.age) return 2000;
    let bmr = (10 * data.weight) + (6.25 * data.height) - (5 * data.age);
    bmr = data.gender === 'Nam' ? bmr + 5 : bmr - 161;
    const multiplier = activityLevels.find(a => a.id === data.activityLevel)?.multiplier || 1.2;
    let tdee = bmr * multiplier;
    if (data.goal === 'Giảm cân') tdee -= 500;
    else if (data.goal === 'Tăng cơ') tdee += 300;
    return Math.round(tdee);
  }, [data]);

  const handleFinish = () => {
    onComplete({ ...data, calorieGoal: useBodyData ? calorieGoal : 2000 } as UserProfile);
  };

  return (
    <div className="max-w-md mx-auto h-[100dvh] bg-[#FAFBFA] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-100/40 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-orange-100/40 rounded-full blur-3xl" />

      {showAnalysis && bodyAnalysis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-md" />
          <div className="bg-white w-full rounded-[40px] p-6 space-y-6 relative z-10 shadow-2xl border border-emerald-50/50 animate-in zoom-in slide-in-from-bottom-12 duration-500">
             <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-white rounded-[24px] mx-auto flex items-center justify-center shadow-inner relative overflow-hidden border border-emerald-100">
                   <Activity size={32} className="relative z-10 animate-pulse text-emerald-600" />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-emerald-950 tracking-tight">Cơ thể bạn nói gì?</h3>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Phân tích thể trạng bởi Fomi</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50/80 p-4 rounded-[24px] border border-gray-100 text-center">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">BMI</p>
                   <p className="text-3xl font-black text-emerald-950 mt-1">{bodyAnalysis.bmi}</p>
                </div>
                <div className="bg-gray-50/80 p-4 rounded-[24px] border border-gray-100 text-center flex flex-col justify-center items-center">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Phân loại</p>
                   <p className={`text-sm font-black mt-1 leading-tight ${bodyAnalysis.color}`}>{bodyAnalysis.status}</p>
                </div>
             </div>

             <div className="bg-emerald-950 p-5 rounded-[32px] text-white relative overflow-hidden shadow-xl border border-white/10">
                <div className="flex gap-3 relative z-10">
                   <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                      <Zap size={16} fill="white" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Lời khuyên từ Fomi</p>
                      <p className="text-xs font-bold leading-relaxed italic opacity-90">
                         "{bodyAnalysis.advice}"
                      </p>
                   </div>
                </div>
             </div>

             <button 
               onClick={() => { setShowAnalysis(false); nextStep(); }}
               className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-200 flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-95 transition-all"
             >
                Xác nhận & Tiếp tục <ChevronRight size={16} />
             </button>
          </div>
        </div>
      )}

      <div key={step} className="w-full relative z-10 space-y-6 animate-in slide-in-from-right-8 duration-500 overflow-y-auto max-h-full py-2 no-scrollbar">
        {step > 1 && step < 6 && (
          <div className="flex gap-1.5 justify-center mb-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ${step >= i ? 'bg-emerald-600 w-6' : 'bg-gray-200 w-3'}`} />
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="text-center space-y-8 animate-in zoom-in duration-700">
            {/* Mascot Container - Fomi Eating Watermelon */}
            <div className="relative w-40 h-40 mx-auto">
               <div className="w-36 h-36 bg-[#b6e3f4] rounded-full mx-auto flex items-center justify-center shadow-2xl relative group border-[6px] border-white overflow-hidden">
                 {/* Gấu Panda trắng */}
                 <img src={MASCOT_URL} alt="Fomi" className="w-full h-full object-cover transform scale-125 translate-y-3" />
               </div>
               
               {/* Dưa hấu Overlay - Tạo hiệu ứng đang cầm/ăn */}
               <div className="absolute bottom-0 right-2 w-16 h-16 animate-bounce z-10 drop-shadow-lg" style={{ animationDuration: '2s' }}>
                 <span className="text-5xl block transform -rotate-12">🍉</span>
               </div>

               {/* Hiệu ứng lấp lánh */}
               <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white border-2 border-[#FAFBFA] shadow-lg animate-bounce z-20">
                  <Sparkles size={14} />
               </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-black text-emerald-950 tracking-tighter">Fomi.</h1>
              <p className="text-emerald-600 font-black uppercase text-[10px] tracking-[0.3em]">Sức khỏe từ bữa ăn</p>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Tên của bạn là gì?" 
                  className="w-full bg-white border-2 border-emerald-50 rounded-[24px] px-6 py-4 text-center text-lg font-black focus:border-emerald-500 outline-none shadow-sm transition-all focus:shadow-xl focus:shadow-emerald-500/5"
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && data.name && nextStep()}
                />
              </div>
              <button 
                disabled={!data.name}
                onClick={nextStep}
                className="w-full bg-emerald-600 text-white font-black py-4 rounded-[24px] shadow-xl shadow-emerald-200 disabled:opacity-40 transition-all active:scale-95 text-xs uppercase tracking-widest"
              >
                Bắt đầu ngay
              </button>
            </div>
          </div>
        )}

        {/* Các Step khác giữ nguyên logic nhưng có thể thêm Mascot nhỏ ở góc nếu cần */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1 text-center">
              <h2 className="text-3xl font-black text-emerald-950 tracking-tight leading-tight">Mục tiêu?</h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Fomi sẽ cân đối thực đơn cho bạn</p>
            </div>
            <div className="grid gap-3">
              {['Giảm cân', 'Giữ dáng', 'Tăng cơ'].map((g) => (
                <button
                  key={g}
                  onClick={() => { setData({ ...data, goal: g as any }); nextStep(); }}
                  className="w-full p-6 bg-white border-2 border-emerald-50 rounded-[32px] text-left hover:border-emerald-500 transition-all shadow-sm flex items-center justify-between group active:scale-[0.98] hover:shadow-lg"
                >
                  <span className="text-xl font-black text-emerald-950">{g}</span>
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                     <ChevronRight size={20} />
                  </div>
                </button>
              ))}
            </div>
            <button onClick={prevStep} className="w-full text-center py-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-emerald-600 transition-colors">Quay lại</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1 text-center">
              <h2 className="text-2xl font-black text-emerald-950 tracking-tight">Thông số sức khỏe</h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest italic">Không bắt buộc</p>
            </div>
            
            {!useBodyData ? (
               <div className="space-y-3">
                  <button 
                    onClick={() => setUseBodyData(true)}
                    className="w-full p-6 bg-white border-2 border-emerald-50 rounded-[32px] text-center space-y-3 shadow-sm hover:border-emerald-500 transition-all group"
                  >
                     <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-[20px] mx-auto flex items-center justify-center group-hover:scale-110 transition-transform"><Scale size={28} /></div>
                     <div>
                        <p className="text-lg font-black text-emerald-950">Nhập chỉ số</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Để Fomi tư vấn chi tiết hơn</p>
                     </div>
                  </button>
                  <button 
                    onClick={() => { setUseBodyData(false); nextStep(); }}
                    className="w-full py-4 bg-gray-50 text-gray-400 font-black rounded-[24px] text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all"
                  >
                     Bỏ qua
                  </button>
               </div>
            ) : (
               <div className="space-y-6 animate-in slide-in-from-bottom-8">
                  <div className="grid grid-cols-2 gap-3">
                     <div className="col-span-2 flex gap-2">
                        {['Nam', 'Nữ'].map(g => (
                           <button 
                              key={g}
                              onClick={() => setData({...data, gender: g as any})}
                              className={`flex-1 py-3 rounded-xl font-black text-xs border-2 transition-all ${data.gender === g ? 'bg-emerald-950 border-emerald-950 text-white shadow-md' : 'bg-white border-emerald-50 text-gray-300'}`}
                           >
                              {g}
                           </button>
                        ))}
                     </div>
                     <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Tuổi</label>
                        <input type="number" placeholder="25" onChange={(e) => setData({...data, age: parseInt(e.target.value)})} className="w-full bg-white border-2 border-emerald-50 rounded-xl px-4 py-3 font-black text-emerald-950 outline-none focus:border-emerald-500 text-sm" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Chiều cao (cm)</label>
                        <input type="number" placeholder="170" onChange={(e) => setData({...data, height: parseInt(e.target.value)})} className="w-full bg-white border-2 border-emerald-50 rounded-xl px-4 py-3 font-black text-emerald-950 outline-none focus:border-emerald-500 text-sm" />
                     </div>
                     <div className="space-y-1 col-span-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Cân nặng (kg)</label>
                        <input type="number" placeholder="60" onChange={(e) => setData({...data, weight: parseInt(e.target.value)})} className="w-full bg-white border-2 border-emerald-50 rounded-xl px-4 py-3 font-black text-emerald-950 outline-none focus:border-emerald-500 text-sm" />
                     </div>
                     <div className="col-span-2 space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Mức độ vận động</label>
                        <select onChange={(e) => setData({...data, activityLevel: e.target.value as any})} className="w-full bg-white border-2 border-emerald-50 rounded-xl px-4 py-3 font-black text-emerald-950 outline-none focus:border-emerald-500 appearance-none cursor-pointer text-sm">
                           {activityLevels.map(a => <option key={a.id} value={a.id}>{a.id}</option>)}
                        </select>
                     </div>
                  </div>
                  <div className="flex gap-3">
                     <button onClick={() => setUseBodyData(false)} className="w-14 h-14 bg-white border-2 border-emerald-50 rounded-[20px] flex items-center justify-center text-emerald-950 hover:bg-emerald-50 transition-colors"><ChevronLeft size={24} /></button>
                     <button 
                        disabled={!data.age || !data.height || !data.weight}
                        onClick={() => setShowAnalysis(true)} 
                        className="flex-1 bg-emerald-600 text-white font-black rounded-[20px] flex items-center justify-center gap-2 disabled:opacity-40 uppercase text-xs tracking-widest shadow-xl shadow-emerald-200 active:scale-95 transition-all"
                     >
                        Phân tích <Activity size={16} />
                     </button>
                  </div>
               </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-1 text-center">
              <h2 className="text-3xl font-black text-emerald-950 leading-tight tracking-tight">Vùng miền?</h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Gợi ý món ăn chuẩn vị</p>
            </div>
            <div className="grid gap-3">
              {[Region.NORTH, Region.CENTRAL, Region.SOUTH].map((r) => (
                <button
                  key={r}
                  onClick={() => { setData({ ...data, region: r }); nextStep(); }}
                  className={`w-full p-6 rounded-[32px] text-left border-2 transition-all flex items-center justify-between group active:scale-[0.98] ${
                    data.region === r ? 'border-emerald-500 bg-white shadow-xl shadow-emerald-500/10' : 'border-white bg-white opacity-80 hover:opacity-100 hover:border-emerald-100'
                  }`}
                >
                  <span className="text-xl font-black text-emerald-950">Miền {r}</span>
                  <MapPin size={24} className={data.region === r ? 'text-emerald-500 animate-bounce' : 'text-gray-200'} />
                </button>
              ))}
            </div>
            <button onClick={prevStep} className="w-full text-center py-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-emerald-600 transition-colors">Quay lại</button>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div className="space-y-1 text-center">
               <h2 className="text-2xl font-black text-emerald-950 leading-tight">Sở thích?</h2>
               <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Ưu tiên món bạn thích</p>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-2">
                {tasteGroups[0].items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleList('preferences', item.id)}
                    className={`flex items-center gap-2 p-4 rounded-[24px] text-[10px] font-black border-2 transition-all active:scale-[0.96] ${
                      data.preferences?.includes(item.id) ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-emerald-50 text-gray-400'
                    }`}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {flavorProfiles.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => toggleList('flavors', f.id)}
                    className={`flex-1 p-4 rounded-[24px] text-[10px] font-black border-2 transition-all active:scale-[0.96] ${
                      data.flavors?.includes(f.id) ? 'bg-emerald-950 border-emerald-950 text-white shadow-lg' : 'bg-white border-emerald-50 text-gray-400'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={prevStep} className="w-14 h-14 bg-white border-2 border-emerald-50 rounded-[20px] flex items-center justify-center text-emerald-950 active:scale-90 transition-all"><ChevronLeft size={24} /></button>
              <button onClick={nextStep} className="flex-1 bg-emerald-600 text-white font-black rounded-[20px] flex items-center justify-center gap-2 uppercase text-xs tracking-widest shadow-xl shadow-emerald-200 active:scale-95 transition-all">Hoàn tất <CheckCircle2 size={18} /></button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-8 text-center animate-in zoom-in duration-1000">
            <div className="space-y-4">
               {/* Final Mascot Celebration */}
               <div className="w-28 h-28 bg-[#b6e3f4] rounded-full mx-auto flex items-center justify-center animate-bounce shadow-2xl border-[6px] border-white overflow-hidden relative">
                  <img src={MASCOT_URL} alt="Fomi" className="w-full h-full object-cover transform scale-125 translate-y-2" />
               </div>
               <div className="space-y-2">
                  <h2 className="text-4xl font-black text-emerald-950 tracking-tighter">Sẵn sàng!</h2>
                  <p className="text-gray-400 font-bold text-xs px-4 leading-relaxed">Fomi đã tối ưu hóa mọi thứ dành riêng cho <b>{data.name}</b>.</p>
               </div>
            </div>

            <div className="bg-emerald-950 p-8 rounded-[40px] text-center space-y-3 shadow-2xl relative overflow-hidden group">
               <div className="relative z-10 space-y-1">
                  <p className="text-emerald-400 text-[9px] font-black uppercase tracking-widest">Năng lượng tiêu chuẩn mỗi ngày</p>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-5xl font-black text-white">{useBodyData ? calorieGoal : 2000}</span>
                    <span className="text-[10px] font-black text-emerald-500 uppercase mt-3">Calo</span>
                  </div>
                  <div className="pt-2">
                     <span className="bg-white/10 px-3 py-1 rounded-full text-[9px] text-emerald-200 font-bold uppercase tracking-wider">Mục tiêu: {data.goal}</span>
                  </div>
               </div>
            </div>

            <button 
              onClick={handleFinish}
              className="w-full py-5 bg-emerald-600 text-white font-black rounded-[32px] shadow-2xl shadow-emerald-200 flex items-center justify-center gap-3 text-sm uppercase tracking-widest active:scale-95 transition-all"
            >
              Khám phá ngay <Sparkles size={18} className="animate-sparkle" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
