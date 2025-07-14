
import React from 'react';
import { Product, CartItem } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  recordPurchaseAndClearCart: () => void;
  itemCount: number;
}

const CartContext = React.createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = React.useState<CartItem[]>(() => {
    try {
      const localData = localStorage.getItem('futuremart-cart');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      return [];
    }
  });

  React.useEffect(() => {
    localStorage.setItem('futuremart-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };
  
  const recordPurchaseAndClearCart = () => {
    try {
      const historyData = localStorage.getItem('futuremart-history');
      const history: Product[] = historyData ? JSON.parse(historyData) : [];
      
      const newPurchaseItems = cartItems.map(({ quantity, ...product }) => product);
      
      const existingIds = new Set(history.map((p) => p.id));
      const uniqueNewItems = newPurchaseItems.filter(p => !existingIds.has(p.id));

      const newHistory = [...uniqueNewItems, ...history];
      const truncatedHistory = newHistory.slice(0, 20); // Keep last 20 purchased items
      localStorage.setItem('futuremart-history', JSON.stringify(truncatedHistory));
    } catch (error) {
      console.error("Could not save purchase history:", error);
    }
    setCartItems([]);
  };

  const clearCart = () => {
      setCartItems([]);
  }

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, recordPurchaseAndClearCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};