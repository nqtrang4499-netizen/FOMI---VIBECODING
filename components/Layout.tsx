
import React from 'react';
import { Home, ShoppingBag, History, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'home' | 'shopping' | 'history';
  setActiveTab: (tab: 'home' | 'shopping' | 'history') => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onLogout }) => {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FDFCF8] flex flex-col pb-20 shadow-xl border-x border-orange-50">
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-[#FDFCF8]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <h1 className="text-2xl font-bold text-orange-900">Fomi</h1>
        </div>
        <button 
          onClick={() => {
            if(confirm('Bạn muốn nghỉ tay chút à? Đăng xuất nhé?')) onLogout();
          }}
          className="p-2 bg-orange-50 rounded-full text-orange-600 hover:bg-orange-100 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-lg border-t border-orange-100 px-8 py-3 flex justify-between items-center z-20">
        <NavButton 
          active={activeTab === 'home'} 
          onClick={() => setActiveTab('home')} 
          icon={<Home size={24} />} 
          label="Trang chủ" 
        />
        <NavButton 
          active={activeTab === 'shopping'} 
          onClick={() => setActiveTab('shopping')} 
          icon={<ShoppingBag size={24} />} 
          label="Đi chợ" 
        />
        <NavButton 
          active={activeTab === 'history'} 
          onClick={() => setActiveTab('history')} 
          icon={<History size={24} />} 
          label="Nhật ký" 
        />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-orange-500 scale-110' : 'text-gray-400'}`}
  >
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);
