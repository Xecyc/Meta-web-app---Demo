import { CartItem, CustomerProfile, Branch } from '../types';
import { BRANCHES, INITIAL_EXCHANGE_RATE } from '../data/products';

export const STORAGE_KEYS = {
  BRANCH: 'meta_supermarket_branch',
  RATE: 'meta_supermarket_rate',
  CART: 'meta_supermarket_cart',
  PROFILE: 'meta_supermarket_profile',
} as const;

export const loadSavedBranch = (): Branch => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.BRANCH);
    if (saved) {
      const found = BRANCHES.find((b) => b.id === saved);
      if (found) return found;
    }
  } catch (e) {
    console.error('Failed to load branch from storage:', e);
  }
  return BRANCHES[0];
};

export const saveBranch = (branchId: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.BRANCH, branchId);
  } catch (e) {
    console.error('Failed to save branch to storage:', e);
  }
};

export const loadSavedRate = (): number => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.RATE);
    if (saved) {
      const val = parseFloat(saved);
      if (!isNaN(val) && val > 0) return val;
    }
  } catch (e) {
    console.error('Failed to load rate from storage:', e);
  }
  return INITIAL_EXCHANGE_RATE;
};

export const saveRate = (rate: number): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.RATE, rate.toString());
  } catch (e) {
    console.error('Failed to save rate to storage:', e);
  }
};

export const loadSavedCart = (): CartItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CART);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load cart from storage:', e);
  }
  return [];
};

export const saveCart = (cart: CartItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  } catch (e) {
    console.error('Failed to save cart to storage:', e);
  }
};

export const loadSavedProfile = (): CustomerProfile => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load profile from storage:', e);
  }
  return {
    documentType: 'V',
    documentNumber: '',
    fullName: '',
    phone: '',
    email: '',
    address: '',
    preferredBranch: BRANCHES[0].id,
  };
};

export const saveProfile = (profile: CustomerProfile): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile to storage:', e);
  }
};
