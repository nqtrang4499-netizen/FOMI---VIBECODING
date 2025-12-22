
import React, { useState } from 'react';
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
    
    let coords: { lat: number; lng: number } | undefined;
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
      coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch (e) {
      console.warn("Could not get location");
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
          <h2 className="text-2xl font-black text-emerald-900 tracking-tight">Giỏ đi chợ</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tự động tổng hợp từ Fomi</p>
        </div>
        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
           <ShoppingCart size={24} />
        </div>
      </div>

      {/* Cart Items List */}
      <section className="space-y-4">
        {cart.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-emerald-100 rounded-[40px] p-12 text-center space-y-3">
            <Package size={40} className="text-emerald-200 mx-auto" />
            <p className="text-sm font-bold text-emerald-900/60">Giỏ hàng đang trống!</p>
          </div>
        ) : (
          <div className="bg-white border border-emerald-50 rounded-[32px] overflow-hidden shadow-sm">
            {cart.map((item) => (
              <div key={item.id} className={`flex items-center justify-between p-5 border-b border-emerald-50 last:border-0 transition-all ${item.isBought ? 'bg-gray-50' : 'bg-white'}`}>
                <div className="flex items-center gap-4 flex-1" onClick={() => toggleItem(item.id)}>
                  {item.isBought ? <CheckCircle2 size={24} className="text-emerald-500" /> : <Circle size={24} className="text-emerald-100" />}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-sm ${item.isBought ? 'line-through text-gray-300' : 'text-emerald-900'}`}>{item.name}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">{item.price?.toLocaleString()}đ • {item.fromMeal}</p>
                  </div>
                </div>
                <button onClick={() => removeItem(item.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            ))}
            
            <div className="bg-emerald-50/50 p-6 flex justify-between items-center">
               <span className="text-sm font-black text-emerald-900 uppercase">Tổng cộng ước tính:</span>
               <span className="text-xl font-black text-emerald-600">{totalPrice.toLocaleString()}đ</span>
            </div>
          </div>
        )}
      </section>

      {/* Market Logistics */}
      {cart.length > 0 && (
        <section className="space-y-4">
           <div className="flex gap-2">
              <button 
                onClick={() => setDeliveryMode('delivery')}
                className={`flex-1 py-4 rounded-3xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 border-2 ${deliveryMode === 'delivery' ? 'bg-emerald-950 border-emerald-950 text-white shadow-lg' : 'bg-white border-emerald-50 text-gray-400'}`}
              >
                <Clock size={16} /> Delivery
              </button>
              <button 
                onClick={() => setDeliveryMode('pickup')}
                className={`flex-1 py-4 rounded-3xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 border-2 ${deliveryMode === 'pickup' ? 'bg-emerald-950 border-emerald-950 text-white shadow-lg' : 'bg-white border-emerald-50 text-gray-400'}`}
              >
                <Navigation size={16} /> Pickup
              </button>
           </div>

           <button 
            onClick={handleFindMarkets}
            disabled={loadingMarket}
            className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-[32px] flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 text-sm uppercase"
          >
            {loadingMarket ? <Loader2 size={24} className="animate-spin" /> : <MapPin size={24} />}
            Tìm cửa hàng gần đây
          </button>

          {marketInfo && (
            <div className="bg-white border border-emerald-50 rounded-[32px] p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-black text-emerald-900 text-sm flex items-center gap-2">
                  <Zap size={18} className="text-emerald-500" /> Đề xuất nơi mua
                </h4>
                <button onClick={() => setShowMarketAdvice(!showMarketAdvice)} className="text-gray-300">
                   {showMarketAdvice ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>

              {showMarketAdvice && (
                <div className="space-y-4">
                  <div className="text-gray-600 text-[13px] leading-relaxed whitespace-pre-wrap font-medium">
                    {marketInfo.advice}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {marketInfo.links.map((link, idx) => (
                      <a 
                        key={idx} href={link.uri} target="_blank" rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black hover:bg-emerald-100 transition-all border border-emerald-100"
                      >
                        {link.title || "Xem Maps"}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default ShoppingList;
