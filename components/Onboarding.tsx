
import React, { useState, useMemo } from 'react';
import { UserProfile, Region } from '../types';
import { 
  ChefHat, MapPin, Target, Flame, ChevronRight, ChevronLeft, 
  Sparkles, Fish, Drumstick, Leaf, Candy, Scale, Activity, 
  Heart, CheckCircle2, Ruler, User, Info, Zap
} from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const tasteGroups = [
  {
    title: "Món chính ưu tiên",
    key: "protein",
    items: [
      { id: 'beef', label: 'Thịt bò', icon: <Flame size={14} /> },
      { id: 'pork', label: 'Thịt heo', icon: <Drumstick size={14} /> },
      { id: 'seafood', label: 'Hải sản', icon: <Fish size={14} /> },
      { id: 'poultry', label: 'Gà/Vịt', icon: <Drumstick size={14} /> },
      { id: 'tofu', label: 'Đồ chay', icon: <Leaf size={14} /> },
    ]
  }
];

const flavorProfiles = [
  { id: 'spicy', label: 'Ăn cay', icon: <Flame size={14} className="text-red-500" /> },
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

    // Tiêu chuẩn Châu Á (WPRO)
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
    <div className="max-w-md mx-auto min-h-screen bg-[#FAFBFA] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-100/40 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-orange-100/40 rounded-full blur-3xl" />

      {showAnalysis && bodyAnalysis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-md" />
          <div className="bg-white w-full rounded-[48px] p-8 space-y-8 relative z-10 shadow-2xl border border-emerald-50/50 animate-in zoom-in slide-in-from-bottom-12 duration-500">
             <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[32px] mx-auto flex items-center justify-center shadow-inner relative overflow-hidden">
                   <Activity size={48} className="relative z-10 animate-pulse" />
                   <div className="absolute inset-0 bg-emerald-200/20" />
                </div>
                <div>
                   <h3 className="text-3xl font-black text-emerald-950 tracking-tight">Cơ thể bạn nói gì?</h3>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Phân tích thể trạng bởi Fomi</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50/80 p-6 rounded-[32px] border border-gray-100 text-center">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Chỉ số cơ thể</p>
                   <p className="text-4xl font-black text-emerald-950 mt-1">{bodyAnalysis.bmi}</p>
                </div>
                <div className="bg-gray-50/80 p-6 rounded-[32px] border border-gray-100 text-center flex flex-col justify-center items-center">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Phân loại</p>
                   <p className={`text-lg font-black mt-2 leading-tight ${bodyAnalysis.color}`}>{bodyAnalysis.status}</p>
                </div>
             </div>

             <div className="bg-emerald-950 p-7 rounded-[40px] text-white relative overflow-hidden shadow-xl border border-white/10">
                <div className="flex gap-4 relative z-10">
                   <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                      <Zap size={20} fill="white" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Lời khuyên từ Fomi</p>
                      <p className="text-sm font-bold leading-relaxed italic opacity-90">
                         "{bodyAnalysis.advice}"
                      </p>
                   </div>
                </div>
                <ChefHat size={120} className="absolute -right-8 -bottom-8 text-white/5 rotate-12" />
             </div>

             <button 
               onClick={() => { setShowAnalysis(false); nextStep(); }}
               className="w-full py-5 bg-emerald-600 text-white font-black rounded-3xl shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 text-sm uppercase tracking-wider active:scale-95 transition-all"
             >
                Xác nhận & Tiếp tục <ChevronRight size={20} />
             </button>
          </div>
        </div>
      )}

      <div key={step} className="w-full relative z-10 space-y-8 animate-in slide-in-from-right-8 duration-500">
        {step > 1 && step < 6 && (
          <div className="flex gap-1.5 justify-center mb-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ${step >= i ? 'bg-emerald-600 w-8' : 'bg-gray-200 w-4'}`} />
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="text-center space-y-12 animate-in zoom-in duration-700">
            <div className="w-32 h-32 bg-emerald-950 rounded-[44px] mx-auto flex items-center justify-center shadow-2xl relative group">
              <ChefHat size={64} className="text-emerald-400 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white border-4 border-[#FAFBFA] shadow-lg animate-bounce">
                 <Sparkles size={20} />
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-6xl font-black text-emerald-950 tracking-tighter">Fomi.</h1>
              <p className="text-emerald-600 font-black uppercase text-[11px] tracking-[0.4em]">Sức khỏe bắt đầu từ bữa ăn</p>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Tên của bạn là gì?" 
                  className="w-full bg-white border-2 border-emerald-50 rounded-[32px] px-8 py-6 text-center text-xl font-black focus:border-emerald-500 outline-none shadow-sm transition-all focus:shadow-xl focus:shadow-emerald-500/5"
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && data.name && nextStep()}
                />
              </div>
              <button 
                disabled={!data.name}
                onClick={nextStep}
                className="w-full bg-emerald-600 text-white font-black py-6 rounded-[32px] shadow-2xl shadow-emerald-200 disabled:opacity-40 transition-all active:scale-95 text-sm uppercase tracking-widest"
              >
                Bắt đầu ngay
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10">
            <div className="space-y-2 text-center">
              <h2 className="text-4xl font-black text-emerald-950 tracking-tight leading-tight">Mục tiêu của bạn?</h2>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Fomi sẽ cân đối thực đơn cho bạn</p>
            </div>
            <div className="grid gap-4">
              {['Giảm cân', 'Giữ dáng', 'Tăng cơ'].map((g) => (
                <button
                  key={g}
                  onClick={() => { setData({ ...data, goal: g as any }); nextStep(); }}
                  className="w-full p-8 bg-white border-2 border-emerald-50 rounded-[40px] text-left hover:border-emerald-500 transition-all shadow-sm flex items-center justify-between group active:scale-[0.98] hover:shadow-xl hover:shadow-emerald-500/5"
                >
                  <span className="text-2xl font-black text-emerald-950">{g}</span>
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                     <ChevronRight size={28} />
                  </div>
                </button>
              ))}
            </div>
            <button onClick={prevStep} className="w-full text-center py-4 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-emerald-600 transition-colors">Quay lại</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-black text-emerald-950 tracking-tight">Thông số sức khỏe</h2>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest italic">Không bắt buộc - Có thể bỏ qua</p>
            </div>
            
            {!useBodyData ? (
               <div className="space-y-4">
                  <button 
                    onClick={() => setUseBodyData(true)}
                    className="w-full p-10 bg-white border-2 border-emerald-50 rounded-[48px] text-center space-y-4 shadow-sm hover:border-emerald-500 transition-all group"
                  >
                     <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[32px] mx-auto flex items-center justify-center group-hover:scale-110 transition-transform"><Scale size={40} /></div>
                     <div>
                        <p className="text-xl font-black text-emerald-950">Nhập chỉ số</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Để Fomi tư vấn chi tiết hơn</p>
                     </div>
                  </button>
                  <button 
                    onClick={() => { setUseBodyData(false); nextStep(); }}
                    className="w-full py-6 bg-gray-50 text-gray-400 font-black rounded-[32px] text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
                  >
                     Bỏ qua bước này
                  </button>
               </div>
            ) : (
               <div className="space-y-8 animate-in slide-in-from-bottom-8">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="col-span-2 flex gap-2">
                        {['Nam', 'Nữ'].map(g => (
                           <button 
                              key={g}
                              onClick={() => setData({...data, gender: g as any})}
                              className={`flex-1 py-5 rounded-2xl font-black text-sm border-2 transition-all ${data.gender === g ? 'bg-emerald-950 border-emerald-950 text-white shadow-xl' : 'bg-white border-emerald-50 text-gray-300'}`}
                           >
                              {g}
                           </button>
                        ))}
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Tuổi</label>
                        <input type="number" placeholder="25" onChange={(e) => setData({...data, age: parseInt(e.target.value)})} className="w-full bg-white border-2 border-emerald-50 rounded-2xl px-6 py-4 font-black text-emerald-950 outline-none focus:border-emerald-500 focus:shadow-lg focus:shadow-emerald-500/5" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Chiều cao (cm)</label>
                        <input type="number" placeholder="170" onChange={(e) => setData({...data, height: parseInt(e.target.value)})} className="w-full bg-white border-2 border-emerald-50 rounded-2xl px-6 py-4 font-black text-emerald-950 outline-none focus:border-emerald-500 focus:shadow-lg focus:shadow-emerald-500/5" />
                     </div>
                     <div className="space-y-1.5 col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Cân nặng (kg)</label>
                        <input type="number" placeholder="60" onChange={(e) => setData({...data, weight: parseInt(e.target.value)})} className="w-full bg-white border-2 border-emerald-50 rounded-2xl px-6 py-4 font-black text-emerald-950 outline-none focus:border-emerald-500 focus:shadow-lg focus:shadow-emerald-500/5" />
                     </div>
                     <div className="col-span-2 space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Mức độ vận động</label>
                        <select onChange={(e) => setData({...data, activityLevel: e.target.value as any})} className="w-full bg-white border-2 border-emerald-50 rounded-2xl px-6 py-4 font-black text-emerald-950 outline-none focus:border-emerald-500 appearance-none cursor-pointer">
                           {activityLevels.map(a => <option key={a.id} value={a.id}>{a.id}</option>)}
                        </select>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <button onClick={() => setUseBodyData(false)} className="w-20 h-20 bg-white border-2 border-emerald-50 rounded-[28px] flex items-center justify-center text-emerald-950 hover:bg-emerald-50 transition-colors"><ChevronLeft size={32} /></button>
                     <button 
                        disabled={!data.age || !data.height || !data.weight}
                        onClick={() => setShowAnalysis(true)} 
                        className="flex-1 bg-emerald-600 text-white font-black rounded-[28px] flex items-center justify-center gap-3 disabled:opacity-40 uppercase text-sm tracking-widest shadow-2xl shadow-emerald-200 active:scale-95 transition-all"
                     >
                        Phân tích chỉ số <Activity size={24} />
                     </button>
                  </div>
               </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-10">
            <div className="space-y-2 text-center">
              <h2 className="text-4xl font-black text-emerald-950 leading-tight tracking-tight">Khẩu vị vùng miền?</h2>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Để Fomi gợi ý món ăn chuẩn vị quê nhà</p>
            </div>
            <div className="grid gap-4">
              {[Region.NORTH, Region.CENTRAL, Region.SOUTH].map((r) => (
                <button
                  key={r}
                  onClick={() => { setData({ ...data, region: r }); nextStep(); }}
                  className={`w-full p-8 rounded-[40px] text-left border-2 transition-all flex items-center justify-between group active:scale-[0.98] ${
                    data.region === r ? 'border-emerald-500 bg-white shadow-xl shadow-emerald-500/10' : 'border-white bg-white opacity-70 hover:opacity-100 hover:border-emerald-100'
                  }`}
                >
                  <span className="text-2xl font-black text-emerald-950">Miền {r}</span>
                  <MapPin size={28} className={data.region === r ? 'text-emerald-500 animate-bounce' : 'text-gray-200'} />
                </button>
              ))}
            </div>
            <button onClick={prevStep} className="w-full text-center py-4 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-emerald-600 transition-colors">Quay lại</button>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-10">
            <div className="space-y-2 text-center">
               <h2 className="text-3xl font-black text-emerald-950 leading-tight">Sở thích cá nhân?</h2>
               <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Ưu tiên những món bạn thích nhất</p>
            </div>
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-3">
                {tasteGroups[0].items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleList('preferences', item.id)}
                    className={`flex items-center gap-3 p-6 rounded-[32px] text-xs font-black border-2 transition-all active:scale-[0.96] ${
                      data.preferences?.includes(item.id) ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 'bg-white border-emerald-50 text-gray-400'
                    }`}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                {flavorProfiles.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => toggleList('flavors', f.id)}
                    className={`flex-1 p-6 rounded-[32px] text-[11px] font-black border-2 transition-all active:scale-[0.96] ${
                      data.flavors?.includes(f.id) ? 'bg-emerald-950 border-emerald-950 text-white shadow-xl' : 'bg-white border-emerald-50 text-gray-400'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={prevStep} className="w-20 h-20 bg-white border-2 border-emerald-50 rounded-[28px] flex items-center justify-center text-emerald-950 active:scale-90 transition-all"><ChevronLeft size={32} /></button>
              <button onClick={nextStep} className="flex-1 bg-emerald-600 text-white font-black rounded-[32px] flex items-center justify-center gap-3 uppercase text-sm tracking-widest shadow-2xl shadow-emerald-200 active:scale-95 transition-all">Hoàn tất <CheckCircle2 size={24} /></button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-12 text-center animate-in zoom-in duration-1000">
            <div className="space-y-6">
               <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center animate-bounce shadow-inner border-8 border-white">
                  <Heart size={64} fill="currentColor" />
               </div>
               <div className="space-y-3">
                  <h2 className="text-5xl font-black text-emerald-950 tracking-tighter">Sẵn sàng!</h2>
                  <p className="text-gray-400 font-bold text-sm px-6 leading-relaxed">Fomi đã tối ưu hóa mọi thứ dành riêng cho <b>{data.name}</b>. Chúc bạn có những bữa ăn thật ngon và khỏe mạnh.</p>
               </div>
            </div>

            <div className="bg-emerald-950 p-12 rounded-[56px] text-center space-y-4 shadow-3xl relative overflow-hidden group">
               <div className="relative z-10 space-y-2">
                  <p className="text-emerald-400 text-xs font-black uppercase tracking-widest">Năng lượng tiêu chuẩn mỗi ngày</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-7xl font-black text-white">{useBodyData ? calorieGoal : 2000}</span>
                    <span className="text-sm font-black text-emerald-500 uppercase mt-4">Calo</span>
                  </div>
                  <div className="pt-2">
                     <span className="bg-white/10 px-4 py-2 rounded-full text-[10px] text-emerald-200 font-bold uppercase tracking-wider">Mục tiêu: {data.goal}</span>
                  </div>
               </div>
               <ChefHat size={200} className="absolute -right-16 -bottom-16 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
            </div>

            <button 
              onClick={handleFinish}
              className="w-full py-7 bg-emerald-600 text-white font-black rounded-[40px] shadow-3xl shadow-emerald-200 flex items-center justify-center gap-4 text-base uppercase tracking-widest active:scale-95 transition-all"
            >
              Bắt đầu khám phá <Sparkles size={24} className="animate-sparkle" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
