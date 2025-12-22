
import React, { useState } from 'react';
import { ChefHat, Mail, Apple, Lock, UserPlus, LogIn } from 'lucide-react';

interface AuthProps {
  onLogin: (email: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [error, setError] = useState('');

  const handleAuthAction = () => {
    setError('');
    
    if (!email.includes('@')) {
      setError('Email không hợp lệ');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    // Simulate database with localStorage
    const storedUsers = JSON.parse(localStorage.getItem('fomi_simulated_users') || '{}');

    if (isSignup) {
      if (storedUsers[email]) {
        setError('Email này đã được đăng ký');
        return;
      }
      storedUsers[email] = password;
      localStorage.setItem('fomi_simulated_users', JSON.stringify(storedUsers));
      onLogin(email);
    } else {
      if (storedUsers[email] === password) {
        onLogin(email);
      } else {
        setError('Email hoặc mật khẩu không đúng');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-orange-50 flex flex-col p-8 items-center justify-center space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-orange-500 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-orange-200">
          <ChefHat size={40} color="white" />
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-orange-900">Fomi.</h1>
          <p className="text-orange-600 font-medium">Ăn ngon, vẫn khỏe.</p>
        </div>
      </div>

      <div className="w-full space-y-4">
        {!showEmailForm ? (
          <>
            <button 
              onClick={() => onLogin('apple-user@icloud.com')}
              className="w-full bg-black text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg"
            >
              <Apple size={20} fill="white" />
              Tiếp tục với Apple
            </button>
            
            <button 
              onClick={() => {
                setShowEmailForm(true);
                setIsSignup(true);
              }}
              className="w-full bg-white text-gray-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 border border-orange-100 transition-all active:scale-95 shadow-sm"
            >
              <Mail size={20} />
              Đăng ký bằng Email
            </button>

            <button 
              onClick={() => {
                setShowEmailForm(true);
                setIsSignup(false);
              }}
              className="w-full text-orange-600 font-bold py-2 text-sm"
            >
              Đã có tài khoản? Đăng nhập
            </button>
          </>
        ) : (
          <div className="space-y-4 animate-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold text-orange-900 text-center mb-2">
              {isSignup ? 'Tạo tài khoản mới' : 'Chào mừng quay trở lại'}
            </h2>
            
            <div className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  placeholder="Email của bạn" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border-2 border-orange-100 rounded-2xl pl-12 pr-6 py-4 text-sm focus:border-orange-500 outline-none transition-all"
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" 
                  placeholder="Mật khẩu" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border-2 border-orange-100 rounded-2xl pl-12 pr-6 py-4 text-sm focus:border-orange-500 outline-none transition-all"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-medium text-center">{error}</p>}

            <button 
              onClick={handleAuthAction}
              className="w-full bg-orange-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isSignup ? (
                <>Đăng ký <UserPlus size={18} /></>
              ) : (
                <>Đăng nhập <LogIn size={18} /></>
              )}
            </button>
            
            <div className="flex flex-col items-center gap-3">
              <button 
                onClick={() => {
                  setError('');
                  setIsSignup(!isSignup);
                }}
                className="text-orange-600 font-bold text-sm"
              >
                {isSignup ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
              </button>
              
              <button 
                onClick={() => {
                  setError('');
                  setShowEmailForm(false);
                }}
                className="text-gray-400 font-medium text-xs underline"
              >
                Quay lại trang chính
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-[10px] text-gray-400 text-center px-4">
        Bằng cách tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của Fomi.
      </p>
    </div>
  );
};

export default Auth;
