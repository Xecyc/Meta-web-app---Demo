import type { CategoryType } from './data/products';
export type { CategoryType };

export interface Product {
  id: string;
  name: string;
  category: CategoryType;
  priceUSD: number;
  image: string;
  unit: string;
  brand: string;
  inStock: boolean;
  stockCount: number;
  discountPercent?: number;
  originalPriceUSD?: number;
  description: string;
  barcode: string;
  aisle: string;
  isFeatured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type DocumentType = 'V' | 'E' | 'J' | 'G';

export interface CustomerProfile {
  documentType: DocumentType;
  documentNumber: string;
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  preferredBranch: string;
  notes?: string;
}

export interface Branch {
  id: string;
  name: string;
  shortName: string;
  address: string;
  phone: string;
  hours: string;
  whatsappNumber: string;
}

export type ActiveTab = 'inicio' | 'productos' | 'carrito' | 'cuenta';

