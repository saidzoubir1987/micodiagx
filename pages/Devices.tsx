
import React, { useState } from 'react';
import { AppState, Device, SubscriptionStatus } from '../types';
import { Icons } from '../constants';
import { generateId, getSubscriptionStatus, formatDate } from '../utils/helpers';

interface DevicesProps {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
}

const Devices: React.FC<DevicesProps> = ({ state, updateState }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [transferTargetId, setTransferTargetId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    customerId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    simCardNumber: '',
    simExpiryDate: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().split('T')[0],
  });

  const filteredDevices = state.devices.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    state.customers.find(c => c.id === d.customerId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCustomerName = (id: string) => state.customers.find(c => c.id === id)?.name || 'غير معروف';

  const handleOpenAdd = () => {
    setSelectedDevice(null);
    setFormData({
      name: '',
      serialNumber: '',
      customerId: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      simCardNumber: '',
      simExpiryDate: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const handleOpenEdit = (device: Device) => {
    setSelectedDevice(device);
    setFormData({
      name: device.name,
      serialNumber: device.serialNumber,
      customerId: device.customerId,
      startDate: device.startDate,
      endDate: device.endDate,
      simCardNumber: device.simCard.cardNumber,
      simExpiryDate: device.simCard.expiryDate,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSim = { 
      id: selectedDevice?.simCard.id || generateId(), 
      cardNumber: formData.simCardNumber, 
      expiryDate: formData.simExpiryDate 
    };

    if (selectedDevice) {
      const updatedDevices = state.devices.map(d => 
        d.id === selectedDevice.id ? { ...d, ...formData, simCard: newSim } : d
      );
      updateState({ devices: updatedDevices });
    } else {
      const newDevice: Device = {
        id: generateId(),
        customerId: formData.customerId,
        name: formData.name,
        serialNumber: formData.serialNumber,
        startDate: formData.startDate,
        endDate: formData.endDate,
        simCard: newSim
      };
      
      const updatedCustomers = state.customers.map(c => 
        c.id === formData.customerId ? { ...c, deviceIds: [...c.deviceIds, newDevice.id] } : c
      );

      updateState({ 
        devices: [...state.devices, newDevice],
        customers: updatedCustomers
      });
    }
    setShowModal(false);
  };

  const handleTransfer = () => {
    if (!selectedDevice || !transferTargetId) return;

    const updatedCustomers = state.customers.map(c => {
      if (c.id === selectedDevice.customerId) {
        return { ...c, deviceIds: c.deviceIds.filter(id => id !== selectedDevice.id) };
      }
      if (c.id === transferTargetId) {
        return { ...c, deviceIds: [...c.deviceIds, selectedDevice.id] };
      }
      return c;
    });

    const updatedDevices = state.devices.map(d => 
      d.id === selectedDevice.id ? { ...d, customerId: transferTargetId } : d
    );

    updateState({ customers: updatedCustomers, devices: updatedDevices });
    setShowTransferModal(false);
    setSelectedDevice(null);
  };

  const handleDelete = (id: string, customerId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الجهاز؟')) {
      const remainingDevices = state.devices.filter(d => d.id !== id);
      const updatedCustomers = state.customers.map(c => 
        c.id === customerId ? { ...c, deviceIds: c.deviceIds.filter(did => did !== id) } : c
      );
      updateState({ devices: remainingDevices, customers: updatedCustomers });
    }
  };

  const getStatusBadge = (endDate: string) => {
    const status = getSubscriptionStatus(endDate);
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
            {Icons.StatusActive}
            فعال
          </span>
        );
      case SubscriptionStatus.EXPIRING_SOON:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
            {Icons.StatusWarning}
            قريب الانتهاء
          </span>
        );
      case SubscriptionStatus.EXPIRED:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
            {Icons.StatusDanger}
            منتهي
          </span>
        );
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Spreadsheet Toolbar */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">{Icons.Devices}</span>
            سجل الأجهزة
          </h2>
          <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div>
          <div className="relative">
            <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 pointer-events-none">
              {Icons.Search}
            </span>
            <input
              type="text"
              placeholder="بحث في الأجهزة، العملاء، السيريال..."
              className="w-full md:w-80 pr-10 pl-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <button 
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-bold"
        >
          {Icons.Add}
          إضافة جهاز جديد
        </button>
      </div>

      {/* Spreadsheet Table Container */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse table-fixed min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider w-12 border-l border-gray-100">#</th>
                <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/6 border-l border-gray-100">اسم الجهاز</th>
                <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/6 border-l border-gray-100">الرقم التسلسلي</th>
                <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/6 border-l border-gray-100">الزبون</th>
                <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/8 border-l border-gray-100">بطاقة SIM</th>
                <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/8 border-l border-gray-100 text-center">تاريخ الانتهاء</th>
                <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/8 border-l border-gray-100 text-center">الحالة</th>
                <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider w-24 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredDevices.length > 0 ? filteredDevices.map((device, index) => (
                <tr key={device.id} className="hover:bg-blue-50/40 transition-colors group">
                  <td className="px-4 py-3 text-gray-400 text-center border-l border-gray-100 font-mono text-xs">{index + 1}</td>
                  <td className="px-4 py-3 font-bold text-gray-800 border-l border-gray-100 truncate">{device.name}</td>
                  <td className="px-4 py-3 text-gray-600 border-l border-gray-100 font-mono text-xs truncate uppercase tracking-tighter">{device.serialNumber}</td>
                  <td className="px-4 py-3 border-l border-gray-100">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">
                      {getCustomerName(device.customerId)}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-l border-gray-100 font-mono text-xs text-gray-600">
                    <div className="flex flex-col">
                      <span className="font-bold">{device.simCard.cardNumber}</span>
                      <span className="text-[10px] text-gray-400">{formatDate(device.simCard.expiryDate)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-l border-gray-100 text-center text-gray-700 font-semibold">{formatDate(device.endDate)}</td>
                  <td className="px-4 py-3 border-l border-gray-100">
                    <div className="flex justify-center">
                      {getStatusBadge(device.endDate)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center items-center gap-1">
                      <button 
                        onClick={() => handleOpenEdit(device)}
                        className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        {Icons.Edit}
                      </button>
                      <button 
                        onClick={() => { setSelectedDevice(device); setTransferTargetId(''); setShowTransferModal(true); }}
                        className="p-1.5 text-indigo-500 hover:bg-indigo-100 rounded-lg transition-colors"
                        title="تحويل"
                      >
                        {Icons.Transfer}
                      </button>
                      <button 
                        onClick={() => handleDelete(device.id, device.customerId)}
                        className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                        title="حذف"
                      >
                        {Icons.Delete}
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-4 bg-gray-50 rounded-full">{Icons.Devices}</div>
                      <p>لا توجد أجهزة مطابقة لعملية البحث</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Device Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">{selectedDevice ? 'تعديل بيانات الجهاز' : 'إضافة جهاز جديد'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">الزبون</label>
                  <select 
                    required
                    disabled={!!selectedDevice}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.customerId}
                    onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                  >
                    <option value="">اختر زبوناً...</option>
                    {state.customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">اسم الجهاز</label>
                  <input required className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">الرقم التسلسلي</label>
                  <input required className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none" 
                    value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">رقم بطاقة SIM</label>
                  <input required className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none" 
                    value={formData.simCardNumber} onChange={e => setFormData({...formData, simCardNumber: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">تاريخ انتهاء SIM</label>
                  <input type="date" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none" 
                    value={formData.simExpiryDate} onChange={e => setFormData({...formData, simExpiryDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">تاريخ بدء الاشتراك</label>
                  <input type="date" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none" 
                    value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">تاريخ انتهاء الاشتراك</label>
                  <input type="date" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none" 
                    value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-2 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-xl font-bold text-gray-500">إلغاء</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700">حفظ الجهاز</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">تحويل ملكية الجهاز</h3>
            <p className="text-sm text-gray-500 mb-6">أنت بصدد نقل ملكية الجهاز <span className="font-bold text-gray-800">{selectedDevice?.name}</span> إلى زبون آخر.</p>
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">الزبون الجديد</label>
              <select 
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={transferTargetId}
                onChange={(e) => setTransferTargetId(e.target.value)}
              >
                <option value="">اختر الزبون المستهدف...</option>
                {state.customers.filter(c => c.id !== selectedDevice?.customerId).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 mt-8">
              <button onClick={() => setShowTransferModal(false)} className="flex-1 px-4 py-2 border rounded-xl font-bold text-gray-500">إلغاء</button>
              <button onClick={handleTransfer} disabled={!transferTargetId} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 disabled:opacity-50">تأكيد النقل</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devices;
