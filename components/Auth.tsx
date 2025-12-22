
import React, { useState } from 'react';
import { ChefHat, Mail, Apple, Lock, UserPlus, LogIn, Smartphone, ChevronLeft } from 'lucide-react';

interface AuthProps {
  onLogin: (identifier: string) => void;
}

type AuthMethod = 'none' | 'email' | 'phone';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [method, setMethod] = useState<AuthMethod>('none');
  const [identifier, setIdentifier] = useState(''); // Email or Phone
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');

  const handleAuthAction = () => {
    setError('');
    
    if (method === 'email') {
      if (!identifier.includes('@')) {
        setError('Email sai rồi bạn ơi');
        return;
      }
    } else if (method === 'phone') {
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
      if (!phoneRegex.test(identifier)) {
        setError('Số điện thoại không đúng định dạng rồi');
        return;
      }
    }

    if (password.length < 6) {
      setError('Mật khẩu ít nhất 6 ký tự nhé');
      return;
    }

    // Giả lập database bằng localStorage
    const storedUsers = JSON.parse(localStorage.getItem('fomi_simulated_users') || '{}');

    if (isSignup) {
      if (storedUsers[identifier]) {
        setError('Tài khoản này có rồi, đăng nhập thôi');
        return;
      }
      storedUsers[identifier] = password;
      localStorage.setItem('fomi_simulated_users', JSON.stringify(storedUsers));
      onLogin(identifier);
    } else {
      if (storedUsers[identifier] === password) {
        onLogin(identifier);
      } else {
        setError('Thông tin đăng nhập chưa đúng nè');
      }
    }
  };

  const resetForm = () => {
    setMethod('none');
    setError('');
    setIdentifier('');
    setPassword('');
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-orange-50 flex flex-col p-8 items-center justify-center space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-orange-500 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-orange-200">
          <ChefHat size={40} color="white" />
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-orange-900 tracking-tight">Fomi.</h1>
          <p className="text-orange-600 font-medium italic">Ăn ngon, vẫn khỏe.</p>
        </div>
      </div>

      <div className="w-full space-y-4">
        {method === 'none' ? (
          <div className="space-y-3 animate-in fade-in duration-300">
            <button 
              onClick={() => onLogin('apple-user@icloud.com')}
              className="w-full bg-black text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg"
            >
              <Apple size={20} fill="white" />
              Dùng Apple cho nhanh
            </button>
            
            <button 
              onClick={() => {
                setMethod('phone');
                setIsSignup(false);
              }}
              className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-orange-100"
            >
              <Smartphone size={20} />
              Đăng nhập số điện thoại
            </button>

            <button 
              onClick={() => {
                setMethod('email');
                setIsSignup(false);
              }}
              className="w-full bg-white text-gray-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 border border-orange-100 transition-all active:scale-95 shadow-sm"
            >
              <Mail size={20} />
              Tiếp tục với Email
            </button>

            <div className="pt-4 text-center">
              <button 
                onClick={() => {
                  setMethod('phone');
                  setIsSignup(true);
                }}
                className="text-orange-600 font-bold text-sm"
              >
                Chưa có tài khoản? Đăng ký ngay
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-2 mb-2">
              <button onClick={resetForm} className="p-2 -ml-2 text-gray-400 hover:text-orange-500 transition-colors">
                <ChevronLeft size={24} />
              </button>
              <h2 className="text-xl font-bold text-orange-900">
                {isSignup ? 'Đăng ký mới' : 'Đăng nhập'}
              </h2>
            </div>
            
            <div className="space-y-3">
              <div className="relative">
                {method === 'email' ? (
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                ) : (
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                )}
                <input 
                  type={method === 'email' ? 'email' : 'tel'}
                  placeholder={method === 'email' ? 'Nhập email của bạn' : 'Số điện thoại của bạn'} 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-white border-2 border-orange-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-medium focus:border-orange-500 outline-none transition-all"
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" 
                  placeholder="Mật khẩu" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border-2 border-orange-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-medium focus:border-orange-500 outline-none transition-all"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-bold text-center animate-shake">{error}</p>}

            <button 
              onClick={handleAuthAction}
              className="w-full bg-orange-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isSignup ? (
                <>Tạo tài khoản <UserPlus size={18} /></>
              ) : (
                <>Vào việc thôi! <LogIn size={18} /></>
              )}
            </button>
            
            <div className="text-center pt-2">
              <button 
                onClick={() => {
                  setError('');
                  setIsSignup(!isSignup);
                }}
                className="text-orange-600 font-bold text-xs"
              >
                {isSignup ? 'Đã có tài khoản? Đăng nhập' : 'Bạn là người mới? Đăng ký tại đây'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="pt-8">
        <p className="text-[10px] text-gray-400 text-center px-8 leading-relaxed italic">
          Bằng cách dùng Fomi, bạn đồng ý với Điều khoản và Chính sách của tụi mình nhé. Ăn ngon, sống khỏe nha!
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default Auth;
