
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
        type: 'Ăn nhẹ',
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
             description: result.hackTip,
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
    <div className="flex flex-col h-full bg-[#FAFBFA] animate-in slide-in-from-right duration-500 overflow-hidden">
      {/* Header - Fixed */}
      <div className="px-5 py-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50 shadow-sm">
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-xl font-black text-emerald-950">Ăn bên ngoài</h2>
      </div>

      {/* Content - Flex-1 to take remaining space, scroll internally */}
      <div className="flex-1 overflow-y-auto px-5 pb-6 min-h-0">
        {!analyzedMeal ? (
          <div className="space-y-6">
            <div className="bg-orange-50 p-4 rounded-[24px] border border-orange-100 space-y-1.5 shrink-0">
              <div className="flex items-center gap-2 text-orange-600 font-black text-xs uppercase tracking-widest">
                  <Store size={14} /> Lưu ý
              </div>
              <p className="text-xs text-gray-600 font-medium">
                  Fomi ước tính calo theo dữ liệu trung bình. Hãy nhập chi tiết để chính xác hơn.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex bg-gray-100 p-1 rounded-xl relative shrink-0">
                  <button 
                    onClick={() => setInputMode('text')}
                    className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${inputMode === 'text' ? 'bg-white text-emerald-950 shadow-md' : 'text-gray-400'}`}
                  >
                    Nhập tên món
                  </button>
                  <button 
                    onClick={() => setInputMode('camera')}
                    className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${inputMode === 'camera' ? 'bg-white text-emerald-950 shadow-md' : 'text-gray-400'}`}
                  >
                    Chụp ảnh
                  </button>
              </div>

              {inputMode === 'text' ? (
                  <div className="relative">
                    <input 
                        type="text" 
                        value={textInput}
                        autoComplete="off"
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Ví dụ: Cơm tấm sườn bì..."
                        className="w-full p-4 bg-white border-2 border-emerald-50 rounded-[20px] font-bold text-emerald-950 placeholder:font-medium outline-none focus:border-emerald-500 transition-all shadow-sm text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeText()}
                    />
                    <button 
                        onClick={handleAnalyzeText}
                        disabled={loading || !textInput}
                        className="absolute right-2 top-2 bottom-2 aspect-square bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                    </button>
                  </div>
              ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-[4/3] bg-emerald-50/50 border-2 border-dashed border-emerald-200 rounded-[28px] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-emerald-50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-emerald-500">
                        {loading ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
                    </div>
                    <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Chạm để chụp món ăn</p>
                  </div>
              )}
              <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
            </div>
          </div>
        ) : (
          <div className="space-y-5 animate-in slide-in-from-bottom duration-500">
            {photo && (
                <div className="w-full h-40 rounded-[28px] overflow-hidden shadow-lg border-4 border-white shrink-0">
                  <img src={photo} alt="Food" className="w-full h-full object-cover" />
                </div>
            )}
            
            <div className="bg-white p-6 rounded-[32px] shadow-xl border border-emerald-50 space-y-4">
                <div className="space-y-1.5 text-center">
                  <h3 className="text-xl font-black text-emerald-950">{analyzedMeal.name}</h3>
                  <div className="flex items-center justify-center gap-2">
                      <span className="bg-orange-50 text-orange-600 px-3 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1">
                        <Flame size={12} /> {analyzedMeal.calories} Kcal
                      </span>
                  </div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-[20px] space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest">
                      <AlertCircle size={12} /> Nhận xét dinh dưỡng
                  </div>
                  <p className="text-xs text-emerald-900 font-medium leading-relaxed italic">
                      "{analyzedMeal.hackTip || analyzedMeal.description}"
                  </p>
                </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer - Fixed */}
      {analyzedMeal && (
         <div className="p-5 bg-white border-t border-gray-50 shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-20 flex gap-3">
            <button 
              onClick={() => { setAnalyzedMeal(null); setTextInput(''); setPhoto(null); }}
              className="flex-1 py-3.5 bg-gray-50 text-gray-400 font-black rounded-2xl uppercase text-[10px] tracking-wider"
            >
              Thử lại
            </button>
            <button 
              onClick={handleConfirm}
              className="flex-[2] py-3.5 bg-emerald-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-wider shadow-xl shadow-emerald-200 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} /> Lưu vào nhật ký
            </button>
         </div>
      )}
    </div>
  );
};

export default EatOutInput;
