
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppContext } from '../contexts/AppContext';
import { AppMode, User } from '../types';
import { getAddressFromCoordinates } from '../services/geminiService';
import { MapPinIcon, AlertTriangleIcon, EyeIcon, EyeOffIcon } from './icons/Icons';

const Login: React.FC = () => {
  const [isLoginView, setIsLoginView] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [street, setStreet] = React.useState('');
  const [city, setCity] = React.useState('');
  const [state, setState] = React.useState('');
  const [zip, setZip] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLocating, setIsLocating] = React.useState(false);
  const [locationError, setLocationError] = React.useState<string | null>(null);

  const { login, signup } = useAuth();
  const { redirectAfterLogin, setRedirectAfterLogin, setMode } = useAppContext();

  const handleFormSwitch = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoginView(!isLoginView);
    setError(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
        if (isLoginView) {
            await login(email, password);
        } else {
            const newUser: Omit<User, 'id' | 'coupons'> = {
                firstName,
                lastName,
                email,
                address: { street, city, state, zip },
                points: 0,
            };
            await signup(newUser);
        }
        
        if (redirectAfterLogin) {
            setMode(redirectAfterLogin);
            setRedirectAfterLogin(null);
        } else {
            setMode(AppMode.HOME);
        }

    } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleFetchLocation = async () => {
    if (!navigator.geolocation) {
        setLocationError("Geolocation is not supported by your browser.");
        return;
    }
    setIsLocating(true);
    setLocationError(null);

    const options = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const address = await getAddressFromCoordinates(latitude, longitude);
                setStreet(address.street);
                setCity(address.city);
                setState(address.state);
                setZip(address.zip);
            } catch (error: any) {
                console.error("Failed to get address from coordinates:", error);
                setLocationError(error.message || "Failed to convert your location to an address. Please enter it manually.");
            } finally {
                setIsLocating(false);
            }
        },
        (error) => {
            let message: string;
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    message = "Location access was denied. To use this feature, please enable location permissions for this site in your browser settings.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    message = "Your location could not be determined. Please ensure your device's location service is on and you have a stable network connection.";
                    break;
                case error.TIMEOUT:
                    message = "The request to get your location timed out. Please try again.";
                    break;
                default:
                    message = "An unknown error occurred while accessing your location. Please try again or enter the address manually.";
                    break;
            }
            setLocationError(message);
            setIsLocating(false);
        },
        options
    );
  };

  const inputClasses = "p-3 bg-neutral border border-gray-300 rounded-md w-full text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-primary focus:outline-none transition-shadow";

  return (
    <div className="flex justify-center py-8">
      <div className="max-w-md w-full bg-base-100 p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-primary">
              Welcome to Future<span className="text-accent">Mart</span>
            </h1>
            <p className="text-text-secondary mt-1">{isLoginView ? "Sign in to continue" : "Create an account to get started"}</p>
        </div>
        
        {error && (
            <div className="bg-red-100 border border-error text-error px-4 py-3 rounded-md relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginView && (
            <div className="grid grid-cols-2 gap-4">
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name" className={inputClasses} required />
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last Name" className={inputClasses} required />
            </div>
          )}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className={inputClasses} required />
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'}
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Password" 
              className={`${inputClasses} pr-10`}
              required 
            />
            <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary hover:text-text-primary"
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                ) : (
                    <EyeIcon className="w-5 h-5" />
                )}
            </button>
          </div>
          
          {!isLoginView && (
            <>
                <div className="flex justify-between items-center pt-2 mb-2">
                    <h3 className="text-lg font-semibold text-text-primary">Shipping Address</h3>
                    <button
                        type="button"
                        onClick={handleFetchLocation}
                        disabled={isLocating}
                        className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline disabled:opacity-50"
                    >
                        <MapPinIcon className="w-5 h-5" />
                        <span>{isLocating ? 'Locating...' : 'Use my location'}</span>
                    </button>
                </div>
                 {locationError && (
                    <div className="bg-red-50 border border-red-300 text-error px-4 py-3 rounded-md relative my-2 flex items-start gap-3" role="alert">
                         <AlertTriangleIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600" />
                         <span className="block sm:inline text-sm">{locationError}</span>
                    </div>
                )}
                <input type="text" value={street} onChange={e => setStreet(e.target.value)} placeholder="Street Address" className={inputClasses} required />
                <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="City" className={inputClasses} required />
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" value={state} onChange={e => setState(e.target.value)} placeholder="State" className={inputClasses} required />
                    <input type="text" value={zip} onChange={e => setZip(e.target.value)} placeholder="Zip Code" className={inputClasses} required />
                </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-primary-focus transition-colors flex items-center justify-center disabled:bg-gray-400"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (isLoginView ? 'Sign In' : 'Create Account')}
          </button>
        </form>
        
        <div className="text-center mt-6">
            <p className="text-sm text-text-secondary">
                {isLoginView ? "Don't have an account?" : "Already have an account?"}
                <button onClick={handleFormSwitch} className="font-semibold text-primary hover:underline ml-1">
                    {isLoginView ? "Sign Up" : "Sign In"}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
