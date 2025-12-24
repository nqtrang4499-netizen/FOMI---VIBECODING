
import React, { useState } from 'react';
import { UserProfile, DailyLog, HealthRecord } from '../types';
import { analyzeHealthTrends } from '../services/geminiService';
import { 
  Activity, Calendar, TrendingUp, TrendingDown, Minus, 
  MessageSquare, Plus, Scale, ChevronRight, Loader2, Utensils, Trash2, Flame 
} from 'lucide-react';

interface HealthTrackingViewProps {
  profile: UserProfile;
  dailyLog: DailyLog; // Log hôm nay
  allLogs: DailyLog[]; // Lịch sử log
  onUpdateWeight: (weight: number) => void;
  onRemoveMeal: (mealId: string) => void;
}

const HealthTrackingView: React.FC<HealthTrackingViewProps> = ({ profile, dailyLog, allLogs, onUpdateWeight, onRemoveMeal }) => {
  const [activeTab, setActiveTab] = useState<'journal' | 'body'>('journal');
  const [newWeight, setNewWeight] = useState('');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Body Tab Logic
  const healthHistory = profile.healthHistory || [];
  const latestWeight = healthHistory.length > 0 ? healthHistory[healthHistory.length - 1].weight : profile.weight;
  const startWeight = healthHistory.length > 0 ? healthHistory[0].weight : profile.weight;
  
  const handleAddWeight = () => {
    if (!newWeight) return;
    onUpdateWeight(parseFloat(newWeight));
    setNewWeight('');
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    const result = await analyzeHealthTrends(profile, [...healthHistory].reverse(), [dailyLog, ...allLogs]);
    setAiInsight(result);
    setAnalyzing(false);
  };

  // Journal Tab Logic
  const totalCalories = dailyLog.meals.reduce((acc, m) => acc + m.calories, 0);
  const calorieGoal = profile.calorieGoal || 2000;

  // Tính toán so sánh với ngày gần nhất
  const getYesterdayComparison = () => {
      if (allLogs.length === 0) return null;
      // Tìm log gần nhất (không phải hôm nay)
      const sortedLogs = [...allLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const previousLog = sortedLogs[0];
      
      if (!previousLog) return null;

      const prevCalories = previousLog.meals.reduce((acc, m) => acc + m.calories, 0);
      const diff = totalCalories - prevCalories;
      
      return {
          diff,
          date: new Date(previousLog.date).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'})
      };
  };

  const comparison = getYesterdayComparison();

  return (
    <div className="flex flex-col h-full bg-[#FAFBFA]">
      {/* Custom Header with Tabs */}
      <div className="px-5 pt-3 pb-2 bg-white sticky top-0 z-20 shadow-sm border-b border-gray-50">
        <h2 className="text-xl font-black text-emerald-950 mb-3">Sức khỏe & Nhật ký</h2>
        <div className="flex p-1 bg-gray-100 rounded-2xl">
          <button 
            onClick={() => setActiveTab('journal')}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === 'journal' ? 'bg-white text-emerald-950 shadow-sm' : 'text-gray-400'}`}
          >
            Nhật ký ăn uống
          </button>
          <button 
            onClick={() => setActiveTab('body')}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === 'body' ? 'bg-white text-emerald-950 shadow-sm' : 'text-gray-400'}`}
          >
            Theo dõi thể trạng
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 pb-32 space-y-6 animate-in slide-in-from-bottom-2">
        {activeTab === 'journal' ? (
          <>
            {/* Journal Content */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Đã nạp</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black text-emerald-900">{totalCalories} <span className="text-xs text-gray-400">/ {calorieGoal} kcal</span></p>
                </div>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${totalCalories > calorieGoal ? 'bg-orange-50 text-orange-500' : 'bg-emerald-50 text-emerald-600'}`}>
                 <Flame size={20} fill="currentColor" />
              </div>
            </div>

            {/* Comparison Badge */}
            {comparison && (
                <div className={`p-3 rounded-2xl border flex items-center gap-3 ${comparison.diff > 0 ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'}`}>
                    {comparison.diff > 0 ? <TrendingUp size={16} className="text-orange-500"/> : <TrendingDown size={16} className="text-blue-500"/>}
                    <div>
                        <p className={`text-xs font-bold ${comparison.diff > 0 ? 'text-orange-900' : 'text-blue-900'}`}>
                            {comparison.diff > 0 ? 'Cao hơn' : 'Thấp hơn'} {Math.abs(comparison.diff)} kcal
                        </p>
                        <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">So với {comparison.date}</p>
                    </div>
                </div>
            )}

            <div className="space-y-3">
              {dailyLog.meals.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-100 rounded-[28px] p-8 text-center space-y-2">
                  <Utensils size={32} className="text-gray-100 mx-auto" />
                  <p className="text-xs font-bold text-gray-300">Chưa có món nào hôm nay</p>
                </div>
              ) : (
                dailyLog.meals.map((meal) => (
                  <div key={meal.id} className="bg-white p-4 rounded-[24px] border border-gray-50 shadow-sm flex justify-between items-start group">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                         <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">{meal.type}</span>
                         {meal.isEatOut && <span className="text-[9px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-md">Ăn ngoài</span>}
                      </div>
                      <h4 className="font-bold text-emerald-900 text-sm">{meal.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold">{meal.calories} kcal</p>
                    </div>
                    <button onClick={() => onRemoveMeal(meal.id)} className="text-gray-200 hover:text-red-500 p-1.5"><Trash2 size={16}/></button>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            {/* Body Stats Content */}
            <div className="grid grid-cols-2 gap-3">
               <div className="bg-white p-5 rounded-[24px] border border-emerald-50 shadow-sm space-y-1">
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Hiện tại</p>
                  <p className="text-2xl font-black text-emerald-900">{latestWeight} <span className="text-xs text-gray-400">kg</span></p>
               </div>
               <div className="bg-white p-5 rounded-[24px] border border-emerald-50 shadow-sm space-y-1">
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Thay đổi</p>
                  <div className="flex items-center gap-2">
                     {(latestWeight || 0) < (startWeight || 0) ? <TrendingDown className="text-emerald-500" size={16}/> : (latestWeight === startWeight ? <Minus className="text-gray-400" size={16}/> : <TrendingUp className="text-orange-500" size={16}/>)}
                     <p className="text-xl font-black text-emerald-900">{Math.abs((latestWeight || 0) - (startWeight || 0)).toFixed(1)} <span className="text-xs text-gray-400">kg</span></p>
                  </div>
               </div>
            </div>

            {/* Weight Input */}
            <div className="bg-white p-1.5 rounded-[24px] border border-gray-100 flex items-center shadow-sm">
               <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 ml-1">
                  <Scale size={18} />
               </div>
               <input 
                 type="number" 
                 placeholder="Cập nhật cân nặng..." 
                 value={newWeight}
                 onChange={(e) => setNewWeight(e.target.value)}
                 className="flex-1 px-3 outline-none font-bold text-emerald-900 bg-transparent placeholder-gray-300 text-sm"
               />
               <button 
                 onClick={handleAddWeight}
                 disabled={!newWeight}
                 className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-all disabled:opacity-50"
               >
                  <Plus size={20} />
               </button>
            </div>

            {/* Chart Simulation (Simplified List) */}
            <div className="space-y-2">
               <h3 className="font-bold text-emerald-900 text-xs">Lịch sử gần đây</h3>
               <div className="space-y-1.5">
                  {healthHistory.slice().reverse().slice(0, 5).map((rec, idx) => (
                     <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-50">
                        <span className="text-[10px] font-bold text-gray-400">{new Date(rec.date).toLocaleDateString('vi-VN')}</span>
                        <span className="text-xs font-black text-emerald-900">{rec.weight} kg</span>
                     </div>
                  ))}
                  {healthHistory.length === 0 && <p className="text-[10px] text-gray-400 italic">Chưa có dữ liệu.</p>}
               </div>
            </div>

            {/* AI Analysis */}
            <div className="pt-2">
               {aiInsight ? (
                  <div className="bg-emerald-900 text-white p-5 rounded-[24px] space-y-3 animate-in zoom-in">
                     <div className="flex items-center gap-2 text-emerald-400 font-black text-[9px] uppercase tracking-widest">
                        <Activity size={12} /> Góc nhìn của Fomi
                     </div>
                     <p className="text-xs font-medium leading-relaxed opacity-90">{aiInsight}</p>
                     <button onClick={() => setAiInsight(null)} className="text-[10px] font-bold text-emerald-400 underline">Đóng lại</button>
                  </div>
               ) : (
                  <button 
                     onClick={handleAnalyze}
                     disabled={analyzing}
                     className="w-full py-4 bg-emerald-50 text-emerald-700 font-black rounded-[24px] flex items-center justify-center gap-2 border border-emerald-100 hover:bg-emerald-100 transition-all text-xs"
                  >
                     {analyzing ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
                     Tâm sự với Fomi
                  </button>
               )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HealthTrackingView;
