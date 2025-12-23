
import React, { useState, useRef } from 'react';
import { Meal } from '../types';
import { PartyPopper, Camera, Check, Sparkles, Share2, ArrowRight, Heart, Flame, Star } from 'lucide-react';

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
    <div className="px-8 py-10 flex flex-col items-center justify-center space-y-10 animate-in zoom-in duration-700 min-h-[85vh]">
      <div className="text-center space-y-3">
         <div className="relative">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-2xl animate-bounce">
               <PartyPopper size={44} />
            </div>
            <Sparkles size={24} className="absolute -top-2 -right-2 text-yellow-400 animate-pulse" />
         </div>
         <h2 className="text-3xl font-extrabold text-emerald-950 tracking-tight">Tuyệt vời!</h2>
         <p className="text-sm font-medium text-gray-500">Món <span className="text-emerald-600 font-bold">{meal.name}</span> đã sẵn sàng.</p>
      </div>

      {/* Photo Achievement Card */}
      <div className="w-full aspect-square max-w-[300px] bg-white rounded-[40px] shadow-2xl relative overflow-hidden group border-4 border-white">
         {photo ? (
           <div className="w-full h-full relative">
              <img src={photo} alt="Finish" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 to-transparent" />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-[10px] font-extrabold">
                 <Camera size={14} /> Chụp lại
              </div>
           </div>
         ) : (
           <div 
             onClick={() => fileInputRef.current?.click()}
             className="w-full h-full flex flex-col items-center justify-center p-8 space-y-4 cursor-pointer bg-emerald-50/30"
           >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-50">
                 <Camera size={28} />
              </div>
              <div className="text-center">
                 <p className="text-xs font-extrabold text-emerald-900 uppercase tracking-widest leading-relaxed">Khoe chiến tích</p>
                 <p className="text-[10px] text-gray-400 mt-1">Lưu lại thành quả của bạn</p>
              </div>
           </div>
         )}
         <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleCapture} />
      </div>

      {/* Stats Summary - Simple Badges */}
      <div className="flex gap-4 w-full justify-center">
         <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-emerald-50 flex items-center gap-3">
            <Flame size={16} className="text-orange-500" fill="currentColor" />
            <span className="text-xs font-extrabold text-emerald-950">{meal.calories} Kcal</span>
         </div>
         <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-emerald-50 flex items-center gap-3">
            <Star size={16} className="text-yellow-400" fill="currentColor" />
            <span className="text-xs font-extrabold text-emerald-950">+50 XP</span>
         </div>
      </div>

      {/* Final Action Button */}
      <div className="w-full space-y-3">
         {photo && (
           <button className="w-full py-4.5 bg-emerald-950 text-emerald-400 font-extrabold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all text-xs uppercase tracking-widest border border-emerald-800 shadow-lg">
              <Share2 size={16} /> Chia sẻ ngay
           </button>
         )}
         <button 
           onClick={onFinish}
           className="w-full py-5 bg-emerald-600 text-white font-extrabold rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 active:scale-95 transition-all text-sm uppercase tracking-wider"
         >
           Về Trang chủ <ArrowRight size={20} />
         </button>
      </div>
    </div>
  );
};

export default EnjoyMealView;
