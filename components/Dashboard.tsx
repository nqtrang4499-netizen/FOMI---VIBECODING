
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, DailyLog, Meal } from '../types';
import { getDishesFromIngredients, recognizeMealFromPhoto } from '../services/geminiService';
import { Sparkles, Utensils, Store, Zap, Flame, Activity, Camera, Search, Plus, X, ShoppingCart, ChevronRight, Loader2, PartyPopper } from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  dailyLog: DailyLog;
  onAddMeal: (meal: Meal) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, dailyLog, onAddMeal }) => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addIngredient = () => {
    if (inputValue.trim() && !ingredients.includes(inputValue.trim())) {
      setIngredients([...ingredients, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeIngredient = (tag: string) => {
    setIngredients(ingredients.filter(t => t !== tag));
  };

  const handleSearchDishes = async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    const dishes = await getDishesFromIngredients(profile, ingredients);
    setResults(dishes);
    setLoading(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCapturing(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const result = await recognizeMealFromPhoto(base64);
      if (result) {
        onAddMeal({
          id: Math.random().toString(),
          name: result.name,
          type: 'Lunch',
          isEatOut: true,
          calories: result.calories,
          description: result.hackTip,
          hackTip: result.hackTip
        });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
      setIsCapturing(false);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addToCart = (item: string) => {
    const cart = JSON.parse(localStorage.getItem('fomi_manual_cart') || '[]');
    if (!cart.includes(item)) {
      localStorage.setItem('fomi_manual_cart', JSON.stringify([...cart, item]));
      alert(`Đã thêm "${item}" vào danh sách đi chợ!`);
    }
  };

  const caloriesConsumed = dailyLog.meals.reduce((acc, m) => acc + m.calories, 0);
  const calorieGoal = 2000;
  const progressPercent = Math.min((caloriesConsumed / calorieGoal) * 100, 100);

  return (
    <div className="px-6 space-y-6 animate-in fade-in duration-500 pb-10 relative">
      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 z-50 animate-in slide-in-from-top-4">
          <PartyPopper size={20} />
          <span className="font-bold text-sm">Đã ghi nhận món ăn!</span>
        </div>
      )}

      {isCapturing && (
        <div className="fixed inset-0 bg-orange-900/40 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4 animate-in fade-in">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden">
             <div className="absolute inset-x-0 h-1 bg-orange-500/50 animate-scan"></div>
             <Camera size={40} className="text-orange-500" />
          </div>
          <div className="text-center">
            <p className="text-white font-black text-xl">Đang soi món...</p>
            <p className="text-orange-100 text-sm italic">Fomi đang xem bát cơm của bạn chút nhé!</p>
          </div>
          <Loader2 className="animate-spin text-white opacity-50" size={32} />
        </div>
      )}

      {/* Greeting */}
      <section className="pt-6 flex justify-between items-end">
        <div>
          <p className="text-gray-400 text-sm font-medium">Hôm nay ăn gì nhỉ,</p>
          <h2 className="text-3xl font-black text-gray-900">
            <span className="text-orange-500">{profile.name}</span>
          </h2>
        </div>
        <div className="relative">
          <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg active:scale-90 transition-all">
            <Camera size={22} />
          </button>
        </div>
      </section>

      {/* Stats Quick Look */}
      <section className="bg-white rounded-[32px] p-5 shadow-sm border border-orange-50 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
               <Flame size={24} fill="currentColor" />
            </div>
            <div>
               <p className="text-2xl font-black text-gray-900">{caloriesConsumed}</p>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kcal đã nạp</p>
            </div>
         </div>
         <div className="text-right">
            <p className="text-sm font-bold text-green-600">{progressPercent < 80 ? 'Vẫn còn chỗ!' : 'Hơi no rồi nha'}</p>
            <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
               <div className="h-full bg-orange-500" style={{ width: `${progressPercent}%` }} />
            </div>
         </div>
      </section>

      {/* Fridge Section */}
      <section className="space-y-4">
        <div className="bg-orange-900 text-white rounded-[32px] p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Utensils size={20} className="text-orange-400" />
            <h3 className="font-bold text-lg">Tủ lạnh có gì?</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {ingredients.map(tag => (
              <span key={tag} className="bg-white/20 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-in zoom-in">
                {tag}
                <button onClick={() => removeIngredient(tag)}><X size={12} /></button>
              </span>
            ))}
            <div className="flex-1 min-w-[120px] relative">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                placeholder="Thêm nguyên liệu..." 
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-xs outline-none focus:bg-white/20 transition-all"
              />
              <button onClick={addIngredient} className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-400">
                <Plus size={16} />
              </button>
            </div>
          </div>

          <button 
            onClick={handleSearchDishes}
            disabled={loading || ingredients.length === 0}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
            Nấu món gì ngon?
          </button>
        </div>
      </section>

      {/* Results Section */}
      {results.length > 0 && (
        <section className="space-y-4 animate-in slide-in-from-bottom-4">
          <h3 className="text-lg font-bold text-gray-900 px-2 flex items-center gap-2">
            <Sparkles size={18} className="text-orange-500" />
            Gợi ý cho bạn
          </h3>
          <div className="space-y-4">
            {results.map((dish, idx) => (
              <div key={idx} className="bg-white border-2 border-orange-50 rounded-[32px] p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="text-xl font-black text-gray-900 leading-tight">{dish.name}</h4>
                  <span className="text-orange-500 font-black text-sm">{dish.calories} kcal</span>
                </div>
                
                <p className="text-sm text-gray-500 leading-relaxed italic">"{dish.description}"</p>
                
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nguyên liệu còn thiếu:</p>
                  <div className="flex flex-wrap gap-2">
                    {dish.ingredientsMissing.map((m: string) => (
                      <button 
                        key={m} 
                        onClick={() => addToCart(m)}
                        className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <Plus size={12} /> {m}
                      </button>
                    ))}
                    {dish.ingredientsMissing.length === 0 && <span className="text-green-600 text-[11px] font-bold italic">Đã đủ đồ, nấu luôn thôi!</span>}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-orange-800 font-medium">
                    <Zap size={14} className="text-orange-500" />
                    {dish.hackTip}
                  </div>
                  <button 
                    onClick={() => onAddMeal({
                      id: Math.random().toString(),
                      name: dish.name,
                      type: 'Lunch',
                      isEatOut: false,
                      calories: dish.calories,
                      description: dish.description
                    })}
                    className="w-10 h-10 bg-orange-900 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* History Placeholder */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 px-2">Ghi chép hôm nay</h3>
        {dailyLog.meals.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center text-gray-400">
            <p className="text-xs font-medium italic">Bạn chưa ăn gì à? Ghi lại nhé!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dailyLog.meals.map((meal) => (
              <div key={meal.id} className="bg-white p-4 rounded-2xl border border-gray-50 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                      <Utensils size={18} />
                   </div>
                   <div>
                      <h5 className="font-bold text-gray-900 text-sm leading-tight">{meal.name}</h5>
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Hôm nay</p>
                   </div>
                </div>
                <span className="text-sm font-black text-gray-900">{meal.calories} kcal</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <style>{`
        @keyframes scan { 0% { top: -10%; } 100% { top: 110%; } }
        .animate-scan { position: absolute; width: 100%; animation: scan 2s linear infinite; }
      `}</style>
    </div>
  );
};

export default Dashboard;
