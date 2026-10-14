import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext.jsx';

const WishlistCartContext = createContext(null);

export function WishlistCartProvider({ children }) {
  const { showToast } = useToast();

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('nexguard_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('nexguard_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('nexguard_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Failed to save wishlist to localStorage', e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('nexguard_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Wishlist actions
  const isInWishlist = (idOrSlug) => {
    if (!idOrSlug) return false;
    return wishlist.some(item => item.slug === idOrSlug || item.id === idOrSlug || item._id === idOrSlug);
  };

  const addToWishlist = (item) => {
    if (!item) return;
    const identifier = item.slug || item.id || item._id;
    if (isInWishlist(identifier)) return;

    const newItem = {
      id: identifier,
      slug: item.slug || identifier,
      title: item.title,
      level: item.level || 'Intermediate',
      duration: item.duration || '4 weeks',
      category: item.category || 'ACADEMY',
      price: item.price || 199,
      type: item.type || 'course'
    };

    setWishlist(prev => [...prev, newItem]);
    showToast(`Added "${item.title}" to your wishlist.`, 'success');
  };

  const removeFromWishlist = (idOrSlug) => {
    setWishlist(prev => prev.filter(item => item.slug !== idOrSlug && item.id !== idOrSlug && item._id !== idOrSlug));
    showToast('Removed from wishlist.', 'info');
  };

  const toggleWishlist = (item) => {
    if (!item) return;
    const identifier = item.slug || item.id || item._id;
    if (isInWishlist(identifier)) {
      removeFromWishlist(identifier);
    } else {
      addToWishlist(item);
    }
  };

  // Cart actions
  const isInCart = (idOrSlug) => {
    if (!idOrSlug) return false;
    return cart.some(item => item.slug === idOrSlug || item.id === idOrSlug || item._id === idOrSlug);
  };

  const addToCart = (item) => {
    if (!item) return;
    const identifier = item.slug || item.id || item._id;
    if (isInCart(identifier)) {
      showToast(`"${item.title}" is already in your cart.`, 'info');
      setIsCartOpen(true);
      return;
    }

    const newItem = {
      id: identifier,
      slug: item.slug || identifier,
      title: item.title,
      category: item.category || 'ACADEMY',
      level: item.level || 'All Levels',
      duration: item.duration || 'Self-paced',
      price: item.price !== undefined ? item.price : 199,
      type: item.type || (item.slug?.includes('pentest') || item.category?.includes('Security') ? 'service' : 'course')
    };

    setCart(prev => [...prev, newItem]);
    showToast(`Added "${item.title}" to your cart.`, 'success');
    setIsCartOpen(true);
  };

  const removeFromCart = (idOrSlug) => {
    setCart(prev => prev.filter(item => item.slug !== idOrSlug && item.id !== idOrSlug && item._id !== idOrSlug));
    showToast('Removed item from cart.', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const moveWishlistToCart = (item) => {
    removeFromWishlist(item.slug || item.id);
    addToCart(item);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  return (
    <WishlistCartContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isWishlistOpen,
        setIsWishlistOpen,

        cart,
        cartCount: cart.length,
        cartTotal,
        isInCart,
        addToCart,
        removeFromCart,
        clearCart,
        moveWishlistToCart,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </WishlistCartContext.Provider>
  );
}

export function useWishlistCart() {
  const context = useContext(WishlistCartContext);
  if (!context) {
    throw new Error('useWishlistCart must be used within a WishlistCartProvider');
  }
  return context;
}
