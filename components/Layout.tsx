
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Fomi Panda - Gấu trắng tai đen
const MASCOT_LOGO = "https://api.dicebear.com/7.x/big-ears/svg?seed=Fomi&backgroundColor=b6e3f4&skinColor=ffffff&hairColor=000000";

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  showBack?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  hideHeader?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, onLogout, showBack, onBack, onNext, hideHeader }) => {
  return (
    <div className="flex justify-center min-h-[100dvh] bg-gray-100">
      {/* App Container */}
      <div className="w-full max-w-[390px] h-[100dvh] bg-[#FAFBFA] flex flex-col relative overflow-hidden shadow-xl sm:rounded-[30px] sm:my-4 sm:h-[calc(100dvh-2rem)] sm:border-[6px] sm:border-gray-900 ring-1 ring-gray-900/5">
        
        {/* Header Compact */}
        {!hideHeader && (
          <header className="px-4 py-3 flex items-center justify-between bg-white/80 backdrop-blur-md z-40 shrink-0 sticky top-0 border-b border-gray-50/50">
            <div className="flex items-center gap-2">
              {showBack && (
                <button 
                  onClick={onBack}
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-emerald-900 border border-gray-100 active:scale-90 transition-all shadow-sm hover:bg-gray-50"
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              
              {/* Logo Linh vật Fomi - Gấu Panda */}
              <div className="flex items-center gap-2">
                 <div className="w-9 h-9 bg-[#b6e3f4] rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center relative">
                    <img src={MASCOT_LOGO} alt="Fomi Mascot" className="w-full h-full object-cover transform scale-125 translate-y-1" />
                 </div>
                 <span className="text-lg font-extrabold text-emerald-950 tracking-tight">Fomi</span>
              </div>
            </div>
            
            {onNext ? (
               <button 
                 onClick={onNext}
                 className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center transition-all active:scale-90 border border-emerald-100"
               >
                 <ChevronRight size={18} />
               </button>
            ) : (
               <div className="w-8 h-8" /> 
            )}
          </header>
        )}

        <main className="flex-1 relative z-10 flex flex-col overflow-hidden bg-[#FAFBFA]">
          {children}
        </main>
      </div>
    </div>
  );
};
