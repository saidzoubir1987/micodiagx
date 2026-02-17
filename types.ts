
export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRING_SOON = 'expiring_soon',
  EXPIRED = 'expired'
}

export interface SIMCard {
  id: string;
  cardNumber: string;
  expiryDate: string; // ISO format
}

export interface Device {
  id: string;
  customerId: string;
  name: string;
  serialNumber: string;
  startDate: string;
  endDate: string;
  simCard: SIMCard;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  notes: string;
  deviceIds: string[];
}

export interface AppState {
  customers: Customer[];
  devices: Device[];
  settings: {
    whatsappNotificationsEnabled: boolean;
    simExpiryThresholdDays: number;
    deviceExpiryThresholdDays: number;
  };
}
