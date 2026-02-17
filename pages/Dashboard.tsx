
import React from 'react';
import { AppState, SubscriptionStatus } from '../types';
import { getSubscriptionStatus } from '../utils/helpers';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Icons, COLORS } from '../constants';

const StatCard = ({ title, value, icon, color, trend }: { title: string, value: string | number, icon: React.ReactNode, color: string, trend?: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-gray-500 font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
      {trend && <p className={`text-sm mt-2 font-semibold ${trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{trend}</p>}
    </div>
    <div className={`p-4 rounded-xl ${color} text-white`}>
      {icon}
    </div>
  </div>
);

const Dashboard: React.FC<{ state: AppState }> = ({ state }) => {
  const expiringDevices = state.devices.filter(d => getSubscriptionStatus(d.endDate, state.settings.deviceExpiryThresholdDays) === SubscriptionStatus.EXPIRING_SOON);
  const expiredDevices = state.devices.filter(d => getSubscriptionStatus(d.endDate) === SubscriptionStatus.EXPIRED);
  const expiringSims = state.devices.filter(d => getSubscriptionStatus(d.simCard.expiryDate, state.settings.simExpiryThresholdDays) === SubscriptionStatus.EXPIRING_SOON);

  const chartData = [
    { name: 'نشطة', value: state.devices.length - expiringDevices.length - expiredDevices.length, color: COLORS.success },
    { name: 'قريبة الانتهاء', value: expiringDevices.length, color: COLORS.warning },
    { name: 'منتهية', value: expiredDevices.length, color: COLORS.danger },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="إجمالي الزبائن" value={state.customers.length} icon={Icons.Customers} color="bg-blue-600" trend="+12% من الشهر الماضي" />
        <StatCard title="إجمالي الأجهزة" value={state.devices.length} icon={Icons.Devices} color="bg-indigo-600" />
        <StatCard title="اشتراكات قريبة الانتهاء" value={expiringDevices.length} icon={Icons.Alerts} color="bg-amber-500" />
        <StatCard title="اشتراكات منتهية" value={expiredDevices.length} icon={Icons.Delete} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">حالة الاشتراكات</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around mt-4">
            {chartData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">تنبيهات عاجلة</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {expiringDevices.length === 0 && expiredDevices.length === 0 && (
              <p className="text-center text-gray-500 py-10">لا توجد تنبيهات حالية</p>
            )}
            {expiringDevices.map(d => (
              <div key={d.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500 text-white rounded-lg">{Icons.Alerts}</div>
                  <div>
                    <p className="font-bold text-amber-900">{d.name}</p>
                    <p className="text-xs text-amber-700">ينتهي في غضون 30 يوماً</p>
                  </div>
                </div>
                <button className="text-amber-600 hover:bg-amber-100 p-2 rounded-lg transition-colors">
                  {Icons.Phone}
                </button>
              </div>
            ))}
            {expiringSims.map(d => (
              <div key={`sim-${d.id}`} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500 text-white rounded-lg">{Icons.SIMs}</div>
                  <div>
                    <p className="font-bold text-red-900">SIM: {d.simCard.cardNumber}</p>
                    <p className="text-xs text-red-700">قاربت صلاحيتها على الانتهاء</p>
                  </div>
                </div>
                <button className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition-colors">
                  {Icons.Edit}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
