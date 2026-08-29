import { Product } from '../../types';

export type ScannerMode = 'auto' | 'barcode' | 'ocr';
export type CameraState = 'idle' | 'requesting' | 'active' | 'denied' | 'unsupported';
export type StatusType = 'green' | 'blue' | 'yellow' | 'red';

export interface ScanResult {
  rawCode: string;
  type: 'barcode' | 'ocr';
  timestamp: number;
  matchedProduct?: Product;
  extractedPrice?: number;
}

export interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  exchangeRate: number;
  onAddToCart: (product: Product, quantity?: number) => void;
  onProductSelect?: (product: Product) => void;
  onSearchProduct?: (query: string) => void;
  branchName: string;
}
