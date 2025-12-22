
import React, { useState, useEffect } from 'react';
import { UserProfile, ShoppingItem } from '../types';
import { getSmartShoppingList } from '../services/geminiService';
import { CheckCircle2, Circle, ShoppingCart, Beef, Apple, Package } from 'lucide-react';

interface ShoppingListProps {
  profile: UserProfile;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ profile }) => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    const result = await getSmartShoppingList(profile);
    setItems(result);
    setLoading(false);
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

  const proteinItems = items.filter(i => i.isProtein);
  const otherItems = items.filter(i => !i.isProtein);

  return (
    <div className="px-6 py-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-orange-900">Danh sách đi chợ</h2>
          <p className="text-sm text-gray-500">Tối ưu chi phí cho 3 ngày tới</p>
        </div>
        <button onClick={fetchList} className="p-2 bg-orange-100 rounded-xl text-orange-600">
           <ShoppingCart size={20} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-4 pt-10">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Protein Highlights */}
          <section className="bg-orange-500 rounded-3xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Beef size={20} />
              <h3 className="font-bold">Nhóm Đạm - Mua Tiết Kiệm</h3>
            </div>
            <div className="space-y-3">
              {proteinItems.map((item) => (
                <div 
                  key={item.name}
                  onClick={() => toggleItem(item.name)}
                  className="flex items-center justify-between bg-white/10 p-3 rounded-xl border border-white/20"
                >
                  <div className="flex items-center gap-3">
                    {checkedItems.has(item.name) ? <CheckCircle2 size={18} className="text-orange-200" /> : <Circle size={18} />}
                    <span className={`text-sm font-medium ${checkedItems.has(item.name) ? 'line-through text-white/50' : ''}`}>
                      {item.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-md">{item.amount}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] mt-4 opacity-70 italic">*Nhóm này chiếm ~40% ngân sách, Fomi đã gom nhóm để bạn mua 1 lần dùng cho 3 ngày.</p>
          </section>

          {/* Other items */}
          <section className="space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Package size={18} className="text-orange-500" />
              Nguyên liệu khác
            </h3>
            <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm">
               {otherItems.map((item) => (
                <div 
                  key={item.name}
                  onClick={() => toggleItem(item.name)}
                  className="flex items-center justify-between p-3 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    {checkedItems.has(item.name) ? <CheckCircle2 size={18} className="text-orange-500" /> : <Circle size={18} className="text-gray-300" />}
                    <span className={`text-sm ${checkedItems.has(item.name) ? 'line-through text-gray-400' : 'text-gray-700 font-medium'}`}>
                      {item.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-400">{item.amount}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default ShoppingList;
