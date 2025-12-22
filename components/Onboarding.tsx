
import React, { useState, useMemo } from 'react';
import { UserProfile, Region } from '../types';
import { ChefHat, MapPin, Target, Flame, ChevronRight, ChevronLeft, UtensilsCrossed, Sparkles, Fish, Drumstick, Soup, Wheat, Leaf, Candy, Droplets, AlertCircle, Scale, Ruler, User } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const tasteGroups = [
  {
    title: "Món chính ưu tiên",
    description: "Bạn thường đi chợ mua gì nhất?",
    key: "protein",
    items: [
      { id: 'beef', label: 'Thịt bò', icon: <Flame size={14} /> },
      { id: 'pork', label: 'Thịt heo', icon: <Drumstick size={14} /> },
      { id: 'seafood', label: 'Hải sản', icon: <Fish size={14} /> },
      { id: 'poultry', label: 'Gà/Vịt', icon: <Drumstick size={14} /> },
      { id: 'tofu', label: 'Đồ chay', icon: <Leaf size={14} /> },
    ]
  },
  {
    title: "Kiểu tinh bột",
    key: "starch",
    items: [
      { id: 'rice', label: 'Cơm', icon: <Wheat size={14} /> },
      { id: 'noodle', label: 'Bún/Phở', icon: <Soup size={14} /> },
      { id: 'bread', label: 'Bánh mì', icon: <Wheat size={14} /> },
    ]
  }
];

const flavorProfiles = [
  { id: 'spicy', label: 'Ăn cay', icon: <Flame size={14} className="text-red-500" /> },
  { id: 'sweet', label: 'Hơi ngọt', icon: <Candy size={14} className="text-pink-400" /> },
  { id: 'salty', label: 'Đậm đà', icon: <Droplets size={14} className="text-blue-400" /> },
  { id: 'sour', label: 'Vị chua', icon: <Droplets size={14} className="text-yellow-500" /> },
  { id: 'light', label: 'Ăn thanh đạm', icon: <Leaf size={14} className="text-green-400" /> },
];

const activityLevels = [
  { id: 'Ít vận động', label: 'Ít vận động', multiplier: 1.2, desc: 'Văn phòng, ít tập thể dục' },
  { id: 'Vận động nhẹ', label: 'Vận động nhẹ', multiplier: 1.375, desc: 'Tập thể dục 1-3 lần/tuần' },
  { id: 'Vận động vừa', label: 'Vận động vừa', multiplier: 1.55, desc: 'Tập thể dục 3-5 lần/tuần' },
  { id: 'Vận động mạnh', label: 'Vận động mạnh', multiplier: 1.725, desc: 'Tập cường độ cao hàng ngày' },
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [useBodyData, setUseBodyData] = useState(false);
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

  const calculateCalorieGoal = () => {
    if (!useBodyData || !data.weight || !data.height || !data.age) {
      return 2000; // Mặc định nếu không nhập liệu
    }

    // Mifflin-St Jeor Equation
    let bmr = (10 * data.weight) + (6.25 * data.height) - (5 * data.age);
    if (data.gender === 'Nam') bmr += 5;
    else bmr -= 161;

    const multiplier = activityLevels.find(a => a.id === data.activityLevel)?.multiplier || 1.2;
    let tdee = bmr * multiplier;

    if (data.goal === 'Giảm cân') tdee -= 500;
    else if (data.goal === 'Tăng cơ') tdee += 300;

    return Math.round(tdee);
  };

  const handleFinish = () => {
    const calorieGoal = calculateCalorieGoal();
    onComplete({ ...data, calorieGoal } as UserProfile);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-emerald-50/30 flex flex-col p-8 items-center justify-center overflow-y-auto">
      {step > 1 && (
        <div className="w-full max-w-xs mb-8 flex gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-emerald-600' : 'bg-emerald-200'}`} 
            />
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="w-full text-center space-y-6 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-emerald-100">
            <ChefHat size={48} color="white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-emerald-900 tracking-tight">Fomi</h1>
            <p className="text-emerald-600 font-medium italic">Khỏe hơn mỗi ngày</p>
          </div>
          <div className="pt-8 space-y-4">
            <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest">Tên bạn là gì nhỉ?</p>
            <input 
              type="text" 
              placeholder="Vd: Nguyễn Văn A" 
              className="w-full bg-white border-2 border-emerald-100 rounded-2xl px-6 py-4 text-center text-lg font-bold focus:border-emerald-500 outline-none transition-all shadow-sm"
              onChange={(e) => setData({ ...data, name: e.target.value })}
            />
          </div>
          <button 
            disabled={!data.name}
            onClick={nextStep}
            className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50 transition-all active:scale-95"
          >
            Bắt đầu khám phá
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="w-full space-y-6 animate-in slide-in-from-right duration-500">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-emerald-900">
              <Scale size={28} />
              <h2 className="text-2xl font-bold tracking-tight">Cá nhân hóa mục tiêu</h2>
            </div>
            <p className="text-gray-500 text-sm font-medium">Bạn có muốn nhập dữ liệu cơ thể để Fomi tính toán lượng Calo chính xác nhất?</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => { setUseBodyData(true); nextStep(); }}
              className="w-full p-6 bg-white border-2 border-emerald-100 rounded-[32px] text-left hover:border-emerald-500 transition-all shadow-sm group"
            >
              <h4 className="font-bold text-emerald-900 flex items-center justify-between">
                Có, tính Calo cho tôi <ChevronRight size={18} className="text-emerald-300 group-hover:translate-x-1 transition-transform" />
              </h4>
              <p className="text-xs text-gray-400 mt-1">Dựa trên cân nặng, chiều cao, độ tuổi...</p>
            </button>
            <button 
              onClick={() => { setUseBodyData(false); setStep(4); }}
              className="w-full p-6 bg-emerald-50/50 border-2 border-emerald-50 rounded-[32px] text-left opacity-70"
            >
              <h4 className="font-bold text-gray-500">Bỏ qua</h4>
              <p className="text-xs text-gray-400 mt-1">Sử dụng mục tiêu mặc định (2000 Kcal/ngày)</p>
            </button>
          </div>
          
          <button onClick={prevStep} className="w-full py-4 text-emerald-600 font-bold text-sm">Quay lại</button>
        </div>
      )}

      {step === 3 && (
        <div className="w-full space-y-6 animate-in slide-in-from-right duration-500">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-emerald-900">Thông số cơ thể</h2>
            <p className="text-sm text-gray-500">Thông tin này giúp Fomi biết bạn cần bao nhiêu năng lượng.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
               <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Giới tính</label>
               <div className="flex gap-2">
                  {['Nam', 'Nữ'].map(g => (
                    <button 
                      key={g}
                      onClick={() => setData({...data, gender: g as any})}
                      className={`flex-1 py-3 rounded-2xl font-bold border-2 transition-all ${data.gender === g ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-emerald-50 text-gray-400'}`}
                    >
                      {g}
                    </button>
                  ))}
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Tuổi</label>
              <input 
                type="number" 
                value={data.age || ''}
                onChange={(e) => setData({...data, age: parseInt(e.target.value)})}
                className="w-full bg-white border-2 border-emerald-50 rounded-2xl px-4 py-3 font-bold text-emerald-900 outline-none focus:border-emerald-500"
                placeholder="25"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Chiều cao (cm)</label>
              <input 
                type="number" 
                value={data.height || ''}
                onChange={(e) => setData({...data, height: parseInt(e.target.value)})}
                className="w-full bg-white border-2 border-emerald-50 rounded-2xl px-4 py-3 font-bold text-emerald-900 outline-none focus:border-emerald-500"
                placeholder="170"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Cân nặng (kg)</label>
              <input 
                type="number" 
                value={data.weight || ''}
                onChange={(e) => setData({...data, weight: parseInt(e.target.value)})}
                className="w-full bg-white border-2 border-emerald-50 rounded-2xl px-4 py-3 font-bold text-emerald-900 outline-none focus:border-emerald-500"
                placeholder="65"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Mức độ vận động</label>
              <select 
                value={data.activityLevel}
                onChange={(e) => setData({...data, activityLevel: e.target.value as any})}
                className="w-full bg-white border-2 border-emerald-50 rounded-2xl px-4 py-3 font-bold text-emerald-900 outline-none focus:border-emerald-500 appearance-none"
              >
                {activityLevels.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={prevStep} className="flex-1 bg-white text-emerald-900 font-bold py-4 rounded-2xl border border-emerald-100 flex items-center justify-center"><ChevronLeft size={20} /></button>
            <button 
              disabled={!data.age || !data.height || !data.weight}
              onClick={nextStep} 
              className="flex-[3] bg-emerald-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Tiếp theo <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="w-full space-y-8 animate-in slide-in-from-right duration-500">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-emerald-900">
              <MapPin size={28} />
              <h2 className="text-2xl font-bold tracking-tight">Bạn ở vùng nào?</h2>
            </div>
            <p className="text-gray-500 text-sm font-medium">Gợi ý món ăn đúng chuẩn vị quê nhà cho bạn.</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {[Region.NORTH, Region.CENTRAL, Region.SOUTH].map((r) => (
              <button
                key={r}
                onClick={() => setData({ ...data, region: r })}
                className={`w-full p-5 rounded-3xl text-left border-2 transition-all relative ${
                  data.region === r ? 'border-emerald-500 bg-white shadow-md' : 'border-white bg-white opacity-80'
                }`}
              >
                <span className="text-lg font-bold text-emerald-900">{r}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-4">
            <button onClick={() => setStep(useBodyData ? 3 : 2)} className="flex-1 bg-white text-emerald-900 font-bold py-4 rounded-2xl border border-emerald-100 flex items-center justify-center"><ChevronLeft size={20} /></button>
            <button onClick={nextStep} className="flex-[3] bg-emerald-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2">Tiếp theo <ChevronRight size={20} /></button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="w-full space-y-6 animate-in slide-in-from-right duration-500">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-emerald-900">
              <UtensilsCrossed size={28} />
              <h2 className="text-2xl font-bold tracking-tight">Nguyên liệu & Gu vị</h2>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-widest">Món chính ưu tiên</h3>
            <div className="grid grid-cols-3 gap-2">
              {tasteGroups[0].items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleList('preferences', item.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl text-[10px] font-bold border-2 transition-all ${
                    data.preferences?.includes(item.id) ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white border-white text-gray-500 shadow-sm'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${data.preferences?.includes(item.id) ? 'bg-white/20' : 'bg-emerald-50'}`}>{item.icon}</div>
                  {item.label}
                </button>
              ))}
            </div>

            <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-widest">Gu thưởng thức</h3>
            <div className="grid grid-cols-2 gap-2">
              {flavorProfiles.map((f) => (
                <button
                  key={f.id}
                  onClick={() => toggleList('flavors', f.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl text-xs font-bold border-2 transition-all ${
                    data.flavors?.includes(f.id) ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white border-white text-gray-500'
                  }`}
                >
                  {f.icon} {f.label}
                </button>
              ))}
            </div>

            <div className="bg-white p-4 rounded-3xl shadow-sm border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <AlertCircle size={20} className="text-orange-400" />
                 <span className="text-xs font-bold text-gray-700">Dị ứng sữa/Lactose?</span>
              </div>
              <button 
                onClick={() => setData({ ...data, isLactoseIntolerant: !data.isLactoseIntolerant })}
                className={`w-10 h-5 rounded-full transition-all relative ${data.isLactoseIntolerant ? 'bg-emerald-500' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${data.isLactoseIntolerant ? 'left-5.5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={prevStep} className="flex-1 bg-white text-emerald-900 font-bold py-4 rounded-2xl border border-emerald-100 flex items-center justify-center"><ChevronLeft size={20} /></button>
            <button onClick={nextStep} className="flex-[3] bg-emerald-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2">Tiếp theo <ChevronRight size={20} /></button>
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="w-full space-y-8 animate-in slide-in-from-right duration-500">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-emerald-900">
              <Target size={28} />
              <h2 className="text-2xl font-bold tracking-tight">Mục tiêu của bạn</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {['Giảm cân', 'Giữ dáng', 'Tăng cơ'].map((g) => (
              <button
                key={g}
                onClick={() => setData({ ...data, goal: g as any })}
                className={`w-full p-6 rounded-3xl text-left border-2 transition-all ${
                  data.goal === g ? 'border-emerald-500 bg-white shadow-md' : 'border-white bg-white opacity-80 text-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">{g}</span>
                  {data.goal === g && <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white"><ChevronRight size={14} /></div>}
                </div>
              </button>
            ))}
          </div>

          {/* Calorie Preview if body data is present */}
          {useBodyData && (
             <div className="bg-emerald-900 text-white p-6 rounded-[32px] animate-in zoom-in">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest text-center">Mục tiêu Calo ước tính của bạn</p>
                <p className="text-4xl font-black text-center mt-2">{calculateCalorieGoal()} <span className="text-lg font-medium opacity-50">Kcal/ngày</span></p>
             </div>
          )}

          <div className="flex gap-4">
             <button onClick={prevStep} className="flex-1 bg-white text-emerald-900 font-bold py-4 rounded-2xl border border-emerald-100 flex items-center justify-center"><ChevronLeft size={20} /></button>
             <button 
               onClick={handleFinish}
               className="flex-[3] bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
             >
               Vào bếp thôi! <Sparkles size={20} />
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
