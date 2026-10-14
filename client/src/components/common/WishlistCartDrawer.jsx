import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  ShoppingCart,
  Heart,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Check,
  Tag,
  CreditCard,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { useWishlistCart } from '../../context/WishlistCartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function WishlistCartDrawer({ onOpenPlatform, onOpenContact }) {
  const {
    wishlist,
    wishlistCount,
    removeFromWishlist,
    moveWishlistToCart,
    isWishlistOpen,
    setIsWishlistOpen,

    cart,
    cartCount,
    cartTotal,
    removeFromCart,
    clearCart,
    isCartOpen,
    setIsCartOpen
  } = useWishlistCart();

  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('cart'); // 'cart' | 'wishlist'
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Sync drawer tab with whichever was opened
  useEffect(() => {
    if (isWishlistOpen) {
      setActiveTab('wishlist');
    } else if (isCartOpen) {
      setActiveTab('cart');
    }
  }, [isWishlistOpen, isCartOpen]);

  const isOpen = isWishlistOpen || isCartOpen;

  const handleClose = () => {
    setIsWishlistOpen(false);
    setIsCartOpen(false);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const applyPromo = (e) => {
    e.preventDefault();
    const clean = promoCode.trim().toUpperCase();
    if (clean === 'OFFENSIVE20' || clean === 'NEXGUARD20' || clean === 'HACKER20') {
      setDiscountPercent(20);
      setPromoApplied(true);
      showToast('Promo code applied: 20% Discount unlocked!', 'success');
    } else if (clean === 'CYBER50') {
      setDiscountPercent(50);
      setPromoApplied(true);
      showToast('Masterclass Promo: 50% Enterprise Grant applied!', 'success');
    } else if (clean === '') {
      showToast('Please enter a coupon code.', 'error');
    } else {
      showToast('Invalid or expired coupon code.', 'error');
    }
  };

  const discountAmount = Math.round((cartTotal * discountPercent) / 100);
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      showToast('Enrollment order verified! Generating syllabus & lab access tokens...', 'success');
      clearCart();
      handleClose();

      // If user is logged in, offer to take them straight to the learning platform
      if (onOpenPlatform) {
        setTimeout(() => {
          onOpenPlatform();
        }, 600);
      } else {
        window.location.hash = '#platform';
      }
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={handleClose} aria-modal="true" role="dialog">
      <div
        className="drawer-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-tabs">
            <button
              type="button"
              className={`drawer-tab-btn ${activeTab === 'cart' ? 'active' : ''}`}
              onClick={() => setActiveTab('cart')}
            >
              <ShoppingCart size={16} />
              <span>Cart</span>
              <span className="drawer-badge">{cartCount}</span>
            </button>
            <button
              type="button"
              className={`drawer-tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('wishlist')}
            >
              <Heart size={16} />
              <span>Wishlist</span>
              <span className="drawer-badge">{wishlistCount}</span>
            </button>
          </div>

          <button
            type="button"
            className="drawer-close-btn"
            onClick={handleClose}
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="drawer-content">
          {activeTab === 'cart' ? (
            cart.length === 0 ? (
              <div className="drawer-empty-state">
                <div className="empty-icon-wrap">
                  <ShoppingCart size={36} />
                </div>
                <h3>Your Cart is Empty</h3>
                <p>
                  Explore our offensive security tracks and enterprise services to add specialized curriculum to your schedule.
                </p>
                <div className="empty-actions">
                  <a
                    href="#academy"
                    className="btn btn-primary btn-sm"
                    onClick={handleClose}
                  >
                    Browse Academy Tracks <ArrowRight size={14} />
                  </a>
                  <a
                    href="#services"
                    className="btn btn-secondary btn-sm"
                    onClick={handleClose}
                  >
                    Explore Services
                  </a>
                </div>
              </div>
            ) : (
              <div className="cart-list-view">
                <div className="cart-items-scroll">
                  {cart.map((item) => (
                    <div className="cart-item-card" key={item.id || item.slug}>
                      <div className="cart-item-header">
                        <div className="cart-item-type">
                          {item.type === 'service' ? (
                            <>
                              <ShieldCheck size={12} className="text-accent" />
                              <span>OFFENSIVE SERVICE</span>
                            </>
                          ) : (
                            <>
                              <GraduationCap size={12} className="text-accent" />
                              <span>ACADEMY TRACK</span>
                            </>
                          )}
                        </div>
                        <span className="cart-item-price">
                          ${item.price} <small>USD</small>
                        </span>
                      </div>

                      <h4 className="cart-item-title">{item.title}</h4>

                      <div className="cart-item-meta">
                        <span className="meta-pill">{item.level || 'Professional'}</span>
                        <span className="meta-pill">{item.duration || 'Self-paced'}</span>
                        <span className="meta-pill text-accent">{item.category || 'DEFENSIVE'}</span>
                      </div>

                      <div className="cart-item-footer">
                        <button
                          type="button"
                          className="cart-remove-btn"
                          onClick={() => removeFromCart(item.slug || item.id)}
                          title="Remove item"
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                        <a
                          href={item.type === 'service' ? `#service/${item.slug}` : `#course/${item.slug}`}
                          className="cart-view-link"
                          onClick={handleClose}
                        >
                          <span>Review details</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code Input */}
                <form className="drawer-promo-form" onSubmit={applyPromo}>
                  <div className="promo-input-wrap">
                    <Tag size={14} className="promo-icon" />
                    <input
                      type="text"
                      placeholder="Coupon: OFFENSIVE20"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={promoApplied}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-secondary btn-sm promo-apply-btn"
                    disabled={promoApplied || !promoCode.trim()}
                  >
                    {promoApplied ? <Check size={14} /> : 'Apply'}
                  </button>
                </form>

                {/* Pricing Summary */}
                <div className="drawer-summary">
                  <div className="summary-row">
                    <span>Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
                    <span>${cartTotal} USD</span>
                  </div>
                  {promoApplied && (
                    <div className="summary-row promo-discount-row">
                      <span>Discount ({discountPercent}%)</span>
                      <span>-${discountAmount} USD</span>
                    </div>
                  )}
                  <div className="summary-row">
                    <span>Access & Lab Environment</span>
                    <span className="text-accent">INCLUDED FREE</span>
                  </div>
                  <div className="summary-row summary-total-row">
                    <span>Total Due</span>
                    <span className="total-highlight">${finalTotal} USD</span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary btn-checkout-action"
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? (
                      <>
                        <Sparkles size={16} className="animate-spin" />
                        <span>Provisioning Seat...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} />
                        <span>Complete Enrollment (${finalTotal})</span>
                      </>
                    )}
                  </button>

                  <p className="checkout-guarantee">
                    <ShieldCheck size={13} /> 100% Verified curriculum with hands-on red team labs & lifetime updates.
                  </p>
                </div>
              </div>
            )
          ) : (
            /* Wishlist Tab */
            wishlist.length === 0 ? (
              <div className="drawer-empty-state">
                <div className="empty-icon-wrap">
                  <Heart size={36} />
                </div>
                <h3>Your Wishlist is Empty</h3>
                <p>
                  Save learning paths or security frameworks here by clicking the heart icon on any course card.
                </p>
                <a
                  href="#academy"
                  className="btn btn-primary btn-sm"
                  onClick={handleClose}
                >
                  Explore Course Catalog <ArrowRight size={14} />
                </a>
              </div>
            ) : (
              <div className="wishlist-list-view">
                <div className="cart-items-scroll">
                  {wishlist.map((item) => (
                    <div className="cart-item-card wishlist-item-card" key={item.id || item.slug}>
                      <div className="cart-item-header">
                        <div className="cart-item-type">
                          <GraduationCap size={12} className="text-accent" />
                          <span>LEARNING PATH</span>
                        </div>
                        <span className="cart-item-price">
                          ${item.price} <small>USD</small>
                        </span>
                      </div>

                      <h4 className="cart-item-title">{item.title}</h4>

                      <div className="cart-item-meta">
                        <span className="meta-pill">{item.level || 'Intermediate'}</span>
                        <span className="meta-pill">{item.duration || '4 weeks'}</span>
                        <span className="meta-pill text-accent">{item.category || 'ACADEMY'}</span>
                      </div>

                      <div className="wishlist-item-actions">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm move-cart-btn"
                          onClick={() => moveWishlistToCart(item)}
                        >
                          <ShoppingCart size={13} />
                          <span>Move to Cart</span>
                        </button>
                        <button
                          type="button"
                          className="cart-remove-btn"
                          onClick={() => removeFromWishlist(item.slug || item.id)}
                          title="Remove from wishlist"
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="wishlist-footer-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      wishlist.forEach(w => moveWishlistToCart(w));
                      setActiveTab('cart');
                    }}
                  >
                    Move All to Cart ({wishlistCount})
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
