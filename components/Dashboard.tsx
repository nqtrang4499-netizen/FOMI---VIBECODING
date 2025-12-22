
import React from 'react';
import { UserProfile, DailyLog, Meal } from '../types';
import { 
  Flame, Plus, Smile, Activity, Camera, 
  ShoppingBag, History, Sparkles, ChefHat, ChevronRight, Wind, Play
} from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  dailyLog: DailyLog;
  onNavigate: (view: string) => void;
  hasLastSuggestions: boolean;
  activeCookingMeal?: Meal | null;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, dailyLog, onNavigate, hasLastSuggestions, activeCookingMeal }) => {
  const caloriesConsumed = dailyLog.meals.reduce((acc, m) => acc + m.calories, 0);
  const calorieGoal = profile.calorieGoal || 2000;
  const progressPercent = Math.min((caloriesConsumed / calorieGoal) * 100, 100);

  const getStatus = () => {
    if (progressPercent < 40) return { label: 'Bụng còn trống', color: 'text-blue-500', bg: 'bg-blue-50', bar: 'bg-blue-400', icon: <Wind size={14} /> };
    if (progressPercent < 90) return { label: 'Đã nạp năng lượng', color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500', icon: <Smile size={14} /> };
    return { label: 'Đã đủ Calo', color: 'text-orange-600', bg: 'bg-orange-50', bar: 'bg-orange-500', icon: <Activity size={14} /> };
  };

  const status = getStatus();

  return (
    <div className="px-6 space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Welcome Header */}
      <section className="pt-6 flex justify-between items-center">
        <div>
          <p className="text-gray-400 text-sm font-medium">Chào ngày mới,</p>
          <h2 className="text-3xl font-bold text-emerald-900 tracking-tight">{profile.name}</h2>
        </div>
        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
           <ChefHat size={28} />
        </div>
      </section>

      {/* Active Cooking Meal (Highest Priority) */}
      {activeCookingMeal && (
        <section 
          onClick={() => onNavigate('resume-cooking')}
          className="bg-orange-500 rounded-[40px] p-8 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all"
        >
           <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                 <Play size={24} className="text-white fill-white" />
              </div>
              <div>
                 <h3 className="text-2xl font-bold">Tiếp tục nấu ăn</h3>
                 <p className="text-orange-100 text-sm font-medium opacity-90 mt-1">{activeCookingMeal.name}</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-orange-200 pt-2">
                 Quay lại quy trình <ChevronRight size={14} />
              </div>
           </div>
           <ChefHat size={120} className="absolute -right-8 -bottom-8 text-white/10 rotate-12 group-hover:scale-110 transition-all" />
        </section>
      )}

      {/* Primary Action Card (If not cooking) */}
      {!activeCookingMeal && (
        <section 
          onClick={() => onNavigate('select-ingredients')}
          className="bg-emerald-900 rounded-[40px] p-8 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-800 rounded-full blur-3xl opacity-50 group-hover:scale-125 transition-all duration-700"></div>
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <Plus size={24} className="text-emerald-400" />
            </div>
            <div>
                <h3 className="text-2xl font-bold">Lên thực đơn</h3>
                <p className="text-emerald-300 text-sm font-medium opacity-80 mt-1">Hôm nay bạn muốn ăn gì?</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400 pt-2">
                Bắt đầu ngay <ChevronRight size={14} />
            </div>
          </div>
          <Sparkles size={120} className="absolute -right-8 -bottom-8 text-white/5 rotate-12 group-hover:scale-110 transition-all" />
        </section>
      )}

      {/* Quick Access Grid */}
      <section className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onNavigate('shopping')}
          className="bg-white p-6 rounded-[32px] border border-gray-100 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
             <ShoppingBag size={20} />
          </div>
          <div className="text-left">
             <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Đi chợ</span>
             <span className="text-sm font-bold text-emerald-900">Mua sắm</span>
          </div>
        </button>

        <button 
          onClick={() => onNavigate('history')}
          className="bg-white p-6 rounded-[32px] border border-gray-100 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
             <History size={20} />
          </div>
          <div className="text-left">
             <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Lịch sử</span>
             <span className="text-sm font-bold text-emerald-900">Nhật ký ăn</span>
          </div>
        </button>
      </section>

      {/* Resume Suggestions (Persistence) */}
      {hasLastSuggestions && !activeCookingMeal && (
        <section 
          onClick={() => onNavigate('meal-suggestions')}
          className="bg-white p-5 rounded-[32px] border-2 border-emerald-100 flex items-center justify-between group cursor-pointer"
        >
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                 <Sparkles size={18} />
              </div>
              <div>
                 <p className="text-sm font-bold text-emerald-900">Xem lại gợi ý cũ</p>
                 <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Tiếp tục thực đơn của bạn</p>
              </div>
           </div>
           <ChevronRight size={20} className="text-gray-300 group-hover:text-emerald-600 transition-all" />
        </section>
      )}

      {/* Calorie Stats */}
      <section 
        onClick={() => onNavigate('history')}
        className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50 space-y-6 cursor-pointer"
      >
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className={`w-12 h-12 ${status.bg} rounded-2xl flex items-center justify-center ${status.color}`}>
                  <Flame size={24} fill="currentColor" />
               </div>
               <div>
                  <h4 className="text-lg font-bold text-emerald-900 leading-tight">Dinh dưỡng</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{status.label}</p>
               </div>
            </div>
            <div className="text-right">
               <p className="text-2xl font-bold text-emerald-900">{caloriesConsumed}</p>
               <p className="text-[10px] font-bold text-gray-300">/ {calorieGoal} Kcal</p>
            </div>
         </div>
         <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
            <div className={`h-full ${status.bar} transition-all duration-1000`} style={{ width: `${progressPercent}%` }} />
         </div>
      </section>
    </div>
  );
};

export default Dashboard;
