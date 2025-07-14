
import React from 'react';
import { AppMode, Product, Order } from '../types';

interface AppContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  selectedProduct: Product | null;
  viewProduct: (product: Product) => void;
  previousMode: AppMode;
  currentOrder: Order | null;
  setCurrentOrder: (order: Order | null) => void;
  isChatOpen: boolean;
  setChatOpen: (isOpen: boolean) => void;
  redirectAfterLogin: AppMode | null;
  setRedirectAfterLogin: (mode: AppMode | null) => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = React.useState<AppMode>(AppMode.HOME);
  const [previousMode, setPreviousMode] = React.useState<AppMode>(AppMode.HOME);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [currentOrder, setCurrentOrder] = React.useState<Order | null>(null);
  const [isChatOpen, setChatOpen] = React.useState<boolean>(false);
  const [redirectAfterLogin, setRedirectAfterLogin] = React.useState<AppMode | null>(null);

  const handleSetMode = (newMode: AppMode) => {
    setPreviousMode(mode);
    setMode(newMode);
  }

  const viewProduct = (product: Product) => {
    setSelectedProduct(product);
    handleSetMode(AppMode.PRODUCT_DETAIL);
  }

  return (
    <AppContext.Provider value={{ 
        mode, 
        setMode: handleSetMode, 
        selectedProduct, 
        viewProduct, 
        previousMode, 
        currentOrder, 
        setCurrentOrder,
        isChatOpen,
        setChatOpen,
        redirectAfterLogin,
        setRedirectAfterLogin
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};