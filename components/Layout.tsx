
import React from 'react';
import { LogOut, ChevronLeft } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  showBack?: boolean;
  onBack?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onLogout, showBack, onBack }) => {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F8FAF8] flex flex-col shadow-xl border-x border-green-50 relative">
      <header className="px-6 py-5 flex items-center justify-between sticky top-0 bg-[#F8FAF8]/90 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          {showBack && (
            <button 
              onClick={onBack}
              className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-emerald-600 transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <h1 className="text-xl font-bold text-emerald-900 tracking-tight">Fomi</h1>
          </div>
        </div>
        
        <button 
          onClick={() => {
            if(confirm('Bạn muốn đăng xuất?')) onLogout();
          }}
          className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-emerald-600 transition-colors shadow-sm"
        >
          <LogOut size={18} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-10">
        {children}
      </main>
    </div>
  );
};
