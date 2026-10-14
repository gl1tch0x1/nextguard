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
  ShoppingCart,
  Check,
  Cpu,
  Server,
  FileCheck2,
  Sparkles,
  Users,
  Compass
} from 'lucide-react';
import { apiRequest } from '../../api/client.js';
import { Badge } from '../ui/badge.jsx';
import { Button } from '../ui/button.jsx';
import { Tabs } from '../ui/tabs.jsx';
import { useWishlistCart } from '../../context/WishlistCartContext.jsx';
import { LEARNING_DETAILS } from '../../data/learningDetails.js';

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

    const fallbackTrack = LEARNING_DETAILS[courseSlug] || null;

    apiRequest(`/courses/${courseSlug}`)
      .then((data) => {
        const remoteCourse = data?.course || {};
        if (remoteCourse.title || fallbackTrack) {
          const merged = {
            ...(fallbackTrack || {}),
            ...remoteCourse,
            overview: {
              ...(fallbackTrack?.overview || {}),
              ...(remoteCourse.overview || {})
            },
            modules: (remoteCourse.modules && remoteCourse.modules.length > 0)
              ? remoteCourse.modules
              : (fallbackTrack?.modules || []),
            tools: (remoteCourse.tools && remoteCourse.tools.length > 0)
              ? remoteCourse.tools
              : (fallbackTrack?.tools || []),
            capstone: remoteCourse.capstone || fallbackTrack?.capstone || null,
            targetAudience: remoteCourse.targetAudience || fallbackTrack?.targetAudience || null,
            prerequisites: remoteCourse.prerequisites || fallbackTrack?.prerequisites || null
          };
          setTrack(merged);
        } else {
          setError('Course curriculum not found in database.');
        }
      })
      .catch((err) => {
        if (fallbackTrack) {
          setTrack(fallbackTrack);
        } else {
          setError(err.message || 'Unable to connect to course database.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [courseSlug]);

  useEffect(() => {
    apiRequest('/courses')
      .then((data) => {
        if (data?.courses && Array.isArray(data.courses) && data.courses.length > 0) {
          setAllTracks(data.courses);
        } else {
          setAllTracks(Object.values(LEARNING_DETAILS));
        }
      })
      .catch(() => {
        setAllTracks(Object.values(LEARNING_DETAILS));
      });
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
      <div className="enterprise-spec-root academy-spec-root" style={{ minHeight: '80vh', padding: '100px 0' }}>
        <div className="spec-canvas-container" style={{ maxWidth: '900px' }}>
          <div className="skeleton-line" style={{ width: '220px', height: '20px', marginBottom: '28px' }} />
          <div className="skeleton-line" style={{ width: '80%', height: '42px', marginBottom: '18px' }} />
          <div className="skeleton-line" style={{ width: '100%', height: '18px', marginBottom: '12px' }} />
          <div className="skeleton-line" style={{ width: '88%', height: '18px', marginBottom: '32px' }} />
          <div className="skeleton-line" style={{ width: '100%', height: '320px', borderRadius: '10px' }} />
        </div>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="enterprise-spec-root academy-spec-root" style={{ minHeight: '80vh', padding: '100px 0' }}>
        <div className="spec-canvas-container" style={{ maxWidth: '640px', textAlign: 'center' }}>
          <div className="scoping-success-card" style={{ borderColor: 'rgba(255, 77, 109, 0.4)', background: 'rgba(255, 77, 109, 0.08)' }}>
            <AlertCircle size={36} color="#ff4d6d" style={{ marginBottom: '8px' }} />
            <h3>Curriculum Specification Not Found</h3>
            <p style={{ maxWidth: '480px', margin: '0 auto 20px', color: '#cbd5e1' }}>
              {error || `No published learning track exists matching slug: "${courseSlug}".`}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button type="button" className="spec-hero-secondary-btn" onClick={onBack}>
                <ArrowLeft size={14} /> All Learning Tracks
              </button>
              <button
                type="button"
                className="spec-hero-cta-btn"
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={13} /> Reload
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const TrackIcon = iconMap[track.slug] || BookOpen;
  const modules = track.modules || [];
  
  // Extract virtual labs if not explicitly defined
  const labs = (track.labs && track.labs.length > 0)
    ? track.labs
    : modules
        .filter((m) => m.labExercise)
        .map((m, idx) => ({
          title: typeof m.labExercise === 'object' ? m.labExercise.title : `Lab: ${m.title}`,
          objective: typeof m.labExercise === 'object' ? m.labExercise.description : (m.summary || m.labExercise),
          difficulty: track.level || 'Intermediate',
          topics: m.topics || [],
          duration: m.duration || '1 session'
        }));

  const tools = track.tools || [];
  const capstone = track.capstone || track.capstoneProject || null;
  const overview = track.overview || {};
  const philosophyText = overview.philosophy || overview.description || track.summary;
  const highlights = overview.highlights || [
    'Verifiable hands-on lab sandbox simulations on isolated targets',
    'Real-world offensive & defensive toolchains and frameworks',
    'Interactive knowledge check quizzes with instant remediation hints',
    'Verified completion certificate with cryptographic hash validation'
  ];

  const trackPrice = track.price || 199;
  const trackCartItem = {
    id: track.slug,
    slug: track.slug,
    title: track.title,
    level: track.level,
    duration: track.duration,
    category: track.category || 'ACADEMY',
    price: trackPrice,
    type: 'course'
  };

  const tabsConfig = [
    { id: 'overview', label: 'Track Overview' },
    { id: 'syllabus', label: `Syllabus (${modules.length} Modules)` },
    { id: 'labs', label: `Virtual Labs (${labs.length})` },
    { id: 'tools', label: `Tools (${tools.length})` },
    { id: 'capstone', label: 'Capstone & Certification' }
  ];

  return (
    <div className="enterprise-spec-root academy-spec-root">
      {/* Ambient Cyber Lighting Backdrops */}
      <div className="spec-ambient-glow glow-1" />
      <div className="spec-ambient-glow glow-2" />
      <div className="spec-cyber-grid-overlay" />

      {/* 1. Sticky Navigation Sub-Bar */}
      <header className="spec-sticky-navbar">
        <div className="spec-canvas-container spec-navbar-inner">
          <div className="spec-nav-breadcrumbs">
            <button
              type="button"
              className="spec-nav-back-btn"
              onClick={onBack}
              title="Return to Academy catalog"
            >
              <ArrowLeft size={13} />
              <span>Catalog</span>
            </button>
            <span className="spec-breadcrumb-slash">/</span>
            <span className="spec-breadcrumb-tag">{track.category || 'ACADEMY'}</span>
            <span className="spec-breadcrumb-slash">/</span>
            <span className="spec-breadcrumb-title">{track.title}</span>
          </div>

          <nav className="spec-nav-jump-links" aria-label="Curriculum Navigation">
            <button type="button" onClick={() => setActiveTab('overview')}>Overview</button>
            <button type="button" onClick={() => setActiveTab('syllabus')}>Syllabus</button>
            <button type="button" onClick={() => setActiveTab('labs')}>Labs ({labs.length})</button>
            <button type="button" onClick={() => setActiveTab('tools')}>Tools</button>
            <button type="button" onClick={() => setActiveTab('capstone')}>Certification</button>
          </nav>

          <div className="spec-nav-cta-group">
            <button
              type="button"
              className={`spec-share-btn ${isInWishlist(track.slug) ? 'active' : ''}`}
              onClick={() => toggleWishlist(trackCartItem)}
              title={isInWishlist(track.slug) ? 'Remove from wishlist' : 'Save to wishlist'}
              style={{
                color: isInWishlist(track.slug) ? '#ff4d6d' : undefined,
                borderColor: isInWishlist(track.slug) ? 'rgba(255, 77, 109, 0.4)' : undefined
              }}
            >
              <Heart
                size={13}
                fill={isInWishlist(track.slug) ? '#ff4d6d' : 'none'}
                stroke={isInWishlist(track.slug) ? '#ff4d6d' : 'currentColor'}
              />
              <span>{isInWishlist(track.slug) ? 'Saved' : 'Wishlist'}</span>
            </button>

            <button
              type="button"
              className="spec-share-btn"
              onClick={handleShare}
              title="Copy direct curriculum link"
            >
              {copied ? <Check size={13} color="#baff66" /> : <Share2 size={13} />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            <button
              type="button"
              className="spec-primary-action-btn"
              onClick={() => {
                if (isInCart(track.slug)) {
                  setIsCartOpen(true);
                } else {
                  addToCart(trackCartItem);
                }
              }}
            >
              <ShoppingCart size={13} />
              <span>{isInCart(track.slug) ? 'In Cart' : `Enroll ($${trackPrice})`}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Executive Hero Stage */}
      <section className="spec-hero-stage">
        <div className="spec-canvas-container spec-hero-grid">
          {/* Left Column: Title, Metadata, Stats, Action CTAs */}
          <div className="spec-hero-left">
            <div className="spec-meta-pills-row">
              <span className="spec-code-tag">ACADEMY-TRK</span>
              <span className="spec-category-tag">{track.category || 'CYBER ENGINEERING'}</span>
              <span className="spec-status-beacon">
                <span className="beacon-pulse" />
                {track.level?.toUpperCase() || 'INTERMEDIATE'} LEVEL
              </span>
            </div>

            <h1 className="spec-hero-main-title">{track.title}</h1>
            
            {track.heroSubtitle && (
              <p className="spec-hero-tagline-text">{track.heroSubtitle}</p>
            )}

            <p className="spec-hero-lead-summary">{track.summary}</p>

            {/* 4-Stat Curriculum Metric Bar */}
            <div className="spec-stats-bar">
              <div className="spec-stat-item">
                <span className="stat-value">{track.duration || 'Self-Paced'}</span>
                <span className="stat-label">Estimated Timeline</span>
              </div>
              <div className="spec-stat-divider" />
              <div className="spec-stat-item">
                <span className="stat-value">{modules.length || 4} Deep Modules</span>
                <span className="stat-label">Structured Syllabus</span>
              </div>
              <div className="spec-stat-divider" />
              <div className="spec-stat-item">
                <span className="stat-value">{labs.length} Virtual Sandboxes</span>
                <span className="stat-label">Hands-on CLI Labs</span>
              </div>
              <div className="spec-stat-divider" />
              <div className="spec-stat-item">
                <span className="stat-value" style={{ color: '#baff66' }}>Verified Credential</span>
                <span className="stat-label">Certification Lab</span>
              </div>
            </div>

            {/* Hero CTAs */}
            <div className="spec-hero-action-buttons">
              <Button
                variant="primary"
                size="md"
                className="spec-hero-cta-btn"
                onClick={() => {
                  if (isInCart(track.slug)) {
                    setIsCartOpen(true);
                  } else {
                    addToCart(trackCartItem);
                  }
                }}
              >
                <ShoppingCart size={14} />
                <span>{isInCart(track.slug) ? 'View in Cart · $199' : `Enroll in Track · $${trackPrice}`}</span>
              </Button>

              <button
                type="button"
                className="spec-hero-secondary-btn"
                style={{
                  color: isInWishlist(track.slug) ? '#ff4d6d' : undefined,
                  borderColor: isInWishlist(track.slug) ? 'rgba(255, 77, 109, 0.4)' : undefined
                }}
                onClick={() => toggleWishlist(trackCartItem)}
              >
                <Heart
                  size={14}
                  fill={isInWishlist(track.slug) ? '#ff4d6d' : 'none'}
                  stroke={isInWishlist(track.slug) ? '#ff4d6d' : 'currentColor'}
                />
                <span>{isInWishlist(track.slug) ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>

              <button
                type="button"
                className="spec-hero-secondary-btn"
                onClick={() => onInquireCohort && onInquireCohort(track.title)}
                title="Request team training cohort"
              >
                <span>Team Cohort</span>
                <ArrowUpRight size={13} />
              </button>
            </div>
          </div>

          {/* Right Column: Curriculum Specification Matrix Card */}
          <div className="spec-hero-right">
            <div className="spec-profile-card">
              <div className="profile-card-top">
                <div className="profile-icon-halo">
                  <TrackIcon size={20} />
                </div>
                <div>
                  <h3 className="profile-card-heading">CURRICULUM SPECIFICATION</h3>
                  <span className="profile-card-subheading">GOV & ENTERPRISE ACCREDITED</span>
                </div>
              </div>

              <div className="profile-spec-rows">
                <div className="profile-spec-row">
                  <span className="row-label">Skill Tier</span>
                  <span className="row-value">{track.level || 'Intermediate'}</span>
                </div>
                <div className="profile-spec-row">
                  <span className="row-label">Estimated Effort</span>
                  <span className="row-value">{track.duration || '5 Weeks (10 hrs/wk)'}</span>
                </div>
                <div className="profile-spec-row">
                  <span className="row-label">Lab Delivery</span>
                  <span className="row-value">{labs.length} Browser Sandbox Environments</span>
                </div>
                <div className="profile-spec-row">
                  <span className="row-label">Evaluation Mode</span>
                  <span className="row-value">{capstone ? 'Independent Capstone PoC' : 'Practical Examination'}</span>
                </div>
                <div className="profile-spec-row">
                  <span className="row-label">Access Model</span>
                  <span className="row-value">Lifetime Updates + Community</span>
                </div>
              </div>

              {/* Verified Learning Guarantees */}
              <div className="profile-card-deliverables-box">
                <span className="deliverables-box-title">VERIFIED TRACK OUTCOMES:</span>
                <div className="deliverables-checklist">
                  {highlights.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="deliv-check-item">
                      <CheckCircle2 size={13} color="#baff66" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="profile-card-book-btn"
                onClick={() => {
                  if (isInCart(track.slug)) {
                    setIsCartOpen(true);
                  } else {
                    addToCart(trackCartItem);
                  }
                }}
              >
                <ShoppingCart size={13} />
                <span>{isInCart(track.slug) ? 'View Cart to Checkout' : `Enroll Now · $${trackPrice}`}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Curriculum Explorer (Tabbed) */}
      <section className="spec-section-wrapper" id="curriculum-explorer">
        <div className="spec-canvas-container">
          <div className="spec-section-header">
            <div className="sec-eyebrow">
              <Compass size={13} />
              <span>SYLLABUS & LABORATORY MATRIX</span>
            </div>
            <h2>Comprehensive Technical Curriculum</h2>
            <p>
              Inspect the objective-driven modules, hands-on virtual sandbox environments, industry tooling ecosystem, and capstone certification requirements.
            </p>
          </div>

          {/* Segmented Tab Navigation Bar */}
          <div style={{ marginBottom: '28px' }}>
            <Tabs
              tabs={tabsConfig}
              activeTab={activeTab}
              onChange={setActiveTab}
              size="md"
            />
          </div>

          {/* Tab Panes */}
          <div className="spec-tab-pane-container">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="spec-tab-content-fade">
                {/* Track Philosophy & Objectives Card */}
                <div className="threat-context-wide-card" style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <BookOpen size={16} color="#baff66" />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#baff66', letterSpacing: '0.05em' }}>
                      TRACK OBJECTIVES & LEARNING PHILOSOPHY
                    </span>
                  </div>
                  <p className="threat-context-lead-text">{philosophyText}</p>

                  {/* Clean, Readable Bullet Points for Core Focus Areas */}
                  <div className="track-philosophy-highlights">
                    <span className="track-highlights-heading">
                      CORE CURRICULUM HIGHLIGHTS & DELIVERABLES:
                    </span>
                    <ul className="track-highlights-list">
                      {highlights.map((hl, hIdx) => {
                        const colonIdx = hl.indexOf(':');
                        const hasColon = colonIdx > -1 && colonIdx < 50;
                        const lead = hasColon ? hl.slice(0, colonIdx) : null;
                        const rest = hasColon ? hl.slice(colonIdx + 1).trim() : hl;

                        return (
                          <li key={hIdx} className="track-highlight-item">
                            <span className="track-highlight-bullet">
                              <CheckCircle2 size={15} color="#baff66" />
                            </span>
                            <div>
                              {lead ? (
                                <>
                                  <strong className="track-highlight-title">{lead}: </strong>
                                  <span className="track-highlight-body">{rest}</span>
                                </>
                              ) : (
                                <span className="track-highlight-body">{hl}</span>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                {/* Target Audience & Prerequisites Split Grid */}
                <div className="pillars-enterprise-grid">
                  <div className="pillar-enterprise-card">
                    <div className="pillar-card-top-bar">
                      <span className="pillar-num-badge">AUDIENCE</span>
                      <Users size={16} color="#baff66" />
                    </div>
                    <h3>Target Audience</h3>
                    <p className="pillar-lead-desc">
                      Engineered for practitioners who require verifiable offensive and defensive capabilities:
                    </p>
                    <div className="pillar-checklist-section">
                      <ul>
                        {(track.targetAudience ? [track.targetAudience] : [
                          'Security Analysts & SOC Engineers seeking hands-on adversary tradecraft',
                          'Software Engineers & DevOps Teams hardening production cloud pipelines',
                          'Security Consultants conducting comprehensive offensive assessments'
                        ]).map((aud, aIdx) => (
                          <li key={aIdx}>
                            <CheckCircle2 size={13} color="#baff66" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{aud}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pillar-enterprise-card">
                    <div className="pillar-card-top-bar">
                      <span className="pillar-num-badge">REQUIREMENTS</span>
                      <Cpu size={16} color="#baff66" />
                    </div>
                    <h3>Prerequisites & Environment</h3>
                    <p className="pillar-lead-desc">
                      Foundational knowledge recommended to maximize learning velocity in this track:
                    </p>
                    <div className="pillar-checklist-section">
                      <ul>
                        {(Array.isArray(track.prerequisites) ? track.prerequisites : [
                          'Basic networking fundamentals (TCP/IP, HTTP headers, DNS queries)',
                          'Familiarity with CLI environments and basic scripting (Python or Bash)',
                          'Standard modern web browser for remote virtual sandbox streaming'
                        ]).map((pre, pIdx) => (
                          <li key={pIdx}>
                            <ChevronRight size={13} color="#baff66" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{pre}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SYLLABUS */}
            {activeTab === 'syllabus' && (
              <div className="spec-tab-content-fade" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {modules.map((mod, mIdx) => {
                  const modId = mod.id || `mod-${mIdx + 1}`;
                  const isExpanded = expandedModule === modId;

                  return (
                    <div
                      key={modId}
                      style={{
                        background: isExpanded ? 'rgba(12, 17, 26, 0.95)' : 'rgba(10, 14, 22, 0.7)',
                        border: `1px solid ${isExpanded ? 'rgba(186, 255, 102, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                        borderRadius: '10px',
                        overflow: 'hidden',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div
                        onClick={() => setExpandedModule(isExpanded ? null : modId)}
                        role="button"
                        tabIndex={0}
                        style={{
                          padding: '16px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          userSelect: 'none',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono, monospace)',
                              fontSize: '11px',
                              fontWeight: 700,
                              color: isExpanded ? '#070a0e' : '#baff66',
                              background: isExpanded ? '#baff66' : 'rgba(186, 255, 102, 0.1)',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            MODULE 0{mIdx + 1}
                          </span>
                          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>
                            {mod.title}
                          </h4>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '11px',
                              color: '#94a3b8',
                              fontFamily: 'var(--font-mono, monospace)'
                            }}
                          >
                            <Clock size={12} />
                            {mod.duration || '1 Week'}
                          </span>
                          <ChevronDown
                            size={16}
                            color="#94a3b8"
                            style={{
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease'
                            }}
                          />
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          {mod.summary && (
                            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6, margin: '14px 0 16px 0' }}>
                              {mod.summary}
                            </p>
                          )}

                          {/* Lessons / Key Topics List */}
                          {((mod.topics && mod.topics.length > 0) || (mod.lessons && mod.lessons.length > 0)) && (
                            <div style={{ marginBottom: '16px' }}>
                              <span style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', marginBottom: '8px' }}>
                                KEY LEARNING TOPICS:
                              </span>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
                                {(mod.topics || mod.lessons.map(l => l.title)).map((topic, tIdx) => (
                                  <div
                                    key={tIdx}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'flex-start',
                                      gap: '8px',
                                      fontSize: '12px',
                                      color: '#e2e8f0',
                                      background: 'rgba(255, 255, 255, 0.03)',
                                      padding: '8px 12px',
                                      borderRadius: '6px',
                                      border: '1px solid rgba(255, 255, 255, 0.05)'
                                    }}
                                  >
                                    <span style={{ color: '#baff66', fontWeight: 700, fontSize: '11px', fontFamily: 'var(--font-mono, monospace)' }}>
                                      {mIdx + 1}.{tIdx + 1}
                                    </span>
                                    <span>{topic}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Hands-on Lab Simulation Challenge */}
                          {mod.labExercise && (
                            <div
                              style={{
                                background: 'rgba(186, 255, 102, 0.04)',
                                border: '1px solid rgba(186, 255, 102, 0.2)',
                                borderRadius: '8px',
                                padding: '12px 16px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px'
                              }}
                            >
                              <Terminal size={16} color="#baff66" style={{ flexShrink: 0, marginTop: '2px' }} />
                              <div>
                                <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#baff66', letterSpacing: '0.05em', marginBottom: '2px' }}>
                                  HANDS-ON SIMULATION:
                                </span>
                                <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#f1f5f9', display: 'block' }}>
                                  {typeof mod.labExercise === 'object' ? mod.labExercise.title : 'Practical Lab Challenge'}
                                </span>
                                {typeof mod.labExercise === 'object' && mod.labExercise.description && (
                                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                                    {mod.labExercise.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 3: VIRTUAL LABS */}
            {activeTab === 'labs' && (
              <div className="spec-tab-content-fade">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                  {labs.map((lab, lIdx) => (
                    <div key={lIdx} className="spec-lab-card">
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#baff66', background: 'rgba(186, 255, 102, 0.1)', border: '1px solid rgba(186, 255, 102, 0.25)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono, monospace)' }}>
                            VIRTUAL LAB 0{lIdx + 1}
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}>
                            {lab.difficulty || 'Intermediate'}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                          {lab.title}
                        </h4>
                        <p style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                          {lab.objective}
                        </p>

                        {/* Hands-on Simulation Topics in Clean Bullet Points */}
                        {lab.topics && lab.topics.length > 0 && (
                          <div className="spec-lab-focus-box">
                            <span className="spec-lab-focus-title">
                              HANDS-ON SIMULATION OBJECTIVES:
                            </span>
                            <ul className="spec-lab-bullet-list">
                              {lab.topics.map((topic, tIdx) => {
                                const colonIdx = topic.indexOf(':');
                                const hasColon = colonIdx > -1 && colonIdx < 45;
                                const tTitle = hasColon ? topic.slice(0, colonIdx) : null;
                                const tDesc = hasColon ? topic.slice(colonIdx + 1).trim() : topic;

                                return (
                                  <li key={tIdx} className="spec-lab-bullet-item">
                                    <span className="spec-lab-bullet-dot" />
                                    <div>
                                      {tTitle ? (
                                        <>
                                          <strong className="spec-lab-bullet-strong">{tTitle}: </strong>
                                          <span className="spec-lab-bullet-desc">{tDesc}</span>
                                        </>
                                      ) : (
                                        <span className="spec-lab-bullet-desc">{topic}</span>
                                      )}
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Tooling Environment Micro-Pills */}
                      {tools && tools.length > 0 && (
                        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                            Environment:
                          </span>
                          {tools.slice(0, 3).map((tl, tIdx) => {
                            const name = typeof tl === 'string' ? tl : tl.name;
                            return (
                              <span
                                key={tIdx}
                                style={{
                                  fontSize: '10px',
                                  fontFamily: 'var(--font-mono, monospace)',
                                  color: '#baff66',
                                  background: 'rgba(186, 255, 102, 0.06)',
                                  border: '1px solid rgba(186, 255, 102, 0.16)',
                                  padding: '2px 7px',
                                  borderRadius: '4px'
                                }}
                              >
                                {name}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: TOOLS & ECOSYSTEM */}
            {activeTab === 'tools' && (
              <div className="spec-tab-content-fade">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  {tools.map((tl, tIdx) => {
                    const toolName = typeof tl === 'string' ? tl : tl.name;
                    const toolDesc = typeof tl === 'object' ? tl.desc : 'Industrial standard cybersecurity utility integrated into curriculum sandboxes.';

                    return (
                      <div
                        key={tIdx}
                        style={{
                          background: 'rgba(12, 17, 26, 0.88)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '8px',
                          padding: '16px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            background: 'rgba(186, 255, 102, 0.1)',
                            border: '1px solid rgba(186, 255, 102, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#baff66',
                            flexShrink: 0
                          }}
                        >
                          <Terminal size={15} />
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 700, color: '#f1f5f9', fontFamily: 'var(--font-mono, monospace)' }}>
                            {toolName}
                          </h4>
                          <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8', lineHeight: 1.45 }}>
                            {toolDesc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: CAPSTONE & CERTIFICATION */}
            {activeTab === 'capstone' && capstone && (
              <div className="spec-tab-content-fade">
                <div className="poc-dossier-card">
                  <div className="dossier-badges-row">
                    <span className="dossier-severity-badge" style={{ color: '#baff66', background: 'rgba(186, 255, 102, 0.1)', borderColor: 'rgba(186, 255, 102, 0.3)' }}>
                      <Award size={13} />
                      FINAL VERIFICATION ASSESSMENT
                    </span>
                    <span className="dossier-cwe-badge">NIST AI RMF · OWASP CERTIFIED</span>
                  </div>

                  <h3 className="dossier-title">{capstone.title || 'Comprehensive Capstone Assessment'}</h3>

                  <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                    {capstone.description || capstone.summary || 'Execute an end-to-end objective simulation against an enterprise target infrastructure to demonstrate verifiable mastery before certificate issuance.'}
                  </p>

                  {/* Required Capstone Deliverables */}
                  {capstone.deliverables && (
                    <div style={{ background: 'rgba(7, 10, 15, 0.65)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '16px' }}>
                      <span style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', marginBottom: '10px' }}>
                        REQUIRED EVALUATION DELIVERABLES:
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {capstone.deliverables.map((deliv, dIdx) => (
                          <div key={dIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#e2e8f0' }}>
                            <CheckCircle2 size={13} color="#baff66" style={{ flexShrink: 0 }} />
                            <span>{deliv}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certificate Preview Card */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(16, 24, 36, 0.95) 0%, rgba(9, 13, 20, 0.98) 100%)',
                      border: '1px solid rgba(186, 255, 102, 0.3)',
                      borderRadius: '8px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: 'rgba(186, 255, 102, 0.1)',
                          border: '1px solid rgba(186, 255, 102, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#baff66'
                        }}
                      >
                        <FileCheck2 size={20} />
                      </div>
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', display: 'block' }}>
                          Nexguard Certified Security Specialist (NCSS)
                        </span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          Cryptographically signed digital credential with public verification link
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#baff66',
                          background: 'rgba(186, 255, 102, 0.08)',
                          border: '1px solid rgba(186, 255, 102, 0.2)',
                          padding: '4px 10px',
                          borderRadius: '4px'
                        }}
                      >
                        30 CPE CREDITS
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Enterprise Team Training Scoping Banner */}
      <section className="spec-section-wrapper spec-section-darker">
        <div className="spec-canvas-container">
          <div className="spec-scoping-banner-box">
            <div className="banner-left-info">
              <span className="banner-badge">ENTERPRISE TEAM UPSKILLING</span>
              <h2>Train Your Engineering or Security Cohort</h2>
              <p>
                We offer dedicated corporate cohort schedules, custom virtual sandbox topologies, and instructor-led coaching tailored to your organization’s tech stack.
              </p>
              <div className="banner-assurance-list">
                <div className="assurance-bullet">
                  <CheckCircle2 size={14} color="#baff66" />
                  <span>Dedicated private sandbox instances with custom corporate IP whitelisting</span>
                </div>
                <div className="assurance-bullet">
                  <CheckCircle2 size={14} color="#baff66" />
                  <span>Live debrief workshops led by offensive security research fellows</span>
                </div>
                <div className="assurance-bullet">
                  <CheckCircle2 size={14} color="#baff66" />
                  <span>Executive skill telemetry and competency progress dashboard</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(186, 255, 102, 0.1)', border: '1px solid rgba(186, 255, 102, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#baff66' }}>
                <Users size={22} />
              </div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#f1f5f9' }}>
                Cohort Sizing: 5 - 50 Seats
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', maxWidth: '280px' }}>
                Volume enrollment discounts and customized lab scopes available on request.
              </p>
              <button
                type="button"
                className="spec-hero-cta-btn"
                style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
                onClick={() => onInquireCohort && onInquireCohort(track.title)}
              >
                <span>Inquire Corporate Training</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Connected Curricula Section */}
      {allTracks.length > 1 && (
        <section className="spec-section-wrapper">
          <div className="spec-canvas-container">
            <div className="spec-section-header">
              <div className="sec-eyebrow">
                <Compass size={13} />
                <span>CONNECTED CURRICULA</span>
              </div>
              <h2>Explore Related Learning Tracks</h2>
              <p>
                Deepen your defensive and offensive cyber tradecraft across our specialized professional learning pathways.
              </p>
            </div>

            <div className="deliverables-four-grid">
              {allTracks
                .filter((c) => c.slug !== track.slug)
                .slice(0, 4)
                .map((c, index) => {
                  const OtherIcon = iconMap[c.slug] || BookOpen;
                  return (
                    <div
                      key={c.slug || index}
                      className="deliverable-quad-card"
                      onClick={() => {
                        window.location.hash = `#course/${c.slug}`;
                      }}
                      role="button"
                      tabIndex={0}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="quad-top-meta">
                        <span className="quad-num">TRACK 0{index + 1}</span>
                        <OtherIcon size={16} color="#baff66" />
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#baff66', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {c.category || 'ACADEMY'}
                      </span>
                      <h4>{c.title}</h4>
                      <p>{c.summary}</p>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', fontWeight: 600, color: '#baff66', marginTop: 'auto' }}>
                        View Curriculum <ArrowUpRight size={13} />
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
