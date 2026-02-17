
import React from 'react';
import { 
  Users, 
  Monitor, 
  Cpu, 
  LayoutDashboard, 
  Settings, 
  Bell, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  LogOut,
  ChevronLeft,
  Calendar,
  Phone,
  ArrowLeftRight,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCcw
} from 'lucide-react';

export const COLORS = {
  primary: '#2563eb', // Blue 600
  secondary: '#475569', // Slate 600
  success: '#10b981', // Emerald 500
  warning: '#f59e0b', // Amber 500
  danger: '#ef4444', // Red 500
};

export const Icons = {
  Dashboard: <LayoutDashboard size={20} />,
  Customers: <Users size={20} />,
  Devices: <Monitor size={20} />,
  SIMs: <Cpu size={20} />,
  Settings: <Settings size={20} />,
  Alerts: <Bell size={20} />,
  Search: <Search size={18} />,
  Add: <Plus size={18} />,
  Delete: <Trash2 size={18} />,
  Edit: <Edit size={18} />,
  Logout: <LogOut size={20} />,
  Back: <ChevronLeft size={20} />,
  Calendar: <Calendar size={18} />,
  Phone: <Phone size={18} />,
  Transfer: <ArrowLeftRight size={18} />,
  Reset: <RefreshCcw size={18} />,
  StatusActive: <CheckCircle size={10} />,
  StatusWarning: <AlertCircle size={10} />,
  StatusDanger: <XCircle size={10} />
};
