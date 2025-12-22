
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, DailyLog, Meal, IngredientInput } from '../types';
import { getDishesFromIngredients, recognizeMealFromPhoto, generateMealImage, recognizeIngredientsFromPhoto } from '../services/geminiService';
import { 
  Sparkles, Utensils, Zap, Flame, Activity, Camera, 
  Plus, X, Loader2, PartyPopper, Pin, PinOff, 
  Smile, Wind, ChefHat, BookOpen, Image as ImageIcon,
  Store, Drumstick, Leaf, Soup, Cherry, Egg, Search as SearchIcon
} from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  dailyLog: DailyLog;
  onAddMeal: (meal: any) => void;
}

const COMMON_INGREDIENTS = [
  { name: 'Thịt heo', icon: <Drumstick size={14} />, category: 'protein' },
  { name: 'Thịt bò', icon: <Drumstick size={14} />, category: 'protein' },
  { name: 'Thịt gà', icon: <Drumstick size={14} />, category: 'protein' },
  { name: 'Cá', icon: <Drumstick size={14} />, category: 'protein' },
  { name: 'Trứng', icon: <Egg size={14} />, category: 'protein' },
  { name: 'Đậu phụ', icon: <Utensils size={14} />, category: 'protein' },
  { name: 'Rau muống', icon: <Leaf size={14} />, category: 'veggie' },
  { name: 'Bắp cải', icon: <Leaf size={14} />, category: 'veggie' },
  { name: 'Cà chua', icon: <Cherry size={14} />, category: 'veggie' },
  { name: 'Cà rốt', icon: <Cherry size={14} />, category: 'veggie' },
  { name: 'Gừng', icon: <Soup size={14} />, category: 'spice' },
  { name: 'Hành tím', icon: <Soup size={14} />, category: 'spice' },
];

const Dashboard: React.FC<DashboardProps> = ({ profile, dailyLog, onAddMeal }) => {
  const [ingredients, setIngredients] = useState<IngredientInput[]>([]);
  const [manualInput, setManualInput] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [scanType, setScanType] = useState<'meal' | 'fridge'>('meal');
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
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

  const toggleIngredient = (name: string) => {
    const exists = ingredients.find(i => i.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      setIngredients(ingredients.filter(i => i.name.toLowerCase() !== name.toLowerCase()));
    } else {
      setIngredients([...ingredients, { name, isMandatory: false }]);
    }
  };

  const handleManualAdd = () => {
    const val = manualInput.trim();
    if (val) {
      toggleIngredient(val);
      setManualInput('');
    }
  };

  const toggleMandatory = (name: string) => {
    setIngredients(ingredients.map(i => 
      i.name === name ? { ...i, isMandatory: !i.isMandatory } : i
    ));
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
      alert("Yêu cầu chọn API Key để dùng tính năng này.");
      handleSelectKey();
      return;
    }
    setGeneratingImages(prev => ({ ...prev, [idx]: true }));
    try {
      const imageData = await generateMealImage(mealName, "1K");
      if (imageData) setAiGeneratedImages(prev => ({ ...prev, [idx]: imageData }));
    } catch (error: any) {
      setHasApiKey(false);
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
      if (scanType === 'meal') {
        const result = await recognizeMealFromPhoto(base64);
        if (result) {
          onAddMeal({ id: Math.random().toString(), name: result.name, type: 'Lunch', isEatOut: true, calories: result.calories, description: result.hackTip, hackTip: result.hackTip });
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        }
      } else {
        const detected = await recognizeIngredientsFromPhoto(base64);
        const newIngs = [...ingredients];
        detected.forEach((d: any) => {
          if (!newIngs.find(i => i.name.toLowerCase() === d.name.toLowerCase())) {
            newIngs.push({ name: d.name, isMandatory: false });
          }
        });
        setIngredients(newIngs);
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
    if (percent < 50) return { label: 'Bụng còn trống', color: 'text-blue-500', bg: 'bg-blue-50', bar: 'bg-blue-400', icon: <Wind size={14} /> };
    if (percent < 90) return { label: 'Vừa đủ', color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500', icon: <Smile size={14} /> };
    return { label: 'Đã no nê', color: 'text-emerald-700', bg: 'bg-emerald-100', bar: 'bg-emerald-600', icon: <Activity size={14} /> };
  };

  const status = getCalorieStatus(progressPercent);

  return (
    <div className="px-6 space-y-6 animate-in fade-in duration-500 pb-10 relative">
      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 z-50 animate-in slide-in-from-top-4">
          <PartyPopper size={20} />
          <span className="font-semibold text-sm">Đã ghi nhận!</span>
        </div>
      )}

      {isCapturing && (
        <div className="fixed inset-0 bg-emerald-900/40 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4 animate-in fade-in">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden">
             <div className="absolute inset-x-0 h-1 bg-emerald-500/50 animate-scan"></div>
             <Camera size={40} className="text-emerald-600" />
          </div>
          <p className="text-white font-semibold text-xl">Đang nhận diện {scanType === 'meal' ? 'món ăn' : 'tủ lạnh'}...</p>
        </div>
      )}

      {/* Greeting & Camera Actions */}
      <section className="pt-6 flex justify-between items-center">
        <div>
          <p className="text-gray-400 text-sm font-medium">Xin chào,</p>
          <h2 className="text-3xl font-bold text-gray-900"><span className="text-emerald-600">{profile.name}</span></h2>
        </div>
        <div className="flex gap-2">
          <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
          <button 
            onClick={() => { setScanType('meal'); fileInputRef.current?.click(); }} 
            className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg active:scale-90 transition-all border-2 border-white"
          >
            <Camera size={22} />
          </button>
        </div>
      </section>

      {/* Progress */}
      <section className="bg-white rounded-[32px] p-6 shadow-sm border border-green-50 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${status.bg} rounded-2xl flex items-center justify-center ${status.color}`}>
               <Flame size={24} fill="currentColor" />
            </div>
            <div>
               <p className="text-2xl font-bold text-gray-900">{caloriesConsumed}</p>
               <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Kcal hôm nay</p>
            </div>
         </div>
         <div className="text-right">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${status.bg} ${status.color} mb-2`}>
               {status.icon} <span className="text-[10px] font-bold uppercase tracking-wider">{status.label}</span>
            </div>
            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
               <div className={`h-full ${status.bar} transition-all duration-1000`} style={{ width: `${progressPercent}%` }} />
            </div>
         </div>
      </section>

      {/* Hybrid Picker */}
      <section className="space-y-4">
        <div className="bg-emerald-950 text-white rounded-[40px] p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-900 rounded-2xl flex items-center justify-center">
                 <Utensils size={20} className="text-emerald-400" />
              </div>
              <h3 className="font-bold text-xl">Thực phẩm sẵn có</h3>
            </div>
            <button 
              onClick={() => { setScanType('fridge'); fileInputRef.current?.click(); }}
              className="text-[10px] font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all border border-white/10 flex items-center gap-2"
            >
              <Camera size={14} /> Quét nhanh
            </button>
          </div>

          <div className="space-y-4">
            <div className="relative group">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400/50">
                  <SearchIcon size={18} />
               </div>
               <input 
                  type="text" 
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()}
                  placeholder="Thêm nhanh thực phẩm khác..." 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-sm outline-none focus:bg-white/10 focus:border-emerald-500/50 transition-all placeholder:text-white/20 font-semibold"
               />
               <button 
                  onClick={handleManualAdd}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-500 transition-all shadow-lg active:scale-90"
               >
                  <Plus size={20} />
               </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {COMMON_INGREDIENTS.map(item => {
                const isSelected = ingredients.find(i => i.name.toLowerCase() === item.name.toLowerCase());
                return (
                  <button
                    key={item.name}
                    onClick={() => toggleIngredient(item.name)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1 ${
                      isSelected ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {item.icon}
                    <span className="text-[9px] font-semibold text-center leading-tight">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {ingredients.length > 0 && (
            <div className="pt-4 border-t border-white/10 space-y-3">
              <p className="text-[11px] text-white/50 font-semibold uppercase tracking-widest px-1">Danh sách thực phẩm:</p>
              <div className="flex flex-wrap gap-2">
                {ingredients.map(i => (
                  <div key={i.name} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${i.isMandatory ? 'bg-emerald-600' : 'bg-white/10'}`}>
                    <button onClick={() => toggleMandatory(i.name)}>{i.isMandatory ? <Pin size={10} fill="white" /> : <PinOff size={10} />}</button>
                    <span>{i.name}</span>
                    <button onClick={() => toggleIngredient(i.name)} className="opacity-50"><X size={10} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={handleSearchDishes}
            disabled={loading || ingredients.length === 0}
            className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-[28px] flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 text-sm uppercase tracking-widest"
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : <ChefHat size={24} />}
            Tìm món ăn ngay
          </button>
        </div>
      </section>

      {/* Suggested Results */}
      {results.length > 0 && (
        <section className="space-y-6 animate-in slide-in-from-bottom-6">
          <div className="flex items-center gap-3 px-2">
            <Sparkles size={24} className="text-emerald-600 fill-emerald-100" />
            <h3 className="text-xl font-bold text-gray-900">Gợi ý món ngon</h3>
          </div>
          <div className="space-y-8">
            {results.map((combo, idx) => (
              <div key={idx} className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-green-50 group hover:shadow-xl transition-all">
                <div className="relative h-60">
                   <img src={aiGeneratedImages[idx] || `https://source.unsplash.com/800x600/?fresh,food,${encodeURIComponent(combo.name)}`} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-1000" alt={combo.name} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                   
                   {!generatingImages[idx] && !aiGeneratedImages[idx] && (
                    <button onClick={(e) => { e.stopPropagation(); handleGenerateAIImage(idx, combo.name); }} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-xl transition-all">
                        <ImageIcon size={18} />
                    </button>
                   )}
                   
                   <div className="absolute bottom-6 left-8 right-8">
                      <h4 className="text-2xl font-bold text-white leading-tight">{combo.name}</h4>
                   </div>
                </div>
                <div className="p-8 space-y-6">
                  <p className="text-sm text-gray-500 italic leading-relaxed font-medium">"{combo.description}"</p>
                  
                  <div className="flex items-center justify-between border-t border-gray-50 pt-6">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Năng lượng</span>
                        <span className="text-xl font-bold text-emerald-900">{combo.calories} kcal</span>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => setSelectedRecipe(combo)} className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-all"><BookOpen size={20} /></button>
                        <button 
                          onClick={() => {
                            onAddMeal({ id: Math.random().toString(), name: combo.name, type: 'Lunch', isEatOut: false, calories: combo.calories, description: combo.description, ingredientsMissing: combo.ingredientsMissing });
                            setShowSuccess(true);
                            setTimeout(() => setShowSuccess(false), 3000);
                          }} 
                          className="px-6 h-12 rounded-2xl bg-emerald-900 text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all shadow-lg"
                        >
                          Lưu món này
                        </button>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* History Short */}
      {dailyLog.meals.length > 0 && (
         <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 px-2 tracking-tight">Đã ăn hôm nay</h3>
            <div className="space-y-3">
               {dailyLog.meals.map((meal) => (
                  <div key={meal.id} className="bg-white p-4 rounded-3xl border border-green-50 flex items-center justify-between shadow-sm">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                           {meal.isEatOut ? <Store size={18} /> : <Utensils size={18} />}
                        </div>
                        <span className="font-semibold text-sm text-emerald-900">{meal.name}</span>
                     </div>
                     <span className="text-xs font-bold text-gray-400">{meal.calories} kcal</span>
                  </div>
               ))}
            </div>
         </section>
      )}

      <style>{`
        @keyframes scan { 0% { top: -10%; } 100% { top: 110%; } }
        .animate-scan { position: absolute; width: 100%; height: 4px; background: linear-gradient(to right, transparent, #10b981, transparent); animation: scan 2s linear infinite; box-shadow: 0 0 15px #10b981; }
      `}</style>
    </div>
  );
};

export default Dashboard;
