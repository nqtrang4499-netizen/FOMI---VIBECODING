
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
    <div className="flex flex-col h-full bg-[#FAFBFA] overflow-hidden">
      
      {/* 1. Header (Fixed) */}
      <div className="shrink-0 pt-4 pb-2 text-center space-y-2 px-6">
         <div className="relative inline-block">
            <div className="w-16 h-16 bg-[#b6e3f4] text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-lg animate-bounce overflow-hidden border-[3px] border-white">
               <img src="https://api.dicebear.com/7.x/big-ears/svg?seed=Fomi&backgroundColor=b6e3f4&skinColor=ffffff&hairColor=000000" alt="Fomi" className="w-full h-full object-cover transform scale-125 translate-y-0.5" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm animate-pulse">
                <Sparkles size={12} />
            </div>
         </div>
         <div>
            <h2 className="text-xl font-black text-emerald-950 tracking-tight">Tuyệt vời!</h2>
            <p className="text-xs font-medium text-gray-500">Món <span className="text-emerald-600 font-bold">{meal.name}</span> đã xong.</p>
         </div>
      </div>

      {/* 2. Middle (Flexible, Shrinkable) */}
      <div className="flex-1 flex flex-col justify-center items-center py-2 px-6 min-h-0">
          <div className="w-full aspect-square max-h-full bg-white rounded-[28px] shadow-xl relative overflow-hidden group border-[4px] border-white mx-auto max-w-[300px]">
            {photo ? (
            <div className="w-full h-full relative">
                <img src={photo} alt="Finish" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-white/30 transition-all border border-white/30"
                >
                    <Camera size={12} /> Chụp lại
                </div>
            </div>
            ) : (
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full flex flex-col items-center justify-center p-4 space-y-2 cursor-pointer bg-emerald-50/50 hover:bg-emerald-50 transition-colors"
            >
                <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-emerald-500 shadow-md border border-emerald-100 transform group-hover:scale-110 transition-transform">
                    <Camera size={32} />
                </div>
                <div className="text-center space-y-0.5">
                    <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Khoe chiến tích</p>
                    <p className="text-[9px] text-gray-400 font-bold">Lưu lại thành quả</p>
                </div>
            </div>
            )}
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleCapture} />
        </div>
      </div>

      {/* 3. Footer (Fixed) */}
      <div className="shrink-0 p-5 space-y-3 bg-white border-t border-gray-50 z-20">
        <div className="flex gap-2 w-full justify-center">
            <div className="bg-white px-3 py-2 rounded-xl shadow-sm border border-emerald-50 flex items-center gap-1.5">
                <Flame size={12} className="text-orange-500" fill="currentColor" />
                <span className="text-[10px] font-black text-emerald-950">{meal.calories} Kcal</span>
            </div>
            <div className="bg-white px-3 py-2 rounded-xl shadow-sm border border-emerald-50 flex items-center gap-1.5">
                <Star size={12} className="text-yellow-400" fill="currentColor" />
                <span className="text-[10px] font-black text-emerald-950">+50 XP</span>
            </div>
        </div>

         <div className="space-y-2">
            {photo && (
                <button className="w-full py-3 bg-emerald-950 text-emerald-400 font-black rounded-[20px] flex items-center justify-center gap-2 active:scale-95 transition-all text-[9px] uppercase tracking-widest border border-emerald-800 shadow-lg">
                    <Share2 size={12} /> Chia sẻ
                </button>
            )}
            <button 
                onClick={onFinish}
                className="w-full py-3.5 bg-emerald-600 text-white font-black rounded-[20px] flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 active:scale-95 transition-all text-xs uppercase tracking-widest"
            >
                Về Trang chủ <ArrowRight size={16} />
            </button>
         </div>
      </div>
    </div>
  );
};

export default EnjoyMealView;
