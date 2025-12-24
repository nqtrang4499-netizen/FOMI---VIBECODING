
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  Calculator, Flame, ChevronLeft, ArrowRight, Target, 
  Scale, Info, Sparkles, Leaf, Candy, Droplets
} from 'lucide-react';

interface DayPlanConfigProps {
  profile: UserProfile;
  onBack: () => void;
  onConfirm: (calories: number, flavors: string[]) => void;
  isGenerating: boolean;
}

const flavorOptions = [
  { id: 'Đậm đà', label: 'Đậm đà', icon: <Droplets size={14} /> },
  { id: 'Thanh đạm', label: 'Thanh đạm', icon: <Leaf size={14} /> },
  { id: 'Cay nồng', label: 'Cay nồng', icon: <Flame size={14} /> },
  { id: 'Ngọt dịu', label: 'Ngọt dịu', icon: <Candy size={14} /> },
  { id: 'Nhiều đạm', label: 'Nhiều đạm', icon: <Scale size={14} /> },
];

const DayPlanConfig: React.FC<DayPlanConfigProps> = ({ profile, onBack, onConfirm, isGenerating }) => {
  const recommendedCalories = profile.calorieGoal || 2000;
  const [targetCalories, setTargetCalories] = useState<number>(recommendedCalories);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>(profile.flavors || []);

  const toggleFlavor = (id: string) => {
    if (selectedFlavors.includes(id)) {
      setSelectedFlavors(selectedFlavors.filter(f => f !== id));
    } else {
      setSelectedFlavors([...selectedFlavors, id]);
    }
  };

  const calorieDiff = targetCalories - recommendedCalories;
  const diffPercent = Math.round((calorieDiff / recommendedCalories) * 100);

  const getAdvice = () => {
    if (Math.abs(calorieDiff) < 100) return { text: "Lý tưởng để duy trì mục tiêu.", color: "text-emerald-600", bg: "bg-emerald-50" };
    if (calorieDiff < -500) return { text: "Khá thấp, có thể gây mệt.", color: "text-orange-600", bg: "bg-orange-50" };
    if (calorieDiff < 0) return { text: "Thâm hụt giúp giảm cân.", color: "text-blue-600", bg: "bg-blue-50" };
    return { text: "Cao hơn khuyến nghị.", color: "text-purple-600", bg: "bg-purple-50" };
  };

  const advice = getAdvice();

  return (
    <div className="flex flex-col h-full bg-[#FAFBFA] animate-in slide-in-from-right duration-500">
      {/* Header Section */}
      <div className="px-5 py-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50 shadow-sm">
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-xl font-black text-emerald-950">Thiết kế ngày ăn</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 space-y-6 pb-6">
        {/* Calorie Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-[10px] uppercase tracking-widest">
             <Calculator size={14} /> Mục tiêu Calo hôm nay
          </div>
          
          <div className="bg-white p-6 rounded-[32px] shadow-xl shadow-emerald-900/5 border border-emerald-50 text-center space-y-5">
             <div className="relative">
                <input 
                  type="number" 
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(Number(e.target.value))}
                  className="text-5xl font-black text-emerald-950 text-center w-full outline-none bg-transparent placeholder-gray-200"
                  placeholder="2000"
                />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest absolute bottom-2 right-8">Kcal</span>
             </div>

             <div className="space-y-3">
                <input 
                  type="range" 
                  min="1000" 
                  max="4000" 
                  step="50" 
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                   <span>1000</span>
                   <span>4000</span>
                </div>
             </div>

             <div className={`p-3 rounded-xl ${advice.bg} border border-white/50 flex items-start gap-2 text-left`}>
                <Info size={16} className={`mt-0.5 shrink-0 ${advice.color}`} />
                <div className="space-y-0.5">
                   <p className={`text-[10px] font-bold ${advice.color}`}>{advice.text}</p>
                   <p className="text-[9px] font-bold text-gray-500">
                      So với khuyến nghị ({recommendedCalories}): {calorieDiff > 0 ? '+' : ''}{calorieDiff}
                   </p>
                </div>
             </div>
          </div>
        </section>

        {/* Flavor Section */}
        <section className="space-y-3">
           <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-[10px] uppercase tracking-widest">
              <Sparkles size={14} /> Khẩu vị hôm nay
           </div>
           <div className="grid grid-cols-2 gap-2">
              {flavorOptions.map((flavor) => (
                 <button
                    key={flavor.id}
                    onClick={() => toggleFlavor(flavor.id)}
                    className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-2 ${selectedFlavors.includes(flavor.id) ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-emerald-50 text-gray-500 hover:border-emerald-200'}`}
                 >
                    {flavor.icon}
                    <span className="text-[10px] font-bold uppercase tracking-wider">{flavor.label}</span>
                 </button>
              ))}
           </div>
        </section>
      </div>

      {/* Footer Button (Fixed within flex container) */}
      <div className="p-5 bg-white border-t border-gray-50 shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-20">
         <button 
            onClick={() => onConfirm(targetCalories, selectedFlavors)}
            disabled={isGenerating}
            className="w-full py-4 bg-emerald-950 text-emerald-400 font-extrabold rounded-[28px] shadow-2xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-95 transition-all disabled:opacity-70"
         >
            {isGenerating ? 'Đang tạo...' : 'Tạo thực đơn ngay'} 
            {!isGenerating && <ArrowRight size={18} />}
         </button>
      </div>
    </div>
  );
};

export default DayPlanConfig;
