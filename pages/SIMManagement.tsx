
import React, { useState } from 'react';
import { AppState, SubscriptionStatus, SIMCard } from '../types';
import { Icons } from '../constants';
import { getSubscriptionStatus, formatDate } from '../utils/helpers';

interface SIMManagementProps {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
}

interface SIMWithMeta extends SIMCard {
  deviceId: string;
  deviceName: string;
  customerName: string;
  status: SubscriptionStatus;
}

const SIMManagement: React.FC<SIMManagementProps> = ({ state, updateState }) => {
  const [editingSim, setEditingSim] = useState<SIMWithMeta | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: ''
  });

  const simList: SIMWithMeta[] = state.devices.map(d => ({
    ...d.simCard,
    deviceId: d.id,
    deviceName: d.name,
    customerName: state.customers.find(c => c.id === d.customerId)?.name || 'غير معروف',
    status: getSubscriptionStatus(d.simCard.expiryDate, state.settings.simExpiryThresholdDays)
  }));

  const activeSims = simList.filter(sim => sim.status !== SubscriptionStatus.EXPIRED);
  const expiredSims = simList.filter(sim => sim.status === SubscriptionStatus.EXPIRED);

  const handleOpenEdit = (sim: SIMWithMeta) => {
    setEditingSim(sim);
    setFormData({
      cardNumber: sim.cardNumber,
      expiryDate: sim.expiryDate
    });
    setShowModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSim) return;

    const updatedDevices = state.devices.map(d => {
      if (d.id === editingSim.deviceId) {
        return {
          ...d,
          simCard: {
            ...d.simCard,
            cardNumber: formData.cardNumber,
            expiryDate: formData.expiryDate
          }
        };
      }
      return d;
    });

    updateState({ devices: updatedDevices });
    setShowModal(false);
    setEditingSim(null);
  };

  const handleResetSim = (sim: SIMWithMeta) => {
    if (window.confirm(`هل أنت متأكد من إعادة تعيين البطاقة رقم ${sim.cardNumber}؟ سيتم تمديد صلاحيتها لشهرين إضافيين من اليوم.`)) {
      const now = new Date();
      now.setMonth(now.getMonth() + 2);
      const newExpiry = now.toISOString().split('T')[0];
      
      const updatedDevices = state.devices.map(d => {
        if (d.id === sim.deviceId) {
          return {
            ...d,
            simCard: {
              ...d.simCard,
              expiryDate: newExpiry
            }
          };
        }
        return d;
      });

      updateState({ devices: updatedDevices });
    }
  };

  const getSIMStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
            {Icons.StatusActive}
            فعالة
          </span>
        );
      case SubscriptionStatus.EXPIRING_SOON:
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
            {Icons.StatusWarning}
            قريبة الانتهاء
          </span>
        );
      case SubscriptionStatus.EXPIRED:
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
            {Icons.StatusDanger}
            منتهية
          </span>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">{Icons.SIMs}</span>
          إدارة بطاقات SIM
        </h2>
        <div className="flex gap-2">
          <div className="text-xs bg-white border border-gray-200 shadow-sm text-gray-600 px-4 py-2 rounded-xl font-bold">
             إجمالي البطاقات: {simList.length}
          </div>
        </div>
      </div>

      {/* Section 1: Active/Expiring Soon */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
          <h3 className="font-bold text-gray-700">البطاقات النشطة</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {activeSims.length > 0 ? activeSims.map(sim => (
            <SIMCardRow 
              key={sim.id} 
              sim={sim} 
              onEdit={handleOpenEdit} 
              onReset={handleResetSim} 
              badge={getSIMStatusBadge(sim.status)} 
            />
          )) : (
            <div className="bg-white p-12 text-center text-gray-400 rounded-3xl border border-dashed border-gray-200">
              لا توجد بطاقات نشطة حالياً
            </div>
          )}
        </div>
      </section>

      {/* Section 2: Expired */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <div className="w-2 h-6 bg-red-500 rounded-full"></div>
          <h3 className="font-bold text-red-600">البطاقات منتهية الصلاحية</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {expiredSims.length > 0 ? expiredSims.map(sim => (
            <SIMCardRow 
              key={sim.id} 
              sim={sim} 
              onEdit={handleOpenEdit} 
              onReset={handleResetSim} 
              badge={getSIMStatusBadge(sim.status)} 
              isExpired={true}
            />
          )) : (
            <div className="bg-white p-12 text-center text-gray-400 rounded-3xl border border-dashed border-gray-200">
              لا توجد بطاقات منتهية الصلاحية
            </div>
          )}
        </div>
      </section>

      {/* Edit SIM Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">تعديل بطاقة SIM</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-3xl font-light">&times;</button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">رقم البطاقة</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">تاريخ نهاية الصلاحية</label>
                <input
                  required
                  type="date"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                />
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <p className="text-xs text-blue-700 font-semibold leading-relaxed">
                  تنبيه: سيتم تحديث بيانات البطاقة فوراً للجهاز: <span className="underline font-bold">{editingSim?.deviceName}</span>
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold shadow-lg shadow-blue-200"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface SIMCardRowProps {
  sim: SIMWithMeta;
  onEdit: (sim: SIMWithMeta) => void;
  onReset: (sim: SIMWithMeta) => void;
  badge: React.ReactNode;
  isExpired?: boolean;
}

const SIMCardRow: React.FC<SIMCardRowProps> = ({ sim, onEdit, onReset, badge, isExpired }) => (
  <div className={`bg-white p-6 rounded-3xl shadow-sm border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl ${isExpired ? 'border-red-100 bg-red-50/10' : 'border-gray-100'}`}>
    <div className="flex items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isExpired ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
        {Icons.SIMs}
      </div>
      <div>
        <h3 className="font-bold text-gray-800 text-xl font-mono tracking-tight">{sim.cardNumber}</h3>
        <p className="text-sm text-gray-500 mt-0.5">مرتبطة بـ: <span className="text-gray-700 font-bold">{sim.deviceName}</span></p>
      </div>
    </div>

    <div className="flex flex-col md:items-center px-4 md:border-r border-gray-100">
      <span className="text-[10px] text-gray-400 uppercase font-extrabold tracking-widest mb-1">الزبون</span>
      <span className="font-bold text-gray-700 text-sm">{sim.customerName}</span>
    </div>

    <div className="flex flex-col md:items-center px-4 md:border-r border-gray-100">
      <span className="text-[10px] text-gray-400 uppercase font-extrabold tracking-widest mb-1">تاريخ الانتهاء</span>
      <span className={`font-bold text-sm font-mono ${isExpired ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>
        {formatDate(sim.expiryDate)}
      </span>
    </div>

    <div className="flex flex-wrap items-center gap-4">
      {badge}
      <div className="flex gap-2 border-r pr-4 border-gray-100">
        <button 
          onClick={() => onEdit(sim)}
          className="flex items-center gap-1.5 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all text-xs font-bold"
          title="تعديل بيانات البطاقة"
        >
          {Icons.Edit}
          تعديل
        </button>
        <button 
          onClick={() => onReset(sim)}
          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl transition-all text-xs font-bold shadow-sm ${isExpired ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-green-200' : 'text-green-600 hover:bg-green-50'}`}
          title="تجديد الصلاحية لشهرين"
        >
          {Icons.Reset}
          إعادة تعيين
        </button>
      </div>
    </div>
  </div>
);

export default SIMManagement;
