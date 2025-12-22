
import React, { useState, useEffect } from 'react';
import { UserProfile, ShoppingItem } from '../types';
import { getMarketDetails } from '../services/geminiService';
import { CheckCircle2, Circle, ShoppingCart, MapPin, Package, Zap, Trash2, Loader2, Navigation, Clock, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';

interface ShoppingListProps {
  profile: UserProfile;
  cart: ShoppingItem[];
  setCart: (cart: ShoppingItem[]) => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ profile, cart, setCart }) => {
  const [marketInfo, setMarketInfo] = useState<{ advice: string; links: any[] } | null>(null);
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');
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
    
    // Get location
    let coords: { lat: number; lng: number } | undefined;
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
      coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch (e) {
      console.warn("Could not get location, using general area");
    }

    const ingredients = cart.map(i => i.name);
    const result = await getMarketDetails(ingredients, coords?.lat, coords?.lng);
    setMarketInfo(result);
    setLoadingMarket(false);
    setShowMarketAdvice(true);
  };

  const totalPrice = cart.reduce((acc, item) => acc + (item.price || 0), 0);

  return (
    <div className="px-6 py-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-orange-900 leading-tight tracking-tight">Giỏ đồ đi chợ</h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Tổng hợp từ các món bạn chọn</p>
        </div>
        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-inner">
           <ShoppingCart size={24} />
        </div>
      </div>

      {/* Cart Items List */}
      <section className="space-y-4">
        {cart.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-orange-100 rounded-[40px] p-12 text-center space-y-3">
            <Package size={40} className="text-orange-200 mx-auto" />
            <p className="text-sm font-bold text-orange-900/60">Giỏ hàng đang trống trơn!</p>
            <p className="text-[10px] text-gray-400">Hãy chọn "Nấu món này" ở trang chủ để thêm nguyên liệu vào đây nhé.</p>
          </div>
        ) : (
          <div className="bg-white border border-orange-50 rounded-[40px] overflow-hidden shadow-sm">
            {cart.map((item) => (
              <div key={item.id} className={`flex items-center justify-between p-5 border-b border-orange-50 last:border-0 transition-all ${item.isBought ? 'bg-gray-50' : 'bg-white'}`}>
                <div className="flex items-center gap-4 flex-1" onClick={() => toggleItem(item.id)}>
                  {item.isBought ? <CheckCircle2 size={24} className="text-orange-500" /> : <Circle size={24} className="text-orange-100" />}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-sm ${item.isBought ? 'line-through text-gray-300' : 'text-orange-900'}`}>{item.name}</span>
                      {item.fromMeal && <span className="text-[8px] bg-orange-50 text-orange-400 px-1.5 py-0.5 rounded-full uppercase font-black">{item.fromMeal}</span>}
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">{item.amount} • {item.price?.toLocaleString()}đ</p>
                  </div>
                </div>
                <button onClick={() => removeItem(item.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            ))}
            
            {/* Total Summary */}
            <div className="bg-orange-50/50 p-6 flex justify-between items-center">
               <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-orange-500" />
                  <span className="text-sm font-black text-orange-900 uppercase">Tổng tiền ước tính:</span>
               </div>
               <span className="text-xl font-black text-orange-600">{totalPrice.toLocaleString()}đ</span>
            </div>
          </div>
        )}
      </section>

      {/* Market Logistics & Grounding */}
      {cart.length > 0 && (
        <section className="space-y-4">
           {/* Logistics Toggles */}
           <div className="flex gap-2">
              <button 
                onClick={() => setDeliveryMode('delivery')}
                className={`flex-1 py-4 rounded-3xl font-black text-xs uppercase transition-all flex items-center justify-center gap-2 border-2 ${deliveryMode === 'delivery' ? 'bg-orange-900 border-orange-900 text-white shadow-lg' : 'bg-white border-orange-50 text-gray-400'}`}
              >
                <Clock size={16} /> Delivery
              </button>
              <button 
                onClick={() => setDeliveryMode('pickup')}
                className={`flex-1 py-4 rounded-3xl font-black text-xs uppercase transition-all flex items-center justify-center gap-2 border-2 ${deliveryMode === 'pickup' ? 'bg-orange-900 border-orange-900 text-white shadow-lg' : 'bg-white border-orange-50 text-gray-400'}`}
              >
                <Navigation size={16} /> Pickup
              </button>
           </div>

           <button 
            onClick={handleFindMarkets}
            disabled={loadingMarket}
            className="w-full py-5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-[32px] flex items-center justify-center gap-3 shadow-xl shadow-orange-200 transition-all active:scale-95 text-sm uppercase"
          >
            {loadingMarket ? <Loader2 size={24} className="animate-spin" /> : <MapPin size={24} />}
            Tìm nơi mua gần nhất
          </button>

          {marketInfo && (
            <div className="bg-white border border-orange-50 rounded-[40px] p-6 shadow-sm space-y-4 animate-in slide-in-from-top-4">
              <div className="flex justify-between items-center">
                <h4 className="font-black text-gray-900 text-sm flex items-center gap-2">
                  <Zap size={18} className="text-orange-500" /> Phân tích cửa hàng
                </h4>
                <button onClick={() => setShowMarketAdvice(!showMarketAdvice)} className="text-gray-400">
                   {showMarketAdvice ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>

              {showMarketAdvice && (
                <div className="space-y-4">
                  <div className="prose prose-sm text-gray-600 text-[13px] leading-relaxed whitespace-pre-wrap font-medium border-l-4 border-orange-100 pl-4 py-1">
                    {marketInfo.advice}
                  </div>
                  
                  {marketInfo.links.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Xem chi tiết trên Maps:</p>
                      <div className="flex flex-wrap gap-2">
                        {marketInfo.links.map((link, idx) => (
                          <a 
                            key={idx} 
                            href={link.uri} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-xl text-[10px] font-black hover:bg-orange-100 transition-colors border border-orange-100"
                          >
                            <MapPin size={12} /> {link.title || "Địa điểm " + (idx + 1)}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <p className="text-[10px] text-gray-400 text-center italic px-4 pb-10 leading-relaxed">
        *Fomi tự động tổng hợp danh sách từ mâm cơm bạn đã chọn. Giá cả và thời gian là ước tính từ dữ liệu Google.
      </p>
    </div>
  );
};

export default ShoppingList;
