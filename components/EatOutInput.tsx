
import React, { useState, useRef } from 'react';
import { recognizeMealFromPhoto, estimateCaloriesFromText } from '../services/geminiService';
import { Meal } from '../types';
import { Camera, Search, Loader2, X, ChevronLeft, Store, Flame, AlertCircle, CheckCircle2 } from 'lucide-react';

interface EatOutInputProps {
  onBack: () => void;
  onConfirm: (meal: Meal) => void;
}

const EatOutInput: React.FC<EatOutInputProps> = ({ onBack, onConfirm }) => {
  const [inputMode, setInputMode] = useState<'text' | 'camera'>('text');
  const [textInput, setTextInput] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzedMeal, setAnalyzedMeal] = useState<Partial<Meal> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyzeText = async () => {
    if (!textInput.trim()) return;
    setLoading(true);
    const result = await estimateCaloriesFromText(textInput);
    if (result) {
      setAnalyzedMeal({
        ...result,
        id: Math.random().toString(36).substr(2, 9),
        type: 'Ăn nhẹ', // Mặc định, user có thể sửa nếu cần logic phức tạp hơn
        isEatOut: true,
        ingredientsFound: [], 
        ingredientsMissing: []
      });
    }
    setLoading(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setPhoto(base64);
        setLoading(true);
        const result = await recognizeMealFromPhoto(base64.split(',')[1]);
        if (result) {
          setAnalyzedMeal({
             ...result,
             id: Math.random().toString(36).substr(2, 9),
             type: 'Ăn nhẹ',
             isEatOut: true,
             description: result.hackTip, // Map hacktip to description for display
             ingredientsFound: [],
             ingredientsMissing: []
          });
        }
        setLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (analyzedMeal) {
      onConfirm(analyzedMeal as Meal);
    }
  };

  return (
    <div className="px-6 py-6 space-y-6 animate-in slide-in-from-right duration-500 h-full overflow-y-auto pb-24">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-2xl font-black text-emerald-950">Ăn bên ngoài</h2>
      </div>

      {!analyzedMeal ? (
        <div className="space-y-8">
          <div className="bg-orange-50 p-6 rounded-[32px] border border-orange-100 space-y-2">
             <div className="flex items-center gap-2 text-orange-600 font-black text-sm uppercase tracking-widest">
                <Store size={16} /> Lưu ý
             </div>
             <p className="text-sm text-gray-600 font-medium">
                Fomi sẽ ước tính lượng calo dựa trên dữ liệu trung bình. Hãy cố gắng nhập chi tiết (ví dụ: "Phở bò tái không nước béo") để chính xác hơn.
             </p>
          </div>

          <div className="space-y-4">
             <div className="flex bg-gray-100 p-1 rounded-2xl relative">
                <button 
                  onClick={() => setInputMode('text')}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${inputMode === 'text' ? 'bg-white text-emerald-950 shadow-md' : 'text-gray-400'}`}
                >
                   Nhập tên món
                </button>
                <button 
                  onClick={() => setInputMode('camera')}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${inputMode === 'camera' ? 'bg-white text-emerald-950 shadow-md' : 'text-gray-400'}`}
                >
                   Chụp ảnh
                </button>
             </div>

             {inputMode === 'text' ? (
                <div className="relative">
                   <input 
                      type="text" 
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Ví dụ: Cơm tấm sườn bì..."
                      className="w-full p-5 bg-white border-2 border-emerald-50 rounded-[24px] font-bold text-emerald-950 placeholder:font-medium outline-none focus:border-emerald-500 transition-all shadow-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeText()}
                   />
                   <button 
                      onClick={handleAnalyzeText}
                      disabled={loading || !textInput}
                      className="absolute right-3 top-3 bottom-3 aspect-square bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg disabled:opacity-50"
                   >
                      {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                   </button>
                </div>
             ) : (
                <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="w-full aspect-[4/3] bg-emerald-50/50 border-2 border-dashed border-emerald-200 rounded-[32px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-emerald-50 transition-colors"
                >
                   <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg text-emerald-500">
                      {loading ? <Loader2 size={32} className="animate-spin" /> : <Camera size={32} />}
                   </div>
                   <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Chạm để chụp món ăn</p>
                </div>
             )}
             <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
           {photo && (
              <div className="w-full h-48 rounded-[32px] overflow-hidden shadow-lg border-4 border-white">
                 <img src={photo} alt="Food" className="w-full h-full object-cover" />
              </div>
           )}
           
           <div className="bg-white p-8 rounded-[40px] shadow-xl border border-emerald-50 space-y-6">
              <div className="space-y-2 text-center">
                 <h3 className="text-2xl font-black text-emerald-950">{analyzedMeal.name}</h3>
                 <div className="flex items-center justify-center gap-2">
                    <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1">
                       <Flame size={14} /> {analyzedMeal.calories} Kcal
                    </span>
                 </div>
              </div>

              <div className="bg-emerald-50 p-6 rounded-[24px] space-y-2">
                 <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                    <AlertCircle size={14} /> Nhận xét dinh dưỡng
                 </div>
                 <p className="text-sm text-emerald-900 font-medium leading-relaxed italic">
                    "{analyzedMeal.hackTip || analyzedMeal.description}"
                 </p>
              </div>

              <div className="flex gap-3">
                 <button 
                   onClick={() => { setAnalyzedMeal(null); setTextInput(''); setPhoto(null); }}
                   className="flex-1 py-4 bg-gray-50 text-gray-400 font-black rounded-2xl uppercase text-xs tracking-wider"
                 >
                    Thử lại
                 </button>
                 <button 
                   onClick={handleConfirm}
                   className="flex-[2] py-4 bg-emerald-600 text-white font-black rounded-2xl uppercase text-xs tracking-wider shadow-xl shadow-emerald-200 flex items-center justify-center gap-2"
                 >
                    <CheckCircle2 size={18} /> Lưu vào nhật ký
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default EatOutInput;
