
import React, { useState, useRef } from 'react';
import { Meal } from '../types';
import { recognizeMealFromPhoto } from '../services/geminiService';
import { 
  Camera, Store, Loader2, CheckCircle2, AlertCircle, 
  MapPin, Flame, Share2, ArrowRight 
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

            // Nếu tên món khác nhau đáng kể, tự động cập nhật (hoặc hỏi user, ở đây ta làm flow đơn giản là hiển thị kết quả)
            if (result.name.toLowerCase() !== meal.name.toLowerCase()) {
                onUpdateMeal(meal.id, {
                    name: result.name,
                    calories: result.calories,
                    description: result.hackTip,
                    // Giữ nguyên các thuộc tính khác
                });
            }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="px-6 py-8 h-full flex flex-col items-center justify-center space-y-8 animate-in zoom-in duration-500">
      <div className="text-center space-y-2">
        <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto shadow-inner mb-4">
           <Store size={40} />
        </div>
        <h2 className="text-2xl font-black text-emerald-950">Ăn bên ngoài</h2>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
           {meal.name}
        </p>
      </div>

      <div className="w-full aspect-[4/5] max-w-sm bg-white rounded-[40px] shadow-2xl border-4 border-white relative overflow-hidden group">
         {photo ? (
           <>
             <img src={photo} alt="Check-in" className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
             
             {analyzing ? (
                <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-center gap-3 text-white">
                   <Loader2 size={32} className="animate-spin" />
                   <p className="text-xs font-bold uppercase tracking-widest">Đang nhận diện món ăn...</p>
                </div>
             ) : (
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-2 animate-in slide-in-from-bottom">
                   <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest">
                      <CheckCircle2 size={14} /> Đã Check-in
                   </div>
                   <h3 className="text-xl font-black leading-tight">
                      {detectedMeal ? detectedMeal.name : meal.name}
                   </h3>
                   <div className="flex items-center gap-4 text-xs font-bold opacity-90">
                      <span className="flex items-center gap-1"><Flame size={14} /> {detectedMeal ? detectedMeal.calories : meal.calories} Kcal</span>
                      <span className="flex items-center gap-1"><MapPin size={14} /> Check-in</span>
                   </div>
                   {detectedMeal && detectedMeal.name.toLowerCase() !== meal.name.toLowerCase() && (
                       <p className="text-[10px] text-orange-300 italic pt-2 border-t border-white/20 mt-2">
                           * Fomi nhận thấy món ăn khác với dự kiến và đã cập nhật thực đơn của bạn.
                       </p>
                   )}
                </div>
             )}
           </>
         ) : (
           <div 
             onClick={() => fileInputRef.current?.click()}
             className="w-full h-full bg-emerald-50/50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-emerald-50 transition-colors"
           >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100">
                 <Camera size={32} />
              </div>
              <p className="text-xs font-black text-emerald-900 uppercase tracking-widest">Chụp ảnh món ăn</p>
           </div>
         )}
         <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleCapture} />
      </div>

      <div className="w-full space-y-3">
         {photo && !analyzing && (
            <button 
              onClick={onComplete}
              className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 active:scale-95 transition-all text-sm uppercase tracking-wider"
            >
              Hoàn tất & Lưu <ArrowRight size={20} />
            </button>
         )}
         <button onClick={onComplete} className="text-xs font-bold text-gray-400 hover:text-emerald-600 py-2">
            Bỏ qua bước chụp ảnh
         </button>
      </div>
    </div>
  );
};

export default EatOutCheckInView;
