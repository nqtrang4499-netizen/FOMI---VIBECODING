
import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { recognizeIngredientsFromPhoto } from '../services/geminiService';
import { 
  Calculator, Flame, ChevronLeft, ArrowRight, 
  ShoppingBasket, Plus, X, Camera, Sparkles, Leaf, Candy, Droplets, Scale
} from 'lucide-react';

interface DayPlanConfigProps {
  profile: UserProfile;
  onBack: () => void;
  onConfirm: (calories: number, flavors: string[], ingredients: string[]) => void;
  isGenerating: boolean;
}

const flavorOptions = [
  { id: 'Đậm đà', label: 'Đậm đà', icon: <Droplets size={12} /> },
  { id: 'Thanh đạm', label: 'Thanh đạm', icon: <Leaf size={12} /> },
  { id: 'Cay nồng', label: 'Cay nồng', icon: <Flame size={12} /> },
  { id: 'Ngọt dịu', label: 'Ngọt dịu', icon: <Candy size={12} /> },
  { id: 'Nhiều đạm', label: 'Nhiều đạm', icon: <Scale size={12} /> },
];

const quickIngredients = ['Thịt heo', 'Thịt bò', 'Gà', 'Cá', 'Trứng', 'Đậu hũ', 'Rau cải', 'Cà chua', 'Nấm'];

const DayPlanConfig: React.FC<DayPlanConfigProps> = ({ profile, onBack, onConfirm, isGenerating }) => {
  const recommendedCalories = profile.calorieGoal || 2000;
  const [targetCalories, setTargetCalories] = useState<number>(recommendedCalories);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>(profile.flavors || []);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  
  // Camera & Image state
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleFlavor = (id: string) => {
    if (selectedFlavors.includes(id)) {
      setSelectedFlavors(selectedFlavors.filter(f => f !== id));
    } else {
      setSelectedFlavors([...selectedFlavors, id]);
    }
  };

  const addIngredient = (name: string) => {
      if(name && !ingredients.includes(name)) {
          setIngredients([...ingredients, name]);
          setInputValue('');
      }
  };

  const removeIngredient = (name: string) => {
      setIngredients(ingredients.filter(i => i !== name));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsScanning(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        // Gọi AI nhận diện
        const detected = await recognizeIngredientsFromPhoto(base64.split(',')[1]);
        if (detected && detected.length > 0) {
            const newIngs = detected.map((d: any) => d.name).filter((n: string) => !ingredients.includes(n));
            setIngredients([...ingredients, ...newIngs]);
        }
        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const calorieDiff = targetCalories - recommendedCalories;
  const getAdvice = () => {
    if (Math.abs(calorieDiff) < 100) return { text: "Lý tưởng", color: "text-emerald-600", bg: "bg-emerald-50" };
    if (calorieDiff < -500) return { text: "Thấp", color: "text-orange-600", bg: "bg-orange-50" };
    if (calorieDiff < 0) return { text: "Thâm hụt", color: "text-blue-600", bg: "bg-blue-50" };
    return { text: "Cao", color: "text-purple-600", bg: "bg-purple-50" };
  };

  const advice = getAdvice();

  return (
    <div className="flex flex-col h-full bg-[#FAFBFA] overflow-hidden animate-in slide-in-from-right duration-500">
      
      {isScanning && (
        <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-md z-50 flex items-center justify-center flex-col gap-3">
           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xl">
              <div className="animate-scan" />
              <Camera size={24} className="text-emerald-600" />
           </div>
           <p className="text-white font-bold text-xs">Đang soi tủ lạnh...</p>
        </div>
      )}

      {/* Header Section - Fixed */}
      <div className="px-5 py-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50 shadow-sm">
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-xl font-black text-emerald-950">Thiết kế ngày ăn</h2>
      </div>

      {/* Main Body - Flex Column - No Global Scroll */}
      <div className="flex-1 flex flex-col gap-3 px-5 min-h-0 overflow-hidden pb-2">
        
        {/* 1. COMPACT CALORIE SECTION (Shrink) */}
        <section className="shrink-0 bg-white p-4 rounded-[24px] shadow-sm border border-emerald-50">
           <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Calculator size={16} />
                 </div>
                 <span className="text-xs font-black text-emerald-950 uppercase tracking-wide">Mục tiêu Calo</span>
              </div>
              <div className="flex items-baseline gap-1 bg-gray-50 px-2 rounded-lg">
                 <input 
                    type="number" 
                    value={targetCalories}
                    onChange={(e) => setTargetCalories(Number(e.target.value))}
                    className="text-xl font-black text-emerald-950 text-right w-20 outline-none bg-transparent py-1"
                 />
                 <span className="text-[10px] font-bold text-gray-400 pr-1">Kcal</span>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
               <input 
                  type="range" 
                  min="1000" 
                  max="4000" 
                  step="50" 
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className={`px-2 py-1 rounded-lg ${advice.bg} border border-white/50 shrink-0`}>
                    <span className={`text-[9px] font-bold ${advice.color}`}>{advice.text}</span>
                </div>
           </div>
        </section>

        {/* 2. FLAVOR SECTION (Shrink) */}
        <section className="shrink-0 space-y-2">
           <div className="flex items-center gap-2 text-gray-400 font-extrabold text-[9px] uppercase tracking-widest px-1">
              <Sparkles size={12} /> Khẩu vị hôm nay
           </div>
           <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {flavorOptions.map((flavor) => (
                 <button
                    key={flavor.id}
                    onClick={() => toggleFlavor(flavor.id)}
                    className={`px-3 py-2 rounded-xl border transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${selectedFlavors.includes(flavor.id) ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white border-emerald-50 text-gray-500 hover:border-emerald-200'}`}
                 >
                    {flavor.icon}
                    <span className="text-[10px] font-bold uppercase tracking-wider">{flavor.label}</span>
                 </button>
              ))}
           </div>
        </section>

        {/* 3. INGREDIENT SECTION (Flex-1 to take remaining space) */}
        <section className="flex-1 flex flex-col min-h-0 bg-emerald-50/40 rounded-[28px] p-4 border border-emerald-50 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 shrink-0">
               <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-[10px] uppercase tracking-widest">
                  <ShoppingBasket size={14} /> Nguyên liệu đang có
               </div>
               <span className="text-[9px] font-bold text-emerald-600 bg-white px-2 py-0.5 rounded-full shadow-sm">{ingredients.length} món</span>
            </div>

            {/* Input & Camera - Shrink 0 */}
            <div className="relative shrink-0 mb-3 flex gap-2">
                <div className="relative flex-1">
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addIngredient(inputValue)}
                        placeholder="Nhập hoặc chụp ảnh..."
                        className="w-full bg-white border border-emerald-100 rounded-xl pl-3 pr-8 py-2.5 text-xs font-bold shadow-sm focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400"
                    />
                    <button 
                        onClick={() => addIngredient(inputValue)}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center active:scale-95"
                    >
                        <Plus size={14} />
                    </button>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 bg-white border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm active:scale-95"
                >
                    <Camera size={18} />
                </button>
                <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
            </div>

            {/* Quick Suggestions - Horizontal Scroll - Shrink 0 */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 shrink-0">
                {quickIngredients.map(ing => (
                    <button 
                        key={ing}
                        onClick={() => addIngredient(ing)}
                        className="px-2.5 py-1.5 bg-white border border-emerald-100/50 rounded-lg text-[9px] font-bold text-emerald-800 hover:bg-emerald-50 transition-all shrink-0 shadow-sm"
                    >
                        + {ing}
                    </button>
                ))}
            </div>
            
            {/* Selected List - SCROLLS INTERNALLY HERE */}
            <div className="flex-1 overflow-y-auto pr-1 min-h-0">
               {ingredients.length > 0 ? (
                  <div className="flex flex-wrap gap-2 content-start">
                      {ingredients.map(ing => (
                          <span key={ing} className="bg-white text-emerald-900 border border-emerald-100 pl-3 pr-2 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 shadow-sm animate-in zoom-in duration-200">
                              {ing} 
                              <button onClick={() => removeIngredient(ing)} className="bg-gray-100 rounded-full p-0.5 hover:bg-red-100 hover:text-red-500 transition-colors">
                                <X size={10} />
                              </button>
                          </span>
                      ))}
                  </div>
               ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-2 opacity-60">
                     <ShoppingBasket size={32} />
                     <p className="text-[10px] font-bold uppercase text-center">Tủ lạnh trống trơn?<br/>Thêm vài món nhé!</p>
                  </div>
               )}
            </div>
        </section>

      </div>

      {/* Footer Button - Fixed */}
      <div className="p-5 bg-white border-t border-gray-50 shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-20">
         <button 
            onClick={() => onConfirm(targetCalories, selectedFlavors, ingredients)}
            disabled={isGenerating}
            className="w-full py-4 bg-emerald-950 text-emerald-400 font-extrabold rounded-[28px] shadow-2xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-95 transition-all disabled:opacity-70"
         >
            {isGenerating ? 'Đang lên thực đơn...' : 'Tạo thực đơn ngay'} 
            {!isGenerating && <ArrowRight size={18} />}
         </button>
      </div>
    </div>
  );
};

export default DayPlanConfig;
