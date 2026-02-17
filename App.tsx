
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Icons } from './constants';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Devices from './pages/Devices';
import SIMManagement from './pages/SIMManagement';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { AppState, Customer, Device } from './types';
import { generateId } from './utils/helpers';

const initialData: AppState = {
  customers: [
    { id: '1', name: 'أحمد علي', phone: '201234567890', notes: 'زبون دائم', deviceIds: ['d1'] },
    { id: '2', name: 'سارة محمد', phone: '201987654321', notes: 'تركيب في شركة', deviceIds: ['d2'] }
  ],
  devices: [
    { 
      id: 'd1', 
      customerId: '1', 
      name: 'جهاز سيارة تويوتا', 
      serialNumber: 'SN-9988-AA', 
      startDate: '2023-01-01', 
      endDate: '2025-02-15', 
      simCard: { id: 's1', cardNumber: '0100000001', expiryDate: '2025-04-10' }
    },
    { 
      id: 'd2', 
      customerId: '2', 
      name: 'جهاز تتبع دراجة', 
      serialNumber: 'SN-2233-BB', 
      startDate: '2024-05-10', 
      endDate: '2025-05-10', 
      simCard: { id: 's2', cardNumber: '0100000002', expiryDate: '2025-03-01' }
    }
  ],
  settings: {
    whatsappNotificationsEnabled: true,
    simExpiryThresholdDays: 15,
    deviceExpiryThresholdDays: 30
  }
};

const SidebarItem: React.FC<{ to: string, icon: React.ReactNode, label: string, active: boolean }> = ({ to, icon, label, active }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
    }`}
  >
    {icon}
    <span className="font-semibold">{label}</span>
  </Link>
);

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('subscription_app_data');
    return saved ? JSON.parse(saved) : initialData;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('is_authenticated') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('subscription_app_data', JSON.stringify(state));
  }, [state]);

  const updateState = (newState: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  const handleLoginSuccess = () => {
    sessionStorage.setItem('is_authenticated', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('is_authenticated');
    setIsAuthenticated(false);
  };

  return (
    <HashRouter>
      {!isAuthenticated ? (
        <Routes>
          <Route path="*" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        </Routes>
      ) : (
        <div className="min-h-screen flex bg-gray-50 font-['Cairo']">
          <aside className="w-64 bg-white border-l border-gray-200 hidden md:flex flex-col sticky top-0 h-screen p-4">
            <div className="flex items-center gap-3 px-4 mb-8">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                {Icons.Dashboard}
              </div>
              <h1 className="text-xl font-bold text-gray-800">نظام الاشتراك</h1>
            </div>
            
            <nav className="flex-1 space-y-2">
              <NavContent />
            </nav>

            <div className="mt-auto border-t pt-4">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 w-full rounded-lg transition-colors font-semibold"
              >
                {Icons.Logout}
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </aside>

          <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-2 z-50">
             <NavContent isMobile />
          </div>

          <main className="flex-1 overflow-auto pb-20 md:pb-0">
            <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
              <h2 className="text-lg font-bold text-gray-700">لوحة التحكم</h2>
              <div className="flex items-center gap-4">
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
                  {Icons.Alerts}
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-blue-200">
                  م
                </div>
              </div>
            </header>

            <div className="p-8">
              <Routes>
                <Route path="/" element={<Dashboard state={state} />} />
                <Route path="/customers" element={<Customers state={state} updateState={updateState} />} />
                <Route path="/devices" element={<Devices state={state} updateState={updateState} />} />
                <Route path="/sims" element={<SIMManagement state={state} updateState={updateState} />} />
                <Route path="/settings" element={<Settings state={state} updateState={updateState} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      )}
    </HashRouter>
  );
};

const NavContent = ({ isMobile }: { isMobile?: boolean }) => {
  const location = useLocation();
  const menuItems = [
    { to: '/', icon: Icons.Dashboard, label: 'الرئيسية' },
    { to: '/customers', icon: Icons.Customers, label: 'الزبائن' },
    { to: '/devices', icon: Icons.Devices, label: 'الأجهزة' },
    { to: '/sims', icon: Icons.SIMs, label: 'البطاقات' },
    { to: '/settings', icon: Icons.Settings, label: 'الإعدادات' },
  ];

  if (isMobile) {
    return (
      <>
        {menuItems.map(item => (
          <Link 
            key={item.to} 
            to={item.to} 
            className={`flex flex-col items-center p-1 ${location.pathname === item.to ? 'text-blue-600' : 'text-gray-500'}`}
          >
            {item.icon}
            <span className="text-[10px] mt-1">{item.label}</span>
          </Link>
        ))}
      </>
    );
  }

  return (
    <>
      {menuItems.map(item => (
        <SidebarItem 
          key={item.to} 
          to={item.to} 
          icon={item.icon} 
          label={item.label} 
          active={location.pathname === item.to} 
        />
      ))}
    </>
  );
}

export default App;
