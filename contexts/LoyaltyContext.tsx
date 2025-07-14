
import React from 'react';
import { Badge, Product } from '../types';
import { useAuth } from './AuthContext';
import { getEarnedBadges } from '../services/geminiService';

interface LoyaltyContextType {
  badges: Badge[];
  isLoading: boolean;
  error: string | null;
  fetchBadges: () => void;
}

const LoyaltyContext = React.createContext<LoyaltyContextType | undefined>(undefined);

export const LoyaltyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [badges, setBadges] = React.useState<Badge[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { user } = useAuth();

  const fetchBadges = React.useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    try {
      const historyData = localStorage.getItem('futuremart-history');
      const purchaseHistory: Product[] = historyData ? JSON.parse(historyData) : [];
      
      const earnedBadges = await getEarnedBadges(purchaseHistory, user.points);
      setBadges(earnedBadges);

    } catch (err: any) {
      setError(err.message || "Failed to fetch loyalty badges.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return (
    <LoyaltyContext.Provider value={{ badges, isLoading, error, fetchBadges }}>
      {children}
    </LoyaltyContext.Provider>
  );
};

export const useLoyalty = (): LoyaltyContextType => {
  const context = React.useContext(LoyaltyContext);
  if (!context) {
    throw new Error('useLoyalty must be used within a LoyaltyProvider');
  }
  return context;
};