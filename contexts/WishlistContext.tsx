
import React from 'react';
import { Product } from '../types';

interface WishlistContextType {
  wishlistItems: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistItemCount: number;
}

const WishlistContext = React.createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = React.useState<Product[]>(() => {
    try {
      const localData = localStorage.getItem('futuremart-wishlist');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Error reading wishlist from localStorage", error);
      return [];
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('futuremart-wishlist', JSON.stringify(wishlistItems));
    } catch (error) {
      console.error("Error saving wishlist to localStorage", error);
    }
  }, [wishlistItems]);

  const addToWishlist = (product: Product) => {
    setWishlistItems(prevItems => {
      if (!prevItems.find(item => item.id === product.id)) {
        return [...prevItems, product];
      }
      return prevItems;
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const wishlistItemCount = wishlistItems.length;

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isInWishlist, wishlistItemCount }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = React.useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};