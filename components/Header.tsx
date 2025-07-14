
import React from 'react';
import { AppMode } from '../types';
import { BotMessageSquareIcon, CameraIcon, ShoppingCartIcon, HeartIcon, LogOutIcon, TrophyIcon, TicketIcon } from './icons/Icons';
import { useAppContext } from '../contexts/AppContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { mode, setMode, setChatOpen } = useAppContext();
  const { itemCount: cartItemCount } = useCart();
  const { wishlistItemCount } = useWishlist();
  const { user, logout } = useAuth();

  const getButtonClass = (buttonMode: AppMode) => {
    return `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
      mode === buttonMode
        ? 'bg-primary text-white shadow-md'
        : 'bg-base-100 text-text-secondary hover:bg-neutral'
    }`;
  };
  
  const handleLogout = () => {
    logout();
    setMode(AppMode.HOME);
  };
  
  const activeCoupons = user?.coupons?.filter(c => new Date(c.expiryDate) > new Date()).length || 0;

  return (
    <header className="bg-base-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => setMode(AppMode.HOME)} className="flex items-center gap-3 cursor-pointer">
            <svg className="h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3L2 8l10 5 10-5-10-5z"></path>
                <path d="M2 16l10 5 10-5"></path>
                <path d="M2 8l10 5 10-5"></path>
            </svg>
            <h1 className="text-xl font-bold text-text-primary">
              Future<span className="text-accent">Mart</span>
            </h1>
          </button>
          <div className="flex items-center gap-2">
            <nav className="hidden md:flex items-center gap-2 p-1 bg-neutral rounded-full">
              <button
                onClick={() => setChatOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 bg-base-100 text-text-secondary hover:bg-gray-200"
                aria-label="AI Product Chat"
              >
                <BotMessageSquareIcon className="w-5 h-5" />
                <span>Chat</span>
              </button>
              <button
                onClick={() => setMode(AppMode.VISUAL_SEARCH)}
                className={getButtonClass(AppMode.VISUAL_SEARCH)}
                aria-label="Visual Search"
              >
                <CameraIcon className="w-5 h-5" />
                <span>Visual Search</span>
              </button>
            </nav>
            <div className="h-8 border-l border-gray-300 mx-2"></div>
             <button onClick={() => setMode(AppMode.WISHLIST)} className="relative p-2 text-text-secondary hover:text-primary transition-colors" aria-label={`Wishlist with ${wishlistItemCount} items`}>
                <HeartIcon className="w-6 h-6" />
                {wishlistItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                        {wishlistItemCount}
                    </span>
                )}
            </button>
            <button onClick={() => setMode(AppMode.CART)} className="relative p-2 text-text-secondary hover:text-primary transition-colors" aria-label={`My Cart with ${cartItemCount} items`}>
                <ShoppingCartIcon className="w-6 h-6" />
                {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                        {cartItemCount}
                    </span>
                )}
            </button>
            {user ? (
              <div className="flex items-center gap-2">
                <div className="h-8 border-l border-gray-300 mx-2"></div>
                <div className="text-right -space-y-1 hidden sm:block">
                    <span className="text-sm font-medium text-text-secondary">Hi, {user.firstName}</span>
                    <span className="text-xs font-bold text-accent">{user.points} points</span>
                </div>
                 <button onClick={() => setMode(AppMode.COUPONS)} className="relative p-2 text-text-secondary hover:text-primary transition-colors" aria-label="My Coupons">
                    <TicketIcon className="w-6 h-6" />
                    {activeCoupons > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                            {activeCoupons}
                        </span>
                    )}
                </button>
                <button onClick={() => setMode(AppMode.REWARDS)} className="p-2 text-text-secondary hover:text-primary transition-colors" aria-label="My Rewards">
                    <TrophyIcon className="w-6 h-6" />
                </button>
                <button onClick={handleLogout} className="p-2 text-text-secondary hover:text-primary transition-colors" aria-label="Logout">
                  <LogOutIcon className="w-6 h-6" />
                </button>
              </div>
            ) : (
                 <div className="flex items-center gap-2">
                    <div className="h-8 border-l border-gray-300 mx-2"></div>
                    <button onClick={() => setMode(AppMode.LOGIN)} className="font-semibold text-sm px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-focus transition-colors">
                        Login / Sign Up
                    </button>
                </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;