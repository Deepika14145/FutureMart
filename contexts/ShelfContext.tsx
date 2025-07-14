
import React from 'react';
import { Product } from '../types';

interface ShelfContextType {
  shelfItems: Product[];
  addToShelf: (product: Product) => void;
  removeFromShelf: (productId: string) => void;
  isOnShelf: (productId: string) => boolean;
  shelfItemCount: number;
}

const ShelfContext = React.createContext<ShelfContextType | undefined>(undefined);

export const ShelfProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shelfItems, setShelfItems] = React.useState<Product[]>(() => {
    try {
      const localData = localStorage.getItem('swapcart-shelf');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Error reading shelf from localStorage", error);
      return [];
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('swapcart-shelf', JSON.stringify(shelfItems));
    } catch (error) {
      console.error("Error saving shelf to localStorage", error);
    }
  }, [shelfItems]);

  const addToShelf = (product: Product) => {
    setShelfItems(prevItems => {
      if (!prevItems.find(item => item.id === product.id)) {
        return [...prevItems, product];
      }
      return prevItems;
    });
  };

  const removeFromShelf = (productId: string) => {
    setShelfItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const isOnShelf = (productId: string) => {
    return shelfItems.some(item => item.id === productId);
  };

  const shelfItemCount = shelfItems.length;

  return (
    <ShelfContext.Provider value={{ shelfItems, addToShelf, removeFromShelf, isOnShelf, shelfItemCount }}>
      {children}
    </ShelfContext.Provider>
  );
};

export const useShelf = (): ShelfContextType => {
  const context = React.useContext(ShelfContext);
  if (!context) {
    throw new Error('useShelf must be used within a ShelfProvider');
  }
  return context;
};