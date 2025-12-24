
import React, { useState } from 'react';
import { Meal, DailyLog } from '../types';
import { 
  Sparkles, Clock, Plus, CheckCircle, 
  X, RotateCcw, Flame, Store, Check
} from 'lucide-react';

interface MealSuggestionsViewProps {
  suggestions: any[];
  dailyLog: DailyLog;
  activeCookingMeal: Meal | null;
  onAddMeal: (meal: any) => void;
  onRemoveMeal: (name: string) => void;
  onRegenerate: () => void;
  onNext?: () => void;
  onFinishSelection?: () => void;
}

// Fomi Panda
const MASCOT_HEAD = "https://api.dicebear.com/7.x/big-ears/svg?seed=Fomi&backgroundColor=b6e3f4&skinColor=ffffff&hairColor=000000";

const MealSuggestionsView: React.FC<MealSuggestionsViewProps> = ({ suggestions, dailyLog, activeCookingMeal, onAddMeal, onRemoveMeal, onRegenerate, onFinishSelection }) => {
  const [selectedMeal, setSelectedMeal] = useState<any | null>(null);

  const isLoggedOrActive = (name: string) => 
    dailyLog.meals.some(m => m.name.toLowerCase() === name.toLowerCase()) || 
    activeCookingMeal?.name.toLowerCase() === name.toLowerCase();

  const handleAddToMenu = (meal: any) => {
    onAddMeal(meal);
    setSelectedMeal(null);
  };
  
  const hasSelectedMeals = dailyLog.meals.length > 0;

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header Compact with Mascot */}
      <div className="px-5 py-4 shrink-0 flex justify-between items-end bg-white border-b border-gray-50 shadow-sm">
         <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#b6e3f4] rounded-full border-2 border-white shadow-sm overflow-hidden shrink-0 flex items-center justify-center">
               <img src={MASCOT_HEAD} alt="Fomi" className="w-full h-full object-cover transform scale-125 translate-y-1" />
            </div>
            <div>
               <h2 className="text-lg font-black text-emerald-950 flex items-center gap-1">
                   Góc của Fomi <Sparkles className="text-yellow-400 fill-current" size={14} />
               </h2>
               <p className="text-xs font-medium text-gray-500">Món ngon dành riêng cho bạn</p>
            </div>
         </div>
         <button 
            onClick={onRegenerate}
            className="w-9 h-9 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:border-emerald-200 transition-all active:rotate-180"
         >
            <RotateCcw size={16} />
         </button>
      </div>

      {/* Suggestion List - Slim & Clean */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32 space-y-3">
        {suggestions.map((item, idx) => {
          const isSelected = isLoggedOrActive(item.name);
          return (
            <div 
              key={idx} 
              onClick={() => setSelectedMeal(item)}
              className={`group bg-white p-2.5 rounded-2xl border transition-all active:scale-[0.99] cursor-pointer shadow-sm flex items-center gap-3 ${isSelected ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/20' : 'border-gray-100 hover:border-emerald-200'}`}
            >
               {/* Image Thumbnail */}
               <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative bg-gray-100">
                  <img 
                    src={`https://source.unsplash.com/150x150/?food,vietnamese,${item.name.split(' ').join(',')}`} 
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all" 
                    alt="" 
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-emerald-600/60 backdrop-blur-[1px] flex items-center justify-center animate-in zoom-in">
                      <CheckCircle size={18} className="text-white drop-shadow-sm" />
                    </div>
                  )}
               </div>

               {/* Text Info */}
               <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{item.type || 'Gợi ý'}</span>
                      {item.isEatOut && <Store size={10} className="text-blue-500"/>}
                  </div>
                  <h4 className="font-bold text-emerald-950 text-sm leading-tight truncate">{item.name}</h4>
                  <div className="flex items-center gap-3 mt-1.5">
                     <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                        <Flame size={10} className="text-orange-400" /> {item.calories}
                     </span>
                     {!item.isEatOut && (
                         <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                            <Clock size={10} className="text-emerald-500" /> {item.estimatedTime}
                         </span>
                     )}
                  </div>
               </div>

               {/* Add Button */}
               {!isSelected ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleAddToMenu(item); }}
                    className="w-8 h-8 rounded-full bg-gray-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all mr-1"
                  >
                     <Plus size={16} />
                  </button>
               ) : (
                  <div className="mr-2 text-emerald-600">
                     <CheckCircle size={18} />
                  </div>
               )}
            </div>
          );
        })}
      </div>

      {/* Floating Finish Button */}
      {hasSelectedMeals && onFinishSelection && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-30 max-w-[390px] mx-auto bg-gradient-to-t from-white via-white/90 to-transparent pt-8">
           <button 
              onClick={onFinishSelection}
              className="w-full py-4 bg-emerald-950 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/20 active:scale-95 transition-all text-xs uppercase tracking-wider"
           >
              Hoàn tất chọn món <Check size={18} />
           </button>
        </div>
      )}

      {/* Meal Detail Modal Slim */}
      {selectedMeal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center animate-in fade-in max-w-[390px] mx-auto">
          <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-[2px]" onClick={() => setSelectedMeal(null)} />
          
          <div className="bg-white w-full rounded-t-[28px] relative z-10 max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-full duration-300 shadow-2xl">
            <div className="shrink-0 p-4 flex justify-between items-center border-b border-gray-50">
               <h3 className="text-sm font-extrabold text-emerald-950 uppercase tracking-wide">Thông tin món ăn</h3>
               <button onClick={() => setSelectedMeal(null)} className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100">
                  <X size={16} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm shrink-0 bg-gray-100">
                  <img src={`https://source.unsplash.com/200x200/?food,recipe,${selectedMeal.name}`} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 py-1">
                  <h4 className="text-lg font-black text-emerald-950 leading-tight mb-1">{selectedMeal.name}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{selectedMeal.description}</p>
                </div>
              </div>

              {selectedMeal.isEatOut ? (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 items-start">
                   <Store className="text-blue-500 shrink-0 mt-0.5" size={16} />
                   <p className="text-xs text-blue-900 font-medium leading-relaxed">Đây là món ăn ngoài, bạn không cần chuẩn bị nguyên liệu.</p>
                </div>
              ) : (
                <div className="space-y-3">
                   <h5 className="text-[11px] font-bold text-gray-900 uppercase tracking-wide">Nguyên liệu chính</h5>
                   <div className="flex flex-wrap gap-2">
                      {selectedMeal.ingredientsFound?.map((ing: string) => (
                        <span key={ing} className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">{ing}</span>
                      ))}
                      {selectedMeal.ingredientsMissing?.map((ing: any) => (
                        <span key={ing.name} className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 line-through">{ing.name}</span>
                      ))}
                   </div>
                </div>
              )}
            </div>

            <div className="shrink-0 p-5 border-t border-gray-50 pb-8 bg-white">
                 {isLoggedOrActive(selectedMeal.name) ? (
                    <button disabled className="w-full py-4 bg-gray-100 text-gray-400 font-bold rounded-xl flex items-center justify-center gap-2 text-xs uppercase cursor-not-allowed">
                       <CheckCircle size={16} /> Đã có trong thực đơn
                    </button>
                 ) : (
                    <button 
                      onClick={() => handleAddToMenu(selectedMeal)}
                      className="w-full py-4 bg-emerald-600 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 active:scale-95 transition-all text-xs uppercase tracking-wider"
                    >
                        <Plus size={16} /> Thêm vào thực đơn
                    </button>
                 )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealSuggestionsView;
