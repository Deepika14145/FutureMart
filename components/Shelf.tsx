
import React from 'react';
import { useShelf } from '../contexts/ShelfContext';
import { useAppContext } from '../contexts/AppContext';
import { AppMode, Product } from '../types';
import { ShelfIcon, RefreshCwIcon } from './icons/Icons';
import { findSwaps } from '../services/geminiService';
import ProductCard from './ProductCard';

const Shelf: React.FC = () => {
    const { shelfItems, removeFromShelf } = useShelf();
    const { setMode, viewProduct } = useAppContext();
    const [swaps, setSwaps] = React.useState<Record<string, Product[]>>({});
    const [loadingSwaps, setLoadingSwaps] = React.useState<string | null>(null);

    const handleFindSwaps = async (product: Product) => {
        setLoadingSwaps(product.id);
        setSwaps(prev => ({ ...prev, [product.id]: [] })); // Clear previous swaps
        try {
            const results = await findSwaps(product);
            setSwaps(prev => ({ ...prev, [product.id]: results }));
        } catch (error) {
            console.error("Failed to find swaps:", error);
        } finally {
            setLoadingSwaps(null);
        }
    };
    
    if (shelfItems.length === 0) {
        return (
            <div className="text-center py-16 px-4 bg-base-100 rounded-lg shadow-sm">
                <ShelfIcon className="w-16 h-16 mx-auto text-gray-300" />
                <h2 className="mt-4 text-3xl font-extrabold text-primary">Your Shelf is Empty</h2>
                <p className="mt-2 text-lg text-secondary">
                    Add items you own or are interested in to your shelf.
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
            <h2 className="text-3xl font-bold text-primary mb-6">My Shelf ({shelfItems.length} items)</h2>
            <div className="space-y-8">
                {shelfItems.map(product => (
                    <div key={product.id} className="bg-base-100 p-4 rounded-lg shadow-sm">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <img 
                                src={product.imageUrl} 
                                alt={product.name} 
                                className="w-32 h-32 object-cover rounded-md cursor-pointer"
                                onClick={() => viewProduct(product)}
                            />
                            <div className="flex-grow text-center md:text-left">
                                <h3 
                                    className="font-bold text-xl text-primary cursor-pointer hover:underline"
                                    onClick={() => viewProduct(product)}
                                >
                                    {product.name}
                                </h3>
                                <p className="text-secondary">{product.price}</p>
                            </div>
                            <div className="flex flex-col gap-2 flex-shrink-0">
                                <button
                                    onClick={() => handleFindSwaps(product)}
                                    disabled={loadingSwaps === product.id}
                                    className="font-bold py-2 px-5 rounded-full transition-colors bg-primary text-white hover:bg-primary-focus flex items-center justify-center gap-2 disabled:bg-gray-400"
                                >
                                    <RefreshCwIcon className={`w-5 h-5 ${loadingSwaps === product.id ? 'animate-spin' : ''}`}/>
                                    <span>{loadingSwaps === product.id ? 'Finding...' : 'Find a Swap'}</span>
                                </button>
                                <button
                                    onClick={() => removeFromShelf(product.id)}
                                    className="font-semibold py-2 px-5 rounded-full transition-colors text-sm bg-red-100 text-error hover:bg-red-200"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>

                        {swaps[product.id] && swaps[product.id].length > 0 && (
                            <div className="mt-6 border-t pt-4">
                                <h4 className="font-bold text-secondary mb-4">Swap suggestions for {product.name}:</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {swaps[product.id].map(swapProduct => (
                                        <ProductCard key={swapProduct.id} product={swapProduct} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Shelf;