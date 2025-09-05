import React, { useState, useEffect, useRef } from 'react';

interface ImageCarouselProps {
  images: string[];
  productName: string;
  className?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, productName, className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const hasImages = images && images.length > 0;
  const hasMultipleImages = hasImages && images.length > 1;

  // Multiple images - full carousel functionality
  const nextImage = () => {
    if (hasImages) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (hasImages) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  // Touch handlers for swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  // Keyboard navigation - always call useEffect
  useEffect(() => {
    if (!hasMultipleImages) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      }
    };

    if (carouselRef.current) {
      carouselRef.current.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (carouselRef.current) {
        carouselRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [hasMultipleImages]);

  // Handle empty or no images
  if (!hasImages) {
    return (
      <div className={`aspect-square bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-slate-500">
          <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-medium">No Image Available</p>
        </div>
      </div>
    );
  }

  // Single image - simple display
  if (!hasMultipleImages) {
    return (
      <div className={`aspect-square overflow-hidden bg-white relative group ${className}`}>
        <img
          src={images[0]}
          alt={productName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/placeholder.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Image Display */}
      <div 
        ref={carouselRef}
        className="aspect-square overflow-hidden bg-white relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
        tabIndex={0}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        
        <img
          src={images[currentIndex]}
          alt={`${productName} - Image ${currentIndex + 1} of ${images.length}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/placeholder.jpg';
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Navigation Arrows */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-3 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Previous image"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-3 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Next image"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        {/* Image Counter */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {currentIndex + 1} of {images.length}
        </div>
        
        {/* Dot Indicators (Mobile) */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 md:hidden">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>
      
      {/* Thumbnail Navigation Strip (Desktop) */}
      <div className="hidden md:flex gap-3 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => goToImage(index)}
            className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
              currentIndex === index 
                ? 'border-primary-500 scale-110 shadow-lg' 
                : 'border-slate-200 hover:border-primary-300 hover:scale-105'
            }`}
            aria-label={`View image ${index + 1}`}
          >
            <img
              src={image}
              alt={`${productName} thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder.jpg';
              }}
            />
          </button>
        ))}
      </div>
      
      {/* Thumbnail Navigation Grid (Mobile) */}
      <div className="grid grid-cols-4 gap-2 md:hidden">
        {images.slice(0, 8).map((image, index) => (
          <button
            key={index}
            onClick={() => goToImage(index)}
            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 ${
              currentIndex === index 
                ? 'border-primary-500 scale-105' 
                : 'border-slate-200 hover:border-primary-300'
            }`}
            aria-label={`View image ${index + 1}`}
          >
            <img
              src={image}
              alt={`${productName} thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder.jpg';
              }}
            />
          </button>
        ))}
        {images.length > 8 && (
          <div className="aspect-square rounded-lg bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-500 text-xs font-medium">
            +{images.length - 8}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCarousel;