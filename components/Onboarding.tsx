
import React, { useState } from 'react';
import { UserProfile, Region } from '../types';
import { ChefHat, MapPin, Target, Flame, ChevronRight, ChevronLeft, UtensilsCrossed, Sparkles } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const mainComponents = [
  { id: 'beef', label: 'Thịt bò' },
  { id: 'chicken', label: 'Thịt gà' },
  { id: 'pork', label: 'Thịt heo' },
  { id: 'seafood', label: 'Hải sản' },
  { id: 'tofu', label: 'Đậu hũ/Chay' },
  { id: 'egg', label: 'Trứng' },
  { id: 'rice', label: 'Cơm/Tinh bột' },
  { id: 'noodle', label: 'Bún/Phở' },
];

const additionalComponents = [
  { id: 'veggies', label: 'Nhiều rau' },
  { id: 'spicy', label: 'Ăn cay' },
  { id: 'herbs', label: 'Rau thơm' },
  { id: 'garlic', label: 'Hành tỏi' },
  { id: 'sour', label: 'Vị chua' },
  { id: 'sweet', label: 'Vị ngọt' },
  { id: 'fermented', label: 'Mắm/Đồ muối' },
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
    <div className="max-w-md mx-auto min-h-screen bg-orange-50 flex flex-col p-8 items-center justify-center">
      {/* Progress Indicator */}
      {step > 1 && (
        <div className="w-full max-w-xs mb-8 flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-orange-500' : 'bg-orange-200'}`} 
            />
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="w-full text-center space-y-6 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-orange-500 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-orange-200">
            <ChefHat size={48} color="white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-orange-900">Fomi.</h1>
            <p className="text-orange-600 font-medium italic">Healthy Thỏa Hiệp</p>
          </div>
          <div className="pt-8">
            <input 
              type="text" 
              placeholder="Tên của bạn là gì?" 
              className="w-full bg-white border-2 border-orange-100 rounded-2xl px-6 py-4 text-center text-lg font-bold focus:border-orange-500 outline-none transition-all"
              onChange={(e) => setData({ ...data, name: e.target.value })}
            />
          </div>
          <button 
            disabled={!data.name}
            onClick={nextStep}
            className="w-full bg-orange-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-200 hover:bg-orange-600 disabled:opacity-50 transition-all active:scale-95"
          >
            Bắt đầu hành trình
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="w-full space-y-8 animate-in slide-in-from-right duration-500">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-orange-900">
              <MapPin size={28} />
              <h2 className="text-2xl font-bold">Bạn ở đâu?</h2>
            </div>
            <p className="text-gray-500 text-sm">Fomi sẽ ưu tiên các món ăn theo hương vị đặc trưng vùng miền của bạn.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {[Region.NORTH, Region.CENTRAL, Region.SOUTH].map((r) => (
              <button
                key={r}
                onClick={() => setData({ ...data, region: r })}
                className={`w-full p-6 rounded-3xl text-left border-2 transition-all ${
                  data.region === r 
                  ? 'border-gray-400 bg-gray-200 text-gray-900 shadow-md scale-[1.02]' 
                  : 'border-white bg-white text-gray-700 shadow-sm'
                }`}
              >
                <span className={`block text-[10px] font-black uppercase tracking-widest ${data.region === r ? 'text-gray-500' : 'text-orange-400 opacity-60'}`}>Khẩu vị miền</span>
                <span className="text-xl font-bold">{r}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button onClick={prevStep} className="flex-1 bg-white text-orange-900 font-bold py-4 rounded-2xl border border-orange-100 flex items-center justify-center gap-2">
              <ChevronLeft size={20} /> Quay lại
            </button>
            <button onClick={nextStep} className="flex-[2] bg-orange-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2">
              Tiếp tục <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="w-full space-y-8 animate-in slide-in-from-right duration-500">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-orange-900">
              <UtensilsCrossed size={28} />
              <h2 className="text-2xl font-bold">Gu ăn uống</h2>
            </div>
            <p className="text-gray-500 text-sm">Chọn những thứ bạn thích ăn (hoặc không thể thiếu) trong bữa ăn.</p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-black text-orange-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                Thành phần chính
              </h3>
              <div className="flex flex-wrap gap-2">
                {mainComponents.map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => togglePreference(comp.id)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                      data.preferences?.includes(comp.id)
                      ? 'bg-gray-200 border-gray-400 text-gray-900'
                      : 'bg-white border-white text-gray-500'
                    }`}
                  >
                    {comp.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-orange-900 uppercase tracking-widest mb-3">
                Thành phần bổ sung
              </h3>
              <div className="flex flex-wrap gap-2">
                {additionalComponents.map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => togglePreference(comp.id)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                      data.preferences?.includes(comp.id)
                      ? 'bg-gray-200 border-gray-400 text-gray-900'
                      : 'bg-white border-white text-gray-500'
                    }`}
                  >
                    {comp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={prevStep} className="flex-1 bg-white text-orange-900 font-bold py-4 rounded-2xl border border-orange-100 flex items-center justify-center gap-2">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextStep} className="flex-[3] bg-orange-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2">
              Tiếp tục <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="w-full space-y-8 animate-in slide-in-from-right duration-500">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-orange-900">
              <Target size={28} />
              <h2 className="text-2xl font-bold">Mục tiêu sức khỏe</h2>
            </div>
            <p className="text-gray-500 text-sm">Fomi sẽ điều chỉnh lượng calo và dinh dưỡng dựa trên mục tiêu này.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {['Giảm cân', 'Giữ dáng', 'Tăng cơ'].map((g) => (
              <button
                key={g}
                onClick={() => setData({ ...data, goal: g as any })}
                className={`w-full p-6 rounded-3xl text-left border-2 transition-all ${
                  data.goal === g 
                  ? 'border-gray-400 bg-gray-200 text-gray-900 shadow-md scale-[1.02]' 
                  : 'border-white bg-white text-gray-700 shadow-sm'
                }`}
              >
                <span className="text-xl font-bold">{g}</span>
              </button>
            ))}
          </div>

          <div className="bg-white p-6 rounded-[28px] border border-orange-100 space-y-4 shadow-sm">
             <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-700 block">Dị ứng Lactose (sữa)?</span>
                  <span className="text-[10px] text-gray-400 font-medium">Lọc các món có thành phần từ sữa</span>
                </div>
                <button 
                  onClick={() => setData({ ...data, isLactoseIntolerant: !data.isLactoseIntolerant })}
                  className={`w-12 h-6 rounded-full transition-all relative ${data.isLactoseIntolerant ? 'bg-orange-500' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${data.isLactoseIntolerant ? 'right-1' : 'left-1'}`}></div>
                </button>
             </div>
          </div>

          <div className="flex gap-4 pt-2">
             <button onClick={prevStep} className="flex-1 bg-white text-orange-900 font-bold py-4 rounded-2xl border border-orange-100 flex items-center justify-center gap-2">
               <ChevronLeft size={20} />
             </button>
             <button 
               onClick={() => onComplete(data as UserProfile)}
               className="flex-[3] bg-orange-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95 flex items-center justify-center gap-2"
             >
               Hoàn tất thiết lập <Sparkles size={20} />
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
