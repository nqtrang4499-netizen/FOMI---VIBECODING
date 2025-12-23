
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
    <div className="px-6 py-6 space-y-8 animate-in slide-in-from-right duration-500 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex-1 pr-4">
          <h2 className="text-2xl font-black text-emerald-900 tracking-tight leading-tight">Đang chế biến:</h2>
          <p className="text-sm font-bold text-emerald-600">{meal.name}</p>
        </div>
        <button 
          onClick={() => { if(confirm('Bạn có muốn dừng nấu bữa này không?')) onCancel(); }}
          className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-3">
         <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Tiến độ nấu</span>
            <span className="text-lg font-black text-emerald-900">{Math.round(progressPercent)}%</span>
         </div>
         <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500 shadow-lg shadow-emerald-100" 
              style={{ width: `${progressPercent}%` }} 
            />
         </div>
      </div>

      <div className="bg-white rounded-[40px] p-8 border border-emerald-50 shadow-xl shadow-emerald-900/5 min-h-[300px] flex flex-col justify-center relative overflow-hidden group">
         <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-50 rounded-full group-hover:scale-110 transition-transform" />
         
         <div className="relative z-10 space-y-6">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
               {currentStep + 1}
            </div>
            
            <p className="text-xl font-bold text-emerald-900 leading-relaxed min-h-[100px]">
               {steps[currentStep]}
            </p>

            {currentStep === 0 && (
               <div className="bg-orange-50 p-4 rounded-2xl flex items-center gap-3">
                  <Clock size={18} className="text-orange-500" />
                  <span className="text-xs font-bold text-orange-900">Thời gian ước tính: {meal.estimatedTime || '20 phút'}</span>
               </div>
            )}
         </div>
      </div>

      <div className="bg-emerald-900 text-white p-7 rounded-[40px] space-y-2">
         <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
            <Sparkles size={14} /> Bí kíp từ Fomi
         </div>
         <p className="text-sm leading-relaxed italic opacity-90">
            {currentStep === steps.length - 1 
              ? "Sắp xếp món ăn đẹp mắt sẽ kích thích vị giác và khiến bạn cảm thấy hài lòng hơn với thành quả của mình."
              : meal.hackTip || "Hãy luôn giữ bếp gọn gàng để quá trình nấu nướng trở nên thư thái và nhanh chóng hơn."}
         </p>
      </div>

      <div className="fixed bottom-6 left-6 right-6 flex gap-4 bg-white/80 backdrop-blur-md p-2 rounded-[40px] border border-gray-100 shadow-2xl">
         <button 
           onClick={prevStep}
           disabled={currentStep === 0}
           className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center disabled:opacity-0 transition-all active:scale-90"
         >
            <ChevronLeft size={28} />
         </button>
         
         <button 
           onClick={nextStep}
           className="flex-1 bg-emerald-600 text-white font-black rounded-full flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all text-sm uppercase"
         >
            {currentStep === steps.length - 1 ? (
              <>Hoàn tất bữa ăn <PartyPopper size={20} /></>
            ) : (
              <>Tiếp theo <ChevronRight size={20} /></>
            )}
         </button>
      </div>
    </div>
  );
};

export default CookingProgressView;
