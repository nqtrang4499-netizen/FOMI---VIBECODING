
import React, { useState, useEffect } from 'react';
import { UserProfile, DailyLog, Meal } from '../types';
import { getMealSuggestions } from '../services/geminiService';
import { Sparkles, Utensils, Store, Zap, CheckCircle, Flame, Activity } from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  dailyLog: DailyLog;
  onAddMeal: (meal: Meal) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, dailyLog, onAddMeal }) => {
  const [suggestion, setSuggestion] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchSuggestion = async () => {
    setLoading(true);
    const result = await getMealSuggestions(profile, dailyLog.meals);
    setSuggestion(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchSuggestion();
  }, [dailyLog.meals.length]);

  const caloriesConsumed = dailyLog.meals.reduce((acc, m) => acc + m.calories, 0);
  const calorieGoal = 2000; // Hypothetical daily goal
  const progressPercent = Math.min((caloriesConsumed / calorieGoal) * 100, 100);

  return (
    <div className="px-6 space-y-6 animate-in fade-in duration-500 pb-10">
      {/* 1. Greeting Section */}
      <section className="pt-6">
        <p className="text-gray-400 text-sm font-medium">Chào ngày mới,</p>
        <h2 className="text-3xl font-black text-gray-900 leading-tight">
          <span className="text-orange-500">{profile.name}</span>!
        </h2>
      </section>

      {/* 2. Quick Stats Dashboard (Restructured above Suggestions) */}
      <section className="bg-white rounded-[32px] p-6 shadow-sm border border-orange-50 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Activity size={16} className="text-orange-500" />
            Chỉ số hôm nay
          </h3>
          <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
            Mục tiêu: {calorieGoal} kcal
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-orange-600">
              <Flame size={16} fill="currentColor" />
              <p className="text-2xl font-black text-gray-900">{caloriesConsumed}</p>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Đã nạp (kcal)</p>
          </div>

          <div className="space-y-1">
            <div className={`flex items-center gap-1.5 ${
              dailyLog.compensationStatus === 'Over' ? 'text-red-500' : 
              dailyLog.compensationStatus === 'Under' ? 'text-blue-500' : 
              'text-green-500'
            }`}>
              <Zap size={16} fill="currentColor" />
              <p className="text-sm font-black text-gray-900">
                {dailyLog.compensationStatus === 'Over' ? 'Vượt ngưỡng' : 
                 dailyLog.compensationStatus === 'Under' ? 'Cần nạp thêm' : 
                 'Cân bằng'}
              </p>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Trạng thái</p>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-2">
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                progressPercent > 80 ? 'bg-red-400' : 'bg-orange-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-gray-400">
            <span>0%</span>
            <span>{Math.round(progressPercent)}% đã dùng</span>
          </div>
        </div>
      </section>

      {/* 3. Main Suggestion Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Sparkles size={18} className="text-orange-500" />
            Gợi ý món tiếp theo
          </h3>
          <button 
            onClick={fetchSuggestion} 
            disabled={loading}
            className="text-xs font-bold text-orange-600 px-3 py-1 bg-orange-50 rounded-full active:scale-95 transition-all"
          >
            {loading ? '...' : 'Đổi món'}
          </button>
        </div>

        {loading ? (
          <div className="bg-white border border-orange-100 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 text-center">
             <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
             <p className="text-xs text-gray-400 font-medium tracking-tight">Đang thiết kế thực đơn cho bạn...</p>
          </div>
        ) : suggestion ? (
          <div className="space-y-4">
            {/* Key points logic bullets */}
            {suggestion.keyPoints && (
              <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100/50">
                <ul className="space-y-2">
                  {suggestion.keyPoints.map((point: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-xs font-medium text-orange-800">
                      <CheckCircle size={14} className="text-orange-500 shrink-0 mt-0.5" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Home Meal Card */}
            <div className="bg-white border-2 border-orange-100 rounded-[32px] p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-lg">Tự nấu tại nhà</span>
                  <h4 className="text-xl font-bold text-gray-900 mt-2">{suggestion.homeMeal.name}</h4>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-orange-600">{suggestion.homeMeal.calories}</span>
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Kcal</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-3 italic leading-relaxed">{suggestion.homeMeal.description}</p>
              
              <button 
                onClick={() => onAddMeal({
                  id: Math.random().toString(),
                  name: suggestion.homeMeal.name,
                  type: 'Lunch',
                  isEatOut: false,
                  calories: suggestion.homeMeal.calories,
                  description: suggestion.homeMeal.description
                })}
                className="w-full mt-6 py-3.5 bg-orange-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-200 transition-all active:scale-95"
              >
                <Utensils size={18} />
                Chọn món này
              </button>
            </div>

            {/* Eat Out Card */}
            <div className="bg-gray-900 rounded-[32px] p-6 shadow-xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700"></div>
              
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-lg">Ăn ngoài / Delivery</span>
                  <h4 className="text-xl font-bold text-white mt-2">{suggestion.eatOutMeal.name}</h4>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-orange-400">{suggestion.eatOutMeal.calories}</span>
                  <span className="text-[10px] text-gray-500 block uppercase font-bold">Kcal</span>
                </div>
              </div>

              <div className="mt-5 p-4 bg-white/5 rounded-2xl border border-white/10 relative z-10">
                <div className="flex items-center gap-2 text-orange-400 mb-2">
                  <Zap size={14} fill="currentColor" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Fomi Hack Tip</span>
                </div>
                <p className="text-sm text-gray-300 leading-snug italic">
                  "{suggestion.eatOutMeal.hackTip}"
                </p>
              </div>

              <button 
                onClick={() => onAddMeal({
                  id: Math.random().toString(),
                  name: suggestion.eatOutMeal.name,
                  type: 'Lunch',
                  isEatOut: true,
                  calories: suggestion.eatOutMeal.calories,
                  description: suggestion.eatOutMeal.hackTip
                })}
                className="w-full mt-6 py-3.5 bg-white text-gray-900 font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
              >
                <Store size={18} />
                Lưu mẹo & Ăn
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {/* 4. History Feed Snippet */}
      <section>
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-lg font-bold text-gray-900">Nhật ký hôm nay</h3>
          <span className="text-[10px] font-bold text-gray-400 uppercase">
            {dailyLog.meals.length} bữa ăn
          </span>
        </div>
        
        {dailyLog.meals.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center text-gray-400">
            <Utensils className="mx-auto mb-2 opacity-20" size={32} />
            <p className="text-xs font-medium">Lên kế hoạch bữa ăn đầu tiên thôi!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dailyLog.meals.map((meal) => (
              <div key={meal.id} className="bg-white p-4 rounded-2xl border border-gray-50 flex items-center justify-between shadow-sm animate-in slide-in-from-left duration-300">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meal.isEatOut ? 'bg-gray-100 text-gray-900' : 'bg-orange-100 text-orange-600'}`}>
                    {meal.isEatOut ? <Store size={18} /> : <Utensils size={18} />}
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm">{meal.name}</h5>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                      {meal.isEatOut ? 'Ăn ngoài' : 'Tự nấu'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-gray-900 text-sm">{meal.calories}</span>
                  <span className="text-[8px] block text-gray-400 font-bold">KCAL</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
