
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { AppMode } from '../types';
import { SparklesIcon } from './icons/Icons';

const Confirmation: React.FC = () => {
    const { setMode, currentOrder } = useAppContext();

    return (
        <div className="text-center py-16 px-4 bg-base-100 rounded-lg shadow-sm">
            <SparklesIcon className="w-16 h-16 mx-auto text-accent" />
            <h2 className="mt-4 text-3xl font-extrabold text-text-primary">Thank You For Your Order!</h2>
            {currentOrder && <p className="text-lg text-text-secondary mt-2">Order ID: {currentOrder.id}</p>}
            <p className="mt-2 text-lg text-text-secondary">
                Your order has been placed successfully. As a thank you, we've added a special coupon to your account!
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                 {currentOrder && (
                    <button
                        onClick={() => setMode(AppMode.ORDER_TRACKING)}
                        className="bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-primary-focus transition-opacity"
                    >
                        Track Your Order
                    </button>
                )}
                <button 
                    onClick={() => setMode(AppMode.HOME)}
                    className="bg-neutral text-text-primary font-bold py-3 px-6 rounded-full hover:bg-gray-200 transition-colors"
                >
                  Continue Shopping
                </button>
            </div>
      </div>
    );
};

export default Confirmation;