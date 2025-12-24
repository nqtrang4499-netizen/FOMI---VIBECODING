
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
    if (Math.abs(calorieDiff) < 100) return { text: "Mức calo lý tưởng để duy trì mục tiêu hiện tại.", color: "text-emerald-600", bg: "bg-emerald-50" };
    if (calorieDiff < -500) return { text: "Mức calo khá thấp, có thể gây mệt mỏi.", color: "text-orange-600", bg: "bg-orange-50" };
    if (calorieDiff < 0) return { text: "Thâm hụt calo giúp giảm cân nhanh hơn.", color: "text-blue-600", bg: "bg-blue-50" };
    return { text: "Cao hơn mức khuyến nghị, phù hợp nếu bạn vận động nhiều hôm nay.", color: "text-purple-600", bg: "bg-purple-50" };
  };

  const advice = getAdvice();

  return (
    <div className="px-6 py-6 space-y-8 animate-in slide-in-from-right duration-500 pb-24 h-full overflow-y-auto">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-2xl font-black text-emerald-950">Thiết kế ngày ăn</h2>
      </div>

      {/* Calorie Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm uppercase tracking-widest">
           <Calculator size={18} /> Mục tiêu Calo hôm nay
        </div>
        
        <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-emerald-900/5 border border-emerald-50 text-center space-y-6">
           <div className="relative">
              <input 
                type="number" 
                value={targetCalories}
                onChange={(e) => setTargetCalories(Number(e.target.value))}
                className="text-6xl font-black text-emerald-950 text-center w-full outline-none bg-transparent placeholder-gray-200"
                placeholder="2000"
              />
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest absolute bottom-2 right-4">Kcal</span>
           </div>

           <div className="space-y-4">
              <input 
                type="range" 
                min="1000" 
                max="4000" 
                step="50" 
                value={targetCalories}
                onChange={(e) => setTargetCalories(Number(e.target.value))}
                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                 <span>1000</span>
                 <span>4000</span>
              </div>
           </div>

           <div className={`p-4 rounded-2xl ${advice.bg} border border-white/50 flex items-start gap-3 text-left`}>
              <Info size={18} className={`mt-0.5 shrink-0 ${advice.color}`} />
              <div className="space-y-1">
                 <p className={`text-xs font-bold ${advice.color}`}>{advice.text}</p>
                 <p className="text-[10px] font-bold text-gray-500">
                    So với khuyến nghị ({recommendedCalories} kcal): {calorieDiff > 0 ? '+' : ''}{calorieDiff} ({calorieDiff > 0 ? '+' : ''}{diffPercent}%)
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* Flavor Section */}
      <section className="space-y-4">
         <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm uppercase tracking-widest">
            <Sparkles size={18} /> Khẩu vị hôm nay
         </div>
         <div className="grid grid-cols-2 gap-3">
            {flavorOptions.map((flavor) => (
               <button
                  key={flavor.id}
                  onClick={() => toggleFlavor(flavor.id)}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${selectedFlavors.includes(flavor.id) ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-emerald-50 text-gray-500 hover:border-emerald-200'}`}
               >
                  {flavor.icon}
                  <span className="text-xs font-bold uppercase tracking-wider">{flavor.label}</span>
               </button>
            ))}
         </div>
      </section>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#FAFBFA] via-[#FAFBFA] to-transparent">
         <button 
            onClick={() => onConfirm(targetCalories, selectedFlavors)}
            disabled={isGenerating}
            className="w-full py-5 bg-emerald-950 text-emerald-400 font-extrabold rounded-[32px] shadow-2xl flex items-center justify-center gap-3 text-sm uppercase tracking-wider active:scale-95 transition-all disabled:opacity-70"
         >
            {isGenerating ? 'Đang lên thực đơn...' : 'Tạo thực đơn ngay'} 
            {!isGenerating && <ArrowRight size={20} />}
         </button>
      </div>
    </div>
  );
};

export default DayPlanConfig;
