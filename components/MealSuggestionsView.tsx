
import React, { useState } from 'react';
import { Meal, DailyLog } from '../types';
import { 
  Sparkles, Clock, Zap, Plus, CheckCircle, ChevronRight, 
  BookOpen, Utensils, ChefHat, PartyPopper, X, RotateCcw, Trash2, ShoppingCart, Info
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
  const [selected, setSelected] = useState<any | null>(null);
  const [confirmShopping, setConfirmShopping] = useState<any | null>(null);
  const [showToast, setShowToast] = useState<'add' | 'remove' | null>(null);

  const isLoggedOrActive = (name: string) => 
    dailyLog.meals.some(m => m.name.toLowerCase() === name.toLowerCase()) || 
    activeCookingMeal?.name.toLowerCase() === name.toLowerCase();

  const handleSelection = (meal: any) => {
    setConfirmShopping(meal);
  };

  const finalizeSelection = (shouldGoShopping: boolean) => {
    if (confirmShopping) {
      onAddMeal(confirmShopping, shouldGoShopping);
      setConfirmShopping(null);
      setSelected(null);
      setShowToast('add');
      setTimeout(() => setShowToast(null), 3000);
    }
  };

  const handleCancel = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    onRemoveMeal(name);
    setShowToast('remove');
    setTimeout(() => setShowToast(null), 3000);
  };

  return (
    <div className="px-6 py-6 space-y-8 animate-in slide-in-from-right duration-500 pb-28">
      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 ${showToast === 'add' ? 'bg-emerald-600' : 'bg-red-500'} text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 z-[110] animate-bounce`}>
          {showToast === 'add' ? <PartyPopper size={18} /> : <RotateCcw size={18} />}
          <span className="text-xs font-bold">
            {showToast === 'add' ? 'Đã ghi nhận lựa chọn!' : 'Đã hủy món ăn'}
          </span>
        </div>
      )}

      {/* Go Shopping Confirmation Modal */}
      {confirmShopping && (
        <div className="fixed inset-0 bg-emerald-950/80 backdrop-blur-md z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-[40px] w-full max-w-sm p-8 space-y-8 shadow-2xl animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center">
                 <ShoppingCart size={40} />
              </div>
              <div className="text-center space-y-3">
                 <h3 className="text-xl font-black text-emerald-900 leading-tight">Đi chợ ngay?</h3>
                 <p className="text-sm font-medium text-gray-500 leading-relaxed">
                    Bạn đang thiếu {confirmShopping.ingredientsMissing?.length || 0} nguyên liệu cho món <b>{confirmShopping.name}</b>. Bạn có muốn đi chợ mua ngay không?
                 </p>
              </div>
              <div className="space-y-3">
                 <button 
                   onClick={() => finalizeSelection(true)}
                   className="w-full py-5 bg-emerald-600 text-white font-black rounded-3xl shadow-xl shadow-emerald-100 active:scale-95 transition-all text-xs uppercase"
                 >
                    Có, đi chợ ngay
                 </button>
                 <button 
                   onClick={() => finalizeSelection(false)}
                   className="w-full py-5 bg-gray-100 text-gray-400 font-black rounded-3xl active:scale-95 transition-all text-xs uppercase"
                 >
                    Để sau, về trang chủ
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Detail Screen (Full Overlay) */}
      {selected && (
        <div className="fixed inset-0 bg-white z-[100] overflow-y-auto animate-in slide-in-from-bottom duration-500">
           <div className="sticky top-0 bg-white/90 backdrop-blur-md p-6 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-xl font-bold text-emerald-900 pr-10 truncate">{selected.name}</h3>
              <button onClick={() => setSelected(null)} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><X size={20} /></button>
           </div>
           <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-emerald-50 p-4 rounded-3xl flex items-center gap-3">
                    <Clock size={20} className="text-emerald-600" />
                    <div>
                       <p className="text-[10px] text-emerald-600 font-bold uppercase">Thời gian</p>
                       <p className="text-sm font-bold text-emerald-900">{selected.estimatedTime || '20 phút'}</p>
                    </div>
                 </div>
                 <div className="bg-orange-50 p-4 rounded-3xl flex items-center gap-3">
                    <Zap size={20} className="text-orange-600" />
                    <div>
                       <p className="text-[10px] text-orange-600 font-bold uppercase">Độ khó</p>
                       <p className="text-sm font-bold text-orange-900">{selected.difficulty || 'Dễ'}</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-lg font-bold text-emerald-900 flex items-center gap-2">Nguyên liệu</h4>
                 <div className="bg-gray-50 rounded-[32px] p-6 space-y-3">
                    {selected.ingredientsFound?.map((ing: string, i: number) => (
                       <div key={i} className="flex items-center gap-3 text-sm font-medium text-gray-700">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> {ing}
                       </div>
                    ))}
                    {selected.ingredientsMissing?.map((ing: any, i: number) => (
                       <div key={i} className="flex items-center gap-3 text-sm font-medium text-orange-500">
                          <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" /> {typeof ing === 'string' ? ing : ing.name} (Cần mua)
                       </div>
                    ))}
                 </div>
              </div>

              {selected.recipeSteps && (
                <div className="space-y-4">
                   <h4 className="text-lg font-bold text-emerald-900 flex items-center gap-2">Công thức</h4>
                   <div className="space-y-6">
                      {selected.recipeSteps.map((step: string, i: number) => (
                         <div key={i} className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-bold flex-shrink-0 flex items-center justify-center text-sm">{i+1}</div>
                            <p className="text-sm text-gray-600 leading-relaxed pt-1">{step}</p>
                         </div>
                      ))}
                   </div>
                </div>
              )}

              <div className="bg-emerald-900 text-white p-7 rounded-[40px] space-y-2 shadow-lg shadow-emerald-900/10">
                 <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                    <Sparkles size={14} /> Mẹo từ Fomi
                 </div>
                 <p className="text-sm leading-relaxed italic opacity-90">{selected.hackTip || "Ăn nhiều rau xanh trước khi ăn đạm giúp tiêu hóa tốt hơn."}</p>
              </div>

              {isLoggedOrActive(selected.name) ? (
                <button 
                  onClick={(e) => {
                    handleCancel(e, selected.name);
                    setSelected(null);
                  }}
                  className="w-full py-5 font-bold rounded-3xl shadow-xl active:scale-95 transition-all text-sm uppercase flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-100"
                >
                  <Trash2 size={18} /> Hủy chọn món ăn này
                </button>
              ) : (
                <button 
                  onClick={() => {
                    handleSelection(selected);
                  }}
                  className="w-full py-5 font-bold rounded-3xl shadow-xl active:scale-95 transition-all text-sm uppercase flex items-center justify-center gap-2 bg-emerald-600 text-white shadow-emerald-100"
                >
                  Chọn nấu món này
                </button>
              )}
           </div>
        </div>
      )}

      {/* Header View */}
      <section className="space-y-2">
        <h2 className="text-2xl font-bold text-emerald-900 tracking-tight flex items-center gap-2">
          <Sparkles className="text-emerald-500" /> Thực đơn gợi ý
        </h2>
        <p className="text-sm text-gray-500 font-medium">Fomi đã thiết kế 3 phương án tuyệt vời dựa trên nguyên liệu của bạn.</p>
      </section>

      {/* List Suggestions */}
      <div className="space-y-6">
        {suggestions.map((item, idx) => {
          const isSelected = isLoggedOrActive(item.name);
          return (
            <div 
              key={idx} 
              onClick={() => setSelected(item)}
              className={`bg-white rounded-[40px] border ${isSelected ? 'border-emerald-200 ring-2 ring-emerald-50' : 'border-gray-100'} overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer relative`}
            >
               <div className="relative h-44 overflow-hidden">
                  <img 
                    src={`https://source.unsplash.com/800x600/?vietnamese,cooking,${encodeURIComponent(item.name)}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    alt={item.name} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  
                  {isSelected && (
                    <div className="absolute top-4 right-4 bg-emerald-600 text-white p-2 rounded-full shadow-lg z-10">
                       <CheckCircle size={16} />
                    </div>
                  )}

                  <div className="absolute bottom-4 left-6 right-6">
                     <h4 className="text-xl font-bold text-white drop-shadow-md">{item.name}</h4>
                     <div className="flex items-center gap-3 mt-1 opacity-90">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{item.calories} Kcal</span>
                        <span className="text-[10px] font-bold text-white/50">•</span>
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">{item.estimatedTime || '20m'}</span>
                     </div>
                  </div>
               </div>
               <div className="p-6 flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <p className="text-xs text-gray-400 font-medium line-clamp-1">
                      {isSelected ? (activeCookingMeal?.name === item.name ? 'Đang chuẩn bị nấu...' : 'Đã hoàn thành') : item.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <button 
                        onClick={(e) => handleCancel(e, item.name)}
                        className="w-10 h-10 bg-red-50 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    <div className={`w-10 h-10 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600'} rounded-xl flex items-center justify-center`}>
                       <ChevronRight size={18} />
                    </div>
                  </div>
               </div>
            </div>
          );
        })}
      </div>

      {/* Satisfaction Check */}
      <section className="bg-white p-8 rounded-[40px] border border-gray-100 space-y-6 shadow-sm">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
               <Info size={24} />
            </div>
            <div>
               <h4 className="font-black text-emerald-900 text-sm">Chưa chọn được món ưng ý?</h4>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Fomi có thể gợi ý lại</p>
            </div>
         </div>
         <button 
           onClick={onRegenerate}
           className="w-full py-4 bg-emerald-50 text-emerald-600 font-black rounded-3xl flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all text-xs uppercase"
         >
            <RotateCcw size={16} /> Gợi ý món khác cho tôi
         </button>
      </section>

      {/* Footer Info */}
      <section className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100 flex items-center gap-4">
         <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
            <BookOpen size={20} />
         </div>
         <p className="text-xs font-semibold text-emerald-900 leading-relaxed">
            Mọi lựa chọn của bạn đều được lưu lại. Bạn có thể thay đổi bất cứ lúc nào.
         </p>
      </section>
    </div>
  );
};

export default MealSuggestionsView;
