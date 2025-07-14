
import React from 'react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useAppContext } from '../contexts/AppContext';
import { AppMode, Product } from '../types';
import { HeartIcon, ShoppingCartIcon } from './icons/Icons';

const Wishlist: React.FC = () => {
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { setMode, viewProduct } = useAppContext();

    const handleMoveToCart = (product: Product) => {
        addToCart(product);
        removeFromWishlist(product.id);
    };
    
    const handleCardClick = (product: Product) => {
        viewProduct(product);
    };

    if (wishlistItems.length === 0) {
        return (
            <div className="text-center py-16 px-4 bg-base-100 rounded-lg shadow-sm">
                <HeartIcon className="w-16 h-16 mx-auto text-gray-300" />
                <h2 className="mt-4 text-3xl font-extrabold text-text-primary">Your Wishlist is Empty</h2>
                <p className="mt-2 text-lg text-text-secondary">
                    Add items you love to your wishlist to save them for later.
                </p>
                <button
                    onClick={() => setMode(AppMode.HOME)}
                    className="mt-6 bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-primary-focus transition-colors"
                >
                    Discover Products
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-text-primary mb-6">Your Wishlist ({wishlistItems.length} items)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlistItems.map(product => (
                    <div key={product.id} className="bg-base-100 rounded-lg shadow-md overflow-hidden flex flex-col">
                         <div
                            className="w-full h-48 bg-gray-200 cursor-pointer relative"
                            onClick={() => handleCardClick(product)}
                         >
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                             <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFromWishlist(product.id);
                                }}
                                className="absolute top-2 right-2 bg-white rounded-full p-2 text-error hover:bg-red-100 transition-colors"
                                aria-label="Remove from Wishlist"
                            >
                                <HeartIcon className="w-6 h-6" fill="currentColor"/>
                            </button>
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                            <h3 className="font-bold text-lg text-text-primary cursor-pointer hover:underline" title={product.name} onClick={() => handleCardClick(product)}>
                                {product.name}
                            </h3>
                            <div className="flex-grow"></div>
                            <div className="flex justify-between items-center mt-4">
                                <span className="text-xl font-bold text-text-primary">{product.price}</span>
                                <button
                                    onClick={() => handleMoveToCart(product)}
                                    className="font-bold py-2 px-4 rounded-full transition-colors bg-primary text-white hover:bg-primary-focus flex items-center gap-2"
                                    aria-label={`Move ${product.name} to cart`}
                                >
                                    <ShoppingCartIcon className="w-5 h-5"/>
                                    <span>Move to Cart</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wishlist;