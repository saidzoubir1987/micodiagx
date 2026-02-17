
import React from 'react';
import { AppState } from '../types';
import { Icons } from '../constants';
import { exportToCSV } from '../utils/helpers';

interface SettingsProps {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
}

const Settings: React.FC<SettingsProps> = ({ state, updateState }) => {
  const handleExport = () => {
    const dataToExport = state.devices.map(d => ({
      'اسم الجهاز': d.name,
      'الرقم التسلسلي': d.serialNumber,
      'الزبون': state.customers.find(c => c.id === d.customerId)?.name || 'غير معروف',
      'بداية الاشتراك': d.startDate,
      'نهاية الاشتراك': d.endDate,
      'رقم SIM': d.simCard.cardNumber,
      'انتهاء SIM': d.simCard.expiryDate
    }));
    exportToCSV(dataToExport, 'بيانات_الاشتراكات');
  };

  const handleToggleWhatsApp = () => {
    updateState({
      settings: {
        ...state.settings,
        whatsappNotificationsEnabled: !state.settings.whatsappNotificationsEnabled
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">الإعدادات</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-green-100 text-green-600 rounded-lg">{Icons.Phone}</div>
          <h3 className="text-lg font-bold text-gray-800">إشعارات الواتساب</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-700">تفعيل التنبيهات التلقائية</p>
              <p className="text-sm text-gray-500">إرسال رابط واتساب جاهز عند اقتراب موعد الانتهاء</p>
            </div>
            <button 
              onClick={handleToggleWhatsApp}
              className={`w-14 h-8 rounded-full transition-colors relative ${state.settings.whatsappNotificationsEnabled ? 'bg-green-500' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${state.settings.whatsappNotificationsEnabled ? 'right-7' : 'right-1'}`}></div>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">تنبيه انتهاء الجهاز (أيام)</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 border rounded-xl outline-none" 
                value={state.settings.deviceExpiryThresholdDays}
                onChange={(e) => updateState({ settings: { ...state.settings, deviceExpiryThresholdDays: parseInt(e.target.value) } })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">تنبيه انتهاء SIM (أيام)</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 border rounded-xl outline-none" 
                value={state.settings.simExpiryThresholdDays}
                onChange={(e) => updateState({ settings: { ...state.settings, simExpiryThresholdDays: parseInt(e.target.value) } })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">{Icons.Dashboard}</div>
          <h3 className="text-lg font-bold text-gray-800">إدارة البيانات</h3>
        </div>
        <div className="p-6 space-y-4">
          <button 
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-100 transition-colors font-bold"
          >
            {Icons.Dashboard}
            تصدير كافة البيانات (Excel/CSV)
          </button>
          <button 
            onClick={() => {
              if (window.confirm('سيتم حذف جميع البيانات والبدء من جديد. هل أنت متأكد؟')) {
                localStorage.removeItem('subscription_app_data');
                window.location.reload();
              }
            }}
            className="w-full flex items-center justify-center gap-2 text-red-600 py-3 rounded-xl hover:bg-red-50 transition-colors font-bold"
          >
            {Icons.Delete}
            إعادة ضبط النظام وحذف البيانات
          </button>
        </div>
      </div>
      
      <div className="text-center text-gray-400 text-sm">
        إصدار النظام v1.0.0 | تم التطوير لأغراض إدارة الاشتراكات
      </div>
    </div>
  );
};

export default Settings;
