
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, DailyLog, Meal, IngredientInput } from '../types';
import { getDishesFromIngredients, recognizeMealFromPhoto, generateMealImage } from '../services/geminiService';
import { 
  Sparkles, Utensils, Zap, Flame, Activity, Camera, 
  Search, Plus, X, Loader2, PartyPopper, Pin, PinOff, 
  Info, CheckCircle2, Wallet, Smile, Wind, AlertCircle, 
  ChefHat, BookOpen, Image as ImageIcon, ExternalLink, Settings2,
  Store
} from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  dailyLog: DailyLog;
  onAddMeal: (meal: Meal) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, dailyLog, onAddMeal }) => {
  const [ingredients, setIngredients] = useState<IngredientInput[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");
  const [generatingImages, setGeneratingImages] = useState<Record<number, boolean>>({});
  const [aiGeneratedImages, setAiGeneratedImages] = useState<Record<number, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      const aiStudio = (window as any).aistudio;
      if (aiStudio) {
        const hasKey = await aiStudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio) {
      await aiStudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const addIngredient = () => {
    const name = inputValue.trim();
    if (name && !ingredients.find(i => i.name.toLowerCase() === name.toLowerCase())) {
      setIngredients([...ingredients, { name, isMandatory: false }]);
      setInputValue('');
    }
  };

  const toggleMandatory = (name: string) => {
    setIngredients(ingredients.map(i => 
      i.name === name ? { ...i, isMandatory: !i.isMandatory } : i
    ));
  };

  const removeIngredient = (name: string) => {
    setIngredients(ingredients.filter(i => i.name !== name));
  };

  const handleSearchDishes = async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    const combos = await getDishesFromIngredients(profile, ingredients);
    setResults(combos);
    setAiGeneratedImages({}); 
    setLoading(false);
  };

  const handleGenerateAIImage = async (idx: number, mealName: string) => {
    if (!hasApiKey) {
      alert("Tính năng tạo ảnh Premium yêu cầu chọn API Key trả phí từ Google AI Studio.");
      handleSelectKey();
      return;
    }

    setGeneratingImages(prev => ({ ...prev, [idx]: true }));
    try {
      const imageData = await generateMealImage(mealName, imageSize);
      if (imageData) {
        setAiGeneratedImages(prev => ({ ...prev, [idx]: imageData }));
      }
    } catch (error: any) {
      if (error.message?.includes("Requested entity was not found")) {
        setHasApiKey(false);
        alert("API Key không hợp lệ. Vui lòng chọn lại.");
      } else {
        alert("Lỗi khi tạo ảnh. Hãy thử lại sau ít phút.");
      }
    } finally {
      setGeneratingImages(prev => ({ ...prev, [idx]: false }));
    }
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

  const caloriesConsumed = dailyLog.meals.reduce((acc, m) => acc + m.calories, 0);
  const calorieGoal = 2000;
  const progressPercent = Math.min((caloriesConsumed / calorieGoal) * 100, 100);

  const getCalorieStatus = (percent: number) => {
    if (percent < 50) return { label: 'Bụng còn trống', desc: 'Dưới chuẩn', color: 'text-blue-500', bg: 'bg-blue-50', bar: 'bg-blue-400', icon: <Wind size={14} /> };
    if (percent < 90) return { label: 'Vừa vặn rồi', desc: 'Vừa đủ', color: 'text-green-600', bg: 'bg-green-50', bar: 'bg-green-500', icon: <Smile size={14} /> };
    if (percent <= 100) return { label: 'No nê rồi đó', desc: 'Sắp đầy', color: 'text-orange-500', bg: 'bg-orange-50', bar: 'bg-orange-500', icon: <Activity size={14} /> };
    return { label: 'Hơi quá chén', desc: 'Vượt mức', color: 'text-red-500', bg: 'bg-red-50', bar: 'bg-red-500', icon: <AlertCircle size={14} /> };
  };

  const status = getCalorieStatus(progressPercent);

  const getDishImage = (name: string, idx: number) => {
    if (aiGeneratedImages[idx]) return aiGeneratedImages[idx];
    return `https://source.unsplash.com/800x600/?vietnamese-food,cooking,dish,${encodeURIComponent(name)}`;
  };

  const handleCookMeal = (combo: any) => {
    onAddMeal({
      id: Math.random().toString(),
      name: combo.name,
      type: 'Lunch',
      isEatOut: false,
      calories: combo.calories,
      description: combo.description,
      ingredientsMissing: combo.ingredientsMissing
    });
    setSelectedRecipe(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="px-6 space-y-6 animate-in fade-in duration-500 pb-10 relative">
      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 z-50 animate-in slide-in-from-top-4">
          <PartyPopper size={20} />
          <span className="font-bold text-sm">Đã ghi nhận & thêm nguyên liệu thiếu vào giỏ!</span>
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

      {/* Recipe Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md sm:rounded-[40px] rounded-t-[40px] max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="relative h-64 w-full">
              <img src={getDishImage(selectedRecipe.name, results.indexOf(selectedRecipe))} className="w-full h-full object-cover" alt={selectedRecipe.name} />
              <button onClick={() => setSelectedRecipe(null)} className="absolute top-6 right-6 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">{selectedRecipe.name}</h3>
                <div className="flex gap-4">
                  <span className="text-orange-600 font-bold text-sm bg-orange-50 px-3 py-1 rounded-full">{selectedRecipe.calories} kcal</span>
                  <span className="text-green-600 font-bold text-sm bg-green-50 px-3 py-1 rounded-full">Healthy Choice</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <BookOpen size={16} /> Cách thực hiện
                </h4>
                <div className="space-y-4">
                  {selectedRecipe.recipeSteps.map((step: string, idx: number) => (
                    <div key={idx} className="flex gap-4 group">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 font-black text-xs group-hover:bg-orange-500 group-hover:text-white transition-all">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed pt-1.5">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => handleCookMeal(selectedRecipe)}
                className="w-full py-5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-orange-100 transition-all active:scale-95"
              >
                <ChefHat size={20} />
                Nấu & Ghi nhật ký calo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium API Key Warning */}
      {!hasApiKey && (
        <section className="bg-orange-50 border border-orange-200 rounded-[28px] p-5 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 shadow-sm">
           <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
              <Zap size={24} className="animate-pulse" />
           </div>
           <div className="flex-1">
              <p className="text-sm font-black text-orange-900">Tính năng Premium AI</p>
              <p className="text-[10px] text-orange-700/70 mb-2">Mở khóa tính năng tạo ảnh món ăn thực tế (1K-4K) bằng API Key của riêng bạn.</p>
              <div className="flex gap-3">
                 <button onClick={handleSelectKey} className="text-[10px] font-black uppercase text-orange-600 border-b border-orange-300 pb-0.5 hover:text-orange-500 transition-colors flex items-center gap-1">
                    <Settings2 size={10} /> Chọn API Key
                 </button>
                 <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-gray-400 flex items-center gap-1 hover:text-gray-600">
                    Billing Docs <ExternalLink size={10} />
                 </a>
              </div>
           </div>
        </section>
      )}

      {/* Greeting & Quick Action */}
      <section className="pt-6 flex justify-between items-end">
        <div>
          <p className="text-gray-400 text-sm font-medium">Chào buổi sáng,</p>
          <h2 className="text-3xl font-black text-gray-900">
            <span className="text-orange-500">{profile.name}</span>
          </h2>
        </div>
        <div className="relative">
          <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg active:scale-90 transition-all border-4 border-white">
            <Camera size={26} />
          </button>
        </div>
      </section>

      {/* Dynamic Calorie Tracker */}
      <section className="bg-white rounded-[40px] p-6 shadow-sm border border-orange-50 space-y-4">
         <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className={`w-14 h-14 ${status.bg} rounded-3xl flex items-center justify-center ${status.color} transition-colors duration-500 shadow-inner`}>
                  <Flame size={28} fill="currentColor" />
               </div>
               <div>
                  <p className="text-3xl font-black text-gray-900 leading-none">{caloriesConsumed}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Calo đã nạp</p>
               </div>
            </div>
            <div className={`flex flex-col items-end gap-1.5 animate-in slide-in-from-right-4`}>
               <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${status.bg} ${status.color} border border-current shadow-sm`}>
                  {status.icon}
                  <span className="text-[10px] font-black uppercase tracking-wider">{status.label}</span>
               </div>
               <p className={`text-[11px] font-bold ${status.color} opacity-80`}>{status.desc}</p>
            </div>
         </div>
         <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div className={`h-full ${status.bar} transition-all duration-1000 ease-out rounded-full`} style={{ width: `${progressPercent}%` }} />
         </div>
         <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
            <span>0</span>
            <span>Mục tiêu: {calorieGoal} kcal</span>
         </div>
      </section>

      {/* Smart Fridge Management */}
      <section className="space-y-4">
        <div className="bg-orange-900 text-white rounded-[40px] p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-800 rounded-2xl flex items-center justify-center">
                 <Utensils size={20} className="text-orange-400" />
              </div>
              <h3 className="font-black text-xl">Tủ lạnh có gì?</h3>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {ingredients.map(item => (
              <div key={item.name} className={`px-4 py-2 rounded-2xl text-[11px] font-black flex items-center gap-3 animate-in zoom-in transition-all ${item.isMandatory ? 'bg-orange-500 text-white shadow-xl scale-105' : 'bg-white/10 text-white/90 border border-white/5'}`}>
                <button onClick={() => toggleMandatory(item.name)} className="hover:scale-125 transition-transform active:scale-90">
                   {item.isMandatory ? <Pin size={14} fill="white" /> : <PinOff size={14} className="opacity-40" />}
                </button>
                <span>{item.name}</span>
                <button onClick={() => removeIngredient(item.name)} className="opacity-40 hover:opacity-100 hover:text-red-400 transition-all"><X size={14} /></button>
              </div>
            ))}
            <div className="flex-1 min-w-[160px] relative group">
              <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addIngredient()} placeholder="Nhập đạm, rau có sẵn..." className="w-full bg-white/5 border border-white/10 rounded-2xl pl-5 pr-12 py-2.5 text-xs outline-none focus:bg-white/10 focus:border-orange-500/50 transition-all placeholder:text-white/20 font-bold" />
              <button onClick={addIngredient} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all"><Plus size={18} /></button>
            </div>
          </div>
          <button onClick={handleSearchDishes} disabled={loading || ingredients.length === 0} className="w-full py-5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-black rounded-3xl flex items-center justify-center gap-3 shadow-xl shadow-orange-950/20 transition-all active:scale-95 text-sm uppercase tracking-widest">
            {loading ? <Loader2 size={24} className="animate-spin" /> : <Search size={24} />}
            Nấu gì không cần đi chợ?
          </button>
        </div>
      </section>

      {/* Results Display */}
      {results.length > 0 && (
        <section className="space-y-6 animate-in slide-in-from-bottom-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <Sparkles size={24} className="text-orange-500 fill-orange-500" />
              Gợi ý "khéo co thì ấm"
            </h3>
          </div>
          <div className="space-y-10">
            {results.map((combo, idx) => (
              <div key={idx} className="bg-white rounded-[48px] overflow-hidden shadow-sm border border-orange-50 group transition-all hover:shadow-2xl hover:-translate-y-2">
                <div className="relative h-64 overflow-hidden">
                  <img src={getDishImage(combo.name, idx)} className={`w-full h-full object-cover transition-transform duration-1000 ${generatingImages[idx] ? 'blur-xl scale-110' : 'group-hover:scale-110'}`} alt={combo.name} />
                  {generatingImages[idx] && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                       <Loader2 size={40} className="animate-spin mb-3 text-orange-400" />
                       <span className="text-xs font-black uppercase tracking-[0.2em]">Đang vẽ mâm cơm {imageSize}...</span>
                    </div>
                  )}
                  {!generatingImages[idx] && !aiGeneratedImages[idx] && (
                    <button onClick={(e) => { e.stopPropagation(); handleGenerateAIImage(idx, combo.name); }} className="absolute top-5 right-5 bg-white/30 hover:bg-orange-500 backdrop-blur-xl text-white px-4 py-2.5 rounded-2xl flex items-center gap-2 text-[10px] font-black transition-all border border-white/20 shadow-2xl active:scale-90">
                      <ImageIcon size={14} /> Tạo ảnh AI Premium
                    </button>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-8 right-8">
                    <div className="flex justify-between items-end gap-4">
                      <div className="space-y-2">
                        <h4 className="text-2xl font-black text-white leading-tight drop-shadow-lg">{combo.name}</h4>
                        <div className="flex flex-wrap gap-2">
                          {combo.comboDishes.map((dishName: string, i: number) => (
                            <span key={i} className="text-[10px] font-black text-orange-200 uppercase tracking-widest drop-shadow-md">{dishName} ·</span>
                          ))}
                        </div>
                      </div>
                      <div className="bg-orange-500 text-white px-4 py-2 rounded-2xl font-black text-xs uppercase shadow-xl border border-orange-400">
                        {combo.calories} kcal
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <p className="text-sm text-gray-500 leading-relaxed italic font-medium">"{combo.description}"</p>
                  <div className="pt-6 border-t border-gray-50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-[11px] text-orange-900 font-bold bg-orange-50 px-5 py-3 rounded-2xl flex-1">
                      <Zap size={16} className="text-orange-500 shrink-0 fill-orange-500" />
                      <span className="line-clamp-2">{combo.hackTip}</span>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => setSelectedRecipe(combo)} className="w-12 h-12 bg-white text-orange-900 rounded-2xl flex items-center justify-center shadow-md border border-orange-100 active:scale-90 transition-all"><BookOpen size={20} /></button>
                       <button onClick={() => handleCookMeal(combo)} className="w-16 h-12 bg-orange-900 text-white rounded-2xl flex items-center justify-center shadow-xl active:scale-90 transition-all font-black text-xl"><ChefHat size={22} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* History Log */}
      <section className="space-y-5">
        <div className="flex justify-between items-center px-2">
           <h3 className="text-xl font-black text-gray-900">Bữa ăn hôm nay</h3>
        </div>
        {dailyLog.meals.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-orange-100 rounded-[40px] p-12 text-center space-y-3 shadow-sm">
            <Utensils size={40} className="text-orange-200 mx-auto" />
            <p className="text-sm font-black text-orange-900 opacity-60">Chưa có dữ liệu ăn uống</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dailyLog.meals.map((meal) => (
              <div key={meal.id} className="bg-white p-5 rounded-[32px] border border-orange-50 flex items-center justify-between shadow-sm animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-inner">
                      {meal.isEatOut ? <Store size={22} /> : <Utensils size={22} />}
                   </div>
                   <div>
                      <h5 className="font-black text-gray-900 text-sm leading-tight">{meal.name}</h5>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${meal.isEatOut ? 'text-orange-500' : 'text-green-600'}`}>
                        {meal.isEatOut ? 'Ăn hàng' : 'Cơm nhà'}
                      </span>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-sm font-black text-gray-900">{meal.calories} kcal</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <style>{`
        @keyframes scan { 0% { top: -10%; } 100% { top: 110%; } }
        .animate-scan { position: absolute; width: 100%; height: 4px; background: linear-gradient(to right, transparent, #f97316, transparent); animation: scan 2s linear infinite; box-shadow: 0 0 15px #f97316; }
      `}</style>
    </div>
  );
};

export default Dashboard;
