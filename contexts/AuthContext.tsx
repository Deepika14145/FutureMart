
import React from 'react';
import { User, Coupon } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  signup: (userData: Omit<User, 'id' | 'coupons'>) => Promise<void>;
  addPoints: (pointsToAdd: number) => void;
  addCoupon: (coupon: Coupon) => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// In a real app, this would be a secure backend. For this demo, we use localStorage.
const FAKE_DB_USERS = 'futuremart-users';
const FAKE_DB_SESSION = 'futuremart-session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Check for an existing session on component mount
    try {
      const sessionUserJson = localStorage.getItem(FAKE_DB_SESSION);
      if (sessionUserJson) {
        const sessionUser = JSON.parse(sessionUserJson);
        setUser(sessionUser);
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error("Failed to parse session user from localStorage", e);
      localStorage.removeItem(FAKE_DB_SESSION);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<void> => {
    // In a real app, you would verify the password hash. Here we just check the email.
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const usersJson = localStorage.getItem(FAKE_DB_USERS);
            const users: User[] = usersJson ? JSON.parse(usersJson) : [];
            const foundUser = users.find(u => u.email === email);
            
            if (foundUser) {
                setUser(foundUser);
                setIsAuthenticated(true);
                localStorage.setItem(FAKE_DB_SESSION, JSON.stringify(foundUser));
                resolve();
            } else {
                reject(new Error("User not found or password incorrect"));
            }
        }, 500);
    });
  };

  const signup = async (userData: Omit<User, 'id' | 'coupons'>): Promise<void> => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
            const usersJson = localStorage.getItem(FAKE_DB_USERS);
            const users: User[] = usersJson ? JSON.parse(usersJson) : [];
            
            if (users.some(u => u.email === userData.email)) {
                return reject(new Error("An account with this email already exists."));
            }
            
            const newUser: User = {
                id: `user-${Date.now()}`,
                ...userData,
                coupons: [],
            };
            
            users.push(newUser);
            localStorage.setItem(FAKE_DB_USERS, JSON.stringify(users));
            
            setUser(newUser);
            setIsAuthenticated(true);
            localStorage.setItem(FAKE_DB_SESSION, JSON.stringify(newUser));
            resolve();
        }, 500);
    });
  };
  
  const addPoints = (pointsToAdd: number) => {
    if (!user) return;

    const updatedUser = { ...user, points: user.points + pointsToAdd };
    
    setUser(updatedUser);
    
    localStorage.setItem(FAKE_DB_SESSION, JSON.stringify(updatedUser));

    try {
        const usersJson = localStorage.getItem(FAKE_DB_USERS);
        const users: User[] = usersJson ? JSON.parse(usersJson) : [];
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex] = updatedUser;
            localStorage.setItem(FAKE_DB_USERS, JSON.stringify(users));
        }
    } catch (e) {
        console.error("Failed to update user points in master list", e);
    }
  };
  
  const addCoupon = (coupon: Coupon) => {
    if (!user) return;

    const updatedUser = { ...user, coupons: [...(user.coupons || []), coupon] };
    
    setUser(updatedUser);
    
    localStorage.setItem(FAKE_DB_SESSION, JSON.stringify(updatedUser));

    try {
        const usersJson = localStorage.getItem(FAKE_DB_USERS);
        const users: User[] = usersJson ? JSON.parse(usersJson) : [];
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex] = updatedUser;
            localStorage.setItem(FAKE_DB_USERS, JSON.stringify(users));
        }
    } catch (e) {
        console.error("Failed to update user coupons in master list", e);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(FAKE_DB_SESSION);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, signup, addPoints, addCoupon }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};