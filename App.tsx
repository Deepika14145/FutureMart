
import React from 'react';
import Header from './components/Header';
import AiAssistant from './components/AiAssistant';
import VisualSearch from './components/VisualSearch';
import ProductDetail from './components/ProductDetail';
import ArView from './components/ArView';
import Cart from './components/Cart';
import Wishlist from './components/Wishlist';
import Checkout from './components/Checkout';
import Confirmation from './components/Confirmation';
import OrderTracking from './components/OrderTracking';
import Home from './components/Home';
import Login from './components/Login';
import { AppMode } from './types';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { AuthProvider } from './contexts/AuthContext';
import { XIcon, BotMessageSquareIcon } from './components/icons/Icons';
import Shelf from './components/Shelf';
import GiftMatcher from './components/GiftMatcher';
import { ShelfProvider } from './contexts/ShelfContext';
import { LoyaltyProvider } from './contexts/LoyaltyContext';
import Rewards from './components/Rewards';
import Coupons from './components/Coupons';

const AppContent: React.FC = () => {
  const { mode, isChatOpen, setChatOpen } = useAppContext();

  const renderContent = () => {
    switch (mode) {
      case AppMode.LOGIN:
        return <Login />;
      case AppMode.HOME:
        return <Home />;
      case AppMode.ASSISTANT:
        return <AiAssistant />;
      case AppMode.VISUAL_SEARCH:
        return <VisualSearch />;
      case AppMode.PRODUCT_DETAIL:
        return <ProductDetail />;
      case AppMode.AR_VIEW:
        return <ArView />;
      case AppMode.CART:
        return <Cart />;
      case AppMode.WISHLIST:
        return <Wishlist />;
      case AppMode.CHECKOUT:
        return <Checkout />;
      case AppMode.CONFIRMATION:
        return <Confirmation />;
      case AppMode.ORDER_TRACKING:
        return <OrderTracking />;
      case AppMode.REWARDS:
        return <Rewards />;
      case AppMode.COUPONS:
        return <Coupons />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="bg-neutral min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6">
        {renderContent()}
      </main>
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 w-full max-w-md h-[calc(100vh-4rem)] sm:h-[600px] bg-base-100 rounded-xl shadow-2xl flex flex-col z-50 transform transition-transform animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-center p-4 border-b bg-neutral rounded-t-xl">
                <div className="flex items-center gap-2">
                    <BotMessageSquareIcon className="w-6 h-6 text-primary" />
                    <h2 className="font-bold text-lg text-text-primary">Jem, your AI Assistant</h2>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-text-secondary hover:text-text-primary">
                    <XIcon className="w-6 h-6" />
                </button>
            </div>
            <AiAssistant />
        </div>
      )}

      {!isChatOpen && (
          <button
              onClick={() => setChatOpen(true)}
              className="fixed bottom-4 right-4 bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary-focus transition-transform hover:scale-110 z-50"
              aria-label="Open AI Assistant"
          >
              <BotMessageSquareIcon className="w-8 h-8" />
          </button>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AuthProvider>
        <WishlistProvider>
          <ShelfProvider>
            <CartProvider>
              <LoyaltyProvider>
                <AppContent />
              </LoyaltyProvider>
            </CartProvider>
          </ShelfProvider>
        </WishlistProvider>
      </AuthProvider>
    </AppProvider>
  );
};

export default App;