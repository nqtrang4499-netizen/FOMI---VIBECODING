
import React, { useState } from 'react';
import { DailyLog, Meal } from '../types';
import { 
  Utensils, Store, Clock, Flame, ChevronRight, X, 
  ChefHat, CheckCircle, AlertCircle, ShoppingCart, Play, Camera, ArrowRight, Check, Plus
} from 'lucide-react';

interface DayMenuViewProps {
  dailyLog: DailyLog;
  onStartProcess: (meal: Meal, shouldGoShopping: boolean) => void;
  onRemoveMeal: (id: string) => void;
  onBack: () => void;
}

const DayMenuView: React.FC<DayMenuViewProps> = ({ dailyLog, onStartProcess, onRemoveMeal, onBack }) => {
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  // Logic xác định món tiếp theo
  const nextMeal = dailyLog.meals.find(m => !m.isEatOut) || dailyLog.meals[0];
  const missingIngredientsCount = dailyLog.meals.reduce((acc, m) => acc + (m.ingredientsMissing?.length || 0), 0);

  const handleStart = (meal: Meal) => {
    const hasMissing = meal.ingredientsMissing && meal.ingredientsMissing.length > 0;
    onStartProcess(meal, !!hasMissing); 
    setSelectedMeal(null);
  };

  const handleNextAction = () => {
      if (nextMeal) handleStart(nextMeal);
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFBFA] overflow-hidden">
      {/* 1. Header (Fixed) */}
      <div className="px-5 py-4 shrink-0 bg-white border-b border-gray-50 flex justify-between items-start">
         <div>
            <h2 className="text-xl font-black text-emerald-950">Thực đơn</h2>
            <p className="text-xs font-bold text-gray-400 mt-0.5 uppercase tracking-wider">Hôm nay</p>
         </div>
         <div className="bg-emerald-50 px-3 py-1.5 rounded-xl text-right">
            <p className="text-lg font-black text-emerald-600 leading-none">{dailyLog.meals.reduce((a,b)=>a+b.calories,0)}</p>
            <p className="text-[9px] font-bold text-emerald-800 uppercase">Kcal</p>
         </div>
      </div>

      {/* 2. List (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {dailyLog.meals.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center border-[6px] border-white shadow-sm">
                 <Utensils size={32} className="text-gray-200" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-black text-gray-400">Chưa có món nào</h3>
                <p className="text-[10px] text-gray-400 font-medium px-8 leading-relaxed">
                    Hãy nhờ Fomi gợi ý thực đơn hoặc tự thêm món ăn yêu thích của bạn.
                </p>
              </div>
              <button 
                onClick={onBack} 
                className="bg-emerald-600 text-white px-6 py-3.5 rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-200 active:scale-95 transition-all flex items-center gap-2"
              >
                <Plus size={14} /> Thêm món ngay
              </button>
           </div>
        ) : (
          dailyLog.meals.map((meal, index) => (
             <div 
               key={meal.id}
               onClick={() => setSelectedMeal(meal)}
               className="group bg-white p-3 rounded-[24px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-3 active:scale-[0.98] transition-all hover:border-emerald-200 cursor-pointer"
             >
                {/* Image / Icon */}
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 relative bg-gray-100 shadow-sm">
                   <img src={`https://source.unsplash.com/200x200/?food,dish,${meal.name}`} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="" />
                   {meal.isEatOut && (
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Store size={18} className="text-white" />
                     </div>
                   )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0 py-0.5">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{meal.type}</span>
                      {meal.ingredientsMissing && meal.ingredientsMissing.length > 0 && (
                          <div className="flex items-center gap-1 text-[9px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                             <AlertCircle size={10} /> Thiếu đồ
                          </div>
                      )}
                   </div>
                   <h4 className="font-extrabold text-emerald-950 text-sm leading-tight truncate mb-1.5">{meal.name}</h4>
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                         <Flame size={12} className="text-orange-400"/> {meal.calories}
                      </span>
                      {!meal.isEatOut && (
                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                            <Clock size={12} className="text-blue-400"/> {meal.estimatedTime || '30p'}
                        </span>
                      )}
                   </div>
                </div>

                {/* Arrow */}
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                   <ChevronRight size={18} />
                </div>
             </div>
          ))
        )}
      </div>

      {/* 3. Footer (Fixed) - Replaces Floating Action */}
      {dailyLog.meals.length > 0 && nextMeal && (
          <div className="shrink-0 p-5 bg-white border-t border-gray-50 z-20 pb-24">
             <div className="bg-emerald-950 rounded-[28px] p-4 shadow-xl flex items-center justify-between gap-3">
                <div className="min-w-0">
                   <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">Món tiếp theo</p>
                   <p className="text-white font-bold text-sm truncate">{nextMeal.name}</p>
                </div>
                <button 
                   onClick={handleNextAction}
                   className="shrink-0 bg-white text-emerald-950 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center gap-2 shadow-lg active:scale-95 transition-transform"
                >
                   {missingIngredientsCount > 0 ? 'Đi chợ' : 'Nấu ngay'} <ArrowRight size={14} />
                </button>
             </div>
          </div>
      )}

      {/* Detail Modal */}
      {selectedMeal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center animate-in fade-in max-w-[390px] mx-auto">
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" onClick={() => setSelectedMeal(null)} />
          
          <div className="bg-white w-full rounded-t-[40px] relative z-10 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-full duration-300 shadow-2xl">
            <div className="shrink-0 px-6 py-5 flex justify-between items-center border-b border-gray-50">
               <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wide">Chi tiết món ăn</h3>
               <button onClick={() => setSelectedMeal(null)} className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
                  <X size={18} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               <div className="flex flex-col gap-4">
                  <div className="w-full aspect-video rounded-[24px] overflow-hidden shadow-sm shrink-0 bg-gray-100 relative">
                     <img src={`https://source.unsplash.com/600x400/?food,dish,${selectedMeal.name}`} className="w-full h-full object-cover" alt="" />
                     <div className="absolute bottom-3 left-3 flex gap-2">
                        <span className="text-[10px] font-black bg-white/90 backdrop-blur text-emerald-900 px-3 py-1.5 rounded-lg">
                           {selectedMeal.calories} Kcal
                        </span>
                        <span className="text-[10px] font-black bg-white/90 backdrop-blur text-emerald-900 px-3 py-1.5 rounded-lg">
                           {selectedMeal.type}
                        </span>
                     </div>
                  </div>
                  <div className="py-1">
                     <h4 className="text-2xl font-black text-emerald-950 leading-tight mb-2">{selectedMeal.name}</h4>
                  </div>
               </div>

               <div className="bg-emerald-50/50 p-5 rounded-[24px] border border-emerald-50">
                  <p className="text-sm text-emerald-900 font-medium leading-relaxed">
                     {selectedMeal.description}
                  </p>
               </div>

               {!selectedMeal.isEatOut && (
                 <div className="space-y-4">
                    <h5 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                       <Utensils size={14} className="text-emerald-600"/> Nguyên liệu cần thiết
                    </h5>
                    <div className="flex flex-wrap gap-2">
                       {selectedMeal.ingredientsFound?.map(ing => (
                          <span key={ing} className="px-3 py-2 bg-emerald-100 text-emerald-900 text-[11px] font-bold rounded-xl border border-emerald-200 flex items-center gap-1.5">
                             <Check size={12} /> {ing}
                          </span>
                       ))}
                       {selectedMeal.ingredientsMissing?.map((ing: any) => (
                          <span key={ing.name || ing} className="px-3 py-2 bg-white text-gray-400 text-[11px] font-bold rounded-xl border border-gray-200 flex items-center gap-1.5 line-through">
                             {typeof ing === 'string' ? ing : ing.name}
                          </span>
                       ))}
                    </div>
                 </div>
               )}
            </div>

            <div className="shrink-0 p-6 border-t border-gray-50 bg-white pb-10">
               <button 
                  onClick={() => handleStart(selectedMeal)}
                  className="w-full py-5 bg-emerald-600 text-white font-black rounded-[24px] flex items-center justify-center gap-2 shadow-xl shadow-emerald-200 active:scale-95 transition-all text-xs uppercase tracking-widest"
               >
                  {selectedMeal.isEatOut ? 'Check-in món này' : 'Bắt đầu chế biến'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayMenuView;
