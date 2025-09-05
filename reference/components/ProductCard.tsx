import React, { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../services/firebase';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ product, onAddToCart }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const placeholderSvg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzE4My40IDE1MDE3MCA4NyAxNzAgODcgMjAwUzEwMy40IDI1MCA4NyAyNTBTMTcwIDI2NyAyMDAgMjY3UzI1MCAyNTAgMjUwIDIyMFMyMzMuNiAxNTAgMjAwIDE1MFoiIGZpbGw9IiNEMUQ1REIiLz4KPHBhdGggZD0iTTE3NSAxODBDMTc1IDE4NS41MjMgMTc5LjQ3NyAxOTAgMTg1IDE5MFMxOTUgMTg1LjUyMyAxOTUgMTgwUzE5MC41MjMgMTcwIDE4NSAxNzBTMTc1IDE3NC40NzcgMTc1IDE4MFoiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+';

  return (
    <div className="group bg-white shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-neutral-100 flex flex-col h-full" style={{borderRadius: '80px 0 80px 0'}}>
      <div className="aspect-square overflow-hidden bg-neutral-200 relative flex items-center justify-center">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-neutral-200 animate-pulse flex items-center justify-center">
            <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <img
          src={imageError ? placeholderSvg : (product.images?.[0] || placeholderSvg)}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-patrick-hand-sc text-lg font-semibold text-neutral-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-neutral-500 text-sm mb-4 line-clamp-2 flex-grow">
          {product.description}
        </p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            ${product.price}
          </span>
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
            USD
          </span>
        </div>
        <div className="flex space-x-3 mt-auto">
          <Link
            to={`/product/${product.id}`}
            className="flex-1 bg-gradient-to-r from-neutral-100 to-neutral-200 hover:from-neutral-200 hover:to-neutral-300 text-neutral-700 font-medium py-3 px-4 rounded-xl text-sm text-center transition-all duration-200"
          >
            View Details
          </Link>
          <button
            onClick={() => onAddToCart(product)}
            className="flex-1 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-medium py-3 px-4 rounded-xl text-sm transition-all duration-200"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;