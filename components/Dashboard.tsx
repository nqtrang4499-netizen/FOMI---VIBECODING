
import React, { useState } from 'react';
import { UserProfile, DailyLog, Meal } from '../types';
import { 
  Plus, Activity, ShoppingBag, ChefHat, ChevronRight, Play,
  Calendar, Zap, Utensils, Store
} from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  dailyLog: DailyLog;
  onNavigate: (view: string, subMode?: 'single' | 'day') => void;
  hasLastSuggestions: boolean;
  activeCookingMeal?: Meal | null;
}

// Fomi Panda
const MASCOT_HELLO = "https://api.dicebear.com/7.x/big-ears/svg?seed=Fomi&backgroundColor=b6e3f4&skinColor=ffffff&hairColor=000000";

const Dashboard: React.FC<DashboardProps> = ({ profile, dailyLog, onNavigate, hasLastSuggestions, activeCookingMeal }) => {
  const [showCookOptions, setShowCookOptions] = useState(false);
  const caloriesConsumed = dailyLog.meals.reduce((acc, m) => acc + m.calories, 0);
  const calorieGoal = profile.calorieGoal || 2000;
  const remaining = calorieGoal - caloriesConsumed;
  const progressPercent = Math.min((caloriesConsumed / calorieGoal) * 100, 100);

  const getStatus = () => {
    if (progressPercent < 40) return { label: 'Cần nạp', color: 'text-blue-600', bar: 'bg-blue-500' };
    if (progressPercent < 90) return { label: 'Tốt', color: 'text-emerald-600', bar: 'bg-emerald-500' };
    if (progressPercent <= 100) return { label: 'Đủ', color: 'text-orange-600', bar: 'bg-orange-500' };
    return { label: 'Vượt', color: 'text-red-600', bar: 'bg-red-500' };
  };

  const status = getStatus();

  return (
    <div className="px-5 pt-4 pb-24 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* 1. Mascot Greeting Header - Fomi Panda */}
      <section className="flex items-center justify-between bg-[#e0f4fc] p-4 rounded-3xl border border-blue-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-md relative group">
             <img src={MASCOT_HELLO} alt="Fomi" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform scale-125 translate-y-1" />
             <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h2 className="text-base font-black text-emerald-950">Chào bạn, {profile.name.split(' ').pop()}!</h2>
            <p className="text-xs font-medium text-gray-500 mt-0.5 flex items-center gap-1">
               Gấu béo Fomi đã sẵn sàng hỗ trợ
            </p>
          </div>
        </div>
      </section>

      {/* 2. Slim Energy Bar */}
      <section className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-50 flex items-center gap-4">
         <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
            <Zap size={18} fill="currentColor" />
         </div>
         <div className="flex-1 space-y-1.5">
            <div className="flex justify-between items-end">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Calo hôm nay</span>
               <span className="text-xs font-black text-emerald-950">{remaining} <span className="text-[9px] text-gray-400 font-bold">kcal còn lại</span></span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
               <div className={`h-full ${status.bar} rounded-full transition-all duration-1000`} style={{ width: `${progressPercent}%` }} />
            </div>
         </div>
      </section>

      {/* 3. Active Cooking State (If any) */}
      {activeCookingMeal && (
        <section 
          onClick={() => onNavigate('resume-cooking')}
          className="bg-emerald-900 rounded-2xl p-4 text-white shadow-lg shadow-emerald-900/20 relative overflow-hidden cursor-pointer active:scale-95 transition-all flex items-center gap-4"
        >
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
             <Play size={18} fill="white" />
          </div>
          <div className="flex-1 min-w-0">
             <p className="text-emerald-400 text-[9px] font-black uppercase tracking-widest">Đang nấu dở</p>
             <h3 className="text-sm font-bold truncate">{activeCookingMeal.name}</h3>
          </div>
          <ChevronRight size={18} className="text-emerald-500" />
        </section>
      )}

      {/* 4. Main Action Grid (2x2 Balanced) */}
      <section className="grid grid-cols-2 gap-3">
         {/* Action 1: Cook (Expandable) */}
         <div className={`col-span-2 transition-all duration-300 ${showCookOptions ? 'bg-gray-50 ring-1 ring-gray-200' : 'bg-white border border-gray-100'} rounded-2xl shadow-sm`}>
            {!showCookOptions ? (
               <div 
                  onClick={() => setShowCookOptions(true)}
                  className="p-4 flex items-center gap-4 cursor-pointer active:bg-gray-50 rounded-2xl transition-colors"
               >
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                     <ChefHat size={22} />
                  </div>
                  <div className="flex-1">
                     <h3 className="text-sm font-extrabold text-emerald-950">Gợi ý món ăn</h3>
                     <p className="text-[10px] font-bold text-gray-400 mt-0.5">Fomi thiết kế thực đơn</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                     <Plus size={16} />
                  </div>
               </div>
            ) : (
               <div className="p-2 grid grid-cols-2 gap-2 animate-in fade-in zoom-in duration-200">
                  <button 
                    onClick={() => { setShowCookOptions(false); onNavigate('select-ingredients', 'single'); }}
                    className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center gap-1 active:scale-95 transition-all hover:border-emerald-200"
                  >
                     <Utensils size={18} className="text-emerald-600"/>
                     <span className="text-[10px] font-bold text-gray-600">1 bữa ăn</span>
                  </button>
                  <button 
                    onClick={() => { setShowCookOptions(false); onNavigate('day-plan-config'); }}
                    className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center gap-1 active:scale-95 transition-all hover:border-emerald-200"
                  >
                     <Calendar size={18} className="text-emerald-600"/>
                     <span className="text-[10px] font-bold text-gray-600">Cả ngày</span>
                  </button>
               </div>
            )}
         </div>

         {/* Action 2: Eat Out */}
         <button 
            onClick={() => onNavigate('eat-out')}
            className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 active:scale-95 transition-all hover:border-orange-200 group"
         >
            <div className="w-9 h-9 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
               <Store size={18} />
            </div>
            <div className="text-left">
               <span className="text-xs font-bold text-emerald-950">Ăn ngoài</span>
            </div>
         </button>

         {/* Action 3: Shopping */}
         <button 
            onClick={() => onNavigate('shopping')}
            className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 active:scale-95 transition-all hover:border-blue-200 group"
         >
            <div className="w-9 h-9 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
               <ShoppingBag size={18} />
            </div>
            <div className="text-left">
               <span className="text-xs font-bold text-emerald-950">Đi chợ</span>
            </div>
         </button>
      </section>

      {/* 5. Health Quick View */}
      <section 
         onClick={() => onNavigate('health-tracking')}
         className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
      >
         <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-50 text-purple-500 rounded-lg flex items-center justify-center">
               <Activity size={18} />
            </div>
            <div>
               <h3 className="text-xs font-bold text-emerald-950">Theo dõi sức khỏe</h3>
               <p className="text-[10px] font-medium text-gray-400 mt-0.5">Cân nặng & BMI</p>
            </div>
         </div>
         <ChevronRight size={16} className="text-gray-300" />
      </section>
    </div>
  );
};

export default Dashboard;
