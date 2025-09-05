import React, { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
    triggerOnce = true
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { elementRef, isVisible };
};

// Animation variants for different effects
export const animationVariants = {
  fadeIn: {
    initial: 'opacity-0 translate-y-8',
    animate: 'opacity-100 translate-y-0',
    transition: 'transition-all duration-700 ease-out'
  },
  fadeInUp: {
    initial: 'opacity-0 translate-y-12',
    animate: 'opacity-100 translate-y-0',
    transition: 'transition-all duration-800 ease-out'
  },
  fadeInLeft: {
    initial: 'opacity-0 -translate-x-12',
    animate: 'opacity-100 translate-x-0',
    transition: 'transition-all duration-700 ease-out'
  },
  fadeInRight: {
    initial: 'opacity-0 translate-x-12',
    animate: 'opacity-100 translate-x-0',
    transition: 'transition-all duration-700 ease-out'
  },
  scaleIn: {
    initial: 'opacity-0 scale-95',
    animate: 'opacity-100 scale-100',
    transition: 'transition-all duration-600 ease-out'
  },
  slideInUp: {
    initial: 'opacity-0 translate-y-16',
    animate: 'opacity-100 translate-y-0',
    transition: 'transition-all duration-900 ease-out'
  }
};

// Helper component for animated elements
export const AnimatedElement: React.FC<{
  children: React.ReactNode;
  variant?: keyof typeof animationVariants;
  delay?: number;
  className?: string;
  options?: UseScrollAnimationOptions;
}> = ({ 
  children, 
  variant = 'fadeIn', 
  delay = 0, 
  className = '',
  options = {} 
}) => {
  const { elementRef, isVisible } = useScrollAnimation(options);
  const animation = animationVariants[variant];

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={`
        ${animation.initial} 
        ${isVisible ? animation.animate : ''} 
        ${animation.transition} 
        ${className}
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};