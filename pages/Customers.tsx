
import React, { useState } from 'react';
import { AppState, Customer, Device, SubscriptionStatus } from '../types';
import { Icons } from '../constants';
import { generateId, getWhatsAppLink, getSubscriptionStatus, formatDate } from '../utils/helpers';

interface CustomersProps {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
}

const Customers: React.FC<CustomersProps> = ({ state, updateState }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    notes: ''
  });

  const getCustomerDevices = (customerId: string): Device[] => {
    return state.devices.filter(d => d.customerId === customerId);
  };

  const filteredCustomers = state.customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.phone.includes(searchTerm);
    
    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;

    const devices = getCustomerDevices(c.id);
    return devices.some(d => getSubscriptionStatus(d.endDate, state.settings.deviceExpiryThresholdDays) === statusFilter);
  });

  const toggleRow = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedRows(newSet);
  };

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({ name: '', phone: '', notes: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({ 
      name: customer.name, 
      phone: customer.phone, 
      notes: customer.notes 
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      const updated = state.customers.map(c => 
        c.id === editingCustomer.id ? { ...c, ...formData } : c
      );
      updateState({ customers: updated });
    } else {
      const newCustomer: Customer = {
        id: generateId(),
        ...formData,
        deviceIds: []
      };
      updateState({ customers: [...state.customers, newCustomer] });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الزبون؟ سيتم حذف جميع الأجهزة المرتبطة به أيضاً.')) {
      const remainingCustomers = state.customers.filter(c => c.id !== id);
      const remainingDevices = state.devices.filter(d => d.customerId !== id);
      updateState({ customers: remainingCustomers, devices: remainingDevices });
    }
  };

  const getStatusBadge = (endDate: string) => {
    const status = getSubscriptionStatus(endDate, state.settings.deviceExpiryThresholdDays);
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

  const getSIMStatusLabel = (expiry: string) => {
    const status = getSubscriptionStatus(expiry, 15);
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return (
          <span className="flex items-center gap-1 text-green-600 text-[10px] font-bold">
            {Icons.StatusActive}
            صالحة
          </span>
        );
      case SubscriptionStatus.EXPIRING_SOON:
        return (
          <span className="flex items-center gap-1 text-amber-600 text-[10px] font-bold">
            {Icons.StatusWarning}
            تنتهي قريباً
          </span>
        );
      case SubscriptionStatus.EXPIRED:
        return (
          <span className="flex items-center gap-1 text-red-600 text-[10px] font-bold">
            {Icons.StatusDanger}
            منتهية
          </span>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">إدارة الزبائن</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <button 
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              الكل
            </button>
            <button 
              onClick={() => setStatusFilter(SubscriptionStatus.ACTIVE)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === SubscriptionStatus.ACTIVE ? 'bg-green-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              فعال
            </button>
            <button 
              onClick={() => setStatusFilter(SubscriptionStatus.EXPIRING_SOON)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === SubscriptionStatus.EXPIRING_SOON ? 'bg-amber-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              قريب الانتهاء
            </button>
            <button 
              onClick={() => setStatusFilter(SubscriptionStatus.EXPIRED)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === SubscriptionStatus.EXPIRED ? 'bg-red-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              منتهي
            </button>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
              {Icons.Search}
            </span>
            <input
              type="text"
              placeholder="بحث..."
              className="w-full md:w-48 pr-10 pl-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            {Icons.Add}
            <span className="font-semibold">إضافة زبون</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-gray-50 text-gray-500 uppercase text-sm font-semibold border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 w-12 text-center">#</th>
              <th className="px-6 py-4">الاسم</th>
              <th className="px-6 py-4">رقم الهاتف</th>
              <th className="px-6 py-4">عدد الأجهزة</th>
              <th className="px-6 py-4">ملاحظات</th>
              <th className="px-6 py-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCustomers.length > 0 ? filteredCustomers.map(customer => {
              const customerDevices = getCustomerDevices(customer.id);
              const isExpanded = expandedRows.has(customer.id);
              
              return (
                <React.Fragment key={customer.id}>
                  <tr className={`hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-blue-50/20' : ''}`}>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleRow(customer.id)}
                        className={`p-1.5 hover:bg-gray-200 rounded-lg transition-transform duration-200 flex items-center justify-center ${isExpanded ? 'rotate-[-90deg] bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                      >
                        {Icons.Back}
                      </button>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">{customer.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-mono text-sm">{customer.phone}</span>
                        <a 
                          href={getWhatsAppLink(customer.phone, `مرحباً ${customer.name}، بخصوص اشتراكك...`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                          title="مراسلة عبر واتساب"
                        >
                          {Icons.Phone}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleRow(customer.id)}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold hover:bg-blue-100 transition-colors"
                      >
                        {customerDevices.length} أجهزة
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm truncate max-w-[200px]">{customer.notes || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleOpenEdit(customer)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="تعديل الزبون"
                        >
                          {Icons.Edit}
                        </button>
                        <button 
                          onClick={() => handleDelete(customer.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف الزبون"
                        >
                          {Icons.Delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr className="bg-gray-50/30">
                      <td colSpan={6} className="px-8 py-6">
                        <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-lg shadow-blue-900/5">
                          <div className="bg-blue-600 px-6 py-3 flex items-center justify-between">
                            <h4 className="text-white text-sm font-bold flex items-center gap-2">
                              {Icons.Devices} قائمة الأجهزة المرتبطة
                            </h4>
                            <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              {customerDevices.length} أجهزة
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 divide-y divide-gray-100">
                            {customerDevices.length > 0 ? customerDevices.map(device => (
                              <div key={device.id} className="p-5 hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                  {/* Device Identity */}
                                  <div className="flex items-center gap-4 min-w-[200px]">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                                      {Icons.Devices}
                                    </div>
                                    <div>
                                      <p className="font-bold text-gray-800 text-base">{device.name}</p>
                                      <p className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-tighter">S/N: {device.serialNumber}</p>
                                    </div>
                                  </div>

                                  {/* SIM Card Details - Enhanced */}
                                  <div className="flex-1 bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                      <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm text-gray-400">
                                          {Icons.SIMs}
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">رقم الشريحة (SIM)</span>
                                            {getSIMStatusLabel(device.simCard.expiryDate)}
                                          </div>
                                          <p className="text-sm font-mono font-bold text-gray-700 leading-none">{device.simCard.cardNumber}</p>
                                        </div>
                                      </div>
                                      
                                      <div className="text-left md:text-right border-t md:border-t-0 md:border-r border-gray-200 pt-3 md:pt-0 md:pr-6">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">صلاحية الشريحة</p>
                                        <p className="text-xs text-gray-600 font-semibold">{formatDate(device.simCard.expiryDate)}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Subscription Status */}
                                  <div className="flex items-center gap-6 lg:border-r border-gray-100 lg:pr-6">
                                    <div className="text-right">
                                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">انتهاء الاشتراك</p>
                                      <p className="text-sm text-gray-800 font-bold">{formatDate(device.endDate)}</p>
                                    </div>
                                    <div className="w-28 flex justify-center">
                                      {getStatusBadge(device.endDate)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )) : (
                              <div className="p-12 text-center">
                                <div className="text-gray-300 mb-2 flex justify-center">{Icons.Devices}</div>
                                <p className="text-gray-400 text-sm">لا توجد أجهزة مسجلة لهذا الزبون.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            }) : (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                   لا يوجد نتائج تطابق خيارات البحث والفلترة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal - Same as before but with slightly better UI */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">{editingCustomer ? 'تعديل بيانات الزبون' : 'إضافة زبون جديد'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-light">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">الاسم بالكامل</label>
                <input
                  required
                  type="text"
                  placeholder="مثال: محمد أحمد علي"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">رقم الهاتف</label>
                <input
                  required
                  type="text"
                  placeholder="مثال: 01012345678"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">ملاحظات إضافية</label>
                <textarea
                  placeholder="أضف أي تفاصيل أخرى هنا..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none transition-all"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                ></textarea>
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
                  {editingCustomer ? 'تحديث البيانات' : 'إضافة الزبون'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
