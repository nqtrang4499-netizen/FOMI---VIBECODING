
import React, { useState, useEffect } from 'react';
import { UserProfile, ShoppingItem } from '../types';
import { getSmartShoppingList } from '../services/geminiService';
import { CheckCircle2, Circle, ShoppingCart, Beef, Package, ChevronRight, Zap, Trash2 } from 'lucide-react';

interface ShoppingListProps {
  profile: UserProfile;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ profile }) => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [manualItems, setManualItems] = useState<string[]>([]);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    const result = await getSmartShoppingList(profile);
    setItems(result);
    setLoading(false);
    
    // Load manual items from suggestions
    const savedManual = JSON.parse(localStorage.getItem('fomi_manual_cart') || '[]');
    setManualItems(savedManual);
  };

  useEffect(() => {
    fetchList();
  }, []);

  const toggleItem = (name: string) => {
    const next = new Set(checkedItems);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setCheckedItems(next);
  };

  const removeManualItem = (name: string) => {
    const next = manualItems.filter(i => i !== name);
    setManualItems(next);
    localStorage.setItem('fomi_manual_cart', JSON.stringify(next));
  };

  const proteinItems = items.filter(i => i.isProtein);
  const otherItems = items.filter(i => !i.isProtein);

  return (
    <div className="px-6 py-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-orange-900 leading-tight tracking-tight">Giỏ đồ đi chợ</h2>
          <p className="text-sm text-gray-500">Mua đủ đồ để nấu món ngon.</p>
        </div>
        <button onClick={fetchList} className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 active:scale-95 transition-all shadow-sm">
           <ShoppingCart size={24} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-4 pt-10">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-[32px] animate-pulse"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Manual Items from suggestions */}
          {manualItems.length > 0 && (
            <section className="space-y-4">
              <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest px-2 flex items-center gap-2">
                <Zap size={18} className="text-orange-500" />
                Đồ cần mua thêm (Từ món gợi ý)
              </h3>
              <div className="bg-orange-50 border-2 border-orange-100 rounded-[32px] overflow-hidden shadow-sm">
                {manualItems.map((item) => (
                  <div key={item} className="flex items-center justify-between p-5 border-b border-orange-100 last:border-0">
                    <div className="flex items-center gap-3" onClick={() => toggleItem(item)}>
                      {checkedItems.has(item) ? <CheckCircle2 size={20} className="text-orange-500" /> : <Circle size={20} className="text-orange-200" />}
                      <span className={`font-bold ${checkedItems.has(item) ? 'line-through text-gray-400' : 'text-orange-900'}`}>{item}</span>
                    </div>
                    <button onClick={() => removeManualItem(item)} className="text-orange-300 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Smart List from Gemini */}
          <section className="space-y-4">
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest px-2 flex items-center gap-2">
              <Beef size={18} className="text-orange-500" />
              Gợi ý đi chợ thông minh
            </h3>
            <div className="space-y-4">
              {proteinItems.map((item) => (
                <div 
                  key={item.name}
                  onClick={() => toggleItem(item.name)}
                  className={`bg-white rounded-[28px] p-5 border-2 transition-all ${checkedItems.has(item.name) ? 'border-orange-100 opacity-60' : 'border-orange-50 shadow-sm'}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {checkedItems.has(item.name) ? <CheckCircle2 size={22} className="text-orange-500" /> : <Circle size={22} className="text-orange-200" />}
                      <span className={`text-lg font-bold text-gray-900 ${checkedItems.has(item.name) ? 'line-through text-gray-300' : ''}`}>
                        {item.name}
                      </span>
                    </div>
                    <span className="text-xs font-black bg-orange-50 text-orange-600 px-3 py-1 rounded-full">{item.amount}</span>
                  </div>
                  {item.plannedUsage && item.plannedUsage.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-gray-50">
                      <div className="flex flex-wrap gap-2">
                        {item.plannedUsage.map((dish, idx) => (
                          <span key={idx} className="text-[10px] bg-gray-50 text-gray-600 font-bold px-2 py-1 rounded-lg">
                             {dish}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <p className="text-[10px] text-gray-400 text-center italic px-4 pb-10 leading-relaxed">
            *Fomi giúp bạn quản lý tủ lạnh và đi chợ khéo hơn để không bao giờ bỏ phí thức ăn!
          </p>
        </>
      )}
    </div>
  );
};

export default ShoppingList;
