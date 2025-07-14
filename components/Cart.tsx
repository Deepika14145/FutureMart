
import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { AppMode, Product } from '../types';
import { MinusCircleIcon, PlusCircleIcon, ShoppingCartIcon, TrashIcon } from './icons/Icons';
import { getCartRecommendations } from '../services/geminiService';
import ProductCard from './ProductCard';

const CartRecommendations: React.FC = () => {
    const { cartItems } = useCart();
    const [recommendations, setRecommendations] = React.useState<Product[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        if (cartItems.length > 0) {
            setIsLoading(true);
            getCartRecommendations(cartItems)
                .then(setRecommendations)
                .catch(console.error)
                .finally(() => setIsLoading(false));
        } else {
            setRecommendations([]);
        }
    }, [cartItems]);
    
    if (cartItems.length === 0) return null;

    return (
        <div className="mt-12">
            <h3 className="text-xl font-bold text-text-primary mb-4">You might also like...</h3>
            {isLoading && <p className="text-text-secondary">Finding recommendations...</p>}
            {recommendations.length > 0 && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recommendations.map(product => <ProductCard key={product.id} product={product} />)}
                </div>
            )}
        </div>
    )
}


const Cart: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, itemCount } = useCart();
  const { setMode, setRedirectAfterLogin } = useAppContext();
  const { isAuthenticated } = useAuth();

  const subtotal = React.useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = parseFloat(item.price.replace('$', ''));
      return sum + price * item.quantity;
    }, 0);
  }, [cartItems]);
  
  const handleCheckout = () => {
    if (isAuthenticated) {
        setMode(AppMode.CHECKOUT);
    } else {
        setRedirectAfterLogin(AppMode.CHECKOUT);
        setMode(AppMode.LOGIN);
    }
  };

  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  if (itemCount === 0) {
    return (
      <div className="text-center py-16 px-4 bg-base-100 rounded-lg shadow-sm">
        <ShoppingCartIcon className="w-16 h-16 mx-auto text-gray-300" />
        <h2 className="mt-4 text-3xl font-extrabold text-text-primary">Your Cart is Empty</h2>
        <p className="mt-2 text-lg text-text-secondary">
          Looks like you haven't added anything yet. Let's find something for you!
        </p>
        <button 
            onClick={() => setMode(AppMode.HOME)}
            className="mt-6 bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-primary-focus transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      <div className="lg:w-2/3">
        <h2 className="text-3xl font-bold text-text-primary mb-6">Your Cart ({itemCount} items)</h2>
        <div className="space-y-4">
          {cartItems.map(item => (
            <div key={item.id} className="bg-base-100 p-4 rounded-lg shadow-sm flex items-center gap-4">
              <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-md" />
              <div className="flex-grow">
                <h3 className="font-bold text-text-primary">{item.name}</h3>
                <p className="text-text-secondary text-sm">{item.price}</p>
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-text-secondary hover:text-primary"><MinusCircleIcon className="w-6 h-6"/></button>
                  <span className="font-bold w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-text-secondary hover:text-primary"><PlusCircleIcon className="w-6 h-6"/></button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-text-primary">${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}</p>
                <button onClick={() => removeFromCart(item.id)} className="text-error hover:text-red-700 mt-2">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <CartRecommendations />
      </div>

      <div className="lg:w-1/3">
        <div className="bg-base-100 p-6 rounded-lg shadow-sm sticky top-24">
            <h3 className="text-xl font-bold text-text-primary mb-4">Order Summary</h3>
            <div className="space-y-2">
                <div className="flex justify-between text-text-secondary">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                    <span>Estimated Tax</span>
                    <span>${tax.toFixed(2)}</span>
                </div>
                 <div className="border-t my-2"></div>
                <div className="flex justify-between font-bold text-lg text-text-primary">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>
            <button onClick={handleCheckout} className="w-full mt-6 bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-primary-focus transition-colors">
                Proceed to Checkout
            </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;