
import { SubscriptionStatus } from '../types';

export const getDaysRemaining = (endDate: string): number => {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getSubscriptionStatus = (endDate: string, threshold: number = 30): SubscriptionStatus => {
  const days = getDaysRemaining(endDate);
  if (days < 0) return SubscriptionStatus.EXPIRED;
  if (days <= threshold) return SubscriptionStatus.EXPIRING_SOON;
  return SubscriptionStatus.ACTIVE;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const exportToCSV = (data: any[], fileName: string) => {
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
  ];
  const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getWhatsAppLink = (phone: string, message: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
