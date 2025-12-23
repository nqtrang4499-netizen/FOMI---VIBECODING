
import React, { useState } from 'react';
import { Meal, DailyLog } from '../types';
import { 
  Sparkles, Clock, Zap, Plus, CheckCircle, ChevronRight, 
  ChefHat, X, RotateCcw, ShoppingCart, Flame, Lightbulb, 
  ArrowRight, BookOpen, AlertCircle
} from 'lucide-react';

interface MealSuggestionsViewProps {
  suggestions: any[];
  dailyLog: DailyLog;
  activeCookingMeal: Meal | null;
  onAddMeal: (meal: any, shouldGoShopping: boolean) => void;
  onRemoveMeal: (name: string) => void;
  onRegenerate: () => void;
}

const MealSuggestionsView: React.FC<MealSuggestionsViewProps> = ({ suggestions, dailyLog, activeCookingMeal, onAddMeal, onRemoveMeal, onRegenerate }) => {
  const [selectedMeal, setSelectedMeal] = useState<any | null>(null);

  const isLoggedOrActive = (name: string) => 
    dailyLog.meals.some(m => m.name.toLowerCase() === name.toLowerCase()) || 
    activeCookingMeal?.name.toLowerCase() === name.toLowerCase();

  const handleStartProcess = (meal: any) => {
    const hasMissing = meal.ingredientsMissing && meal.ingredientsMissing.length > 0;
    onAddMeal(meal, hasMissing);
    setSelectedMeal(null);
  };

  return (
    <div className="px-6 py-4 space-y-8 animate-in slide-in-from-right duration-500 pb-28">
      {/* Meal Detail Modal/Overlay */}
      {selectedMeal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center animate-in fade-in">
          <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" onClick={() => setSelectedMeal(null)} />
          <div className="bg-white w-full max-w-md rounded-t-[40px] relative z-10 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-full duration-500">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md p-6 flex justify-between items-center border-b border-gray-50">
               <h3 className="text-xl font-extrabold text-emerald-950">Chi tiết món ăn</h3>
               <button onClick={() => setSelectedMeal(null)} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                  <X size={20} />
               </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Image & Basic Info */}
              <div className="flex gap-6">
                <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-lg border-4 border-white">
                  <img src={`https://source.unsplash.com/400x400/?food,recipe,${selectedMeal.name}`} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 space-y-3">
                  <h4 className="text-2xl font-black text-emerald-950 leading-tight">{selectedMeal.name}</h4>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                      <Flame size={14} fill="currentColor" />
                      <span className="text-xs font-black">{selectedMeal.calories} Kcal</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                      <Clock size={14} />
                      <span className="text-xs font-black">{selectedMeal.estimatedTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ingredients Section */}
              <div className="space-y-4">
                <h5 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Nguyên liệu</h5>
                <div className="grid grid-cols-2 gap-3">
                  {selectedMeal.ingredientsFound?.map((ing: string) => (
                    <div key={ing} className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50">
                      <CheckCircle size={14} className="text-emerald-500" /> {ing}
                    </div>
                  ))}
                  {selectedMeal.ingredientsMissing?.map((ing: any) => (
                    <div key={ing.name} className="flex items-center gap-2 text-xs font-bold text-orange-800 bg-orange-50/50 p-3 rounded-2xl border border-orange-100/50">
                      <AlertCircle size={14} className="text-orange-400" /> {ing.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recipe Steps Preview */}
              <div className="space-y-4">
                <h5 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Quy trình sơ bộ</h5>
                <div className="space-y-3">
                  {selectedMeal.recipeSteps?.slice(0, 3).map((step: string, i: number) => (
                    <div key={i} className="flex gap-4">
                      <span className="text-emerald-200 font-black text-lg">0{i+1}</span>
                      <p className="text-sm text-gray-600 font-medium leading-relaxed">{step}</p>
                    </div>
                  ))}
                  {selectedMeal.recipeSteps?.length > 3 && (
                    <p className="text-[10px] text-gray-400 font-bold italic text-center">... và {selectedMeal.recipeSteps.length - 3} bước nữa</p>
                  )}
                </div>
              </div>

              {/* Fomi Hack Tip */}
              <div className="bg-emerald-950 p-6 rounded-[32px] text-white flex gap-4 relative overflow-hidden shadow-xl">
                 <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                    <Lightbulb size={20} />
                 </div>
                 <div className="space-y-1 relative z-10">
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Mẹo Fomi</span>
                    <p className="text-xs font-medium italic leading-relaxed opacity-90">{selectedMeal.hackTip}</p>
                 </div>
                 <ChefHat size={60} className="absolute -right-4 -bottom-4 text-white/5 rotate-12" />
              </div>

              {/* Actions */}
              <div className="pt-4 sticky bottom-0 bg-white pb-8">
                 <button 
                   onClick={() => handleStartProcess(selectedMeal)}
                   className="w-full py-5 bg-emerald-600 text-white font-extrabold rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-emerald-200 active:scale-95 transition-all text-sm uppercase tracking-wider"
                 >
                    <ChefHat size={20} />
                    {selectedMeal.ingredientsMissing?.length > 0 ? "Đi chợ & Nấu ngay" : "Bắt đầu nấu ngay"}
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suggestion Grid */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-extrabold text-emerald-950">
             Gợi ý món ngon <Sparkles size={20} className="inline text-emerald-500 ml-1" />
          </h2>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {suggestions.map((item, idx) => {
            const isSelected = isLoggedOrActive(item.name);
            return (
              <div 
                key={idx} 
                onClick={() => setSelectedMeal(item)}
                className={`group bg-white rounded-[32px] overflow-hidden border-2 transition-all active:scale-[0.98] cursor-pointer shadow-sm relative ${isSelected ? 'border-emerald-500 bg-emerald-50/20' : 'border-transparent hover:border-emerald-100'}`}
              >
                 <div className="flex h-40">
                    <div className="w-1/3 relative overflow-hidden">
                       <img 
                         src={`https://source.unsplash.com/400x400/?food,vietnamese,${item.name.split(' ').join(',')}`} 
                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                         alt="" 
                       />
                       <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                       {isSelected && (
                         <div className="absolute inset-0 bg-emerald-600/60 backdrop-blur-[2px] flex items-center justify-center animate-in zoom-in">
                           <CheckCircle size={32} className="text-white drop-shadow-lg" />
                         </div>
                       )}
                    </div>
                    <div className="flex-1 p-5 flex flex-col justify-between">
                       <div className="space-y-1">
                          <h4 className="font-extrabold text-emerald-950 text-lg leading-tight line-clamp-2">{item.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                               {item.ingredientsMissing?.length > 0 ? `Thiếu ${item.ingredientsMissing.length} thứ` : 'Đủ nguyên liệu'}
                            </span>
                            {item.ingredientsMissing?.length === 0 && <CheckCircle size={10} className="text-emerald-500" />}
                          </div>
                       </div>
                       <div className="flex items-center gap-4 border-t border-gray-50 pt-3">
                          <div className="flex items-center gap-1 text-orange-500">
                             <Flame size={12} fill="currentColor" />
                             <span className="text-[11px] font-black">{item.calories}</span>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-600">
                             <Clock size={12} />
                             <span className="text-[11px] font-black">{item.estimatedTime}</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Secondary Actions */}
      <div className="space-y-3">
        <button 
          onClick={onRegenerate}
          className="w-full py-4.5 bg-white border-2 border-emerald-50 text-emerald-600 font-extrabold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all text-[11px] uppercase tracking-wider"
        >
           <RotateCcw size={16} /> Thay đổi lựa chọn khác
        </button>
        <p className="text-[10px] text-gray-400 font-bold text-center px-6 leading-relaxed">
          Fomi dựa trên sở thích miền <b>{dailyLog.meals[0]?.type || 'Nam'}</b> và mục tiêu <b>Healthy</b> của bạn để gợi ý.
        </p>
      </div>
    </div>
  );
};

export default MealSuggestionsView;
