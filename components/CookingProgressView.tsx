
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
    <div className="flex flex-col h-full bg-[#FAFBFA] overflow-hidden">
      
      {/* 1. Header (Fixed) */}
      <div className="shrink-0 px-6 pt-6 pb-4 flex items-start justify-between">
        <div className="flex-1 pr-4">
          <h2 className="text-xl font-black text-emerald-900 tracking-tight leading-tight">Đang chế biến:</h2>
          <p className="text-sm font-bold text-emerald-600 mt-0.5">{meal.name}</p>
        </div>
        <button 
          onClick={() => { if(confirm('Bạn có muốn dừng nấu bữa này không?')) onCancel(); }}
          className="w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm"
        >
          <X size={20} />
        </button>
      </div>

      {/* 2. Body (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-4">
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Tiến độ</span>
                <span className="text-sm font-black text-emerald-900">{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500 shadow-lg shadow-emerald-100" 
                  style={{ width: `${progressPercent}%` }} 
                />
            </div>
          </div>

          {/* Main Step Card */}
          <div className="bg-white rounded-[32px] p-8 border border-emerald-50 shadow-xl shadow-emerald-900/5 min-h-[260px] flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-50 rounded-full group-hover:scale-110 transition-transform" />
            
            <div className="relative z-10 space-y-5">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-200">
                  {currentStep + 1}
                </div>
                
                <p className="text-xl font-bold text-emerald-900 leading-relaxed min-h-[80px]">
                  {steps[currentStep]}
                </p>

                {currentStep === 0 && (
                  <div className="bg-orange-50 p-4 rounded-2xl flex items-center gap-3 w-fit">
                      <Clock size={18} className="text-orange-500" />
                      <span className="text-xs font-bold text-orange-900">Ước tính: {meal.estimatedTime || '20 phút'}</span>
                  </div>
                )}
            </div>
          </div>

          {/* Tips Section - Now safe from overlap */}
          <div className="bg-emerald-950 text-white p-6 rounded-[32px] space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={60}/></div>
            <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest relative z-10">
                <Sparkles size={14} /> Bí kíp từ Fomi
            </div>
            <p className="text-sm leading-relaxed italic opacity-90 relative z-10 font-medium">
                {currentStep === steps.length - 1 
                  ? "Sắp xếp món ăn đẹp mắt sẽ kích thích vị giác và khiến bạn cảm thấy hài lòng hơn với thành quả của mình."
                  : meal.hackTip || "Hãy luôn giữ bếp gọn gàng để quá trình nấu nướng trở nên thư thái và nhanh chóng hơn."}
            </p>
          </div>
      </div>

      {/* 3. Footer (Fixed) - Contains Buttons */}
      <div className="shrink-0 p-5 bg-white border-t border-gray-50 z-20 pb-24">
         <div className="flex gap-3">
            <button 
              onClick={prevStep}
              disabled={currentStep === 0}
              className="w-16 h-16 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center disabled:opacity-30 transition-all active:scale-95 border border-gray-100"
            >
                <ChevronLeft size={28} />
            </button>
            
            <button 
              onClick={nextStep}
              className="flex-1 bg-emerald-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-200 active:scale-95 transition-all text-sm uppercase tracking-wide"
            >
                {currentStep === steps.length - 1 ? (
                  <>Hoàn tất <PartyPopper size={20} /></>
                ) : (
                  <>Tiếp theo <ChevronRight size={20} /></>
                )}
            </button>
         </div>
      </div>

    </div>
  );
};

export default CookingProgressView;
