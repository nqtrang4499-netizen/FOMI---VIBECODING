
import React, { useState } from 'react';
import { UserProfile, ShoppingItem, Meal } from '../types';
import { getMarketDetails } from '../services/geminiService';
import { 
  CheckCircle2, ShoppingCart, MapPin, Package, Zap, Trash2, 
  Loader2, ChevronUp, ChefHat, Store, Check
} from 'lucide-react';

interface ShoppingListProps {
  profile: UserProfile;
  cart: ShoppingItem[];
  setCart: (cart: ShoppingItem[]) => void;
  activeMeal?: Meal | null;
  onStartCooking?: () => void;
}

// Fomi Panda
const MASCOT_SHOPPING = "https://api.dicebear.com/7.x/big-ears/svg?seed=Fomi&backgroundColor=b6e3f4&skinColor=ffffff&hairColor=000000";

const ShoppingList: React.FC<ShoppingListProps> = ({ profile, cart, setCart, activeMeal, onStartCooking }) => {
  const [marketInfo, setMarketInfo] = useState<{ advice: string; locations: any[] } | null>(null);
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [showMarketAdvice, setShowMarketAdvice] = useState(true);

  const toggleItem = (id: string) => {
    const next = cart.map(item => item.id === id ? { ...item, isBought: !item.isBought } : item);
    setCart(next);
  };

  const removeItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleFindMarkets = async () => {
    if (cart.length === 0) return;
    setLoadingMarket(true);
    let coords: { lat: number; lng: number } | undefined;
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
      coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch (e) {
      console.warn("Không thể lấy vị trí hiện tại");
    }
    const ingredients = cart.map(i => i.name);
    
    // Gọi API mới
    const result = await getMarketDetails(ingredients, coords?.lat, coords?.lng);
    
    if (result) {
        // Cập nhật giá tiền vào giỏ hàng
        if (result.itemPrices) {
            const updatedCart = cart.map(item => {
                const priceInfo = result.itemPrices.find((p: any) => p.name.toLowerCase().includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(p.name.toLowerCase()));
                return priceInfo ? { ...item, price: priceInfo.price } : item;
            });
            setCart(updatedCart);
        }
        
        setMarketInfo({
            advice: result.advice,
            locations: result.locations || []
        });
    }
    
    setLoadingMarket(false);
    setShowMarketAdvice(true);
  };

  const totalPrice = cart.reduce((acc, item) => acc + (item.price || 0), 0);
  const isAllBought = cart.every(item => item.isBought);

  // Nguyên liệu có sẵn từ activeMeal
  const availableIngredients = activeMeal?.ingredientsFound || [];

  return (
    <div className="flex flex-col h-full bg-[#FAFBFA]">
      {/* Header */}
      <div className="px-5 py-4 shrink-0 flex items-center justify-between border-b border-gray-50 bg-white">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-[#b6e3f4] rounded-full border border-white shadow-sm overflow-hidden flex items-center justify-center">
              <img src={MASCOT_SHOPPING} alt="Fomi" className="w-full h-full object-cover transform scale-125 translate-y-1" />
           </div>
           <div>
              <h2 className="text-lg font-black text-emerald-950 tracking-tight">
                 {activeMeal ? 'Đi chợ cùng Fomi' : 'Giỏ hàng'}
              </h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                 {activeMeal ? activeMeal.name : 'Danh sách cần mua'}
              </p>
           </div>
        </div>
        <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
           <ShoppingCart size={18} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 pb-32">
        {/* Available Ingredients Section */}
        {availableIngredients.length > 0 && (
           <div className="space-y-2">
              <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                 <CheckCircle2 size={12} /> Đã có sẵn tại nhà ({availableIngredients.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                 {availableIngredients.map((ing, idx) => (
                    <div key={idx} className="bg-emerald-50/50 border border-emerald-100 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                        <Check size={12} className="text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-900 opacity-70">{ing}</span>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* Shopping List Section */}
        <section className="space-y-2">
          {availableIngredients.length > 0 && (
             <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1.5 pt-2 border-t border-gray-50">
                <ShoppingCart size={12} /> Cần mua thêm ({cart.length})
             </h3>
          )}

          {cart.length === 0 ? (
            activeMeal && availableIngredients.length > 0 ? (
               <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center space-y-2 mt-4">
                 <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
                 <p className="text-sm font-bold text-emerald-900">Đã đủ hết nguyên liệu!</p>
                 <p className="text-xs text-gray-500">Tuyệt vời, bạn có thể nấu ngay không cần đi chợ.</p>
               </div>
            ) : (
               !activeMeal && (
                <div className="bg-white border-2 border-dashed border-gray-100 rounded-2xl p-10 text-center space-y-2 mt-4">
                    <Package size={32} className="text-gray-200 mx-auto" />
                    <p className="text-sm font-bold text-gray-400">Giỏ hàng đang trống</p>
                </div>
               )
            )
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${item.isBought ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-gray-100 shadow-sm'}`}
                >
                  <button 
                    onClick={() => toggleItem(item.id)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${item.isBought ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 text-transparent hover:border-emerald-500'}`}
                  >
                    <CheckCircle2 size={14} />
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${item.isBought ? 'text-gray-400 line-through' : 'text-emerald-950'}`}>{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{item.amount || '1 phần'}</span>
                      {item.price && <span className="text-[10px] font-bold text-emerald-600">{item.price.toLocaleString()}đ</span>}
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Market Finder Button */}
        {cart.length > 0 && (
           <div className="space-y-3 pt-2">
              <button 
                onClick={handleFindMarkets}
                disabled={loadingMarket}
                className="w-full py-3 bg-white border border-emerald-100 text-emerald-600 font-bold rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider hover:bg-emerald-50 transition-all shadow-sm"
              >
                 {loadingMarket ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                 Tìm chỗ mua & Báo giá
              </button>

              {marketInfo && showMarketAdvice && (
                 <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-xl shadow-emerald-900/5 space-y-3 animate-in fade-in slide-in-from-bottom">
                    <div className="flex justify-between items-start">
                       <h3 className="text-xs font-black text-emerald-900 uppercase tracking-widest flex items-center gap-1.5">
                          <Zap size={12} className="text-yellow-500" /> Fomi mách nước
                       </h3>
                       <button onClick={() => setShowMarketAdvice(false)}><ChevronUp size={16} className="text-gray-300" /></button>
                    </div>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed bg-gray-50 p-3 rounded-xl">
                       {marketInfo.advice}
                    </p>
                    {marketInfo.locations.length > 0 && (
                       <div className="space-y-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Địa điểm gợi ý</p>
                          {marketInfo.locations.map((loc: any, idx: number) => (
                             <div key={idx} className="flex items-start gap-2 text-xs">
                                <Store size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                                <div>
                                   <p className="font-bold text-emerald-900">{loc.name}</p>
                                   <p className="text-gray-500 text-[10px]">{loc.address}</p>
                                </div>
                             </div>
                          ))}
                       </div>
                    )}
                 </div>
              )}
           </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-5 bg-white border-t border-gray-50 shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-20 space-y-3">
         <div className="flex justify-between items-center px-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tổng thiệt hại</span>
            <span className="text-xl font-black text-emerald-950">{totalPrice.toLocaleString()} <span className="text-xs text-gray-400 font-bold">VNĐ</span></span>
         </div>
         {activeMeal ? (
            <button 
               onClick={onStartCooking}
               disabled={!isAllBought}
               className="w-full py-4 bg-emerald-600 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-200 active:scale-95 transition-all text-xs uppercase tracking-wider disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
            >
               <ChefHat size={18} /> Bắt đầu nấu
            </button>
         ) : (
            <button className="w-full py-4 bg-gray-100 text-gray-400 font-bold rounded-2xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-not-allowed">
               Về trang chủ để chọn món
            </button>
         )}
      </div>
    </div>
  );
};

export default ShoppingList;
