
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { AppMode } from '../types';
import { CubeIcon, ShoppingCartIcon, HeartIcon } from './icons/Icons';

const ProductDetail: React.FC = () => {
    const { selectedProduct, setMode, previousMode } = useAppContext();
    const { addToCart } = useCart();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

    if (!selectedProduct) {
        return (
            <div className="text-center p-8">
                <p>No product selected.</p>
                <button onClick={() => setMode(AppMode.HOME)} className="text-primary font-semibold">
                    &larr; Go back
                </button>
            </div>
        );
    }
    
    const handleWishlistToggle = () => {
        if (isInWishlist(selectedProduct.id)) {
            removeFromWishlist(selectedProduct.id);
        } else {
            addToWishlist(selectedProduct);
        }
    };
    
    const handleAddToCart = () => {
        addToCart(selectedProduct);
    };

    return (
        <div>
            <button onClick={() => setMode(previousMode)} className="text-primary font-semibold mb-4 hover:underline">
                &larr; Back
            </button>
            <div className="bg-base-100 rounded-lg shadow-lg p-6 md:p-8 flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2">
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-auto object-contain rounded-lg max-h-[500px]" />
                </div>
                <div className="md:w-1/2 flex flex-col">
                    <h1 className="text-3xl font-bold text-text-primary">{selectedProduct.name}</h1>
                    <p className="text-3xl font-bold text-text-primary mt-2">{selectedProduct.price}</p>
                    <p className="text-text-secondary mt-4 flex-grow">{selectedProduct.description}</p>
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <button 
                            onClick={handleAddToCart}
                            className="w-full font-bold py-3 px-6 rounded-full transition-colors text-lg flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary-focus"
                        >
                            <ShoppingCartIcon className="w-6 h-6" />
                            <span>Add to Cart</span>
                        </button>
                         <button 
                            onClick={handleWishlistToggle}
                            className={`w-full font-bold py-3 px-6 rounded-full transition-colors text-lg flex items-center justify-center gap-2 ${isInWishlist(selectedProduct.id) ? 'bg-error text-white' : 'border-2 border-error text-error hover:bg-red-50'}`}
                        >
                            <HeartIcon className="w-6 h-6" fill={isInWishlist(selectedProduct.id) ? 'currentColor': 'none'} />
                            <span>{isInWishlist(selectedProduct.id) ? 'In Wishlist' : 'Add to Wishlist'}</span>
                        </button>
                    </div>
                     <button 
                        onClick={() => setMode(AppMode.AR_VIEW)}
                        className="w-full flex items-center justify-center gap-2 mt-3 bg-text-primary text-white font-bold py-3 px-6 rounded-full hover:bg-gray-800 transition-colors"
                    >
                        <CubeIcon className="w-6 h-6" />
                        <span>View in Space</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;