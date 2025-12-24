
import React, { useState } from 'react';
import { Mail, Apple, Smartphone, ChevronLeft, ArrowRight, UserPlus, LogIn, Lock, Key } from 'lucide-react';

interface AuthProps {
  onLogin: (identifier: string) => void;
}

// Fomi Panda - Gấu trắng tai đen
const MASCOT_LOGO = "https://api.dicebear.com/7.x/big-ears/svg?seed=Fomi&backgroundColor=b6e3f4&skinColor=ffffff&hairColor=000000";

type AuthMethod = 'none' | 'email' | 'phone';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [method, setMethod] = useState<AuthMethod>('none');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');

  const handleAuthAction = () => {
    setError('');
    
    if (!identifier.trim()) {
        setError('Vui lòng nhập thông tin tài khoản');
        return;
    }

    if (password.length < 6) {
      setError('Mật khẩu ít nhất 6 ký tự nhé');
      return;
    }

    if (isSignup && password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp');
      return;
    }

    // Giả lập logic auth thành công
    onLogin(identifier || 'demo-user');
  };

  const startLogin = (selectedMethod: AuthMethod) => {
      setIsSignup(false);
      setMethod(selectedMethod);
      setError('');
      setPassword('');
  };

  const startSignup = (selectedMethod: AuthMethod) => {
      setIsSignup(true);
      setMethod(selectedMethod);
      setError('');
      setPassword('');
      setConfirmPassword('');
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-emerald-50/30 flex flex-col p-8 items-center justify-center space-y-6 animate-in fade-in duration-500 overflow-hidden">
      
      {/* Logo Section */}
      <div className="text-center space-y-4 shrink-0">
        <div className="w-24 h-24 bg-[#b6e3f4] rounded-full mx-auto flex items-center justify-center shadow-2xl relative border-4 border-white overflow-hidden">
          <img src={MASCOT_LOGO} alt="Fomi" className="w-full h-full object-cover transform scale-125 translate-y-2" />
        </div>
        <div className="space-y-0.5">
          <h1 className="text-3xl font-black text-emerald-950 tracking-tight">Fomi</h1>
          <p className="text-emerald-600 font-bold italic text-xs">Khỏe hơn mỗi ngày</p>
        </div>
      </div>

      <div className="w-full flex-1 flex flex-col justify-center min-h-0">
        {method === 'none' ? (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            
            {/* Login Options */}
            <div className="space-y-3">
               <div className="text-center mb-4">
                  <h2 className="text-lg font-black text-emerald-950">Chào mừng trở lại!</h2>
                  <p className="text-xs text-gray-400 font-bold">Đăng nhập để tiếp tục</p>
               </div>
               
                <button onClick={() => startLogin('phone')} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-emerald-200">
                  <Smartphone size={20} /> Đăng nhập bằng Số điện thoại
                </button>
                <button onClick={() => startLogin('email')} className="w-full bg-white text-emerald-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 border border-emerald-100 active:scale-95 transition-all shadow-sm">
                  <Mail size={20} /> Đăng nhập bằng Email
                </button>
                <button onClick={() => onLogin('apple')} className="w-full bg-black text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-sm">
                  <Apple size={20} fill="currentColor" /> Tiếp tục với Apple
                </button>
            </div>

            {/* Signup & Guest Link */}
            <div className="pt-4 space-y-6">
                 {/* Divider */}
                 <div className="flex items-center gap-4 opacity-50">
                    <div className="h-px bg-gray-300 flex-1"></div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lựa chọn khác</span>
                    <div className="h-px bg-gray-300 flex-1"></div>
                 </div>

                 {/* Register Button */}
                 <div className="text-center space-y-3">
                    <button 
                        onClick={() => startSignup('email')}
                        className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-400 font-bold rounded-2xl hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <UserPlus size={18} /> Đăng ký tài khoản mới
                    </button>
                    
                    <button 
                        onClick={() => onLogin('guest')} 
                        className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-emerald-600 transition-colors flex items-center justify-center gap-1 mx-auto"
                    >
                        Dùng thử không cần tài khoản <ArrowRight size={12} />
                    </button>
                 </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5 animate-in slide-in-from-right duration-300">
            {/* Form Header */}
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => setMethod('none')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm border border-gray-50 hover:bg-gray-50 active:scale-95 transition-all">
                  <ChevronLeft size={20} />
              </button>
              <div>
                  <h2 className="text-xl font-black text-emerald-900 leading-none">
                      {isSignup ? 'Tạo tài khoản' : 'Đăng nhập'}
                  </h2>
                  <p className="text-xs text-gray-400 font-bold mt-0.5">
                      {isSignup ? 'Điền thông tin bên dưới' : 'Chào mừng bạn quay lại'}
                  </p>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                        {method === 'phone' ? <Smartphone size={18} /> : <Mail size={18} />}
                    </div>
                    <input 
                    type={method === 'phone' ? "tel" : "email"} 
                    value={identifier} 
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={method === 'phone' ? 'Số điện thoại' : 'Địa chỉ Email'} 
                    className="w-full bg-white border-2 border-emerald-50 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-emerald-950 focus:border-emerald-500 outline-none transition-all placeholder:font-medium placeholder:text-gray-300"
                    />
                </div>
                
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                        <Key size={18} />
                    </div>
                    <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu" 
                    className="w-full bg-white border-2 border-emerald-50 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-emerald-950 focus:border-emerald-500 outline-none transition-all placeholder:font-medium placeholder:text-gray-300"
                    />
                </div>

                {isSignup && (
                    <div className="relative animate-in slide-in-from-top-2 fade-in">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                            <Lock size={18} />
                        </div>
                        <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu" 
                        className="w-full bg-white border-2 border-emerald-50 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-emerald-950 focus:border-emerald-500 outline-none transition-all placeholder:font-medium placeholder:text-gray-300"
                        />
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-50 text-red-500 px-4 py-3 rounded-xl text-xs font-bold text-center border border-red-100 flex items-center justify-center gap-2 animate-pulse">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"/> {error}
                </div>
            )}

            <button 
                onClick={handleAuthAction} 
                className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-sm"
            >
              {isSignup ? 'Hoàn tất đăng ký' : 'Đăng nhập ngay'} {isSignup ? <UserPlus size={18} /> : <LogIn size={18} />}
            </button>

            {/* Toggle Mode Link */}
            <div className="text-center pt-2">
                <button 
                    onClick={() => {
                        setIsSignup(!isSignup);
                        setError('');
                        setPassword('');
                        setConfirmPassword('');
                    }}
                    className="text-xs font-medium text-gray-400 hover:text-emerald-600 transition-colors"
                >
                    {isSignup ? (
                        <>Đã có tài khoản? <span className="font-bold underline">Đăng nhập</span></>
                    ) : (
                        <>Chưa có tài khoản? <span className="font-bold underline">Đăng ký mới</span></>
                    )}
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
