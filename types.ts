export interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  imageUrl: string;
  imageSearchTerm?: string;
  category?: string;
  originalPrice?: string;
  discountPercentage?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Review {
    author: string;
    rating: number; // e.g., 4.5
    comment: string;
}

export interface TrackingEvent {
    status: string;
    location: string;
    timestamp: string;
    description: string;
}

export interface Order {
    id: string;
    items: CartItem[];
    total: number;
    date: string;
}

export interface Promotion {
    headline: string;
    description: string;
    cta: string;
}

export interface BundleOffer {
    headline:string;
    description: string;
    products: string[];
    offer: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountPercentage: number;
  expiryDate: string; // ISO string
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  points: number;
  coupons?: Coupon[];
}

export interface Deal {
    title: string;
    description: string;
    discountPercentage: number;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: 'Trophy' | 'Star' | 'Heart' | 'Sparkles';
}

export enum AppMode {
  LOGIN = 'LOGIN',
  HOME = 'HOME',
  ASSISTANT = 'ASSISTANT',
  VISUAL_SEARCH = 'VISUAL_SEARCH',
  PRODUCT_DETAIL = 'PRODUCT_DETAIL',
  AR_VIEW = 'AR_VIEW',
  CHECKOUT = 'CHECKOUT',
  CONFIRMATION = 'CONFIRMATION',
  CART = 'CART',
  WISHLIST = 'WISHLIST',
  ORDER_TRACKING = 'ORDER_TRACKING',
  REWARDS = 'REWARDS',
  COUPONS = 'COUPONS',
}

export type ChatRole = 'user' | 'model' | 'products';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content?: string;
  products?: Product[];
}
