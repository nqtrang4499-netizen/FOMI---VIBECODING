
import React, { useState, useRef } from 'react';
import { UserProfile, IngredientInput } from '../types';
import { getDishesFromIngredients, recognizeIngredientsFromPhoto } from '../services/geminiService';
import { 
  Plus, X, Search, Camera, CheckCircle2, Circle, 
  ChefHat, Loader2, Sparkles, Drumstick, Leaf, Fish, Egg, Soup, Cherry,
  Flame, Candy, Droplets, Info
} from 'lucide-react';

interface IngredientSelectorProps {
  profile: UserProfile;
  onResults: (results: any[], usedIngredients: IngredientInput[]) => void;
}

const COMMON_TAGS = [
  { name: 'Thịt heo', icon: <Drumstick size={14} /> },
  { name: 'Thịt bò', icon: <Drumstick size={14} /> },
  { name: 'Cá', icon: <Fish size={14} /> },
  { name: 'Trứng', icon: <Egg size={14} /> },
  { name: 'Rau muống', icon: <Leaf size={14} /> },
  { name: 'Cà chua', icon: <Cherry size={14} /> },
  { name: 'Bún', icon: <Soup size={14} /> },
];

const flavorProfiles = [
  { id: 'spicy', label: 'Cay', icon: <Flame size={14} /> },
  { id: 'sweet', label: 'Ngọt', icon: <Candy size={14} /> },
  { id: 'salty', label: 'Mặn', icon: <Droplets size={14} /> },
  { id: 'sour', label: 'Chua', icon: <Droplets size={14} /> },
  { id: 'light', label: 'Thanh đạm', icon: <Leaf size={14} /> },
];

const IngredientSelector: React.FC<IngredientSelectorProps> = ({ profile, onResults }) => {
  const [wanted, setWanted] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>([]);
  const [currentFlavors, setCurrentFlavors] = useState<string[]>(profile.flavors || []);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addWanted = (name: string) => {
    if (!name.trim()) return;
    if (!wanted.includes(name)) setWanted([...wanted, name]);
    setInput('');
  };

  const toggleAvailable = (name: string) => {
    if (available.includes(name)) {
      setAvailable(available.filter(i => i !== name));
    } else {
      setAvailable([...available, name]);
    }
  };

  const toggleFlavor = (id: string) => {
    if (currentFlavors.includes(id)) {
      setCurrentFlavors(currentFlavors.filter(f => f !== id));
    } else {
      setCurrentFlavors([...currentFlavors, id]);
    }
  };

  const removeWanted = (name: string) => {
    setWanted(wanted.filter(i => i !== name));
    setAvailable(available.filter(i => i !== name));
  };

  const handleSearch = async () => {
    if (wanted.length === 0) return;
    setLoading(true);
    
    // Cập nhật profile tạm thời với khẩu vị đã chọn
    const tempProfile = { ...profile, flavors: currentFlavors };
    
    const ingredients: IngredientInput[] = wanted.map(w => ({
      name: w,
      isMandatory: available.includes(w)
    }));
    
    const results = await getDishesFromIngredients(tempProfile, ingredients);
    onResults(results, ingredients);
    setLoading(false);
  };

  const handlePhotoScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const detected = await recognizeIngredientsFromPhoto(base64);
      const newWanted = [...wanted];
      const newAvailable = [...available];
      detected.forEach((d: any) => {
        if (!newWanted.includes(d.name)) newWanted.push(d.name);
        if (!newAvailable.includes(d.name)) newAvailable.push(d.name);
      });
      setWanted(newWanted);
      setAvailable(newAvailable);
      setIsScanning(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="px-6 py-6 space-y-8 animate-in slide-in-from-right duration-500 pb-20">
      {isScanning && (
        <div className="fixed inset-0 bg-emerald-900/40 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4">
           <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden">
              <div className="absolute inset-x-0 h-1 bg-emerald-500 animate-scan"></div>
              <Camera size={32} className="text-emerald-600" />
           </div>
           <p className="text-white font-bold">Đang quét tủ lạnh...</p>
        </div>
      )}

      <section className="space-y-2">
        <h2 className="text-2xl font-bold text-emerald-900 tracking-tight">Hôm nay ăn gì?</h2>
        <p className="text-sm text-gray-500 font-medium">Chọn nguyên liệu và tùy chỉnh khẩu vị cho bữa ăn này.</p>
      </section>

      {/* Search Input */}
      <section className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500">
           <Search size={20} />
        </div>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addWanted(input)}
          placeholder="Nhập nguyên liệu: gà, bò, nấm..." 
          className="w-full bg-white border border-gray-100 rounded-3xl pl-12 pr-12 py-5 text-sm font-semibold shadow-sm outline-none focus:border-emerald-500 transition-all"
        />
        <button 
          onClick={() => { fileInputRef.current?.click(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"
        >
          <Camera size={20} />
        </button>
        <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handlePhotoScan} />
      </section>

      {/* Common Tags */}
      <section className="flex flex-wrap gap-2">
        {COMMON_TAGS.map(tag => (
          <button
            key={tag.name}
            onClick={() => addWanted(tag.name)}
            className="px-4 py-2 bg-white border border-gray-50 rounded-full text-xs font-bold text-gray-500 flex items-center gap-2 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
          >
            {tag.icon} {tag.name}
          </button>
        ))}
      </section>

      {/* List Manager */}
      {wanted.length > 0 && (
        <section className="space-y-4 animate-in fade-in">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đồ đã chọn</h3>
              <p className="text-[10px] text-emerald-600 font-bold italic">Tích nếu có sẵn</p>
           </div>
           
           <div className="bg-white rounded-[40px] border border-gray-50 shadow-sm overflow-hidden">
              {wanted.map((item) => (
                <div key={item} className="flex items-center justify-between p-5 border-b border-gray-50 last:border-0">
                   <div className="flex items-center gap-4 flex-1" onClick={() => toggleAvailable(item)}>
                      {available.includes(item) ? (
                        <CheckCircle2 size={24} className="text-emerald-500" />
                      ) : (
                        <Circle size={24} className="text-gray-100" />
                      )}
                      <span className={`font-bold text-sm ${available.includes(item) ? 'text-emerald-900' : 'text-gray-400'}`}>
                        {item}
                      </span>
                   </div>
                   <button onClick={() => removeWanted(item)} className="p-2 text-gray-200 hover:text-red-400">
                      <X size={18} />
                   </button>
                </div>
              ))}
           </div>
        </section>
      )}

      {/* Flavor Refinement */}
      <section className="space-y-4 bg-emerald-50/50 p-6 rounded-[40px] border border-emerald-100/50">
        <div className="flex items-center gap-2 px-2">
          <Sparkles size={18} className="text-emerald-600" />
          <h3 className="text-sm font-bold text-emerald-900">Khẩu vị hôm nay?</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {flavorProfiles.map((f) => (
            <button
              key={f.id}
              onClick={() => toggleFlavor(f.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                currentFlavors.includes(f.id) 
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' 
                : 'bg-white border-gray-100 text-gray-400'
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-emerald-600/60 font-medium px-2 italic">
          * Fomi sẽ ưu tiên các món có vị bạn vừa chọn.
        </p>
      </section>

      {/* Action Button */}
      <div className="pt-4">
        <button 
          onClick={handleSearch}
          disabled={loading || wanted.length === 0}
          className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-[32px] flex items-center justify-center gap-3 shadow-xl shadow-emerald-100 transition-all active:scale-95 text-sm uppercase"
        >
          {loading ? <Loader2 size={24} className="animate-spin" /> : <ChefHat size={24} />}
          {loading ? 'Đang sáng tạo thực đơn...' : 'Tìm món ngon phù hợp'}
        </button>
      </div>
    </div>
  );
};

export default IngredientSelector;
