import React, { useState, useEffect } from 'react';
import { ShieldCheck, Menu, X, ArrowUpRight, User, Heart, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useWishlistCart } from '../../context/WishlistCartContext.jsx';
import GlitchHover from './GlitchHover.jsx';

export default function Navbar({ onOpenPlatform }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const { wishlistCount, setIsWishlistOpen, cartCount, setIsCartOpen } = useWishlistCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const navLinks = [
    ['Services', '#services'],
    ['Academy', '#academy'],
    ['Research', '#research'],
    ['About', '#approach']
  ];

  return (
    <>
      <div className="announcement">
        <span className="pulse-dot" /> SECURITY BUILT FOR THE REAL WORLD{' '}
        <span className="announcement-divider">/</span> ETHICAL BY DESIGN{' '}
        <ArrowUpRight size={13} />
      </div>

      <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
        <div className="container nav-wrap">
          <a className="brand" href="#home" aria-label="Nexguard home">
            <GlitchHover as="span" style={{ display: 'inline-flex' }}>
              <span className="brand-mark">
                <ShieldCheck size={22} />
              </span>
            </GlitchHover>
            <span>
              NEXGUARD<span className="brand-dot">.</span>
              <small>SECURITY / ENGINEERING</small>
            </span>
          </a>

          <nav className={menuOpen ? 'nav nav-open' : 'nav'}>
            {navLinks.map(([title, href]) => (
              <a key={title} href={href} onClick={() => setMenuOpen(false)}>
                {title}
              </a>
            ))}

            {/* Quick Action Icons: Wishlist & Cart */}
            <div className="nav-shop-actions">
              <button
                type="button"
                className="nav-icon-btn"
                onClick={() => {
                  setMenuOpen(false);
                  setIsWishlistOpen(true);
                }}
                title="View Saved Wishlist"
                aria-label={`Wishlist with ${wishlistCount} items`}
              >
                <Heart size={16} />
                {wishlistCount > 0 && (
                  <span className="nav-icon-badge nav-icon-badge-wishlist">{wishlistCount}</span>
                )}
              </button>

              <button
                type="button"
                className="nav-icon-btn"
                onClick={() => {
                  setMenuOpen(false);
                  setIsCartOpen(true);
                }}
                title="View Enrollment Cart"
                aria-label={`Shopping cart with ${cartCount} items`}
              >
                <ShoppingCart size={16} />
                {cartCount > 0 && (
                  <span className="nav-icon-badge">{cartCount}</span>
                )}
              </button>
            </div>

            <button
              className="nav-platform"
              onClick={() => {
                setMenuOpen(false);
                onOpenPlatform();
              }}
            >
              {user ? (
                <>
                  <User size={14} />
                  <span>{user.name.split(' ')[0]}</span>
                  <small className="nav-role-badge">{user.role}</small>
                </>
              ) : (
                <>
                  Platform <ArrowUpRight size={14} />
                </>
              )}
            </button>

            <a href="#contact" className="nav-contact" onClick={() => setMenuOpen(false)}>
              Let’s talk <ArrowUpRight size={14} />
            </a>
          </nav>

          <div className="nav-mobile-right">
            <button
              type="button"
              className="nav-icon-btn mobile-icon-btn"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Cart with ${cartCount} items`}
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="nav-icon-badge">{cartCount}</span>
              )}
            </button>

            <button
              className="mobile-toggle"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

