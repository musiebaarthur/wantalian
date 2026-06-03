export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  vendorId: string;
  rating: number;
  reviewsCount: number;
  createdAt: string;
  brand?: string;
  isExpress?: boolean;
  originalPrice?: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  cardLast4: string;
  address: string;
}

export interface ActionLog {
  id: string;
  productId: string;
  actionType: 'view' | 'cart' | 'purchase';
  timestamp: string;
}

export interface PushNotification {
  id: string;
  orderId: string;
  title: string;
  message: string;
  timestamp: string;
  status: 'unread' | 'read';
}

export interface Recommendation {
  productId: string;
  name: string;
  category: string;
  price: number;
  image: string;
  reason: string;
}

export interface StoreState {
  products: Product[];
  orders: Order[];
  notifications: PushNotification[];
  logs: ActionLog[];
}
