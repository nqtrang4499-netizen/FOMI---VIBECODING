
import React, { useState } from 'react';
import { UserProfile, Region } from '../types';
import { ChefHat, MapPin, Target, Flame, ChevronRight, ChevronLeft, UtensilsCrossed, Sparkles, Fish, Drumstick, Soup, Wheat, Leaf } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const tasteGroups = [
  {
    title: "Sở thích món chính",
    description: "Chọn loại đạm bạn thường ăn nhất",
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
    title: "Thói quen tinh bột",
    description: "Bạn thường chọn món nào hơn?",
    key: "starch",
    items: [
      { id: 'rice', label: 'Cơm trắng', icon: <Wheat size={14} /> },
      { id: 'noodle', label: 'Bún/Phở', icon: <Soup size={14} /> },
      { id: 'bread', label: 'Bánh mì', icon: <Wheat size={14} /> },
      { id: 'lowcarb', label: 'Hạn chế', icon: <Sparkles size={14} /> },
    ]
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<UserProfile>>({
    region: Region.SOUTH,
    isLactoseIntolerant: false,
    preferences: [],
    goal: 'Giữ dáng'
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const togglePreference = (prefId: string) => {
    const currentPrefs = data.preferences || [];
    if (currentPrefs.includes(prefId)) {
      setData({ ...data, preferences: currentPrefs.filter(p => p !== prefId) });
    } else {
      setData({ ...data, preferences: [...currentPrefs, prefId] });
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-emerald-50/30 flex flex-col p-8 items-center justify-center">
      {step > 1 && (
        <div className="w-full max-w-xs mb-8 flex gap-2">
          {[1, 2, 3, 4].map((i) => (
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
        <div className="w-full space-y-8 animate-in slide-in-from-right duration-500">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-emerald-900">
              <MapPin size={28} />
              <h2 className="text-2xl font-bold tracking-tight">Bạn ở vùng nào?</h2>
            </div>
            <p className="text-gray-500 text-sm font-medium">Gợi ý món ăn đúng chuẩn vị quê nhà cho bạn.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {[Region.NORTH, Region.CENTRAL, Region.SOUTH].map((r) => (
              <button
                key={r}
                onClick={() => setData({ ...data, region: r })}
                className={`w-full p-6 rounded-3xl text-left border-2 transition-all relative overflow-hidden ${
                  data.region === r 
                  ? 'border-emerald-500 bg-white text-emerald-900 shadow-md scale-[1.02]' 
                  : 'border-white bg-white text-gray-500 shadow-sm opacity-80'
                }`}
              >
                {data.region === r && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-500 rounded-full"></div>}
                <span className={`block text-[10px] font-semibold uppercase tracking-widest ${data.region === r ? 'text-emerald-500' : 'text-gray-400'}`}>Hương vị miền</span>
                <span className="text-xl font-bold">{r}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button onClick={prevStep} className="flex-1 bg-white text-emerald-900 font-bold py-4 rounded-2xl border border-emerald-100 flex items-center justify-center active:scale-95 transition-all">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextStep} className="flex-[3] bg-emerald-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-100">
              Tiếp theo <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="w-full space-y-6 animate-in slide-in-from-right duration-500">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-emerald-900">
              <UtensilsCrossed size={28} />
              <h2 className="text-2xl font-bold tracking-tight">Khẩu vị của bạn</h2>
            </div>
          </div>

          <div className="space-y-8">
            {tasteGroups.map((group) => (
              <div key={group.key} className="space-y-3">
                <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-widest">{group.title}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => togglePreference(item.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold border-2 transition-all ${
                        data.preferences?.includes(item.id)
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                        : 'bg-white border-white text-gray-500 shadow-sm'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={prevStep} className="flex-1 bg-white text-emerald-900 font-bold py-4 rounded-2xl border border-emerald-100 flex items-center justify-center active:scale-95 transition-all">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextStep} className="flex-[3] bg-emerald-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
              Tiếp tục <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="w-full space-y-8 animate-in slide-in-from-right duration-500">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-emerald-900">
              <Target size={28} />
              <h2 className="text-2xl font-bold tracking-tight">Mục tiêu sức khỏe</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {['Giảm cân', 'Giữ dáng', 'Tăng cơ'].map((g) => (
              <button
                key={g}
                onClick={() => setData({ ...data, goal: g as any })}
                className={`w-full p-6 rounded-3xl text-left border-2 transition-all relative ${
                  data.goal === g 
                  ? 'border-emerald-500 bg-white text-emerald-900 shadow-md scale-[1.02]' 
                  : 'border-white bg-white text-gray-500 shadow-sm opacity-80'
                }`}
              >
                <span className="text-xl font-bold">{g}</span>
                {data.goal === g && <Sparkles className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />}
              </button>
            ))}
          </div>

          <div className="flex gap-4 pt-2">
             <button onClick={prevStep} className="flex-1 bg-white text-emerald-900 font-bold py-4 rounded-2xl border border-emerald-100 flex items-center justify-center active:scale-95 transition-all">
               <ChevronLeft size={20} />
             </button>
             <button 
               onClick={() => onComplete(data as UserProfile)}
               className="flex-[3] bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
             >
               Vào xem món ăn <Sparkles size={20} />
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
