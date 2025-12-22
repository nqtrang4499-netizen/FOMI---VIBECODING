
import React, { useState } from 'react';
import { UserProfile, Region } from '../types';
import { ChefHat, MapPin, Target, Flame, ChevronRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<UserProfile>>({
    region: Region.SOUTH,
    isLactoseIntolerant: false,
    preferences: [],
    goal: 'Giữ dáng'
  });

  const nextStep = () => setStep(step + 1);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-orange-50 flex flex-col p-8 items-center justify-center">
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
          <div className="flex items-center gap-3 text-orange-900">
            <MapPin size={28} />
            <h2 className="text-2xl font-bold">Vùng miền & Khẩu vị</h2>
          </div>
          <p className="text-gray-600">Chúng tôi gợi ý món theo khẩu vị đặc trưng của từng miền.</p>
          
          <div className="grid grid-cols-1 gap-4">
            {[Region.NORTH, Region.CENTRAL, Region.SOUTH].map((r) => (
              <button
                key={r}
                onClick={() => setData({ ...data, region: r })}
                className={`w-full p-6 rounded-3xl text-left border-2 transition-all ${
                  data.region === r 
                  ? 'border-gray-400 bg-gray-200 text-gray-900 shadow-md scale-[1.02]' 
                  : 'border-white bg-white text-gray-700'
                }`}
              >
                <span className={`block text-xs font-bold uppercase ${data.region === r ? 'text-gray-500' : 'opacity-60'}`}>Khẩu vị miền</span>
                <span className="text-xl font-bold">{r}</span>
              </button>
            ))}
          </div>

          <button 
            onClick={nextStep}
            className="w-full bg-orange-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
          >
            Tiếp tục <ChevronRight size={20} />
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="w-full space-y-8 animate-in slide-in-from-right duration-500">
          <div className="flex items-center gap-3 text-orange-900">
            <Target size={28} />
            <h2 className="text-2xl font-bold">Mục tiêu của bạn</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {['Giảm cân', 'Giữ dáng', 'Tăng cơ'].map((g) => (
              <button
                key={g}
                onClick={() => setData({ ...data, goal: g as any })}
                className={`w-full p-6 rounded-3xl text-left border-2 transition-all ${
                  data.goal === g 
                  ? 'border-gray-400 bg-gray-200 text-gray-900 shadow-md scale-[1.02]' 
                  : 'border-white bg-white text-gray-700'
                }`}
              >
                <span className="text-xl font-bold">{g}</span>
              </button>
            ))}
          </div>

          <div className="bg-white p-6 rounded-3xl space-y-4">
             <div className="flex items-center justify-between">
                <span className="font-bold text-gray-700">Dị ứng Lactose (sữa)?</span>
                <button 
                  onClick={() => setData({ ...data, isLactoseIntolerant: !data.isLactoseIntolerant })}
                  className={`w-12 h-6 rounded-full transition-all relative ${data.isLactoseIntolerant ? 'bg-orange-500' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${data.isLactoseIntolerant ? 'right-1' : 'left-1'}`}></div>
                </button>
             </div>
          </div>

          <button 
            onClick={() => onComplete(data as UserProfile)}
            className="w-full bg-orange-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Sẵn sàng "Thỏa Hiệp"! <Flame size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
