import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers3,
  BookOpen,
  Terminal,
  Share2,
  ChevronRight,
  Network,
  Code2,
  Radar,
  Crosshair,
  BrainCircuit,
  LockKeyhole,
  Award,
  ChevronDown,
  AlertCircle,
  RefreshCw,
  Heart,
  ShoppingCart
} from 'lucide-react';
import { apiRequest } from '../../api/client.js';
import { Badge } from '../ui/badge.jsx';
import { Button } from '../ui/button.jsx';
import { Tabs } from '../ui/tabs.jsx';
import { useWishlistCart } from '../../context/WishlistCartContext.jsx';

const iconMap = {
  'cyber-foundations': ShieldCheck,
  'network-linux': Network,
  'web-appsec': Code2,
  'bug-bounty': Radar,
  'red-team': Crosshair,
  'ai-security': BrainCircuit
};

export default function CourseDetailPage({
  courseSlug,
  onBack,
  onOpenPlatform,
  onInquireCohort
}) {
  const { isInWishlist, toggleWishlist, isInCart, addToCart, setIsCartOpen } = useWishlistCart();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'syllabus' | 'labs' | 'tools' | 'capstone'

  const [expandedModule, setExpandedModule] = useState('mod-1');
  const [copied, setCopied] = useState(false);
  const [track, setTrack] = useState(null);
  const [allTracks, setAllTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveTab('overview');
    setExpandedModule('mod-1');
    if (!courseSlug) return;

    setLoading(true);
    setError(null);

    apiRequest(`/courses/${courseSlug}`)
      .then((data) => {
        if (data?.course) {
          setTrack(data.course);
        } else {
          setError('Course curriculum not found in database.');
        }
      })
      .catch((err) => {
        setError(err.message || 'Unable to connect to course database.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [courseSlug]);

  useEffect(() => {
    apiRequest('/courses')
      .then((data) => {
        if (data?.courses && Array.isArray(data.courses)) {
          setAllTracks(data.courses);
        }
      })
      .catch(() => {});
  }, []);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="service-detail-root course-detail-root" style={{ minHeight: '80vh', padding: '120px 20px' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div className="skeleton-line" style={{ width: '220px', height: '24px', marginBottom: '32px' }} />
          <div className="skeleton-line" style={{ width: '85%', height: '48px', marginBottom: '20px' }} />
          <div className="skeleton-line" style={{ width: '100%', height: '20px', marginBottom: '12px' }} />
          <div className="skeleton-line" style={{ width: '90%', height: '20px', marginBottom: '36px' }} />
          <div className="skeleton-line" style={{ width: '100%', height: '350px' }} />
        </div>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="service-detail-root course-detail-root" style={{ minHeight: '80vh', padding: '120px 20px' }}>
        <div className="container" style={{ maxWidth: '700px', textAlign: 'center' }}>
          <div className="content-error-panel" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <AlertCircle size={36} className="error-icon" style={{ marginBottom: '16px' }} />
            <h3>Curriculum Specification Not Found</h3>
            <p style={{ maxWidth: '500px', margin: '0 auto 24px' }}>
              {error || `No published learning track exists matching slug: "${courseSlug}".`}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button type="button" className="btn btn-secondary" onClick={onBack}>
                <ArrowLeft size={15} /> All Learning Tracks
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={14} /> Reload
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const TrackIcon = iconMap[track.slug] || BookOpen;
  const modules = track.modules || [];
  const labs = track.labs || [];
  const tools = track.tools || [];
  const capstone = track.capstone || track.capstoneProject || null;
  const overview = track.overview || {};

  const tabsConfig = [
    { id: 'overview', label: 'Track Overview' },
    { id: 'syllabus', label: `Syllabus (${modules.length} Modules)` },
    { id: 'labs', label: `Hands-on Labs (${labs.length || track.labsCount || 0})` },
    { id: 'tools', label: 'Tools & Ecosystem' },
    { id: 'capstone', label: 'Capstone & Certification' }
  ];

  return (
    <div className="service-detail-root course-detail-root">
      {/* 1. Sticky Navigation Header */}
      <header className="service-detail-header">
        <div className="container service-detail-header-inner">
          <div className="service-header-left">
            <button
              type="button"
              className="btn-back-services"
              onClick={onBack}
              title="Return to all Academy learning tracks"
            >
              <ArrowLeft size={15} />
              <span>All Tracks</span>
            </button>
            <span className="header-divider">/</span>
            <span className="header-category-tag">{track.category}</span>
            <span className="header-divider">/</span>
            <span className="header-current-title">{track.title}</span>
          </div>

          <div className="service-header-right">
            <button
              type="button"
              className={`btn-spec-wishlist ${isInWishlist(track.slug) ? 'active' : ''}`}
              onClick={() => toggleWishlist({
                id: track.slug,
                slug: track.slug,
                title: track.title,
                level: track.level,
                duration: track.duration,
                category: track.category || 'ACADEMY',
                price: track.price || 199,
                type: 'course'
              })}
              title={isInWishlist(track.slug) ? "Remove from wishlist" : "Save to wishlist"}
            >
              <Heart
                size={14}
                fill={isInWishlist(track.slug) ? '#ff4d6d' : 'none'}
                stroke={isInWishlist(track.slug) ? '#ff4d6d' : 'currentColor'}
              />
              <span>{isInWishlist(track.slug) ? 'Saved' : 'Wishlist'}</span>
            </button>

            <button
              type="button"
              className={`btn-spec-cart ${isInCart(track.slug) ? 'active' : ''}`}
              onClick={() => {
                if (isInCart(track.slug)) {
                  setIsCartOpen(true);
                } else {
                  addToCart({
                    id: track.slug,
                    slug: track.slug,
                    title: track.title,
                    level: track.level,
                    duration: track.duration,
                    category: track.category || 'ACADEMY',
                    price: track.price || 199,
                    type: 'course'
                  });
                }
              }}
              title="Add track to enrollment cart"
            >
              <ShoppingCart size={14} />
              <span>{isInCart(track.slug) ? 'In Cart' : 'Enroll ($199)'}</span>
            </button>

            <button
              type="button"
              className="btn-share-spec"
              onClick={handleShare}
              title="Copy direct link to this curriculum specification"
            >
              <Share2 size={14} />
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Header Section */}
      <section className="service-hero-section">
        <div className="container">
          <div className="service-hero-grid">
            <div className="service-hero-main">
              <div className="service-hero-eyebrow">
                <span className="eyebrow-accent-dot" />
                <span>NEXGUARD ACADEMY</span>
                <span className="eyebrow-slash">·</span>
                <span>{track.category}</span>
                <span className="eyebrow-slash">·</span>
                <span className="mono">{track.level} LEVEL</span>
              </div>

              <h1 className="service-hero-title">{track.title}</h1>
              {track.heroSubtitle && (
                <p className="service-hero-tagline">{track.heroSubtitle}</p>
              )}
              <p className="service-hero-summary">{track.summary}</p>

              <div className="service-hero-ctas">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    addToCart({
                      id: track.slug,
                      slug: track.slug,
                      title: track.title,
                      level: track.level,
                      duration: track.duration,
                      category: track.category || 'ACADEMY',
                      price: track.price || 199,
                      type: 'course'
                    });
                  }}
                >
                  <ShoppingCart size={16} />
                  <span>{isInCart(track.slug) ? 'View in Cart ($199)' : 'Enroll in Track · $199'}</span>
                </Button>

                <button
                  type="button"
                  className={`btn btn-secondary ${isInWishlist(track.slug) ? 'btn-wishlist-active' : ''}`}
                  onClick={() => toggleWishlist({
                    id: track.slug,
                    slug: track.slug,
                    title: track.title,
                    level: track.level,
                    duration: track.duration,
                    category: track.category || 'ACADEMY',
                    price: track.price || 199,
                    type: 'course'
                  })}
                >
                  <Heart
                    size={15}
                    fill={isInWishlist(track.slug) ? '#ff4d6d' : 'none'}
                    stroke={isInWishlist(track.slug) ? '#ff4d6d' : 'currentColor'}
                  />
                  <span>{isInWishlist(track.slug) ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                </button>

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => onInquireCohort && onInquireCohort(track.title)}
                >
                  Inquire Team Cohort <ArrowUpRight size={14} />
                </button>
              </div>
            </div>

            {/* Quick Curriculum Specs Card */}
            <div className="service-hero-card">
              <div className="spec-card-header">
                <TrackIcon size={24} />
                <span>CURRICULUM SPECIFICATIONS</span>
              </div>
              <div className="spec-card-body">
                <div className="spec-row">
                  <span className="spec-label">Skill Level</span>
                  <span className="spec-val mono">
                    <Badge variant="cyber">{track.level}</Badge>
                  </span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Estimated Duration</span>
                  <span className="spec-val mono">{track.duration || 'Self-paced'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Curriculum Depth</span>
                  <span className="spec-val mono">
                    {modules.length || track.modulesCount || 4} Modules · {labs.length || track.labsCount || 3} Virtual Labs
                  </span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Capstone Lab</span>
                  <span className="spec-val mono">
                    {capstone ? 'Verified Certification Lab' : 'Standard Assessment'}
                  </span>
                </div>
              </div>

              {overview.highlights && overview.highlights.length > 0 && (
                <div className="spec-card-bullets">
                  {overview.highlights.map((h, i) => (
                    <div key={i} className="spec-bullet-item">
                      <CheckCircle2 size={13} />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tabbed Curriculum Explorer */}
      <section className="service-spec-section" id="curriculum-details">
        <div className="container">
          <div className="academy-spec-tabs-header">
            <Tabs
              tabs={tabsConfig}
              activeTab={activeTab}
              onChange={setActiveTab}
              size="md"
            />
          </div>

          <div className="spec-tab-content-area">
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="tab-pane tab-overview">
                {overview.description && (
                  <div className="threat-context-card">
                    <div className="threat-context-header">
                      <BookOpen size={18} />
                      <h3>Track Objectives & Target Competencies</h3>
                    </div>
                    <p>{overview.description}</p>
                  </div>
                )}

                <div className="course-overview-split-grid">
                  <div className="overview-subcard">
                    <h4 className="mono-label">TARGET AUDIENCE</h4>
                    <ul>
                      {(track.targetAudience || overview.targetAudience || [
                        'Security Analysts & SOC Engineers',
                        'Software Developers seeking practical AppSec mastery',
                        'System Administrators transitioning to Defensive Security'
                      ]).map((aud, aIdx) => (
                        <li key={aIdx}>
                          <CheckCircle2 size={14} />
                          <span>{aud}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="overview-subcard">
                    <h4 className="mono-label">PREREQUISITES</h4>
                    <ul>
                      {(track.prerequisites || overview.prerequisites || [
                        'Basic networking principles (TCP/IP, DNS, HTTP)',
                        'Familiarity with CLI environments (Linux / Terminal)',
                        'A dedicated web browser for remote sandbox access'
                      ]).map((pre, pIdx) => (
                        <li key={pIdx}>
                          <ChevronRight size={14} />
                          <span>{pre}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SYLLABUS */}
            {activeTab === 'syllabus' && (
              <div className="tab-pane tab-syllabus">
                <div className="syllabus-modules-flow">
                  {modules.map((mod, mIdx) => {
                    const modId = mod.id || `mod-${mIdx + 1}`;
                    const isExpanded = expandedModule === modId;

                    return (
                      <div
                        key={modId}
                        className={`syllabus-module-card ${isExpanded ? 'expanded' : ''}`}
                      >
                        <div
                          className="syllabus-module-header"
                          onClick={() => setExpandedModule(isExpanded ? null : modId)}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="module-title-group">
                            <span className="module-idx mono">
                              MODULE {String(mIdx + 1).padStart(2, '0')}
                            </span>
                            <h3>{mod.title}</h3>
                          </div>
                          <div className="module-meta-group">
                            <span className="module-duration mono">
                              <Clock size={13} /> {mod.duration || '2-3 Hours'}
                            </span>
                            <ChevronDown
                              size={18}
                              className={`chevron-icon ${isExpanded ? 'rotate' : ''}`}
                            />
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="syllabus-module-body">
                            {mod.summary && (
                              <p className="module-description">{mod.summary}</p>
                            )}

                            {mod.lessons && mod.lessons.length > 0 && (
                              <div className="module-lessons-list">
                                <h4 className="mono-sublabel">CURRICULUM LESSONS:</h4>
                                {mod.lessons.map((les, lIdx) => (
                                  <div key={lIdx} className="lesson-item-row">
                                    <span className="lesson-num mono">
                                      {mIdx + 1}.{lIdx + 1}
                                    </span>
                                    <div className="lesson-info">
                                      <span className="lesson-title">{les.title}</span>
                                      {les.topics && (
                                        <div className="lesson-topics-chips">
                                          {les.topics.map((top, tIdx) => (
                                            <span key={tIdx} className="topic-pill mono">
                                              {top}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {mod.labExercise && (
                              <div className="module-lab-highlight">
                                <Terminal size={15} />
                                <div>
                                  <span className="lab-tag mono">HANDS-ON SIMULATION:</span>
                                  <p>{mod.labExercise}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: LABS */}
            {activeTab === 'labs' && (
              <div className="tab-pane tab-labs">
                <div className="labs-grid">
                  {labs.map((lab, lIdx) => (
                    <div key={lIdx} className="interactive-lab-card">
                      <div className="lab-card-top">
                        <span className="lab-badge mono">VIRTUAL LAB 0{lIdx + 1}</span>
                        {lab.difficulty && (
                          <span className="lab-difficulty mono">{lab.difficulty}</span>
                        )}
                      </div>
                      <h3>{lab.title}</h3>
                      <p>{lab.objective || lab.description}</p>
                      {lab.tools && (
                        <div className="lab-tools-row">
                          <span className="tools-label mono">Stack:</span>
                          {lab.tools.map((tl, tIdx) => (
                            <span key={tIdx} className="lab-tool-chip mono">
                              {tl}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: TOOLS */}
            {activeTab === 'tools' && (
              <div className="tab-pane tab-tools">
                <div className="tools-mastered-grid">
                  {tools.map((tl, tIdx) => {
                    const toolName = typeof tl === 'string' ? tl : tl.name;
                    const toolDesc = typeof tl === 'object' ? tl.desc : null;

                    return (
                      <div key={tIdx} className="tool-card">
                        <Terminal size={18} />
                        <div>
                          <h4 className="mono">{toolName}</h4>
                          {toolDesc && <p>{toolDesc}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: CAPSTONE */}
            {activeTab === 'capstone' && capstone && (
              <div className="tab-pane tab-capstone">
                <div className="capstone-project-card">
                  <div className="capstone-header">
                    <Award size={24} />
                    <div>
                      <span className="capstone-badge mono">FINAL EVALUATION</span>
                      <h3>{capstone.title || 'Comprehensive Capstone Assessment'}</h3>
                    </div>
                  </div>
                  <p className="capstone-desc">
                    {capstone.description || capstone.summary}
                  </p>
                  {capstone.deliverables && (
                    <div className="capstone-deliverables-list">
                      <h4 className="mono-sublabel">REQUIRED DELIVERABLES:</h4>
                      <ul>
                        {capstone.deliverables.map((del, dIdx) => (
                          <li key={dIdx}>
                            <CheckCircle2 size={14} />
                            <span>{del}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Bottom Cohort Inquiry CTA */}
      <section className="service-scoping-cta">
        <div className="container">
          <div className="scoping-cta-box">
            <div>
              <h2>Train Your Engineering or Security Team</h2>
              <p>
                We offer private cohort schedules, custom lab environments, and instructor-led coaching for teams.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onInquireCohort && onInquireCohort(track.title)}
            >
              Inquire Team Training <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Connected Academy Tracks (from Database) */}
      {allTracks.length > 1 && (
        <section className="related-services-section">
          <div className="container">
            <div className="section-heading">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-line" /> CONNECTED CURRICULA
                </div>
                <h2>Explore Connected Learning Tracks</h2>
              </div>
              <p>
                Deepen your defensive and offensive cyber skills across our structured learning tracks.
              </p>
            </div>

            <div className="related-services-grid">
              {allTracks
                .filter((c) => c.slug !== track.slug)
                .map((c, index) => {
                  const OtherIcon = iconMap[c.slug] || BookOpen;
                  return (
                    <article
                      key={c.slug || index}
                      className="related-service-card"
                      onClick={() => {
                        window.location.hash = `#course/${c.slug}`;
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="related-card-top">
                        <span className="service-number">/0{index + 1}</span>
                        <OtherIcon size={20} />
                      </div>
                      <span className="card-tag">{c.category || 'TRACK'}</span>
                      <h3>{c.title}</h3>
                      <p>{c.summary}</p>
                      <span className="card-link">
                        View Curriculum <ArrowUpRight size={14} />
                      </span>
                    </article>
                  );
                })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
