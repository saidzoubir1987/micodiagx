
import React, { useState } from 'react';
import { Icons } from '../constants';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'zoubir' && password === '1234567xx') {
      setError('');
      onLoginSuccess();
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 font-['Cairo']">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center">
            <div className="flex justify-center mb-4">
                 <div className="p-4 bg-blue-600 rounded-2xl text-white inline-block">
                    {React.cloneElement(Icons.Dashboard, { size: 32 })}
                </div>
            </div>
          <h2 className="text-3xl font-bold text-gray-900">تسجيل الدخول</h2>
          <p className="mt-2 text-sm text-gray-600">
            مرحباً بك في نظام إدارة الاشتراكات
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="text-sm font-bold text-gray-700 tracking-wide">
                اسم المستخدم
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-lg px-4 py-3 mt-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أدخل اسم المستخدم"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="text-sm font-bold text-gray-700 tracking-wide"
              >
                كلمة المرور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-lg px-4 py-3 mt-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="********"
              />
            </div>
          </div>
          {error && (
            <div className="flex items-center justify-center p-3 bg-red-50 text-red-700 rounded-xl text-sm font-semibold">
              <p>{error}</p>
            </div>
          )}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center bg-blue-600 text-white p-4 rounded-xl tracking-wide font-semibold shadow-lg hover:bg-blue-700 transition-all duration-300"
            >
              تسجيل الدخول
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
