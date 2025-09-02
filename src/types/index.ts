export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  barcode?: string;
  image?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  paymentMethod: 'cash' | 'card' | 'pix';
  customerId?: string;
  customerName?: string;
  discount: number;
  tax: number;
  status: 'completed' | 'cancelled' | 'pending';
  cashierId: string;
  cashierName: string;
  createdAt: Date;
  receipt?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CashRegister {
  id: string;
  name: string;
  initialAmount: number;
  currentAmount: number;
  status: 'open' | 'closed';
  openedAt?: Date;
  closedAt?: Date;
  openedBy: string;
  closedBy?: string;
}

export interface CashMovement {
  id: string;
  registerId: string;
  type: 'sale' | 'withdrawal' | 'deposit' | 'return';
  amount: number;
  description: string;
  saleId?: string;
  userId: string;
  createdAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}