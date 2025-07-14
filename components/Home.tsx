
import React from 'react';
import { Product, Promotion, BundleOffer } from '../types';
import { getHomePageContent, getChatResponse } from '../services/geminiService';
import ProductCard from './ProductCard';
import { SparklesIcon, SearchIcon, MicrophoneIcon, XIcon } from './icons/Icons';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { Carousel } from './Carousel';

const Home: React.FC = () => {
    const [products, setProducts] = React.useState<Product[]>([]);
    const [promotion, setPromotion] = React.useState<Promotion | null>(null);
    const [bundle, setBundle] = React.useState<BundleOffer | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [searchQuery, setSearchQuery] = React.useState('');
    const [isSearching, setIsSearching] = React.useState(false);
    const [searchError, setSearchError] = React.useState<string|null>(null);
    const [displayedProducts, setDisplayedProducts] = React.useState<Product[]>([]);

    React.useEffect(() => {
        const loadHomePageData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const { products, promotion, bundle } = await getHomePageContent();
                setProducts(products);
                setDisplayedProducts(products);
                setPromotion(promotion);
                setBundle(bundle);
            } catch (err: any) {
                setError(err.message || 'Failed to load store content. Please try again later.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadHomePageData();
    }, []);
    
    const handleSearch = async (query: string) => {
        if (!query.trim()) return;
        setIsSearching(true);
        setSearchError(null);
        setDisplayedProducts([]);
        try {
            const response = await getChatResponse(`Find products related to: ${query}`);
            if (response.products && response.products.length > 0) {
                setDisplayedProducts(response.products);
            } else {
                setSearchError("No products found for your search. Try another query!");
                setDisplayedProducts([]);
            }
        } catch (err: any) {
            setSearchError(err.message || "Search failed. Please try again.");
            setDisplayedProducts([]);
        } finally {
            setIsSearching(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setDisplayedProducts(products);
        setSearchError(null);
    };

    const { isListening, startListening, hasRecognitionSupport } = useVoiceRecognition({
        onResult: (transcript) => {
          setSearchQuery(transcript);
          handleSearch(transcript);
        },
    });

    const carouselSlides = [
        {
            imageUrl: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9e?q=80&w=2070&auto=format&fit=crop",
            headline: promotion?.headline || "Seasonal Styles Are Here",
            description: promotion?.description || "Discover the latest trends and refresh your look.",
            cta: {
                text: promotion?.cta || "Shop Now",
                onClick: () => {
                    const query = promotion?.headline || 'deals';
                    setSearchQuery(query);
                    handleSearch(query);
                }
            }
        },
        {
            imageUrl: "https://images.unsplash.com/photo-1526178613552-2b45c6c302f0?q=80&w=2070&auto=format&fit=crop",
            headline: "Upgrade Your Tech",
            description: "Find the latest gadgets and electronics to power up your life.",
            cta: {
                text: "Explore Electronics",
                onClick: () => handleSearch("electronics")
            }
        },
        {
            imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop",
            headline: "For Every Moment",
            description: "From home goods to unique gifts, find exactly what you need.",
            cta: {
                text: "See All Products",
                onClick: () => clearSearch()
            }
        }
    ];

    if (isLoading) {
        return (
            <div className="text-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-text-secondary">Loading the store...</p>
            </div>
        );
    }
    
    if (error) {
        return <div className="text-center p-8 text-error bg-red-50 rounded-lg">{error}</div>;
    }

    return (
        <div className="space-y-12">
            <div className="mb-8">
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(searchQuery); }} className="relative max-w-2xl mx-auto">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <SearchIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for products..."
                        className="w-full p-4 pl-12 pr-24 bg-base-100 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow text-text-primary placeholder-text-secondary"
                        disabled={isSearching}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {searchQuery && !isSearching && (
                             <button
                                type="button"
                                onClick={clearSearch}
                                className="p-2 text-gray-400 hover:text-text-primary"
                                aria-label="Clear search"
                            >
                                <XIcon className="w-5 h-5" />
                            </button>
                        )}
                        {hasRecognitionSupport && (
                            <button
                                type="button"
                                onClick={startListening}
                                className={`p-2 rounded-full transition-colors ${isListening ? 'bg-error text-white animate-pulse' : 'text-gray-400 hover:text-text-primary'}`}
                                disabled={isSearching}
                                aria-label="Search with voice"
                            >
                                <MicrophoneIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </form>
            </div>
            {isSearching ? (
                 <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-text-secondary">Searching for "{searchQuery}"...</p>
                </div>
            ) : searchError ? (
                <div className="text-center p-8 text-error bg-red-50 rounded-lg">{searchError}</div>
            ) : displayedProducts.length === 0 && searchQuery ? (
                 <div className="text-center p-8 text-text-secondary bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-bold text-text-primary">No Results Found</h3>
                    <p className="mt-2">We couldn't find any products matching "{searchQuery}". Try a different search term.</p>
                </div>
            ) : (
                <>
                    {!searchQuery && (
                        <Carousel slides={carouselSlides} />
                    )}
                    
                    {bundle && !searchQuery && (
                         <div className="bg-base-100 rounded-lg p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 border-2 border-dashed border-primary">
                            <div className="flex-shrink-0">
                                 <SparklesIcon className="w-16 h-16 text-primary"/>
                            </div>
                            <div className="flex-grow text-center md:text-left">
                                <h2 className="text-2xl font-bold text-text-primary">{bundle.headline}</h2>
                                <p className="text-text-secondary mt-1">{bundle.description}</p>
                                <p className="mt-2">
                                    <span className="font-semibold">Bundle includes: </span>{bundle.products.join(', ')}
                                </p>
                            </div>
                            <div className="flex-shrink-0 bg-accent text-white font-bold py-2 px-4 rounded-md">
                                {bundle.offer}
                            </div>
                        </div>
                    )}

                    <div>
                        <h2 className="text-3xl font-extrabold text-text-primary mb-6">
                            {searchQuery ? `Results for "${searchQuery}"` : "Today's Deals"}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {displayedProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Home;