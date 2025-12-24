
import React, { useState, useEffect } from 'react';
import { UserProfile, DailyLog, Meal } from '../types';
import { 
  Plus, ShoppingBag, ChefHat, ChevronRight, Play,
  Zap, Utensils, Store, Target, Bell, X, BookOpen, Lightbulb
} from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  dailyLog: DailyLog;
  onNavigate: (view: string, subMode?: 'single' | 'day') => void;
  hasLastSuggestions: boolean;
  activeCookingMeal?: Meal | null;
}

// Dữ liệu mẫu cho bài viết sống khỏe (Đổi màu sang tông xanh)
const DAILY_TIP = {
  id: 'tip-01',
  title: "Nghệ vàng - Thần dược dạ dày",
  summary: "Lý do bạn nên dùng tinh bột nghệ mỗi sáng.",
  content: "Curcumin trong nghệ là hoạt chất kháng viêm tự nhiên cực mạnh. \n\nUống một cốc nước ấm pha tinh bột nghệ và mật ong vào buổi sáng không chỉ giúp làm lành các vết loét dạ dày mà còn hỗ trợ thải độc gan, làm đẹp da và tăng cường hệ miễn dịch.\n\nHãy duy trì thói quen này trong 2 tuần để thấy sự khác biệt rõ rệt!",
  color: "bg-emerald-50 border-emerald-100",
  textColor: "text-emerald-900",
  iconColor: "text-emerald-600"
};

const Dashboard: React.FC<DashboardProps> = ({ profile, dailyLog, onNavigate, hasLastSuggestions, activeCookingMeal }) => {
  const [showCookOptions, setShowCookOptions] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [showTipModal, setShowTipModal] = useState(false);

  // Logic tính toán năng lượng
  const caloriesConsumed = dailyLog.meals.reduce((acc, m) => acc + m.calories, 0);
  const calorieGoal = profile.calorieGoal || 2000;
  const remaining = Math.max(calorieGoal - caloriesConsumed, 0);
  const progressPercent = Math.min((caloriesConsumed / calorieGoal) * 100, 100);

  // Logic lời chào theo thời gian
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 11) setGreeting('Chào buổi sáng');
    else if (hour < 14) setGreeting('Chào buổi trưa');
    else if (hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');
  }, []);

  const getStatus = () => {
    if (progressPercent < 40) return { label: 'Cần nạp', color: 'text-blue-600', bar: 'bg-emerald-400' };
    if (progressPercent < 90) return { label: 'Tốt', color: 'text-emerald-600', bar: 'bg-emerald-400' };
    if (progressPercent <= 100) return { label: 'Đủ', color: 'text-orange-600', bar: 'bg-orange-400' };
    return { label: 'Vượt', color: 'text-red-600', bar: 'bg-red-400' };
  };

  const status = getStatus();

  return (
    <div className="flex flex-col h-full bg-[#FAFBFA] overflow-hidden px-5 pt-3 pb-2 relative">
      
      {/* 1. Header: Compact & Rearranged */}
      <section className="shrink-0 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-full border border-emerald-100">
                <Target size={12} /> {profile.goal}
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end">
                 <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{greeting},</span>
                 <h1 className="text-sm font-black text-emerald-950 leading-none">
                    {profile.name}
                 </h1>
             </div>
             <button className="w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-emerald-600 shadow-sm">
                <Bell size={16} />
             </button>
          </div>
      </section>

      {/* 2. Body Content - Flex Column Layout */}
      <div className="flex-1 flex flex-col gap-3 min-h-0 pb-1">
        
        {/* HEALTHY TIP BANNER - Shrink allowed */}
        <section className="shrink-0">
             <div 
                onClick={() => setShowTipModal(true)}
                className={`w-full ${DAILY_TIP.color} rounded-[24px] p-1.5 pr-4 border flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all`}
             >
                <div className="w-14 h-14 bg-white rounded-[20px] shadow-sm flex items-center justify-center shrink-0">
                   <Lightbulb size={24} className={DAILY_TIP.iconColor} />
                </div>
                <div className="flex-1 min-w-0 py-1">
                   <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-[9px] font-black uppercase tracking-widest ${DAILY_TIP.textColor} opacity-70`}>Góc sống khỏe</span>
                   </div>
                   <h3 className={`text-xs font-black ${DAILY_TIP.textColor} truncate`}>{DAILY_TIP.title}</h3>
                   <p className={`text-[10px] ${DAILY_TIP.textColor} font-medium truncate opacity-80`}>{DAILY_TIP.summary}</p>
                </div>
                <div className={`w-8 h-8 rounded-full bg-white/50 flex items-center justify-center ${DAILY_TIP.iconColor}`}>
                   <BookOpen size={16} />
                </div>
             </div>
        </section>

        {/* COMPACT Energy Card (Shrinkable) */}
        <section className="shrink-0 h-[85px] bg-emerald-950 rounded-[24px] p-4 text-white shadow-lg relative overflow-hidden flex items-center justify-between group">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-10 translate-x-10 pointer-events-none group-hover:bg-white/10 transition-colors" />
          
          <div className="flex flex-col justify-center gap-0.5 relative z-10">
               <div className="flex items-center gap-1.5 opacity-80">
                    <Zap size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Còn lại</span>
               </div>
               <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-black tracking-tighter">{remaining}</p>
                  <p className="text-[9px] font-bold opacity-60">Kcal</p>
               </div>
          </div>

          <div className="flex-1 px-5 relative z-10 flex flex-col justify-center gap-1.5">
              <div className="flex justify-between items-end text-[9px] font-bold opacity-80">
                  <span>{Math.round(progressPercent)}%</span>
                  <span>{caloriesConsumed}/{calorieGoal}</span>
              </div>
              <div className="h-2 w-full bg-black/30 rounded-full overflow-hidden backdrop-blur-sm border border-white/5 relative">
                <div className={`h-full ${status.bar} absolute left-0 top-0 bottom-0 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(52,211,153,0.5)]`} style={{ width: `${progressPercent}%` }} />
              </div>
          </div>
        </section>

        {/* Active Cooking State (Conditional) */}
        {activeCookingMeal && (
          <section 
            onClick={() => onNavigate('resume-cooking')}
            className="shrink-0 bg-white rounded-[20px] p-3 border border-emerald-100 shadow-sm relative overflow-hidden cursor-pointer active:scale-95 transition-all flex items-center gap-3 animate-in slide-in-from-bottom-2"
          >
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
              <div className="w-4 h-4 bg-emerald-500 rounded flex items-center justify-center text-white animate-pulse">
                  <Play size={8} fill="white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-emerald-600 text-[9px] font-black uppercase tracking-wide">Đang nấu dở...</span>
              <h3 className="text-xs font-bold text-emerald-950 truncate">{activeCookingMeal.name}</h3>
            </div>
            <ChevronRight size={16} className="text-emerald-300" />
          </section>
        )}

        {/* MAIN ACTION: Suggest Meal - Takes available space (flex-1) */}
        <section className="flex-1 min-h-0">
          <div className={`w-full h-full transition-all duration-300 ${showCookOptions ? 'bg-white ring-2 ring-emerald-50' : 'bg-white border border-emerald-50'} rounded-[32px] shadow-sm relative overflow-hidden group`}>
              {!showCookOptions ? (
                <div 
                    onClick={() => setShowCookOptions(true)}
                    className="w-full h-full p-6 flex flex-col justify-between cursor-pointer active:bg-gray-50 transition-colors relative"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                       <ChefHat size={120} />
                    </div>

                    <div className="flex justify-between items-start">
                       <div className="w-14 h-14 bg-[#e0f4fc] text-emerald-600 rounded-[20px] flex items-center justify-center shadow-sm">
                          <ChefHat size={28} />
                       </div>
                       <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                          <Plus size={18} />
                       </div>
                    </div>
                    
                    <div className="mt-auto">
                      <h3 className="text-xl font-black text-emerald-950 leading-tight mb-1">Gợi ý món ăn</h3>
                      <p className="text-xs font-medium text-gray-400 leading-relaxed max-w-[90%]">
                        Lên thực đơn dựa trên sở thích và nguyên liệu có sẵn của bạn.
                      </p>
                    </div>
                </div>
              ) : (
                <div className="w-full h-full p-4 grid grid-rows-2 gap-3 animate-in fade-in zoom-in duration-200">
                    <button 
                      onClick={() => { setShowCookOptions(false); onNavigate('select-ingredients', 'single'); }}
                      className="bg-emerald-50/50 rounded-[24px] border border-emerald-100 shadow-sm flex items-center justify-center gap-4 active:scale-95 transition-all hover:bg-emerald-50"
                    >
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600">
                         <Utensils size={20} />
                      </div>
                      <div className="text-left">
                         <span className="block text-base font-black text-emerald-950">1 Bữa</span>
                         <span className="text-[9px] font-bold text-gray-400 uppercase">Nấu nhanh gọn</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => { setShowCookOptions(false); onNavigate('day-plan-config'); }}
                      className="bg-purple-50/50 rounded-[24px] border border-purple-100 shadow-sm flex items-center justify-center gap-4 active:scale-95 transition-all hover:bg-purple-50"
                    >
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-purple-600">
                         <Target size={20} />
                      </div>
                       <div className="text-left">
                         <span className="block text-base font-black text-purple-950">Cả ngày</span>
                         <span className="text-[9px] font-bold text-gray-400 uppercase">Lên kế hoạch</span>
                      </div>
                    </button>
                </div>
              )}
          </div>
        </section>

        {/* Secondary Actions Grid - Fixed height to ensure stability */}
        <section className="grid grid-cols-2 gap-3 shrink-0 h-[75px]">
             <button 
                onClick={() => onNavigate('eat-out')}
                className="bg-white rounded-[24px] border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all hover:border-orange-100 group"
            >
                <div className="w-7 h-7 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Store size={14} />
                </div>
                <div className="text-center">
                  <span className="text-xs font-black text-emerald-950 block">Ăn ngoài</span>
                </div>
            </button>

            <button 
                onClick={() => onNavigate('shopping')}
                className="bg-white rounded-[24px] border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all hover:border-blue-100 group"
            >
                <div className="w-7 h-7 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingBag size={14} />
                </div>
                <div className="text-center">
                  <span className="text-xs font-black text-emerald-950 block">Đi chợ</span>
                </div>
            </button>
        </section>

      </div>

      {/* TIP MODAL OVERLAY */}
      {showTipModal && (
         <div className="absolute inset-0 z-50 flex items-center justify-center p-5 bg-emerald-950/60 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 duration-300 relative">
                 <button 
                    onClick={() => setShowTipModal(false)}
                    className="absolute top-4 right-4 w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                 >
                    <X size={18} />
                 </button>

                 <div className="space-y-4">
                     <div className={`w-16 h-16 ${DAILY_TIP.color} rounded-[24px] flex items-center justify-center mb-2 mx-auto`}>
                        <Lightbulb size={32} className={DAILY_TIP.iconColor} />
                     </div>
                     
                     <div className="text-center space-y-1">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${DAILY_TIP.iconColor}`}>Mẹo hay hôm nay</p>
                        <h3 className="text-xl font-black text-emerald-950">{DAILY_TIP.title}</h3>
                     </div>

                     <div className="bg-gray-50 p-4 rounded-[20px] text-sm text-gray-600 font-medium leading-relaxed whitespace-pre-line border border-gray-100">
                        {DAILY_TIP.content}
                     </div>

                     <button 
                        onClick={() => setShowTipModal(false)}
                        className={`w-full py-3.5 ${DAILY_TIP.color} ${DAILY_TIP.textColor} font-black rounded-2xl uppercase text-xs tracking-wider active:scale-95 transition-all`}
                     >
                        Đã hiểu
                     </button>
                 </div>
             </div>
         </div>
      )}
    </div>
  );
};

export default Dashboard;
