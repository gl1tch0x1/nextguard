import React, { useState } from 'react';
import {
  GraduationCap,
  LockKeyhole,
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  ShieldCheck,
  Network,
  Code2,
  Radar,
  Crosshair,
  BrainCircuit,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Heart,
  ShoppingCart
} from 'lucide-react';
import { Tabs } from '../ui/tabs.jsx';
import { Badge } from '../ui/badge.jsx';
import { useWishlistCart } from '../../context/WishlistCartContext.jsx';

const iconMap = {
  'cyber-foundations': ShieldCheck,
  'network-linux': Network,
  'web-appsec': Code2,
  'bug-bounty': Radar,
  'red-team': Crosshair,
  'ai-security': BrainCircuit
};

export default function AcademySection({
  courses = [],
  loading = false,
  error = null,
  onRetry,
  onSelectCourse,
  onOpenPlatform
}) {
  const [filter, setFilter] = useState('All');
  const { isInWishlist, toggleWishlist, isInCart, addToCart } = useWishlistCart();


  const tabsConfig = [
    { id: 'All', label: 'All Tracks', count: courses.length },
    {
      id: 'Beginner',
      label: 'Foundations',
      count: courses.filter((c) => c.level === 'Beginner').length
    },
    {
      id: 'Intermediate',
      label: 'Specialist',
      count: courses.filter((c) => c.level === 'Intermediate').length
    },
    {
      id: 'Advanced',
      label: 'Advanced',
      count: courses.filter((c) => c.level === 'Advanced').length
    }
  ];

  const filteredCourses =
    filter === 'All' ? courses : courses.filter((c) => c.level === filter);

  return (
    <section className="academy section-pad" id="academy">
      <div className="container">
        <div className="section-heading academy-heading">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> THE ACADEMY / 03
            </div>
            <h2>
              Skills you can use.<br />
              <span>Not just watch.</span>
            </h2>
          </div>
          <div className="academy-intro">
            <p>
              Structured learning paths that move from fundamentals to practical application—with responsible AI as a learning partner, not a shortcut.
            </p>
            <a href="#contact" className="text-link">
              Ask about upcoming cohorts <ArrowRight size={15} />
            </a>
          </div>
        </div>

        {/* Toolbar with Filter Tabs */}
        <div className="course-toolbar">
          <div className="course-label">
            <GraduationCap size={17} /> LEARNING PATHS{' '}
            <span className="course-count">
              {filteredCourses.length.toString().padStart(2, '0')} TRACKS
            </span>
          </div>

          <div className="academy-tabs-wrap">
            <Tabs
              tabs={tabsConfig}
              activeTab={filter}
              onChange={setFilter}
              size="sm"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="courses-grid">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="course-card loading-skeleton-card" style={{ minHeight: '280px' }}>
                <div className="skeleton-line" style={{ width: '30%', height: '16px', marginBottom: '16px' }} />
                <div className="skeleton-line" style={{ width: '70%', height: '22px', marginBottom: '12px' }} />
                <div className="skeleton-line" style={{ width: '100%', height: '14px', marginBottom: '8px' }} />
                <div className="skeleton-line" style={{ width: '85%', height: '14px' }} />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="content-error-panel" role="alert">
            <AlertCircle size={22} className="error-icon" />
            <div className="error-body">
              <h4>Unable to load course tracks</h4>
              <p>{error}</p>
              {onRetry && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
                  <RefreshCw size={14} /> Retry Query
                </button>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && courses.length === 0 && (
          <div className="content-empty-panel">
            <GraduationCap size={28} />
            <p>No academy courses are currently published in the database.</p>
          </div>
        )}

        {/* Populated Courses Grid */}
        {!loading && !error && filteredCourses.length > 0 && (
          <div className="courses-grid">
            {filteredCourses.map((c, i) => {
              const Icon = iconMap[c.slug] || c.icon || BookOpen;
              const modulesCount = c.modulesCount || (c.modules?.length) || 4;
              const labsCount = c.labsCount || (c.labs?.length) || 3;
              const highlights = c.overview?.highlights || [];
              const tools = c.tools || [];

              return (
                <article className="course-card course-card-detailed" key={c.slug || c._id || i}>
                  <div className="course-card-top">
                    <span className="course-index">
                      TRACK / {(i + 1).toString().padStart(2, '0')}
                    </span>
                    <div className="course-card-top-controls">
                      <button
                        type="button"
                        className={`course-wishlist-toggle ${isInWishlist(c.slug || c._id) ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist({
                            id: c.slug || c._id,
                            slug: c.slug,
                            title: c.title,
                            level: c.level,
                            duration: c.duration,
                            category: c.category || 'ACADEMY',
                            price: c.price || 199,
                            type: 'course'
                          });
                        }}
                        title={isInWishlist(c.slug || c._id) ? "Remove from wishlist" : "Add to wishlist"}
                        aria-label="Wishlist toggle"
                      >
                        <Heart
                          size={15}
                          fill={isInWishlist(c.slug || c._id) ? '#ff4d6d' : 'none'}
                          stroke={isInWishlist(c.slug || c._id) ? '#ff4d6d' : 'currentColor'}
                        />
                      </button>
                      <div className="course-top-icon-wrap" title={c.title}>
                        <Icon size={18} />
                      </div>
                    </div>
                  </div>

                  <div className="course-category-row">
                    <Badge variant="cyber">{c.category || 'CYBER'}</Badge>
                    <span className="course-depth-indicator">
                      {modulesCount} Modules · {labsCount} Labs
                    </span>
                  </div>

                  <h3>{c.title}</h3>
                  <p className="course-summary-lead">{c.summary}</p>

                  {highlights.length > 0 && (
                    <div className="course-card-highlights">
                      {highlights.slice(0, 2).map((hl, hIdx) => (
                        <div className="course-card-hl-item" key={hIdx}>
                          <CheckCircle2 size={13} className="course-card-hl-icon" />
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {tools.length > 0 && (
                    <div className="course-card-tools">
                      <span className="course-tools-label">Stack:</span>
                      <div className="course-tools-chips">
                        {tools.slice(0, 3).map((tool, tIdx) => (
                          <span key={tIdx} className="course-tool-pill">
                            {tool}
                          </span>
                        ))}
                        {tools.length > 3 && (
                          <span className="course-tool-more">+{tools.length - 3}</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="course-meta">
                    <span>{c.level}</span>
                    <span>{c.duration}</span>
                  </div>

                  <div className="course-card-actions-bar">
                    <button
                      type="button"
                      className="course-link course-link-enhanced"
                      onClick={() => {
                        if (onSelectCourse) {
                          onSelectCourse(c.slug);
                        } else if (onOpenPlatform) {
                          onOpenPlatform(c);
                        }
                      }}
                    >
                      <span>Curriculum</span>
                      <ArrowUpRight size={15} />
                    </button>

                    <button
                      type="button"
                      className={`course-cart-action-btn ${isInCart(c.slug || c._id) ? 'in-cart' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart({
                          id: c.slug || c._id,
                          slug: c.slug,
                          title: c.title,
                          level: c.level,
                          duration: c.duration,
                          category: c.category || 'ACADEMY',
                          price: c.price || 199,
                          type: 'course'
                        });
                      }}
                      title={isInCart(c.slug || c._id) ? "In your enrollment cart" : "Add track to cart"}
                    >
                      <ShoppingCart size={14} />
                      <span>{isInCart(c.slug || c._id) ? 'In Cart' : '$199'}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="academy-footnote">
          <LockKeyhole size={14} /> Training is designed for authorized labs and responsible security practice.
        </div>
      </div>
    </section>
  );
}
