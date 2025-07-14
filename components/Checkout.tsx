
import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { AppMode, Order, Coupon } from '../types';
import { generateCouponForPurchase, getAddressFromCoordinates } from '../services/geminiService';
import { MapPinIcon, AlertTriangleIcon, QrCodeIcon, DollarSignIcon } from './icons/Icons';

type PaymentMethod = 'credit-card' | 'upi' | 'qr-code' | 'cod';

const Checkout: React.FC = () => {
    const { cartItems, recordPurchaseAndClearCart } = useCart();
    const { setMode, setCurrentOrder } = useAppContext();
    const { user, addPoints, addCoupon } = useAuth();
    
    const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('credit-card');
    const [isLocating, setIsLocating] = React.useState(false);
    const [locationError, setLocationError] = React.useState<string | null>(null);

    const [shippingInfo, setShippingInfo] = React.useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zip: '',
    });

    const [couponCode, setCouponCode] = React.useState('');
    const [appliedCoupon, setAppliedCoupon] = React.useState<Coupon | null>(null);
    const [couponMessage, setCouponMessage] = React.useState<{type: 'error' | 'success', text: string} | null>(null);

    React.useEffect(() => {
        if (user) {
            setShippingInfo({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                street: user.address.street,
                city: user.address.city,
                state: user.address.state,
                zip: user.address.zip,
            });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
    }

    const { subtotal, discountAmount, tax, total } = React.useMemo(() => {
        const currentSubtotal = cartItems.reduce((sum, item) => {
            const price = parseFloat(item.price.replace('$', ''));
            return sum + price * item.quantity;
        }, 0);

        const currentDiscountAmount = appliedCoupon ? currentSubtotal * (appliedCoupon.discountPercentage / 100) : 0;
        const subtotalAfterDiscount = currentSubtotal - currentDiscountAmount;
        const currentTax = subtotalAfterDiscount * 0.08;
        const currentTotal = subtotalAfterDiscount + currentTax;

        return { subtotal: currentSubtotal, discountAmount: currentDiscountAmount, tax: currentTax, total: currentTotal };
    }, [cartItems, appliedCoupon]);

    const handleApplyCoupon = () => {
        setCouponMessage(null);
        if (!couponCode.trim()) {
            setCouponMessage({ type: 'error', text: "Please enter a coupon code." });
            return;
        }

        const coupon = user?.coupons?.find(c => c.code.toLowerCase() === couponCode.toLowerCase());

        if (!coupon) {
            setCouponMessage({ type: 'error', text: "Invalid coupon code." });
            setAppliedCoupon(null);
            return;
        }
        if (new Date(coupon.expiryDate) < new Date()) {
            setCouponMessage({ type: 'error', text: "This coupon has expired." });
            setAppliedCoupon(null);
            return;
        }
        
        setAppliedCoupon(coupon);
        setCouponMessage({ type: 'success', text: `Success! ${coupon.discountPercentage}% discount applied.` });
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponMessage(null);
    }

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        const newOrder: Order = {
            id: `FM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            items: cartItems,
            total: total,
            date: new Date().toLocaleDateString('en-US'),
        };
        const pointsEarned = Math.floor(total);
        addPoints(pointsEarned);

        try {
            const coupon = await generateCouponForPurchase(cartItems);
            addCoupon(coupon);
        } catch (error) {
            console.error("Failed to generate coupon:", error);
            // Don't block order for this, it's a bonus.
        }

        setCurrentOrder(newOrder);
        recordPurchaseAndClearCart();
        setMode(AppMode.CONFIRMATION);
    }
    
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
                    setShippingInfo(prev => ({ ...prev, ...address }));
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
    
    const getPaymentButtonClasses = (method: PaymentMethod) => {
        return `py-3 px-4 w-full text-left rounded-lg border-2 transition-colors ${
            paymentMethod === method
                ? 'bg-primary/10 border-primary text-primary font-semibold'
                : 'bg-neutral border-gray-200 hover:border-text-secondary text-text-primary'
        }`;
    }

    return (
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
            <div className="md:w-3/5">
                <div className="bg-base-100 p-8 rounded-lg shadow-sm">
                    <h2 className="text-3xl font-bold text-text-primary mb-6">Checkout</h2>
                    <form onSubmit={handlePlaceOrder} className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xl font-semibold text-text-primary">Shipping Information</h3>
                                <button
                                    type="button"
                                    onClick={handleFetchLocation}
                                    disabled={isLocating}
                                    className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline disabled:opacity-50"
                                >
                                    <MapPinIcon className="w-5 h-5" />
                                    <span>{isLocating ? 'Locating...' : 'Use current location'}</span>
                                </button>
                            </div>
                            {locationError && (
                                <div className="bg-red-50 border border-red-300 text-error px-4 py-3 rounded-md relative my-3 flex items-start gap-3" role="alert">
                                     <AlertTriangleIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600" />
                                     <span className="block sm:inline text-sm">{locationError}</span>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" name="firstName" value={shippingInfo.firstName} onChange={handleInputChange} placeholder="First Name" className={inputClasses} required />
                                <input type="text" name="lastName" value={shippingInfo.lastName} onChange={handleInputChange} placeholder="Last Name" className={inputClasses} required />
                            </div>
                            <input type="email" name="email" value={shippingInfo.email} onChange={handleInputChange} placeholder="Email" className={`${inputClasses} mt-4`} required />
                            <input type="text" name="street" value={shippingInfo.street} onChange={handleInputChange} placeholder="Street Address" className={`${inputClasses} mt-4`} required />
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <input type="text" name="city" value={shippingInfo.city} onChange={handleInputChange} placeholder="City" className={inputClasses} required />
                                <input type="text" name="state" value={shippingInfo.state} onChange={handleInputChange} placeholder="State" className={inputClasses} required />
                                <input type="text" name="zip" value={shippingInfo.zip} onChange={handleInputChange} placeholder="Zip Code" className={inputClasses} required />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-text-primary mb-4">Payment Details</h3>
                            <div className="space-y-3">
                                <button type="button" onClick={() => setPaymentMethod('credit-card')} className={getPaymentButtonClasses('credit-card')}>Credit / Debit Card</button>
                                {paymentMethod === 'credit-card' && (
                                    <div className="p-4 bg-neutral rounded-b-lg grid grid-cols-2 gap-4">
                                        <input type="text" placeholder="Card Number (e.g., 4444 4444 4444 4444)" className={`${inputClasses} col-span-2`} required={paymentMethod === 'credit-card'} />
                                        <input type="text" placeholder="MM / YY" className={inputClasses} required={paymentMethod === 'credit-card'}/>
                                        <input type="text" placeholder="CVC" className={inputClasses} required={paymentMethod === 'credit-card'}/>
                                    </div>
                                )}
                                <button type="button" onClick={() => setPaymentMethod('upi')} className={getPaymentButtonClasses('upi')}>UPI</button>
                                {paymentMethod === 'upi' && (
                                     <div className="p-4 bg-neutral rounded-b-lg">
                                        <input type="text" placeholder="Enter UPI ID" className={inputClasses} required={paymentMethod === 'upi'}/>
                                    </div>
                                )}
                                 <button type="button" onClick={() => setPaymentMethod('qr-code')} className={`${getPaymentButtonClasses('qr-code')} flex items-center gap-2`}>
                                    <QrCodeIcon className="w-5 h-5"/> Scan QR to Pay
                                </button>
                                {paymentMethod === 'qr-code' && (
                                    <div className="p-4 bg-neutral rounded-b-lg text-center">
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=futuremart@ai&pn=FutureMart&am=${total.toFixed(2)}&cu=USD`} alt="QR Code" className="mx-auto rounded-md" />
                                        <p className="text-sm mt-2 text-text-secondary">Scan this code with your payment app.</p>
                                    </div>
                                )}
                                <button type="button" onClick={() => setPaymentMethod('cod')} className={`${getPaymentButtonClasses('cod')} flex items-center gap-2`}>
                                    <DollarSignIcon className="w-5 h-5" /> Cash on Delivery
                                </button>
                                 {paymentMethod === 'cod' && (
                                     <div className="p-4 bg-neutral rounded-b-lg">
                                        <p className="text-sm text-text-secondary">You can pay in cash to the delivery agent upon receiving your order.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <div className="md:w-2/5">
                <div className="bg-base-100 p-6 rounded-lg shadow-sm sticky top-24">
                    <h3 className="text-xl font-bold text-text-primary mb-4">Order Summary</h3>
                    <div className="space-y-1 max-h-60 overflow-y-auto pr-2">
                       {cartItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                                <span className="text-text-primary truncate pr-2">{item.name} (x{item.quantity})</span>
                                <span className="text-text-secondary flex-shrink-0">${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="border-t my-4"></div>

                    {/* Coupon Section */}
                    <div className="mb-4">
                        <label htmlFor="coupon" className="block text-sm font-medium text-text-secondary mb-1">Have a coupon?</label>
                        <div className="flex gap-2">
                             <input
                                id="coupon"
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                placeholder="Enter coupon code"
                                className={inputClasses}
                                disabled={!!appliedCoupon}
                            />
                            {appliedCoupon ? (
                                <button onClick={handleRemoveCoupon} className="font-semibold text-sm px-4 py-2 rounded-md bg-red-100 text-error hover:bg-red-200 transition-colors">
                                    Remove
                                </button>
                            ) : (
                                <button onClick={handleApplyCoupon} className="font-semibold text-sm px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-focus transition-colors">
                                    Apply
                                </button>
                            )}
                        </div>
                        {couponMessage && (
                            <p className={`text-sm mt-2 ${couponMessage.type === 'error' ? 'text-error' : 'text-green-600'}`}>{couponMessage.text}</p>
                        )}
                    </div>

                    <div className="border-t my-4"></div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-text-secondary">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                         {discountAmount > 0 && (
                             <div className="flex justify-between text-green-600">
                                <span>Discount</span>
                                <span>-${discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-text-secondary">
                            <span>Tax (8%)</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="border-t my-2"></div>
                        <div className="flex justify-between font-bold text-lg text-text-primary">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                     <button onClick={handlePlaceOrder} className="w-full mt-6 bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-primary-focus transition-colors">
                        Place Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;