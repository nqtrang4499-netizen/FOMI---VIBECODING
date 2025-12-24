
import React, { useState } from 'react';
import { DailyLog, Meal } from '../types';
import { 
  Utensils, Store, Clock, Flame, ChevronRight, X, 
  ChefHat, CheckCircle, AlertCircle, ShoppingCart, Play, Camera, ArrowRight, Check
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
  // Ưu tiên món chưa nấu và không phải ăn ngoài (để nấu), hoặc món ăn ngoài chưa check-in
  // Ở đây giả định user nấu theo thứ tự bữa
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
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Page Title Area */}
      <div className="px-5 py-4 shrink-0">
         <h2 className="text-xl font-black text-emerald-950">Thực đơn hôm nay</h2>
         <p className="text-xs font-medium text-gray-400 mt-1 flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-bold">{dailyLog.meals.length} món</span>
            <span>•</span>
            <span>{dailyLog.meals.reduce((a,b)=>a+b.calories,0)} Kcal</span>
         </p>
      </div>

      {/* Meal Timeline List */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 space-y-3">
        {dailyLog.meals.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-gray-200 rounded-2xl mx-2 bg-white/50">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                 <Utensils size={20} className="text-gray-300" />
              </div>
              <p className="font-bold text-gray-400 text-xs">Chưa có món nào.</p>
              <button onClick={onBack} className="mt-3 text-emerald-600 text-xs font-bold hover:underline">Thêm món ngay</button>
           </div>
        ) : (
          dailyLog.meals.map((meal, index) => (
             <div 
               key={meal.id}
               onClick={() => setSelectedMeal(meal)}
               className="group bg-white p-3 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center gap-3 active:scale-[0.99] transition-all hover:border-emerald-200 cursor-pointer"
             >
                {/* Image / Icon */}
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative bg-gray-100">
                   <img src={`https://source.unsplash.com/150x150/?food,dish,${meal.name}`} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="" />
                   {meal.isEatOut && (
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Store size={16} className="text-white" />
                     </div>
                   )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{meal.type}</span>
                      {meal.ingredientsMissing && meal.ingredientsMissing.length > 0 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      )}
                   </div>
                   <h4 className="font-extrabold text-emerald-950 text-sm leading-tight truncate">{meal.name}</h4>
                   <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                         <Flame size={10} className="text-orange-400"/> {meal.calories}
                      </span>
                      {!meal.isEatOut && (
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Clock size={10} className="text-blue-400"/> {meal.estimatedTime || '30p'}
                        </span>
                      )}
                   </div>
                </div>

                {/* Arrow */}
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                   <ChevronRight size={16} />
                </div>
             </div>
          ))
        )}
      </div>

      {/* Bottom Action Bar (Next Step) - Fixed */}
      {dailyLog.meals.length > 0 && nextMeal && (
          <div className="fixed bottom-0 left-0 right-0 p-4 z-30 max-w-[390px] mx-auto bg-gradient-to-t from-white via-white to-transparent pt-10">
             <div className="bg-emerald-950 rounded-2xl p-4 shadow-xl shadow-emerald-900/10 flex items-center justify-between gap-4">
                <div className="min-w-0">
                   <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-0.5">Tiếp theo</p>
                   <p className="text-white font-bold text-sm truncate">{nextMeal.name}</p>
                </div>
                <button 
                   onClick={handleNextAction}
                   className="shrink-0 bg-white text-emerald-950 px-5 py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg active:scale-95 transition-transform"
                >
                   {missingIngredientsCount > 0 ? 'Đi chợ' : 'Nấu ngay'} <ArrowRight size={14} />
                </button>
             </div>
          </div>
      )}

      {/* Detail Modal - Clean & Slim */}
      {selectedMeal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center animate-in fade-in max-w-[390px] mx-auto">
          <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-[2px]" onClick={() => setSelectedMeal(null)} />
          
          <div className="bg-white w-full rounded-t-[28px] relative z-10 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-full duration-300 shadow-2xl">
            {/* Header Modal */}
            <div className="shrink-0 px-5 py-4 flex justify-between items-center border-b border-gray-50">
               <h3 className="text-sm font-extrabold text-emerald-950 uppercase tracking-wide">Chi tiết món ăn</h3>
               <button onClick={() => setSelectedMeal(null)} className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
                  <X size={16} />
               </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
               {/* Hero */}
               <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-sm shrink-0 bg-gray-100">
                     <img src={`https://source.unsplash.com/300x300/?food,dish,${selectedMeal.name}`} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 py-1">
                     <h4 className="text-lg font-black text-emerald-950 leading-tight mb-2">{selectedMeal.name}</h4>
                     <div className="flex flex-wrap gap-2">
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">
                           {selectedMeal.calories} Kcal
                        </span>
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">
                           {selectedMeal.type}
                        </span>
                     </div>
                  </div>
               </div>

               {/* Description */}
               <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                     {selectedMeal.description}
                  </p>
               </div>

               {/* Ingredients */}
               {!selectedMeal.isEatOut && (
                 <div className="space-y-3">
                    <h5 className="text-[11px] font-extrabold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                       <Utensils size={12} className="text-emerald-600"/> Nguyên liệu
                    </h5>
                    <div className="flex flex-wrap gap-2">
                       {selectedMeal.ingredientsFound?.map(ing => (
                          <span key={ing} className="px-2.5 py-1.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-lg border border-emerald-100 flex items-center gap-1.5">
                             <Check size={10} /> {ing}
                          </span>
                       ))}
                       {selectedMeal.ingredientsMissing?.map((ing: any) => (
                          <span key={ing.name || ing} className="px-2.5 py-1.5 bg-white text-gray-400 text-[10px] font-bold rounded-lg border border-gray-200 flex items-center gap-1.5 line-through">
                             {typeof ing === 'string' ? ing : ing.name}
                          </span>
                       ))}
                    </div>
                 </div>
               )}
            </div>

            {/* Action Footer */}
            <div className="shrink-0 p-5 border-t border-gray-50 bg-white pb-8">
               <button 
                  onClick={() => handleStart(selectedMeal)}
                  className="w-full py-4 bg-emerald-600 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 active:scale-95 transition-all text-xs uppercase tracking-wider"
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
