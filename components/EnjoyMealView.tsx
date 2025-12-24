
import React, { useState, useRef } from 'react';
import { Meal } from '../types';
import { PartyPopper, Camera, Sparkles, Share2, ArrowRight, Flame, Star } from 'lucide-react';

interface EnjoyMealViewProps {
  meal: Meal;
  onFinish: () => void;
}

const EnjoyMealView: React.FC<EnjoyMealViewProps> = ({ meal, onFinish }) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="px-6 py-6 flex flex-col items-center justify-center space-y-6 animate-in zoom-in duration-700 min-h-[85vh]">
      <div className="text-center space-y-2">
         <div className="relative">
            <div className="w-24 h-24 bg-[#b6e3f4] text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-2xl animate-bounce overflow-hidden border-4 border-white">
               <img src="https://api.dicebear.com/7.x/big-ears/svg?seed=Fomi&backgroundColor=b6e3f4&skinColor=ffffff&hairColor=000000" alt="Fomi" className="w-full h-full object-cover transform scale-125 translate-y-1" />
            </div>
            <Sparkles size={20} className="absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
            {/* Dưa hấu ăn mừng */}
            <div className="absolute -bottom-1 -right-1 text-2xl">🍉</div>
         </div>
         <h2 className="text-2xl font-extrabold text-emerald-950 tracking-tight">Tuyệt vời!</h2>
         <p className="text-xs font-medium text-gray-500">Món <span className="text-emerald-600 font-bold">{meal.name}</span> đã sẵn sàng.</p>
      </div>

      {/* Photo Achievement Card Compact */}
      <div className="w-full aspect-square max-w-[240px] bg-white rounded-[32px] shadow-2xl relative overflow-hidden group border-4 border-white">
         {photo ? (
           <div className="w-full h-full relative">
              <img src={photo} alt="Finish" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 to-transparent" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[9px] font-extrabold">
                 <Camera size={12} /> Chụp lại
              </div>
           </div>
         ) : (
           <div 
             onClick={() => fileInputRef.current?.click()}
             className="w-full h-full flex flex-col items-center justify-center p-6 space-y-3 cursor-pointer bg-emerald-50/30"
           >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-50">
                 <Camera size={24} />
              </div>
              <div className="text-center">
                 <p className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-widest leading-relaxed">Khoe chiến tích</p>
                 <p className="text-[9px] text-gray-400 mt-0.5">Lưu lại thành quả</p>
              </div>
           </div>
         )}
         <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleCapture} />
      </div>

      {/* Stats Summary - Simple Badges */}
      <div className="flex gap-3 w-full justify-center">
         <div className="bg-white px-4 py-2.5 rounded-xl shadow-sm border border-emerald-50 flex items-center gap-2">
            <Flame size={14} className="text-orange-500" fill="currentColor" />
            <span className="text-[10px] font-extrabold text-emerald-950">{meal.calories} Kcal</span>
         </div>
         <div className="bg-white px-4 py-2.5 rounded-xl shadow-sm border border-emerald-50 flex items-center gap-2">
            <Star size={14} className="text-yellow-400" fill="currentColor" />
            <span className="text-[10px] font-extrabold text-emerald-950">+50 XP</span>
         </div>
      </div>

      {/* Final Action Button */}
      <div className="w-full space-y-2.5">
         {photo && (
           <button className="w-full py-4 bg-emerald-950 text-emerald-400 font-extrabold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all text-[10px] uppercase tracking-widest border border-emerald-800 shadow-lg">
              <Share2 size={14} /> Chia sẻ ngay
           </button>
         )}
         <button 
           onClick={onFinish}
           className="w-full py-4.5 bg-emerald-600 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-200 active:scale-95 transition-all text-xs uppercase tracking-wider"
         >
           Về Trang chủ <ArrowRight size={18} />
         </button>
      </div>
    </div>
  );
};

export default EnjoyMealView;
