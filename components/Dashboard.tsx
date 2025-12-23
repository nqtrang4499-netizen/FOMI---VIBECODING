
import React from 'react';
import { UserProfile, DailyLog, Meal } from '../types';
import { 
  Flame, Plus, Smile, Activity, Camera, 
  ShoppingBag, History, Sparkles, ChefHat, ChevronRight, Wind, Play,
  Calendar, Zap, TrendingDown, TrendingUp
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
  const remaining = calorieGoal - caloriesConsumed;
  const progressPercent = Math.min((caloriesConsumed / calorieGoal) * 100, 100);

  const getStatus = () => {
    if (progressPercent < 40) return { label: 'Cần bổ sung thêm', color: 'text-blue-600', bg: 'bg-blue-50', bar: 'bg-blue-500', trend: <TrendingUp size={14}/> };
    if (progressPercent < 90) return { label: 'Duy trì rất tốt', color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500', trend: <TrendingUp size={14}/> };
    if (progressPercent <= 100) return { label: 'Đã đạt mục tiêu', color: 'text-orange-600', bg: 'bg-orange-50', bar: 'bg-orange-500', trend: <Activity size={14}/> };
    return { label: 'Vượt mức cho phép', color: 'text-red-600', bg: 'bg-red-50', bar: 'bg-red-500', trend: <TrendingDown size={14}/> };
  };

  const status = getStatus();

  return (
    <div className="px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <section className="flex items-center gap-4">
        <div className="w-16 h-16 bg-emerald-950 rounded-[24px] flex items-center justify-center text-emerald-400 shadow-xl overflow-hidden relative border-2 border-white">
           <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${profile.name}`} alt="ảnh đại diện" className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-emerald-950 leading-none">Chào {profile.name.split(' ').pop()}!</h2>
          <div className="flex items-center gap-1.5 mt-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
             <Calendar size={12} /> {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-[40px] p-8 shadow-xl shadow-emerald-900/5 border border-emerald-50 relative overflow-hidden group">
         <div className="relative z-10 flex flex-col gap-6">
            <div className="flex justify-between items-start">
               <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Năng lượng mục tiêu</h4>
                  <div className="flex items-baseline gap-2">
                     <span className="text-4xl font-black text-emerald-950">{remaining > 0 ? remaining : 0}</span>
                     <span className="text-sm font-extrabold text-gray-400">Calo còn lại</span>
                  </div>
               </div>
               <div className={`w-12 h-12 ${status.bg} rounded-2xl flex items-center justify-center ${status.color} shadow-inner`}>
                  <Zap size={24} fill="currentColor" />
               </div>
            </div>

            <div className="space-y-3">
               <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-wider">
                  <span className={status.color}>{status.label}</span>
                  <span className="text-gray-400">{Math.round(progressPercent)}%</span>
               </div>
               <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100 shadow-inner">
                  <div className={`h-full ${status.bar} transition-all duration-1000 ease-out relative`} style={{ width: `${progressPercent}%` }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-pulse" />
                  </div>
               </div>
            </div>

            <div className="flex gap-4 pt-2 border-t border-gray-50">
               <div className="flex-1 text-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase">Đã ăn</p>
                  <p className="text-sm font-black text-emerald-900">{caloriesConsumed} <span className="text-[9px] opacity-40 uppercase">Calo</span></p>
               </div>
               <div className="w-[1px] bg-gray-50" />
               <div className="flex-1 text-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase">Hạn mức</p>
                  <p className="text-sm font-black text-emerald-900">{calorieGoal} <span className="text-[9px] opacity-40 uppercase">Calo</span></p>
               </div>
            </div>
         </div>
      </section>

      <section className="space-y-4">
        {activeCookingMeal ? (
          <div 
            onClick={() => onNavigate('resume-cooking')}
            className="bg-emerald-950 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden cursor-pointer active:scale-95 transition-all group"
          >
            <div className="relative z-10 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                   <Play size={24} fill="white" className="ml-1" />
                </div>
                <div>
                   <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Đang dở dang</p>
                   <h3 className="text-xl font-black mt-1 line-clamp-1">{activeCookingMeal.name}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-black text-emerald-500 uppercase">
                 Quay lại nấu ăn ngay <ChevronRight size={16} />
              </div>
            </div>
            <ChefHat size={120} className="absolute -right-6 -bottom-6 text-emerald-900/40 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
          </div>
        ) : (
          <div 
            onClick={() => onNavigate('select-ingredients')}
            className="bg-emerald-600 rounded-[32px] p-8 text-white shadow-2xl shadow-emerald-200 relative overflow-hidden cursor-pointer active:scale-95 transition-all group"
          >
            <div className="relative z-10 flex flex-col gap-6">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl group-hover:rotate-12 transition-transform">
                 <Plus size={32} />
              </div>
              <div className="space-y-1">
                 <h3 className="text-2xl font-black leading-tight uppercase tracking-tight">Gợi ý bữa ăn<br/>cho hôm nay</h3>
                 <p className="text-emerald-100/70 text-xs font-bold mt-1 uppercase tracking-widest">Thông minh & Lành mạnh</p>
              </div>
            </div>
            <Sparkles size={140} className="absolute -right-8 -bottom-8 text-white/10 rotate-12 group-hover:scale-110 transition-transform duration-1000" />
          </div>
        )}
      </section>

      <section className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onNavigate('shopping')}
          className="bg-white p-6 rounded-[32px] border border-emerald-50 flex flex-col gap-5 shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shadow-inner">
             <ShoppingBag size={24} />
          </div>
          <div className="text-left space-y-0.5">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đi mua đồ</span>
             <p className="text-sm font-black text-emerald-950">Sổ đi chợ</p>
          </div>
        </button>

        <button 
          onClick={() => onNavigate('history')}
          className="bg-white p-6 rounded-[32px] border border-emerald-50 flex flex-col gap-5 shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
             <History size={24} />
          </div>
          <div className="text-left space-y-0.5">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Xem lại</span>
             <p className="text-sm font-black text-emerald-950">Nhật ký</p>
          </div>
        </button>
      </section>

      {hasLastSuggestions && !activeCookingMeal && (
        <section 
          onClick={() => onNavigate('meal-suggestions')}
          className="bg-emerald-50 p-6 rounded-[32px] flex items-center justify-between group cursor-pointer border border-emerald-100/50 hover:bg-emerald-100 transition-colors"
        >
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                <Sparkles size={18} />
              </div>
              <div className="space-y-0.5">
                 <p className="text-sm font-black text-emerald-900 uppercase tracking-tight">Xem thực đơn cũ</p>
                 <p className="text-[10px] text-emerald-600 font-bold italic">Tiết kiệm thời gian của bạn</p>
              </div>
           </div>
           <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:translate-x-1 transition-transform">
              <ChevronRight size={18} />
           </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
