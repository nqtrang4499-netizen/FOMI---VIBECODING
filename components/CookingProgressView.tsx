
import React, { useState } from 'react';
import { Meal } from '../types';
import { ChefHat, CheckCircle, ChevronRight, ChevronLeft, Sparkles, Clock, Zap, X, PartyPopper } from 'lucide-react';

interface CookingProgressViewProps {
  meal: Meal;
  onComplete: () => void;
  onCancel: () => void;
}

const CookingProgressView: React.FC<CookingProgressViewProps> = ({ meal, onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = meal.recipeSteps || ["Chuẩn bị nguyên liệu", "Sơ chế", "Chế biến", "Trình bày"];
  
  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="px-5 py-5 space-y-6 animate-in slide-in-from-right duration-500 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex-1 pr-4">
          <h2 className="text-xl font-black text-emerald-900 tracking-tight leading-tight">Đang chế biến:</h2>
          <p className="text-xs font-bold text-emerald-600">{meal.name}</p>
        </div>
        <button 
          onClick={() => { if(confirm('Bạn có muốn dừng nấu bữa này không?')) onCancel(); }}
          className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-2">
         <div className="flex justify-between items-end">
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Tiến độ</span>
            <span className="text-sm font-black text-emerald-900">{Math.round(progressPercent)}%</span>
         </div>
         <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500 shadow-lg shadow-emerald-100" 
              style={{ width: `${progressPercent}%` }} 
            />
         </div>
      </div>

      <div className="bg-white rounded-[32px] p-6 border border-emerald-50 shadow-xl shadow-emerald-900/5 min-h-[220px] flex flex-col justify-center relative overflow-hidden group">
         <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-110 transition-transform" />
         
         <div className="relative z-10 space-y-4">
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-lg">
               {currentStep + 1}
            </div>
            
            <p className="text-lg font-bold text-emerald-900 leading-relaxed min-h-[80px]">
               {steps[currentStep]}
            </p>

            {currentStep === 0 && (
               <div className="bg-orange-50 p-3 rounded-xl flex items-center gap-2">
                  <Clock size={16} className="text-orange-500" />
                  <span className="text-[10px] font-bold text-orange-900">Thời gian ước tính: {meal.estimatedTime || '20 phút'}</span>
               </div>
            )}
         </div>
      </div>

      <div className="bg-emerald-900 text-white p-5 rounded-[32px] space-y-1.5">
         <div className="flex items-center gap-2 text-emerald-400 text-[9px] font-bold uppercase tracking-widest">
            <Sparkles size={12} /> Bí kíp từ Fomi
         </div>
         <p className="text-xs leading-relaxed italic opacity-90">
            {currentStep === steps.length - 1 
              ? "Sắp xếp món ăn đẹp mắt sẽ kích thích vị giác và khiến bạn cảm thấy hài lòng hơn với thành quả của mình."
              : meal.hackTip || "Hãy luôn giữ bếp gọn gàng để quá trình nấu nướng trở nên thư thái và nhanh chóng hơn."}
         </p>
      </div>

      <div className="fixed bottom-24 left-5 right-5 flex gap-3 bg-white/80 backdrop-blur-md p-2 rounded-[32px] border border-gray-100 shadow-2xl z-20">
         <button 
           onClick={prevStep}
           disabled={currentStep === 0}
           className="w-14 h-14 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center disabled:opacity-0 transition-all active:scale-90"
         >
            <ChevronLeft size={24} />
         </button>
         
         <button 
           onClick={nextStep}
           className="flex-1 bg-emerald-600 text-white font-black rounded-full flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all text-xs uppercase"
         >
            {currentStep === steps.length - 1 ? (
              <>Hoàn tất bữa ăn <PartyPopper size={18} /></>
            ) : (
              <>Tiếp theo <ChevronRight size={18} /></>
            )}
         </button>
      </div>
    </div>
  );
};

export default CookingProgressView;
