
import React, { useState } from 'react';
import { ChefHat, Mail, Apple, Smartphone, ChevronLeft } from 'lucide-react';

interface AuthProps {
  onLogin: (identifier: string) => void;
}

type AuthMethod = 'none' | 'email' | 'phone';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [method, setMethod] = useState<AuthMethod>('none');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');

  const handleAuthAction = () => {
    setError('');
    if (password.length < 6) {
      setError('Mật khẩu ít nhất 6 ký tự nhé');
      return;
    }
    onLogin(identifier || 'demo-user');
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-emerald-50/30 flex flex-col p-8 items-center justify-center space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-emerald-100">
          <ChefHat size={40} color="white" />
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-emerald-900 tracking-tight">Fomi</h1>
          <p className="text-emerald-600 font-medium italic">Khỏe hơn mỗi ngày</p>
        </div>
      </div>

      <div className="w-full space-y-3">
        {method === 'none' ? (
          <>
            <button onClick={() => setMethod('phone')} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-emerald-100">
              <Smartphone size={20} /> Số điện thoại
            </button>
            <button onClick={() => setMethod('email')} className="w-full bg-white text-emerald-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 border border-emerald-100 active:scale-95 transition-all shadow-sm">
              <Mail size={20} /> Email
            </button>
            <button onClick={() => onLogin('apple')} className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-sm border border-gray-200">
              <Apple size={20} fill="currentColor" /> Tiếp tục với Apple
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setMethod('none')} className="p-1 text-gray-400"><ChevronLeft size={24} /></button>
              <h2 className="text-xl font-bold text-emerald-900">{isSignup ? 'Đăng ký' : 'Đăng nhập'}</h2>
            </div>
            <input 
              type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)}
              placeholder={method === 'phone' ? 'Số điện thoại' : 'Địa chỉ Email'} className="w-full bg-white border-2 border-emerald-100 rounded-2xl px-6 py-4 text-sm font-medium focus:border-emerald-500 outline-none"
            />
            <input 
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu" className="w-full bg-white border-2 border-emerald-100 rounded-2xl px-6 py-4 text-sm font-medium focus:border-emerald-500 outline-none"
            />
            {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
            <button onClick={handleAuthAction} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-200 active:scale-95 transition-all">
              {isSignup ? 'Tạo tài khoản' : 'Bắt đầu thôi!'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
