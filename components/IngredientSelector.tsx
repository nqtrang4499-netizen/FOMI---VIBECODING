
import React, { useState, useRef } from 'react';
import { UserProfile, IngredientInput } from '../types';
import { getDishesFromIngredients, recognizeIngredientsFromPhoto } from '../services/geminiService';
import { 
  Plus, X, Search, Camera, CheckCircle2, Circle, 
  ChefHat, Loader2, Sparkles, Drumstick, Leaf, Fish, Egg, Soup, Cherry,
  Flame, Candy, Droplets, ArrowRight
} from 'lucide-react';

interface IngredientSelectorProps {
  profile: UserProfile;
  onResults: (results: any[], usedIngredients: IngredientInput[]) => void;
}

const COMMON_TAGS = [
  { name: 'Thịt heo', icon: <Drumstick size={14} /> },
  { name: 'Cá', icon: <Fish size={14} /> },
  { name: 'Trứng', icon: <Egg size={14} /> },
  { name: 'Rau', icon: <Leaf size={14} /> },
  { name: 'Cà chua', icon: <Cherry size={14} /> },
];

const flavorProfiles = [
  { id: 'spicy', label: 'Cay', icon: <Flame size={12} /> },
  { id: 'sweet', label: 'Ngọt', icon: <Candy size={12} /> },
  { id: 'light', label: 'Thanh', icon: <Leaf size={12} /> },
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
    const tempProfile = { ...profile, flavors: currentFlavors };
    const ingredients: IngredientInput[] = wanted.map(w => ({
      name: w,
      isMandatory: available.includes(w)
    }));
    const results = await getDishesFromIngredients(tempProfile, ingredients);
    onResults(results, ingredients);
    setLoading(false);
  };

  return (
    <div className="px-6 py-4 space-y-8 animate-in slide-in-from-right duration-500 pb-24">
      {isScanning && (
        <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-md z-50 flex items-center justify-center">
           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xl">
              <div className="animate-scan" />
              <Camera size={24} className="text-emerald-600" />
           </div>
        </div>
      )}

      <section>
        <h2 className="text-2xl font-extrabold text-emerald-950">Hôm nay ăn gì?</h2>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Chọn nguyên liệu bạn đang có</p>
      </section>

      {/* Simplified Search */}
      <div className="relative">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addWanted(input)}
          placeholder="Thịt bò, nấm, đậu hũ..." 
          className="w-full bg-white border border-emerald-50 rounded-2xl pl-5 pr-14 py-4 text-sm font-semibold shadow-sm focus:border-emerald-500 outline-none transition-all"
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"
        >
          <Camera size={18} />
        </button>
        <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={() => setIsScanning(true)} />
      </div>

      {/* Ingredient Tags Area */}
      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {COMMON_TAGS.map(tag => (
            <button
              key={tag.name}
              onClick={() => addWanted(tag.name)}
              className="px-4 py-2 bg-white border border-emerald-50 rounded-full text-[11px] font-extrabold text-emerald-900 flex items-center gap-2 hover:bg-emerald-50 transition-all shadow-sm"
            >
              {tag.icon} {tag.name}
            </button>
          ))}
        </div>

        {wanted.length > 0 && (
          <div className="bg-emerald-50/30 rounded-[28px] p-6 space-y-4 border border-emerald-50">
             <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest">Danh sách đã chọn</span>
                <span className="text-[9px] text-emerald-600 font-bold italic">Tích nếu có sẵn</span>
             </div>
             <div className="flex flex-wrap gap-3">
                {wanted.map(item => (
                  <div key={item} className="flex items-center gap-2 bg-white p-1 pr-3 rounded-full border border-emerald-50 shadow-sm transition-all group">
                     <button 
                       onClick={() => toggleAvailable(item)}
                       className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${available.includes(item) ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-300'}`}
                     >
                       <CheckCircle2 size={16} />
                     </button>
                     <span className={`text-xs font-bold ${available.includes(item) ? 'text-emerald-950' : 'text-gray-400'}`}>{item}</span>
                     <button onClick={() => removeWanted(item)} className="ml-1 text-gray-300 hover:text-red-500"><X size={14} /></button>
                  </div>
                ))}
             </div>
          </div>
        )}
      </section>

      {/* Flavor Refinement Chips */}
      <section className="space-y-3">
        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Gu vị hôm nay</p>
        <div className="flex gap-2">
          {flavorProfiles.map(f => (
            <button
              key={f.id}
              onClick={() => toggleFlavor(f.id)}
              className={`flex-1 py-3 rounded-xl text-[11px] font-extrabold border transition-all flex items-center justify-center gap-2 ${
                currentFlavors.includes(f.id) ? 'bg-emerald-950 border-emerald-950 text-white shadow-lg' : 'bg-white border-emerald-50 text-gray-400'
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* CTA Button */}
      <div className="pt-2">
        <button 
          onClick={handleSearch}
          disabled={loading || wanted.length === 0}
          className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 transition-all active:scale-95 text-sm uppercase tracking-wider"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
          {loading ? 'Đang sáng tạo...' : 'Xây dựng thực đơn'}
        </button>
      </div>
    </div>
  );
};

export default IngredientSelector;
