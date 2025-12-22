
import React, { useState } from 'react';
import { UserProfile, Region } from '../types';
import { ChefHat, MapPin, Target, Flame, ChevronRight, ChevronLeft, UtensilsCrossed, Sparkles, Fish, Drumstick, Soup, Wheat, Droplets, Leaf } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const tasteGroups = [
  {
    title: "Bạn thích ăn thịt gì?",
    description: "Chọn loại đạm bạn thường đi chợ nhất",
    key: "protein",
    items: [
      { id: 'beef', label: 'Thịt bò', icon: <Flame size={14} /> },
      { id: 'pork', label: 'Thịt heo', icon: <Drumstick size={14} /> },
      { id: 'seafood', label: 'Hải sản', icon: <Fish size={14} /> },
      { id: 'poultry', label: 'Thịt gà/vịt', icon: <Drumstick size={14} /> },
      { id: 'tofu', label: 'Đồ chay/Đậu', icon: <Leaf size={14} /> },
    ]
  },
  {
    title: "Team Cơm hay Team Bún?",
    description: "Thói quen ăn tinh bột hàng ngày",
    key: "starch",
    items: [
      { id: 'rice', label: 'Cơm trắng', icon: <Wheat size={14} /> },
      { id: 'noodle', label: 'Bún/Phở/Mì', icon: <Soup size={14} /> },
      { id: 'bread', label: 'Bánh mì/Xôi', icon: <Wheat size={14} /> },
      { id: 'lowcarb', label: 'Kiêng tinh bột', icon: <Sparkles size={14} /> },
    ]
  },
  {
    title: "Món phải có vị gì?",
    description: "Hương vị linh hồn trong bữa cơm",
    key: "soul",
    items: [
      { id: 'fishsauce', label: 'Nước mắm đậm', icon: <Droplets size={14} /> },
      { id: 'fermented', label: 'Mắm tôm/nêm', icon: <Droplets size={14} /> },
      { id: 'spicy', label: 'Thích ăn cay', icon: <Flame size={14} /> },
      { id: 'herbs', label: 'Nhiều rau thơm', icon: <Leaf size={14} /> },
      { id: 'garlic', label: 'Nhiều hành tỏi', icon: <Sparkles size={14} /> },
      { id: 'sour', label: 'Vị chua thanh', icon: <Droplets size={14} /> },
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
            <h1 className="text-4xl font-black text-orange-900 tracking-tight">Fomi.</h1>
            <p className="text-orange-600 font-medium italic">Ăn ngon, vẫn khỏe</p>
          </div>
          <div className="pt-8 space-y-4">
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Tên bạn là gì nhỉ?</p>
            <input 
              type="text" 
              placeholder="Vd: Trạng Marketing" 
              className="w-full bg-white border-2 border-orange-100 rounded-2xl px-6 py-4 text-center text-lg font-bold focus:border-orange-500 outline-none transition-all shadow-sm"
              onChange={(e) => setData({ ...data, name: e.target.value })}
            />
          </div>
          <button 
            disabled={!data.name}
            onClick={nextStep}
            className="w-full bg-orange-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-200 hover:bg-orange-600 disabled:opacity-50 transition-all active:scale-95"
          >
            Bắt đầu thôi!
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="w-full space-y-8 animate-in slide-in-from-right duration-500">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-orange-900">
              <MapPin size={28} />
              <h2 className="text-2xl font-bold tracking-tight">Quê bạn ở đâu?</h2>
            </div>
            <p className="text-gray-500 text-sm">Fomi sẽ gợi ý món chuẩn vị miền đó để bạn ăn ngon miệng nhất.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {[Region.NORTH, Region.CENTRAL, Region.SOUTH].map((r) => (
              <button
                key={r}
                onClick={() => setData({ ...data, region: r })}
                className={`w-full p-6 rounded-3xl text-left border-2 transition-all relative overflow-hidden ${
                  data.region === r 
                  ? 'border-orange-500 bg-white text-orange-900 shadow-md scale-[1.02]' 
                  : 'border-white bg-white text-gray-500 shadow-sm opacity-80'
                }`}
              >
                {data.region === r && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full"></div>}
                <span className={`block text-[10px] font-black uppercase tracking-widest ${data.region === r ? 'text-orange-500' : 'text-gray-400'}`}>Hương vị miền</span>
                <span className="text-xl font-bold">{r}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button onClick={prevStep} className="flex-1 bg-white text-orange-900 font-bold py-4 rounded-2xl border border-orange-100 flex items-center justify-center gap-2 active:scale-95 transition-all">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextStep} className="flex-[3] bg-orange-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg">
              Tiếp nào <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="w-full space-y-6 animate-in slide-in-from-right duration-500 overflow-y-auto max-h-[80vh] pr-2">
          <div className="space-y-2 sticky top-0 bg-orange-50 py-2 z-10">
            <div className="flex items-center gap-3 text-orange-900">
              <UtensilsCrossed size={28} />
              <h2 className="text-2xl font-bold tracking-tight">Gu ăn uống</h2>
            </div>
            <p className="text-gray-500 text-sm">Cùng xem khẩu vị của bạn thế nào nhé.</p>
          </div>

          <div className="space-y-8 pb-4">
            {tasteGroups.map((group) => (
              <div key={group.key} className="space-y-3">
                <div className="px-1">
                  <h3 className="text-sm font-black text-orange-900 uppercase tracking-widest">{group.title}</h3>
                  <p className="text-[11px] text-gray-400 font-medium">{group.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => togglePreference(item.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold border-2 transition-all ${
                        data.preferences?.includes(item.id)
                        ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                        : 'bg-white border-white text-gray-500 shadow-sm'
                      }`}
                    >
                      <span className={data.preferences?.includes(item.id) ? 'text-white' : 'text-orange-400'}>
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-2 sticky bottom-0 bg-orange-50 py-4">
            <button onClick={prevStep} className="flex-1 bg-white text-orange-900 font-bold py-4 rounded-2xl border border-orange-100 flex items-center justify-center gap-2 active:scale-95 transition-all">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextStep} className="flex-[3] bg-orange-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg">
              Tiếp theo <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="w-full space-y-8 animate-in slide-in-from-right duration-500">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-orange-900">
              <Target size={28} />
              <h2 className="text-2xl font-bold tracking-tight">Mục tiêu của bạn</h2>
            </div>
            <p className="text-gray-500 text-sm">Fomi sẽ tính toán lượng cơm thịt dựa trên mục tiêu này.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {['Giảm cân', 'Giữ dáng', 'Tăng cơ'].map((g) => (
              <button
                key={g}
                onClick={() => setData({ ...data, goal: g as any })}
                className={`w-full p-6 rounded-3xl text-left border-2 transition-all relative ${
                  data.goal === g 
                  ? 'border-orange-500 bg-white text-orange-900 shadow-md scale-[1.02]' 
                  : 'border-white bg-white text-gray-500 shadow-sm opacity-80'
                }`}
              >
                {data.goal === g && <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-orange-500 text-white p-1 rounded-full"><Sparkles size={12} /></div>}
                <span className="text-xl font-bold">{g}</span>
              </button>
            ))}
          </div>

          <div className="bg-white p-6 rounded-[28px] border border-orange-100 space-y-4 shadow-sm">
             <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-700 block text-sm">Dị ứng Lactose (sữa)?</span>
                  <span className="text-[10px] text-gray-400 font-medium italic">Hay bị đau bụng khi uống sữa không?</span>
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
             <button onClick={prevStep} className="flex-1 bg-white text-orange-900 font-bold py-4 rounded-2xl border border-orange-100 flex items-center justify-center gap-2 active:scale-95 transition-all">
               <ChevronLeft size={20} />
             </button>
             <button 
               onClick={() => onComplete(data as UserProfile)}
               className="flex-[3] bg-orange-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95 flex items-center justify-center gap-2"
             >
               Xong rồi đó! <Sparkles size={20} />
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
