
import React, { useState } from 'react';
import { DailyLog, Meal } from '../types';
import { 
  Utensils, Store, Clock, Flame, ChevronRight, X, 
  ChefHat, CheckCircle, AlertCircle, ShoppingCart, Play, Camera, Info
} from 'lucide-react';

interface DayMenuViewProps {
  dailyLog: DailyLog;
  onStartProcess: (meal: Meal, shouldGoShopping: boolean) => void;
  onRemoveMeal: (id: string) => void;
}

const DayMenuView: React.FC<DayMenuViewProps> = ({ dailyLog, onStartProcess, onRemoveMeal }) => {
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  const handleStart = (meal: Meal) => {
    const hasMissing = meal.ingredientsMissing && meal.ingredientsMissing.length > 0;
    onStartProcess(meal, !!hasMissing); // Cast to boolean just in case
    setSelectedMeal(null);
  };

  return (
    <div className="px-6 py-4 space-y-6 animate-in slide-in-from-right duration-500 pb-28">
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-emerald-950">Thực đơn hôm nay</h2>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
           {dailyLog.meals.length} món ăn đã được lên kế hoạch
        </p>
      </div>

      <div className="space-y-4">
        {dailyLog.meals.length === 0 ? (
           <div className="text-center py-10 opacity-50">
              <p>Chưa có món nào được chọn.</p>
           </div>
        ) : (
          dailyLog.meals.map((meal) => (
             <div 
               key={meal.id}
               onClick={() => setSelectedMeal(meal)}
               className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-4 active:scale-95 transition-all cursor-pointer hover:border-emerald-200"
             >
                <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 relative">
                   <img src={`https://source.unsplash.com/200x200/?food,dish,${meal.name}`} className="w-full h-full object-cover" alt="" />
                   {meal.isEatOut && (
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Store size={20} className="text-white" />
                     </div>
                   )}
                </div>
                <div className="flex-1 space-y-1">
                   <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${meal.isEatOut ? 'text-orange-600 bg-orange-50' : 'text-emerald-600 bg-emerald-50'}`}>
                        {meal.isEatOut ? 'Ăn ngoài' : meal.type}
                      </span>
                   </div>
                   <h4 className="font-bold text-emerald-950 leading-tight line-clamp-1">{meal.name}</h4>
                   <div className="flex gap-3 text-xs text-gray-400 font-bold">
                      <span className="flex items-center gap-1"><Flame size={12}/> {meal.calories}</span>
                      <span className="flex items-center gap-1"><Clock size={12}/> {meal.estimatedTime || 'N/A'}</span>
                   </div>
                </div>
                <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                   <ChevronRight size={18} />
                </div>
             </div>
          ))
        )}
      </div>

      {/* Detail Modal for Execution */}
      {selectedMeal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center animate-in fade-in">
          <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" onClick={() => setSelectedMeal(null)} />
          <div className="bg-white w-full max-w-md rounded-t-[40px] relative z-10 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-full duration-500">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md p-6 flex justify-between items-center border-b border-gray-50">
               <h3 className="text-xl font-extrabold text-emerald-950">
                 {selectedMeal.isEatOut ? 'Thông tin món ăn' : 'Chuẩn bị nấu'}
               </h3>
               <button onClick={() => setSelectedMeal(null)} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                  <X size={20} />
               </button>
            </div>

            <div className="p-8 space-y-8">
               <div className="text-center space-y-2">
                  <div className="w-24 h-24 rounded-[32px] overflow-hidden mx-auto shadow-lg mb-4">
                     <img src={`https://source.unsplash.com/300x300/?food,dish,${selectedMeal.name}`} className="w-full h-full object-cover" alt="" />
                  </div>
                  <h4 className="text-2xl font-black text-emerald-950">{selectedMeal.name}</h4>
                  <p className="text-sm font-medium text-gray-500">{selectedMeal.description}</p>
               </div>

               {selectedMeal.isEatOut ? (
                 // Giao diện cho món Ăn ngoài
                 <div className="space-y-6">
                    <div className="bg-orange-50 p-6 rounded-[24px] border border-orange-100 space-y-3">
                       <div className="flex items-center gap-2 text-orange-600 font-black text-xs uppercase tracking-widest">
                          <Info size={16} /> Lưu ý từ Fomi
                       </div>
                       <p className="text-sm text-emerald-900 font-medium leading-relaxed">
                          Bạn không bắt buộc phải ăn đúng món này. Nếu ra quán và đổi ý muốn ăn món khác, hãy cứ nhấn <b>Check-in</b> và chụp lại món mới. Fomi sẽ tự động nhận diện và cập nhật lại thực đơn cho bạn.
                       </p>
                    </div>
                 </div>
               ) : (
                 // Giao diện cho món Tự nấu
                 <>
                   <div className="space-y-4">
                      <h5 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Nguyên liệu cần thiết</h5>
                      <div className="space-y-2">
                         {selectedMeal.ingredientsFound?.map(ing => (
                            <div key={ing} className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                               <CheckCircle size={16} className="text-emerald-500" />
                               <span className="text-sm font-bold text-emerald-900">{ing}</span>
                            </div>
                         ))}
                         {selectedMeal.ingredientsMissing?.map((ing: any) => (
                            <div key={ing.name || ing} className="flex items-center gap-3 p-3 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                               <AlertCircle size={16} className="text-orange-500" />
                               <span className="text-sm font-bold text-orange-900">{typeof ing === 'string' ? ing : ing.name}</span>
                               <span className="ml-auto text-[10px] font-black text-orange-400 uppercase tracking-widest">Thiếu</span>
                            </div>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <h5 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Cách làm</h5>
                      <div className="bg-gray-50 p-6 rounded-3xl space-y-4">
                         {selectedMeal.recipeSteps?.map((step, idx) => (
                            <div key={idx} className="flex gap-3">
                               <span className="w-6 h-6 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0">{idx+1}</span>
                               <p className="text-sm text-gray-600 font-medium">{step}</p>
                            </div>
                         ))}
                      </div>
                   </div>
                 </>
               )}

               {/* Action Button */}
               <div className="pt-4 sticky bottom-0 bg-white pb-8">
                  <button 
                    onClick={() => handleStart(selectedMeal)}
                    className="w-full py-5 bg-emerald-600 text-white font-extrabold rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-emerald-200 active:scale-95 transition-all text-sm uppercase tracking-wider"
                  >
                     {selectedMeal.isEatOut ? (
                        <>Check-in ngay <Camera size={20} /></>
                     ) : (
                        selectedMeal.ingredientsMissing && selectedMeal.ingredientsMissing.length > 0 ? (
                           <>Đi chợ & Nấu <ShoppingCart size={20} /></>
                        ) : (
                           <>Bắt đầu nấu ngay <Play size={20} /></>
                        )
                     )}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayMenuView;
