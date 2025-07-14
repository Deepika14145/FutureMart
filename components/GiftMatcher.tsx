
import React from 'react';
import { Product } from '../types';
import { getGiftIdeas } from '../services/geminiService';
import ProductCard from './ProductCard';
import { GiftIcon, SparklesIcon } from './icons/Icons';

const GiftMatcher: React.FC = () => {
    const [recipientInfo, setRecipientInfo] = React.useState('');
    const [occasion, setOccasion] = React.useState('');
    const [budget, setBudget] = React.useState('');
    const [results, setResults] = React.useState<Product[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!recipientInfo || !occasion || !budget) {
            setError("Please fill out all fields to get the best suggestions.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setResults([]);
        try {
            const giftIdeas = await getGiftIdeas(recipientInfo, occasion, budget);
            setResults(giftIdeas);
        } catch (err: any) {
            setError(err.message || 'An error occurred while finding gifts.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClasses = "p-3 bg-neutral border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-accent focus:outline-none transition-shadow text-primary placeholder-secondary";
    const labelClasses = "block text-sm font-medium text-secondary mb-1";

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-base-100 p-8 rounded-lg shadow-sm mb-8">
                 <div className="text-center mb-6">
                    <GiftIcon className="w-12 h-12 mx-auto text-accent" />
                    <h2 className="mt-2 text-3xl font-extrabold text-primary">Smart Gift Matcher</h2>
                    <p className="mt-2 text-lg text-secondary">
                        Describe the person you're shopping for, and our AI will find the perfect gift.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="recipient" className={labelClasses}>Who is the gift for? (e.g., "My dad who loves fishing and sci-fi movies")</label>
                        <textarea
                            id="recipient"
                            value={recipientInfo}
                            onChange={(e) => setRecipientInfo(e.target.value)}
                            placeholder="Describe their interests, hobbies, and personality..."
                            className={inputClasses}
                            rows={3}
                            required
                        />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label htmlFor="occasion" className={labelClasses}>What's the occasion?</label>
                            <input
                                id="occasion"
                                type="text"
                                value={occasion}
                                onChange={(e) => setOccasion(e.target.value)}
                                placeholder="e.g., Birthday, Anniversary, Holiday"
                                className={inputClasses}
                                required
                            />
                        </div>
                        <div>
                           <label htmlFor="budget" className={labelClasses}>What's your budget?</label>
                            <input
                                id="budget"
                                type="text"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                placeholder="e.g., Around $50, under $200"
                                className={inputClasses}
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-4 bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-primary-focus transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Finding Gifts...</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-6 h-6" />
                                <span>Find Perfect Gifts</span>
                            </>
                        )}
                    </button>
                    {error && <p className="text-error mt-2 text-center">{error}</p>}
                </form>
            </div>

            {results.length > 0 && (
                 <div className="mt-8">
                    <h3 className="text-2xl font-bold mb-4 text-primary">
                        Here are some gift ideas for you!
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {results.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GiftMatcher;