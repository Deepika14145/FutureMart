
import React from 'react';
import { Product } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { HeartIcon, ShoppingCartIcon, CheckIcon } from './icons/Icons';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { viewProduct } = useAppContext();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [imgError, setImgError] = React.useState(false);
  const [isAdded, setIsAdded] = React.useState(false);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => {
        setIsAdded(false);
    }, 2000);
  }

  const handleCardClick = () => {
    viewProduct(product);
  };

  return (
    <div
      className="bg-base-100 rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ease-in-out flex flex-col group cursor-pointer border border-transparent hover:shadow-xl hover:border-gray-200"
      aria-label={`View details for ${product.name}`}
      onClick={handleCardClick}
    >
      <div className="w-full h-48 bg-gray-200 relative">
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center bg-neutral text-text-secondary text-sm">
            Image not available
          </div>
        ) : (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 p-2 bg-white/70 rounded-full text-text-secondary hover:text-error transition-colors"
          aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <HeartIcon className="w-6 h-6" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
        </button>
        {product.discountPercentage && (
            <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold py-1 px-2 rounded">
                SAVE {product.discountPercentage}%
            </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-text-primary truncate group-hover:text-primary transition-colors" title={product.name}>{product.name}</h3>
        <p className="text-sm text-text-secondary mt-1 flex-grow line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-text-primary">{product.price}</span>
            {product.originalPrice && (
                <span className="text-gray-500 line-through">{product.originalPrice}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isAdded}
            className={`font-semibold py-2 px-4 rounded-full transition-colors duration-300 flex items-center justify-center gap-2 ${
                isAdded 
                ? 'bg-success text-white cursor-not-allowed' 
                : 'bg-primary text-white hover:bg-primary-focus'
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            {isAdded ? (
                <>
                    <CheckIcon className="w-5 h-5" />
                    <span>Added</span>
                </>
            ) : (
                <>
                    <ShoppingCartIcon className="w-5 h-5" />
                    <span>Add</span>
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;