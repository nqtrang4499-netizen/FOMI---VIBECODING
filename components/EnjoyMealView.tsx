
import React, { useState, useRef } from 'react';
import { Meal } from '../types';
import { PartyPopper, Camera, Check, Sparkles, Share2, ArrowRight, Heart, Flame } from 'lucide-react';

interface EnjoyMealViewProps {
  meal: Meal;
  onFinish: () => void;
}

const EnjoyMealView: React.FC<EnjoyMealViewProps> = ({ meal, onFinish }) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="px-6 py-8 flex flex-col items-center justify-center space-y-8 animate-in zoom-in duration-700 min-h-[80vh]">
      {/* Celebration Header */}
      <div className="text-center space-y-4">
         <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center animate-bounce shadow-xl shadow-emerald-100">
            <PartyPopper size={48} />
         </div>
         <div className="space-y-1">
            <h2 className="text-3xl font-black text-emerald-900 tracking-tight">Chúc ngon miệng!</h2>
            <p className="text-emerald-600 font-bold italic">Bạn đã hoàn thành món <span className="underline decoration-wavy underline-offset-4">{meal.name}</span></p>
         </div>
      </div>

      {/* Achievement Photo Area */}
      <div className="w-full max-w-sm aspect-square bg-white rounded-[48px] border-2 border-emerald-100 border-dashed overflow-hidden relative group shadow-2xl shadow-emerald-900/5">
         {photo ? (
           <>
             <img src={photo} alt="Chiến tích nấu ăn" className="w-full h-full object-cover animate-in fade-in duration-1000" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-8">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white/20 backdrop-blur-md text-white px-6 py-2 rounded-full font-bold text-xs flex items-center gap-2"
                >
                   <Camera size={14} /> Chụp lại
                </button>
             </div>
             <div className="absolute top-6 right-6 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-xl animate-in slide-in-from-top-4 delay-500">
                <Heart size={24} className="fill-emerald-500" />
             </div>
           </>
         ) : (
           <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-300 rounded-2xl flex items-center justify-center">
                 <Camera size={32} />
              </div>
              <div className="space-y-1">
                 <h4 className="font-black text-emerald-900 text-sm">Khoe chiến tích của bạn</h4>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">Chụp ảnh thành phẩm để lưu giữ khoảnh khắc tự hào này!</p>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 px-8 py-4 bg-emerald-600 text-white font-black rounded-3xl shadow-lg shadow-emerald-100 active:scale-95 transition-all text-xs uppercase"
              >
                 Bắt đầu chụp ảnh
              </button>
           </div>
         )}
         <input 
           type="file" 
           accept="image/*" 
           capture="environment" 
           className="hidden" 
           ref={fileInputRef} 
           onChange={handleCapture} 
         />
      </div>

      {/* Stats Summary */}
      <div className="w-full grid grid-cols-2 gap-4">
         <div className="bg-emerald-50/50 p-6 rounded-[32px] border border-emerald-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm">
               <Flame size={20} className="fill-orange-500" />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Năng lượng</p>
               <p className="text-lg font-black text-emerald-900">{meal.calories} Kcal</p>
            </div>
         </div>
         <div className="bg-emerald-50/50 p-6 rounded-[32px] border border-emerald-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
               <Sparkles size={20} />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kỹ năng</p>
               <p className="text-lg font-black text-emerald-900">+50 XP</p>
            </div>
         </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-3 pt-4">
         {photo && (
            <button className="w-full py-5 bg-emerald-900 text-emerald-400 font-black rounded-[32px] flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 text-xs uppercase border border-emerald-800">
               <Share2 size={18} /> Chia sẻ lên cộng đồng Fomi
            </button>
         )}
         <button 
           onClick={onFinish}
           className="w-full py-5 bg-emerald-600 text-white font-black rounded-[32px] flex items-center justify-center gap-3 shadow-xl shadow-emerald-100 transition-all active:scale-95 text-xs uppercase"
         >
           Hoàn tất & Quay về Trang chủ <ArrowRight size={18} />
         </button>
      </div>
    </div>
  );
};

export default EnjoyMealView;
