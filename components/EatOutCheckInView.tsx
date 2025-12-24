
import React, { useState, useRef } from 'react';
import { Meal } from '../types';
import { recognizeMealFromPhoto } from '../services/geminiService';
import { 
  Camera, Store, Loader2, CheckCircle2, AlertCircle, 
  MapPin, Flame, Share2, ArrowRight, RotateCcw
} from 'lucide-react';

interface EatOutCheckInViewProps {
  meal: Meal;
  onUpdateMeal: (originalMealId: string, newMealData: Partial<Meal>) => void;
  onComplete: () => void;
}

const EatOutCheckInView: React.FC<EatOutCheckInViewProps> = ({ meal, onUpdateMeal, onComplete }) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [detectedMeal, setDetectedMeal] = useState<{name: string, calories: number, tip: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setPhoto(base64);
        setAnalyzing(true);
        
        // Gọi AI nhận diện
        const result = await recognizeMealFromPhoto(base64.split(',')[1]);
        setAnalyzing(false);
        
        if (result) {
            setDetectedMeal({
                name: result.name,
                calories: result.calories,
                tip: result.hackTip
            });

            if (result.name.toLowerCase() !== meal.name.toLowerCase()) {
                onUpdateMeal(meal.id, {
                    name: result.name,
                    calories: result.calories,
                    description: result.hackTip,
                });
            }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFBFA] overflow-hidden">
      
      {/* 1. Header (Fixed) */}
      <div className="shrink-0 pt-4 pb-2 text-center space-y-2 px-5">
        <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto shadow-sm border-[3px] border-white">
           <Store size={24} />
        </div>
        <div>
            <h2 className="text-lg font-black text-emerald-950">Ăn bên ngoài</h2>
            <div className="inline-block bg-white border border-gray-100 px-3 py-1 rounded-full mt-1 shadow-sm">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest truncate max-w-[180px]">
                    {meal.name}
                </p>
            </div>
        </div>
      </div>

      {/* 2. Middle (Flexible, Shrinkable) */}
      <div className="flex-1 flex flex-col justify-center items-center py-2 px-6 min-h-0">
        <div className="w-full aspect-square max-h-full bg-white rounded-[28px] shadow-xl border-[4px] border-white relative overflow-hidden group mx-auto max-w-[300px]">
            {photo ? (
            <>
                <img src={photo} alt="Check-in" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                
                {analyzing ? (
                    <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center gap-2 text-white">
                        <Loader2 size={24} className="animate-spin" />
                        <p className="text-[9px] font-black uppercase tracking-widest">Đang phân tích...</p>
                    </div>
                ) : (
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white space-y-1.5 animate-in slide-in-from-bottom">
                        <div className="flex items-center gap-2 text-emerald-400 font-black text-[9px] uppercase tracking-widest bg-emerald-950/60 backdrop-blur-md px-2 py-0.5 rounded-full w-fit">
                            <CheckCircle2 size={12} /> Đã Check-in
                        </div>
                        <div>
                            <h3 className="text-lg font-black leading-tight mb-0.5">
                                {detectedMeal ? detectedMeal.name : meal.name}
                            </h3>
                            {detectedMeal && detectedMeal.name.toLowerCase() !== meal.name.toLowerCase() && (
                                <p className="text-[8px] text-orange-300 italic">
                                    * Tên món đã được AI cập nhật
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2">
                             <div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1.5">
                                <Flame size={12} className="text-orange-400" fill="currentColor"/> 
                                <span className="text-[9px] font-bold">{detectedMeal ? detectedMeal.calories : meal.calories} Kcal</span>
                             </div>
                        </div>
                    </div>
                )}
            </>
            ) : (
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full bg-emerald-50/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-emerald-50 transition-colors"
            >
                <div className="w-16 h-16 bg-white rounded-[20px] flex items-center justify-center text-emerald-500 shadow-lg border border-emerald-100 transform group-hover:scale-110 transition-transform">
                    <Camera size={32} />
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Chụp ảnh món ăn</p>
                    <p className="text-[8px] font-bold text-gray-400 mt-0.5">Để Fomi tính calo giúp bạn</p>
                </div>
            </div>
            )}
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleCapture} />
        </div>
      </div>

      {/* 3. Footer (Fixed) */}
      <div className="shrink-0 p-5 bg-white border-t border-gray-50 z-20">
         {photo && !analyzing && (
            <div className="flex gap-3">
                <button 
                onClick={() => { setPhoto(null); setDetectedMeal(null); }}
                className="w-12 h-12 bg-white text-gray-400 rounded-[18px] flex items-center justify-center border border-gray-200 shadow-sm active:scale-95 transition-all"
                >
                <RotateCcw size={18} />
                </button>
                <button 
                onClick={onComplete}
                className="flex-1 py-3.5 bg-emerald-600 text-white font-black rounded-[20px] flex items-center justify-center gap-2 shadow-xl shadow-emerald-200 active:scale-95 transition-all text-xs uppercase tracking-wider"
                >
                Hoàn tất & Lưu <ArrowRight size={16} />
                </button>
            </div>
         )}
         {!photo && (
             <button onClick={onComplete} className="w-full py-3.5 text-[9px] font-bold text-gray-400 hover:text-emerald-600 transition-colors bg-white rounded-[20px] border border-gray-100 uppercase tracking-wider">
                Bỏ qua bước chụp ảnh
            </button>
         )}
      </div>
    </div>
  );
};

export default EatOutCheckInView;
