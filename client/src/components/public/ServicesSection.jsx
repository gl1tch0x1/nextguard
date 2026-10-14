import React, { useState, useMemo } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  ShieldCheck,
  ScanSearch,
  Crosshair,
  Code2,
  Network,
  BrainCircuit,
  AlertCircle,
  RefreshCw,
  Search,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  Send
} from 'lucide-react';
import { Tabs } from '../ui/tabs.jsx';
import { Badge } from '../ui/badge.jsx';
import { SERVICE_DETAILS } from '../../data/serviceDetails.js';

const iconMap = {
  'ai-security-automation': BrainCircuit,
  'networking-cloud-infrastructure': Network,
  'red-team-adversary-simulation': Crosshair,
  'secure-web-api-engineering': Code2,
  'security-audits-appsec': ShieldCheck,
  'vulnerability-assessment-pentesting': ScanSearch
};

export default function ServicesSection({
  services = [],
  loading = false,
  error = null,
  onRetry,
  onSelectService
}) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Enrich services with SERVICE_DETAILS static metadata
  const enrichedServices = useMemo(() => {
    return services.map((s, idx) => {
      const detail = SERVICE_DETAILS[s.slug] || {};
      const num = detail.number || s.number || s.n || String(idx + 1).padStart(2, '0');
      return {
        ...s,
        number: num,
        code: `SEC-${num}`,
        tagline: detail.tagline || s.tagline || 'Enterprise Cybersecurity & Verified Defensive Engineering',
        duration: detail.duration || '2 – 4 Weeks',
        assessmentType: detail.assessmentType || 'Manual & Automated Emulation',
        compliance: detail.compliance || 'OWASP · MITRE ATT&CK · NIST CSF',
        clearance: detail.clearance || 'Strict NDA · Secure Vault Delivery',
        bullets: detail.bullets || s.bullets || s.items || [],
        categoryGroup: getCategoryGroup(s.slug, s.category)
      };
    });
  }, [services]);

  function getCategoryGroup(slug, cat) {
    const text = `${slug || ''} ${cat || ''}`.toLowerCase();
    if (text.includes('red-team') || text.includes('pentest') || text.includes('vulnerability')) {
      return 'OFFENSIVE';
    }
    if (text.includes('network') || text.includes('cloud') || text.includes('infra')) {
      return 'CLOUD_INFRA';
    }
    if (text.includes('ai') || text.includes('automation') || text.includes('intelligent')) {
      return 'AI_SECOPS';
    }
    if (text.includes('appsec') || text.includes('api') || text.includes('audit')) {
      return 'APPSEC';
    }
    return 'OFFENSIVE';
  }

  // Filter tabs
  const categoryTabs = [
    { id: 'ALL', label: 'All Capabilities', count: enrichedServices.length },
    {
      id: 'OFFENSIVE',
      label: 'Offensive & Red Team',
      count: enrichedServices.filter((s) => s.categoryGroup === 'OFFENSIVE').length
    },
    {
      id: 'CLOUD_INFRA',
      label: 'Cloud & Infrastructure',
      count: enrichedServices.filter((s) => s.categoryGroup === 'CLOUD_INFRA').length
    },
    {
      id: 'APPSEC',
      label: 'AppSec & APIs',
      count: enrichedServices.filter((s) => s.categoryGroup === 'APPSEC').length
    },
    {
      id: 'AI_SECOPS',
      label: 'AI & SecOps',
      count: enrichedServices.filter((s) => s.categoryGroup === 'AI_SECOPS').length
    }
  ];

  // Filtered and searched services
  const displayedServices = useMemo(() => {
    return enrichedServices.filter((s) => {
      const matchesCategory =
        activeCategory === 'ALL' || s.categoryGroup === activeCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.summary?.toLowerCase().includes(q) ||
        s.tagline?.toLowerCase().includes(q) ||
        s.bullets?.some((b) => b.toLowerCase().includes(q))
      );
    });
  }, [enrichedServices, activeCategory, searchQuery]);

  const handleCardClick = (slug) => {
    if (onSelectService) {
      onSelectService(slug);
    } else {
      window.location.hash = `#service/${slug}`;
    }
  };

  const handleDirectScope = (e, title) => {
    e.stopPropagation();
    window.location.hash = '#contact';
    setTimeout(() => {
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  return (
    <section className="services-section-redesigned section-pad" id="services">
      <div className="container">
        {/* Modern Section Header */}
        <div className="services-header-modern">
          <div className="services-header-left">
            <div className="eyebrow">
              <span className="eyebrow-line" /> CORE SECURITY CAPABILITIES / 01
            </div>
            <h2 className="services-section-title">
              Offensive Adversary Emulation.<br />
              <span>Hardened Defensive Engineering.</span>
            </h2>
          </div>
          <div className="services-header-right">
            <p className="services-header-desc">
              Every engagement pairs deep manual exploitation with deterministic remediation guidelines. From sovereign AI deployments to Kubernetes attack-chain simulations, we test like realistic adversaries.
            </p>
            <div className="services-trust-indicators">
              <span className="trust-pill"><ShieldCheck size={13} /> CREST & OSCP Verified</span>
              <span className="trust-pill"><Sparkles size={13} /> Zero-Retention Testing</span>
              <span className="trust-pill"><Clock size={13} /> 48h Executive Debrief</span>
            </div>
          </div>
        </div>

        {/* Interactive Filter & Search Bar */}
        <div className="services-control-bar">
          <div className="services-tabs-wrapper">
            <Tabs
              tabs={categoryTabs}
              activeTab={activeCategory}
              onChange={setActiveCategory}
              size="sm"
            />
          </div>

          <div className="services-search-box">
            <Search size={15} className="services-search-icon" />
            <input
              type="text"
              placeholder="Search capabilities, vectors, or tooling..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search cybersecurity services"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="services-grid-enhanced">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="service-card-modern skeleton-pulse-card">
                <div className="skeleton-line" style={{ width: '35%', height: '18px', marginBottom: '16px' }} />
                <div className="skeleton-line" style={{ width: '70%', height: '26px', marginBottom: '12px' }} />
                <div className="skeleton-line" style={{ width: '100%', height: '14px', marginBottom: '8px' }} />
                <div className="skeleton-line" style={{ width: '90%', height: '14px', marginBottom: '20px' }} />
                <div className="skeleton-line" style={{ width: '50%', height: '36px' }} />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="content-error-panel" role="alert">
            <AlertCircle size={24} className="error-icon" />
            <div className="error-body">
              <h4>Database Catalog Unavailable</h4>
              <p>{error}</p>
              {onRetry && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
                  <RefreshCw size={14} /> Retry Query
                </button>
              )}
            </div>
          </div>
        )}

        {/* Empty Search Results */}
        {!loading && !error && displayedServices.length === 0 && (
          <div className="content-empty-panel">
            <ShieldCheck size={32} />
            <h4>No capabilities found matching "{searchQuery}"</h4>
            <p>Try searching for terms like "AI", "Cloud", "API", or select "All Capabilities".</p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('ALL');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Enhanced Populated Cards Grid */}
        {!loading && !error && displayedServices.length > 0 && (
          <div className="services-grid-enhanced">
            {displayedServices.map((s, index) => {
              const Icon = iconMap[s.slug] || ShieldCheck;
              const displayBullets = s.bullets.slice(0, 3);

              return (
                <article
                  key={s.slug || index}
                  className="service-card-modern"
                  onClick={() => handleCardClick(s.slug)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCardClick(s.slug);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View technical specifications for ${s.title}`}
                >
                  {/* Top Metadata Row */}
                  <div className="sc-header-row">
                    <div className="sc-tag-group">
                      <span className="sc-code-badge">{s.code}</span>
                      <span className="sc-category-badge">{s.category || 'CAPABILITY'}</span>
                    </div>
                    <div className="sc-icon-wrapper" title={s.title}>
                      <Icon size={20} />
                    </div>
                  </div>

                  {/* Title and Tagline */}
                  <div className="sc-title-block">
                    <h3 className="sc-title">{s.title}</h3>
                    <p className="sc-tagline">{s.tagline}</p>
                  </div>

                  {/* Scope Summary */}
                  <p className="sc-summary">{s.summary || s.desc}</p>

                  {/* Scope Highlights Checklist */}
                  {displayBullets.length > 0 && (
                    <div className="sc-deliverables-list">
                      <span className="sc-subheading">Core Assessment Scope:</span>
                      <ul>
                        {displayBullets.map((bullet, bIdx) => (
                          <li key={bIdx}>
                            <Check size={13} className="sc-check-icon" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Card Technical Badges */}
                  <div className="sc-spec-chips">
                    <div className="sc-spec-chip" title="Typical Engagement Window">
                      <Clock size={12} />
                      <span>{s.duration}</span>
                    </div>
                    <div className="sc-spec-chip text-truncate" title={s.compliance}>
                      <ShieldCheck size={12} />
                      <span>{s.compliance.split('·')[0].trim()}</span>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="sc-actions-footer">
                    <button
                      type="button"
                      className="sc-explore-btn"
                      onClick={() => handleCardClick(s.slug)}
                    >
                      <span>Specifications</span>
                      <ArrowUpRight size={15} />
                    </button>

                    <button
                      type="button"
                      className="sc-scope-action-btn"
                      onClick={(e) => handleDirectScope(e, s.title)}
                      title={`Request scoping call for ${s.title}`}
                    >
                      <Send size={13} />
                      <span>Scope</span>
                    </button>
                  </div>

                  {/* Corner Accent Glow */}
                  <div className="sc-card-glow" />
                </article>
              );
            })}
          </div>
        )}

        {/* Enterprise Methodology Assurance Banner */}
        <div className="services-assurance-strip">
          <div className="assurance-item">
            <span className="assurance-number">01</span>
            <div className="assurance-text">
              <strong>Rules of Engagement</strong>
              <span>Pre-authorized scope and zero-business-disruption mandate.</span>
            </div>
          </div>
          <div className="assurance-divider" />
          <div className="assurance-item">
            <span className="assurance-number">02</span>
            <div className="assurance-text">
              <strong>Reproducible Proof of Concept</strong>
              <span>Zero false-positives. Every vulnerability backed by raw traffic logs.</span>
            </div>
          </div>
          <div className="assurance-divider" />
          <div className="assurance-item">
            <span className="assurance-number">03</span>
            <div className="assurance-text">
              <strong>Retest Included</strong>
              <span>Post-remediation verification within 60 days at no added cost.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
