
import React, { useState, useMemo } from 'react';
import { UserProfile, Region } from '../types';
import { 
  ChevronRight, ChevronLeft, Sparkles, Fish, Drumstick, Leaf, Candy, Scale, Activity, 
  CheckCircle2, MapPin, AlertOctagon, Plus, X, Dna, Fingerprint, ScanLine
} from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const MASCOT_URL = "https://api.dicebear.com/7.x/big-ears/svg?seed=Fomi&backgroundColor=b6e3f4&skinColor=ffffff&hairColor=000000";

const tasteGroups = [
  {
    title: "Món chính ưu tiên",
    key: "protein",
    items: [
      { id: 'beef', label: 'Thịt bò', icon: <img src="https://cdn-icons-png.flaticon.com/512/1134/1134447.png" className="w-4 h-4 grayscale" /> },
      { id: 'pork', label: 'Thịt heo', icon: <Drumstick size={14} /> },
      { id: 'seafood', label: 'Hải sản', icon: <Fish size={14} /> },
      { id: 'poultry', label: 'Gà/Vịt', icon: <Drumstick size={14} /> },
      { id: 'tofu', label: 'Đồ chay', icon: <Leaf size={14} /> },
    ]
  }
];

const allergyOptions = [
    { id: 'seafood', label: 'Hải sản' },
    { id: 'peanut', label: 'Đậu/Hạt' },
    { id: 'dairy', label: 'Sữa' },
    { id: 'gluten', label: 'Gluten' },
    { id: 'garlic', label: 'Hành tỏi' }
];

const flavorProfiles = [
  { id: 'spicy', label: 'Cay', icon: '🌶️' },
  { id: 'sweet', label: 'Ngọt', icon: <Candy size={12} className="text-pink-400" /> },
  { id: 'light', label: 'Thanh', icon: <Leaf size={12} className="text-green-400" /> },
];

const activityLevels = [
  { id: 'Ít vận động', label: 'Ít vận động', multiplier: 1.2 },
  { id: 'Vận động nhẹ', label: 'Vận động nhẹ', multiplier: 1.375 },
  { id: 'Vận động vừa', label: 'Vận động vừa', multiplier: 1.55 },
  { id: 'Vận động mạnh', label: 'Vận động mạnh', multiplier: 1.725 },
];

// Database siêu thực phẩm (Giữ nguyên logic cũ)
const SUPERFOOD_DATABASE = [
    { name: 'Ức gà', group: 'protein', tags: ['poultry'], allergens: [] },
    { name: 'Thịt bò nạc', group: 'protein', tags: ['beef'], allergens: [] },
    { name: 'Cá hồi', group: 'protein', tags: ['seafood'], allergens: ['seafood'] },
    { name: 'Tôm', group: 'protein', tags: ['seafood'], allergens: ['seafood'] },
    { name: 'Đậu hũ', group: 'protein', tags: ['tofu'], allergens: [] },
    { name: 'Trứng gà', group: 'protein', tags: [], allergens: [] },
    { name: 'Yến mạch', group: 'carb', tags: [], allergens: ['gluten'] },
    { name: 'Khoai lang', group: 'carb', tags: [], allergens: [] },
    { name: 'Gạo lứt', group: 'carb', tags: [], allergens: [] },
    { name: 'Bánh mì đen', group: 'carb', tags: [], allergens: ['gluten'] },
    { name: 'Bơ sáp', group: 'fat', tags: [], allergens: [] },
    { name: 'Hạt điều', group: 'fat', tags: [], allergens: ['peanut'] },
    { name: 'Sữa chua Hy Lạp', group: 'other', tags: [], allergens: ['dairy'] },
    { name: 'Phô mai', group: 'fat', tags: [], allergens: ['dairy'] },
    { name: 'Rau chân vịt', group: 'vege', tags: [], allergens: [] },
    { name: 'Bông cải xanh', group: 'vege', tags: [], allergens: [] },
    { name: 'Táo', group: 'fruit', tags: [], allergens: [] },
    { name: 'Chuối', group: 'fruit', tags: [], allergens: [] },
    { name: 'Hạnh nhân', group: 'fat', tags: [], allergens: ['peanut'] }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [useBodyData, setUseBodyData] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // Custom inputs state
  const [customInputs, setCustomInputs] = useState({
      preferences: '',
      flavors: '',
      allergies: ''
  });

  const [data, setData] = useState<Partial<UserProfile>>({
    region: Region.SOUTH,
    isLactoseIntolerant: false,
    preferences: [],
    flavors: [],
    allergies: [],
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

  const addCustomItem = (key: 'preferences' | 'flavors' | 'allergies') => {
      const val = customInputs[key].trim();
      if (!val) return;
      const current = (data[key] as string[]) || [];
      if (!current.includes(val)) {
          setData({ ...data, [key]: [...current, val] });
          setCustomInputs({ ...customInputs, [key]: '' });
      }
  };

  const removeCustomItem = (key: 'preferences' | 'flavors' | 'allergies', val: string) => {
      const current = (data[key] as string[]) || [];
      setData({ ...data, [key]: current.filter(item => item !== val) });
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
      advice = 'Ưu tiên đạm & dinh dưỡng.';
    } else if (bmiValue < 23.0) {
      status = 'Bình thường';
      color = 'text-emerald-500';
      advice = 'Duy trì lối sống này nhé!';
    } else if (bmiValue < 25.0) {
      status = 'Thừa cân';
      color = 'text-orange-500';
      advice = 'Cân bằng lại thực đơn chút.';
    } else {
      status = 'Béo phì';
      color = 'text-red-500';
      advice = 'Giảm calo nhưng vẫn ngon miệng.';
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

  // Logic Recommendation
  const getRecommendations = () => {
    const userAllergies = data.allergies || [];
    const userPreferences = data.preferences || [];
    const goal = data.goal;

    // 1. Lọc bỏ món dị ứng
    let safeFoods = SUPERFOOD_DATABASE.filter(food => {
        const hasAllergen = food.allergens.some(a => userAllergies.includes(a));
        return !hasAllergen;
    });

    // 2. Chấm điểm
    const scoredFoods = safeFoods.map(food => {
        let score = 0;
        if (food.tags.some(t => userPreferences.includes(t))) score += 5;
        if (goal === 'Tăng cơ' && food.group === 'protein') score += 2;
        if (goal === 'Giảm cân' && (food.group === 'vege' || food.group === 'protein')) score += 2;
        if (goal === 'Giữ dáng' && (food.group === 'fruit' || food.group === 'fat')) score += 1;
        return { ...food, score };
    });

    const topFoods = scoredFoods.sort((a, b) => b.score - a.score).slice(0, 6).map(f => f.name);

    let macro = { p: 30, c: 40, f: 30 };
    if (goal === 'Tăng cơ') macro = { p: 40, c: 40, f: 20 };
    else if (goal === 'Giảm cân') macro = { p: 40, c: 30, f: 30 };

    return { foods: topFoods, macro };
  };

  const recs = getRecommendations();
  const calS = Math.round(calorieGoal * 0.25);
  const calT = Math.round(calorieGoal * 0.40);
  const calC = Math.round(calorieGoal * 0.35);

  const handleFinish = () => {
    onComplete({ ...data, calorieGoal: useBodyData ? calorieGoal : 2000 } as UserProfile);
  };

  // ... (Analysis Modal Code kept same)
  if (showAnalysis && bodyAnalysis) {
      return (
        <div className="fixed inset-0 bg-emerald-950/90 backdrop-blur-md flex items-center justify-center p-6 z-[100]">
            <div className="bg-white w-full max-w-sm rounded-[32px] p-6 space-y-5 shadow-2xl animate-in zoom-in duration-300">
                <div className="text-center space-y-2">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl mx-auto flex items-center justify-center mb-2">
                        <Activity size={28} className="text-emerald-600 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-black text-emerald-950">Phân tích thể trạng</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-4 rounded-[20px] text-center border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase">BMI</p>
                        <p className="text-2xl font-black text-emerald-950">{bodyAnalysis.bmi}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-[20px] text-center border border-gray-100 flex flex-col justify-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Trạng thái</p>
                        <p className={`text-sm font-black ${bodyAnalysis.color}`}>{bodyAnalysis.status}</p>
                    </div>
                </div>

                <div className="bg-emerald-950 p-5 rounded-[24px] text-white">
                    <p className="text-[10px] font-black text-emerald-400 uppercase mb-2">Lời khuyên từ Fomi</p>
                    <p className="text-sm font-medium italic opacity-90 leading-relaxed">"{bodyAnalysis.advice}"</p>
                </div>

                <button 
                    onClick={() => { setShowAnalysis(false); nextStep(); }}
                    className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl text-sm uppercase tracking-wider active:scale-95 transition-all"
                >
                    Đã hiểu, tiếp tục
                </button>
            </div>
        </div>
      )
  }

  return (
    <div className="flex flex-col h-full bg-[#FAFBFA] overflow-hidden">
      
      {/* 1. HEADER (Fixed) */}
      <div className="shrink-0 pt-4 pb-1 px-6">
         {step > 1 && step < 6 && (
            <div className="flex gap-1.5 justify-center mb-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'bg-emerald-600 w-8' : 'bg-gray-200 w-2.5'}`} />
                ))}
            </div>
         )}
         
         <div className="text-center space-y-1 min-h-[36px]">
            {step === 1 && <h1 className="text-2xl font-black text-emerald-950 tracking-tighter">Chào bạn mới!</h1>}
            {step === 2 && <h2 className="text-xl font-black text-emerald-950">Mục tiêu chính?</h2>}
            {step === 3 && <h2 className="text-xl font-black text-emerald-950">Chỉ số cơ thể</h2>}
            {step === 4 && <h2 className="text-xl font-black text-emerald-950">Bạn ở vùng nào?</h2>}
            {step === 5 && <h2 className="text-xl font-black text-emerald-950">Sở thích & Lưu ý?</h2>}
            {step === 6 && <h2 className="text-xl font-black text-emerald-950">Hồ sơ dinh dưỡng</h2>}
         </div>
      </div>

      {/* 2. BODY (Flexible & Centered) - No Scroll on content steps */}
      <div className="flex-1 px-6 py-2 flex flex-col justify-center min-h-0 overflow-hidden">
            
            {step === 1 && (
                <div className="w-full flex flex-col items-center gap-6">
                    <div className="relative w-36 h-36">
                        <div className="w-full h-full bg-[#b6e3f4] rounded-full flex items-center justify-center shadow-xl border-[6px] border-white overflow-hidden">
                            <img src={MASCOT_URL} alt="Fomi" className="w-full h-full object-cover transform scale-125 translate-y-3" />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-2 rounded-full border-4 border-[#FAFBFA] animate-bounce">
                            <Sparkles size={20} />
                        </div>
                    </div>
                    <div className="w-full">
                         <input 
                            type="text" 
                            placeholder="Nhập tên của bạn..." 
                            className="w-full bg-white border-2 border-emerald-50 rounded-[24px] px-6 py-4 text-center text-lg font-black focus:border-emerald-500 outline-none shadow-sm transition-all text-emerald-950 placeholder:text-gray-300"
                            onChange={(e) => setData({ ...data, name: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && data.name && nextStep()}
                        />
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="w-full grid gap-3">
                    {['Giảm cân', 'Giữ dáng', 'Tăng cơ'].map((g) => (
                    <button
                        key={g}
                        onClick={() => { setData({ ...data, goal: g as any }); nextStep(); }}
                        className="w-full p-5 bg-white border border-emerald-50 rounded-[24px] text-left hover:border-emerald-500 transition-all shadow-sm flex items-center justify-between group active:scale-[0.98]"
                    >
                        <span className="text-lg font-black text-emerald-950">{g}</span>
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                             <ChevronRight size={20} />
                        </div>
                    </button>
                    ))}
                </div>
            )}

            {step === 3 && (
                 <div className="w-full">
                {!useBodyData ? (
                    <button 
                        onClick={() => setUseBodyData(true)}
                        className="w-full p-8 bg-white border border-emerald-50 rounded-[32px] text-center space-y-3 shadow-sm hover:border-emerald-500 transition-all group"
                    >
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[24px] mx-auto flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><Scale size={32} /></div>
                        <div>
                            <p className="text-lg font-black text-emerald-950">Nhập chỉ số</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Để Fomi tư vấn chi tiết</p>
                        </div>
                    </button>
                ) : (
                    <div className="w-full bg-white p-5 rounded-[28px] border border-emerald-50 shadow-sm space-y-3">
                        <div className="flex gap-2">
                             {['Nam', 'Nữ'].map(g => (
                                <button 
                                   key={g}
                                   onClick={() => setData({...data, gender: g as any})}
                                   className={`flex-1 py-3 rounded-xl font-black text-sm border transition-all ${data.gender === g ? 'bg-emerald-950 border-emerald-950 text-white' : 'bg-white border-emerald-50 text-gray-300'}`}
                                >
                                   {g}
                                </button>
                             ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                             <div className="space-y-1">
                                 <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Tuổi</label>
                                 <input type="number" placeholder="25" onChange={(e) => setData({...data, age: parseInt(e.target.value)})} className="w-full bg-gray-50 rounded-xl px-4 py-3 font-black text-emerald-950 outline-none focus:bg-white border border-transparent focus:border-emerald-500" />
                             </div>
                             <div className="space-y-1">
                                 <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Cao (cm)</label>
                                 <input type="number" placeholder="170" onChange={(e) => setData({...data, height: parseInt(e.target.value)})} className="w-full bg-gray-50 rounded-xl px-4 py-3 font-black text-emerald-950 outline-none focus:bg-white border border-transparent focus:border-emerald-500" />
                             </div>
                        </div>
                        <div className="space-y-1">
                             <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Nặng (kg)</label>
                             <input type="number" placeholder="60" onChange={(e) => setData({...data, weight: parseInt(e.target.value)})} className="w-full bg-gray-50 rounded-xl px-4 py-3 font-black text-emerald-950 outline-none focus:bg-white border border-transparent focus:border-emerald-500" />
                        </div>
                        <div className="space-y-1">
                             <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Vận động</label>
                             <select onChange={(e) => setData({...data, activityLevel: e.target.value as any})} className="w-full bg-gray-50 rounded-xl px-4 py-3 font-black text-emerald-950 text-xs outline-none focus:bg-white border border-transparent focus:border-emerald-500 appearance-none">
                                {activityLevels.map(a => <option key={a.id} value={a.id}>{a.id}</option>)}
                             </select>
                        </div>
                    </div>
                )}
                </div>
            )}

            {step === 4 && (
                <div className="w-full grid gap-3">
                 {[Region.NORTH, Region.CENTRAL, Region.SOUTH].map((r) => (
                   <button
                     key={r}
                     onClick={() => { setData({ ...data, region: r }); nextStep(); }}
                     className={`w-full p-5 rounded-[24px] text-left border transition-all flex items-center justify-between active:scale-[0.98] ${
                       data.region === r ? 'border-emerald-500 bg-white shadow-md' : 'border-white bg-white/80 hover:bg-white'
                     }`}
                   >
                     <span className="text-lg font-black text-emerald-950">Miền {r}</span>
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${data.region === r ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-50 text-gray-300'}`}>
                        <MapPin size={20} />
                     </div>
                   </button>
                 ))}
               </div>
            )}

            {step === 5 && (
                <div className="w-full h-full flex flex-col gap-2 overflow-hidden">
                    {/* Panel 1: Preferences - Shrinkable but robust */}
                    <div className="flex flex-col gap-1.5 shrink-0 bg-white p-3 rounded-[24px] border border-gray-50 shadow-sm">
                        <div className="flex justify-between items-center">
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Món chính</p>
                             <div className="flex gap-1.5">
                                 <input 
                                    type="text"
                                    value={customInputs.preferences}
                                    onChange={(e) => setCustomInputs({...customInputs, preferences: e.target.value})}
                                    onKeyDown={(e) => e.key === 'Enter' && addCustomItem('preferences')}
                                    placeholder="+ Thêm..."
                                    className="w-20 bg-gray-50 rounded-lg px-2 py-1 text-[10px] outline-none"
                                 />
                                 <button onClick={() => addCustomItem('preferences')} className="bg-emerald-50 text-emerald-600 rounded-lg p-1"><Plus size={12}/></button>
                             </div>
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {tasteGroups[0].items.map((item) => (
                                <button
                                key={item.id}
                                onClick={() => toggleList('preferences', item.id)}
                                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-[16px] text-[9px] font-black border transition-all shrink-0 w-16 h-16 ${
                                    data.preferences?.includes(item.id) ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-gray-50 border-transparent text-gray-400'
                                }`}
                                >
                                <div className="scale-100">{item.icon}</div>
                                <span className="truncate w-full text-center">{item.label}</span>
                                </button>
                            ))}
                        </div>
                        {/* Selected Chips */}
                         <div className="flex flex-wrap gap-1 max-h-[40px] overflow-y-auto">
                             {data.preferences?.filter(p => !tasteGroups[0].items.some(i => i.id === p)).map(p => (
                                 <span key={p} className="bg-emerald-100 text-emerald-900 text-[9px] px-2 py-0.5 rounded-md flex items-center gap-1 font-bold">
                                     {p} <button onClick={() => removeCustomItem('preferences', p)}><X size={10} /></button>
                                 </span>
                             ))}
                        </div>
                    </div>
                    
                    {/* Panel 2: Flavors */}
                    <div className="flex flex-col gap-1.5 shrink-0 bg-white p-3 rounded-[24px] border border-gray-50 shadow-sm">
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Khẩu vị</p>
                            <div className="flex gap-1.5">
                                 <input 
                                    type="text"
                                    value={customInputs.flavors}
                                    onChange={(e) => setCustomInputs({...customInputs, flavors: e.target.value})}
                                    onKeyDown={(e) => e.key === 'Enter' && addCustomItem('flavors')}
                                    placeholder="+ Thêm..."
                                    className="w-20 bg-gray-50 rounded-lg px-2 py-1 text-[10px] outline-none"
                                 />
                                 <button onClick={() => addCustomItem('flavors')} className="bg-emerald-50 text-emerald-600 rounded-lg p-1"><Plus size={12}/></button>
                             </div>
                        </div>
                        <div className="flex gap-2">
                            {flavorProfiles.map((f) => (
                            <button
                                key={f.id}
                                onClick={() => toggleList('flavors', f.id)}
                                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black border transition-all ${
                                data.flavors?.includes(f.id) ? 'bg-emerald-950 border-emerald-950 text-white' : 'bg-gray-50 border-transparent text-gray-400'
                                }`}
                            >
                                {f.label}
                            </button>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-1 max-h-[40px] overflow-y-auto">
                             {data.flavors?.filter(f => !flavorProfiles.some(fp => fp.id === f)).map(f => (
                                 <span key={f} className="bg-emerald-100 text-emerald-900 text-[9px] px-2 py-0.5 rounded-md flex items-center gap-1 font-bold">
                                     {f} <button onClick={() => removeCustomItem('flavors', f)}><X size={10} /></button>
                                 </span>
                             ))}
                        </div>
                    </div>

                    {/* Panel 3: Allergies - Takes remaining space */}
                    <div className="flex-1 min-h-0 bg-white p-3 rounded-[24px] border border-red-50 shadow-sm flex flex-col gap-1.5">
                         <div className="flex justify-between items-center">
                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1">
                                <AlertOctagon size={12} /> Dị ứng
                            </p>
                             <div className="flex gap-1.5">
                                 <input 
                                    type="text"
                                    value={customInputs.allergies}
                                    onChange={(e) => setCustomInputs({...customInputs, allergies: e.target.value})}
                                    onKeyDown={(e) => e.key === 'Enter' && addCustomItem('allergies')}
                                    placeholder="+ Khác..."
                                    className="w-20 bg-red-50 rounded-lg px-2 py-1 text-[10px] outline-none placeholder:text-red-300 text-red-900"
                                 />
                                 <button onClick={() => addCustomItem('allergies')} className="bg-red-50 text-red-500 rounded-lg p-1"><Plus size={12}/></button>
                             </div>
                         </div>
                         <div className="flex-1 overflow-y-auto content-start flex flex-wrap gap-2">
                            {allergyOptions.map((a) => (
                                <button
                                    key={a.id}
                                    onClick={() => toggleList('allergies', a.id)}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all h-fit ${
                                        data.allergies?.includes(a.id) ? 'bg-red-50 text-red-500 border-red-200' : 'bg-gray-50 border-transparent text-gray-400'
                                    }`}
                                >
                                    {a.label}
                                </button>
                            ))}
                            {data.allergies?.filter(a => !allergyOptions.some(ao => ao.id === a)).map(a => (
                                 <span key={a} className="bg-red-100 text-red-900 text-[10px] px-2 py-1.5 rounded-full flex items-center gap-1 font-bold h-fit border border-red-200">
                                     {a} <button onClick={() => removeCustomItem('allergies', a)}><X size={10} /></button>
                                 </span>
                             ))}
                         </div>
                    </div>
                </div>
            )}

            {step === 6 && (
                <div className="w-full h-full flex flex-col gap-3 overflow-hidden">
                    {/* SCIFI CARD - Flex Grow to fill space but allow content to scroll internally if huge */}
                    <div className="flex-1 bg-[#022c22] rounded-[32px] p-5 text-white shadow-2xl relative overflow-hidden border border-emerald-800 flex flex-col min-h-0">
                        {/* Background Effects */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-10 translate-x-10 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-900/40 rounded-full blur-2xl translate-y-10 -translate-x-10 pointer-events-none" />
                        
                        <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar">
                             <div className="flex justify-between items-start mb-4">
                                 <div>
                                     <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                                         <Dna size={12} /> Fomi AI Plan
                                     </div>
                                     <h3 className="text-3xl font-black tracking-tight text-white leading-none">
                                         {useBodyData ? calorieGoal.toLocaleString() : "2,000"} <span className="text-base font-bold text-emerald-400">Kcal</span>
                                     </h3>
                                 </div>
                                 <div className="w-10 h-10 bg-emerald-900/50 rounded-2xl border border-emerald-700/50 flex items-center justify-center">
                                     <Fingerprint size={20} className="text-emerald-400 opacity-80" />
                                 </div>
                             </div>

                             {/* Macro Grid */}
                             <div className="grid grid-cols-3 gap-2 mb-4">
                                 <div className="bg-emerald-900/40 border border-emerald-800/50 p-2.5 rounded-2xl backdrop-blur-sm">
                                     <p className="text-[8px] text-emerald-300 font-bold uppercase mb-1">Protein</p>
                                     <div className="h-1 w-full bg-emerald-950 rounded-full mb-1">
                                         <div className="h-full bg-emerald-400 rounded-full w-[30%]"></div>
                                     </div>
                                     <p className="text-[10px] font-mono font-bold">{recs.macro.p}%</p>
                                 </div>
                                 <div className="bg-emerald-900/40 border border-emerald-800/50 p-2.5 rounded-2xl backdrop-blur-sm">
                                     <p className="text-[8px] text-emerald-300 font-bold uppercase mb-1">Fats</p>
                                     <div className="h-1 w-full bg-emerald-950 rounded-full mb-1">
                                         <div className="h-full bg-emerald-400 rounded-full w-[30%]"></div>
                                     </div>
                                     <p className="text-[10px] font-mono font-bold">{recs.macro.f}%</p>
                                 </div>
                                 <div className="bg-emerald-900/40 border border-emerald-800/50 p-2.5 rounded-2xl backdrop-blur-sm">
                                     <p className="text-[8px] text-emerald-300 font-bold uppercase mb-1">Carbs</p>
                                     <div className="h-1 w-full bg-emerald-950 rounded-full mb-1">
                                         <div className="h-full bg-emerald-400 rounded-full w-[40%]"></div>
                                     </div>
                                     <p className="text-[10px] font-mono font-bold">{recs.macro.c}%</p>
                                 </div>
                             </div>
                             
                             {/* Meal Timeline */}
                             <div className="space-y-2 border-t border-emerald-800/50 pt-3">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Phân bổ</p>
                                <div className="flex gap-0.5 h-6 w-full">
                                    <div className="h-full bg-emerald-500 rounded-l-md flex items-center justify-center text-[9px] font-bold w-[25%] shadow-[0_0_15px_rgba(16,185,129,0.3)]">Sáng</div>
                                    <div className="h-full bg-emerald-600 flex items-center justify-center text-[9px] font-bold w-[40%] opacity-90">Trưa</div>
                                    <div className="h-full bg-emerald-800 rounded-r-md flex items-center justify-center text-[9px] font-bold w-[35%] opacity-80">Tối</div>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Scientific Suggestions - Shrinkable */}
                    <div className="shrink-0 space-y-1.5 pb-2">
                        <div className="flex items-center justify-between px-1">
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                 <ScanLine size={12} /> Recommended
                             </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                             {recs.foods.slice(0, 4).map((food, i) => (
                                 <div key={i} className="bg-white border border-gray-100 p-2 rounded-xl flex items-center gap-2 shadow-sm">
                                     <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
                                     <span className="text-[10px] font-bold text-emerald-900">{food}</span>
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            )}
      </div>

      {/* 3. FOOTER (Fixed) */}
      <div className="shrink-0 p-5 bg-white border-t border-gray-50 z-20">
         {step === 1 && (
             <button 
                disabled={!data.name}
                onClick={nextStep}
                className="w-full bg-emerald-600 text-white font-black py-4 rounded-[24px] shadow-xl shadow-emerald-200 disabled:opacity-40 transition-all active:scale-95 text-sm uppercase tracking-widest"
             >
                Bắt đầu ngay
             </button>
         )}

         {(step === 2 || step === 4) && (
             <button onClick={prevStep} className="w-full text-center py-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-emerald-600">Quay lại</button>
         )}

         {step === 3 && (
             <div className="flex gap-3">
                 <button onClick={() => setUseBodyData(false)} className="w-14 h-14 bg-white border border-emerald-50 rounded-[20px] flex items-center justify-center text-emerald-950 hover:bg-emerald-50"><ChevronLeft size={24} /></button>
                 {!useBodyData ? (
                      <button 
                      onClick={() => { setUseBodyData(false); nextStep(); }}
                      className="flex-1 bg-gray-100 text-gray-400 font-black rounded-[20px] text-xs uppercase tracking-widest active:scale-95 transition-all"
                   >
                      Bỏ qua
                   </button>
                 ) : (
                    <button 
                    disabled={!data.age || !data.height || !data.weight}
                    onClick={() => setShowAnalysis(true)} 
                    className="flex-1 bg-emerald-600 text-white font-black rounded-[20px] flex items-center justify-center gap-2 disabled:opacity-50 text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                 >
                    Phân tích <Activity size={16} />
                 </button>
                 )}
            </div>
         )}

         {step === 5 && (
             <div className="flex gap-3">
                <button onClick={prevStep} className="w-14 h-14 bg-white border border-emerald-50 rounded-[20px] flex items-center justify-center text-emerald-950 hover:bg-emerald-50"><ChevronLeft size={24} /></button>
                <button onClick={nextStep} className="flex-1 bg-emerald-600 text-white font-black rounded-[20px] flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                    Hoàn tất <CheckCircle2 size={18} />
                </button>
            </div>
         )}

         {step === 6 && (
             <button 
                 onClick={handleFinish}
                 className="w-full py-4 bg-emerald-950 text-white font-black rounded-[28px] shadow-2xl shadow-emerald-900/30 flex items-center justify-center gap-2 text-sm uppercase tracking-widest active:scale-95 transition-all"
             >
                 Khởi động Fomi <Sparkles size={18} />
             </button>
         )}
      </div>

    </div>
  );
};

export default Onboarding;
