
import React from 'react';
import { DailyLog, Meal } from '../types';
import { Trash2, Utensils, Store, Flame, Clock, Zap } from 'lucide-react';

interface DailyLogViewProps {
  dailyLog: DailyLog;
  onRemoveMeal: (mealId: string) => void;
}

const DailyLogView: React.FC<DailyLogViewProps> = ({ dailyLog, onRemoveMeal }) => {
  const totalCalories = dailyLog.meals.reduce((acc, m) => acc + m.calories, 0);

  return (
    <div className="px-6 py-6 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-emerald-900 tracking-tight">Nhật ký hôm nay</h2>
          <p className="text-xs text-gray-400 font-medium">Bạn đã nạp tổng cộng {totalCalories} Kcal</p>
        </div>
        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
           <Flame size={24} />
        </div>
      </div>

      <div className="space-y-4">
        {dailyLog.meals.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-100 rounded-[32px] p-12 text-center space-y-3">
            <Utensils size={40} className="text-gray-100 mx-auto" />
            <p className="text-sm font-bold text-gray-300">Hôm nay bạn chưa nạp món nào!</p>
          </div>
        ) : (
          dailyLog.meals.map((meal) => (
            <div key={meal.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4 group">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                    {meal.isEatOut ? <Store size={22} /> : <Utensils size={22} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900 text-lg">{meal.name}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{meal.isEatOut ? 'Ăn bên ngoài' : 'Tự nấu'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if(confirm(`Bạn muốn xóa "${meal.name}" khỏi nhật ký?`)) onRemoveMeal(meal.id);
                  }}
                  className="p-2 text-gray-200 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                 <div className="flex items-center gap-1.5">
                    <Flame size={14} className="text-orange-400" />
                    <span className="text-xs font-bold text-gray-600">{meal.calories} kcal</span>
                 </div>
                 {meal.estimatedTime && (
                   <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-emerald-500" />
                      <span className="text-xs font-bold text-gray-600">{meal.estimatedTime}</span>
                   </div>
                 )}
                 {meal.difficulty && (
                   <div className="flex items-center gap-1.5">
                      <Zap size={14} className="text-blue-400" />
                      <span className="text-xs font-bold text-gray-600">{meal.difficulty}</span>
                   </div>
                 )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-emerald-900 text-white p-7 rounded-[40px] space-y-4 shadow-xl">
         <h4 className="font-bold flex items-center gap-2">Tóm tắt dinh dưỡng</h4>
         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
               <p className="text-[10px] uppercase font-bold opacity-50">Calo mục tiêu</p>
               <p className="text-xl font-bold">2,000</p>
            </div>
            <div className="space-y-1">
               <p className="text-[10px] uppercase font-bold opacity-50">Còn lại</p>
               <p className="text-xl font-bold">{Math.max(2000 - totalCalories, 0)}</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DailyLogView;
