
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TicketIcon, CheckIcon } from './icons/Icons';
import { Coupon } from '../types';

const CouponCard: React.FC<{ coupon: Coupon }> = ({ coupon }) => {
    const [isCopied, setIsCopied] = React.useState(false);
    const isExpired = new Date(coupon.expiryDate) < new Date();
    
    const handleCopy = () => {
        navigator.clipboard.writeText(coupon.code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className={`bg-base-100 rounded-lg shadow-sm flex items-center transition-opacity ${isExpired ? 'opacity-50' : ''}`}>
            <div className={`w-16 h-full flex items-center justify-center rounded-l-lg ${isExpired ? 'bg-gray-200' : 'bg-accent/80'}`}>
                <TicketIcon className={`w-8 h-8 ${isExpired ? 'text-gray-500' : 'text-white'}`} />
            </div>
            <div className="flex-grow p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg text-text-primary">{coupon.description}</h3>
                        <p className="text-sm text-text-secondary">
                            Expires on: {new Date(coupon.expiryDate).toLocaleDateString()}
                        </p>
                    </div>
                    <div className={`text-xs font-bold py-1 px-2 rounded-full ${isExpired ? 'bg-red-100 text-error' : 'bg-green-100 text-success'}`}>
                        {isExpired ? 'Expired' : 'Active'}
                    </div>
                </div>
                <div className="mt-3 flex justify-between items-center">
                    <div className="font-mono text-base bg-neutral border-2 border-dashed border-gray-300 py-1 px-3 rounded">
                        {coupon.code}
                    </div>
                    <button 
                        onClick={handleCopy}
                        disabled={isExpired}
                        className={`font-semibold py-2 px-4 rounded-full text-sm transition-colors flex items-center gap-1 ${
                            isCopied 
                            ? 'bg-success text-white' 
                            : 'bg-primary text-white hover:bg-primary-focus disabled:bg-gray-400'
                        }`}
                    >
                        {isCopied ? <><CheckIcon className="w-4 h-4" /> Copied</> : 'Copy Code'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const Coupons: React.FC = () => {
    const { user } = useAuth();
    
    if (!user) {
        return <div className="text-center p-8">Please log in to see your coupons.</div>
    }

    const sortedCoupons = (user.coupons || []).sort((a, b) => new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime());

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <TicketIcon className="w-12 h-12 mx-auto text-primary" />
                <h2 className="mt-2 text-3xl font-extrabold text-text-primary">Your Coupons</h2>
                <p className="mt-2 text-lg text-text-secondary">Here are your available discounts and offers.</p>
            </div>
            
            {sortedCoupons.length > 0 ? (
                <div className="space-y-4">
                    {sortedCoupons.map(coupon => (
                        <CouponCard key={coupon.id} coupon={coupon} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-4 bg-base-100 rounded-lg shadow-sm">
                    <h3 className="text-2xl font-bold text-text-primary">No Coupons Yet!</h3>
                    <p className="mt-2 text-text-secondary">
                        Make a purchase to earn your first coupon and unlock special discounts.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Coupons;