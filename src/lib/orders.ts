export interface OrderHistoryEntry {
  status: string;
  at: string;
}

export interface OrderItem {
  name: string;
  slug?: string;
  imageUrl?: string;
  unitPrice?: number;
  quantity: number;
  lineTotal?: number;
}

export interface Order {
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentMethod: 'cod' | 'esewa';
  paymentStatus: string;
  items: OrderItem[];
  address: {
    firstName: string;
    lastName: string;
    phone: string;
    province: string;
    district: string;
    city: string;
    street?: string;
    landmark: string;
  };
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryCharge: number;
  total: number;
  statusHistory: OrderHistoryEntry[];
}

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Waiting for payment',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  canceled: 'Canceled',
};

const PAYMENT_LABELS: Record<string, string> = {
  unpaid: 'Pay on delivery',
  payment_pending: 'Payment pending',
  paid: 'Paid',
  refunded: 'Refunded',
};

export const statusLabel = (status: string) => STATUS_LABELS[status] ?? status;
export const paymentLabel = (status: string) => PAYMENT_LABELS[status] ?? status;
export const money = (value: number) => `Rs. ${value.toLocaleString('en-IN')}`;
export const formatDate = (value: string) => new Date(value).toLocaleDateString('en-GB', { dateStyle: 'medium' });
export const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
