
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
    <div className="max-w-md mx-auto min-h-screen bg-[#FAFBFA] flex flex-col relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
      
      <header className="px-6 py-6 flex items-center justify-between sticky top-0 bg-[#FAFBFA]/80 backdrop-blur-xl z-40">
        <div className="flex items-center gap-4">
          {showBack && (
            <button 
              onClick={onBack}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-900 border border-emerald-50 active:scale-90 transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-200">
              <span className="text-white font-extrabold text-sm">F</span>
            </div>
            <h1 className="text-lg font-extrabold text-emerald-950 tracking-tight">Fomi</h1>
          </div>
        </div>
        
        <button 
          onClick={() => {
            if(confirm('Đăng xuất khỏi Fomi?')) onLogout();
          }}
          className="w-10 h-10 bg-white rounded-full text-gray-400 hover:text-red-500 flex items-center justify-center transition-all border border-emerald-50 shadow-sm"
        >
          <LogOut size={18} />
        </button>
      </header>

      <main className="flex-1 relative z-10 pb-10">
        {children}
      </main>
    </div>
  );
};
