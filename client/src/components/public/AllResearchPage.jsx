  import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Search,
  Filter,
  Terminal,
  BrainCircuit,
  Layers3,
  Cpu,
  Cloud,
  ShieldCheck,
  Clock,
  Share2,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { apiRequest } from '../../api/client.js';
import { Button } from '../ui/button.jsx';

const iconMap = {
  'continuous-purple-teaming-telemetry': Terminal,
  'indirect-prompt-injection-mitigation': BrainCircuit,
  'zero-trust-spa-session-boundaries': Layers3,
  'ebpf-rootkit-evasion-memory-forensics': Cpu,
  'cloud-identity-oidc-supply-chain-poisoning': Cloud,
  'zero-day-hypervisor-corruption': ShieldCheck,
  'instructor-field-report-kerberos-delegation': Terminal
};

export default function AllResearchPage({
  publishedResearch = [],
  onSelectResearch,
  onBack
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [copiedLink, setCopiedLink] = useState(false);
  const [livePapers, setLivePapers] = useState(publishedResearch);
  const [loading, setLoading] = useState(!publishedResearch || publishedResearch.length === 0);
  const [error, setError] = useState(null);

  // Guarantee the page always starts strictly from the top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const rafId = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Sync or fetch from backend
  useEffect(() => {
    if (publishedResearch && publishedResearch.length > 0) {
      setLivePapers(publishedResearch);
      setLoading(false);
    } else {
      setLoading(true);
      setError(null);
      apiRequest('/research')
        .then((data) => {
          if (data?.research) {
            setLivePapers(data.research);
          }
        })
        .catch((err) => {
          setError(err.message || 'Unable to load research catalog.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [publishedResearch]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(livePapers.map((p) => p.category).filter(Boolean));
    return ['ALL', ...Array.from(cats)];
  }, [livePapers]);

  const filteredArticles = useMemo(() => {
    return livePapers.filter((paper) => {
      const matchesCategory =
        selectedCategory === 'ALL' || paper.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        paper.title?.toLowerCase().includes(q) ||
        paper.summary?.toLowerCase().includes(q) ||
        (paper.tags && paper.tags.some((t) => t.toLowerCase().includes(q)));
      return matchesCategory && matchesSearch;
    });
  }, [livePapers, selectedCategory, searchQuery]);

  const handleCardClick = (slug) => {
    if (onSelectResearch) {
      onSelectResearch(slug);
    } else {
      window.location.hash = `#research/${slug}`;
    }
  };

  return (
    <div className="all-research-root">
      {/* 1. Header Navigation Bar */}
      <header className="all-research-header">
        <div className="container all-research-header-inner">
          <div className="header-left">
            <button
              type="button"
              className="btn-back-research"
              onClick={onBack}
              title="Return to homepage"
            >
              <ArrowLeft size={15} />
              <span>Back to Home</span>
            </button>
            <span className="header-divider">/</span>
            <span className="header-current-title">Technical Research Catalog</span>
          </div>

          <div className="header-right">
            <button
              type="button"
              className="btn-share-research"
              onClick={handleShare}
              title="Share catalog link"
            >
              <Share2 size={14} />
              <span>{copiedLink ? 'Link Copied!' : 'Share Catalog'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Headline Section */}
      <section className="all-research-hero">
        <div className="container">
          <div className="all-research-eyebrow">
            <span className="eyebrow-accent-dot" />
            <span className="mono">NEXGUARD SECURITY LABS</span>
            <span className="eyebrow-slash">·</span>
            <span>PEER-REVIEWED SECURITY RESEARCH</span>
          </div>

          <h1 className="all-research-title">
            Browse All Technical Research Papers
          </h1>
          <p className="all-research-lead">
            Explore unredacted research papers, ring-0 kernel exploit mechanics, cloud identity federation vulnerabilities, and purple-team detection engineering specifications.
          </p>

          {/* Search and Category Filters */}
          <div className="all-research-controls">
            <div className="search-input-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Filter by vulnerability vector, MITRE technique, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-field"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="category-filter-chips">
              <Filter size={14} className="filter-icon" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`cat-chip mono ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Research Publications List */}
      <section className="all-research-grid-section">
        <div className="container">
          {loading && (
            <div className="all-research-grid">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="project-card loading-skeleton-card" style={{ minHeight: '260px' }}>
                  <div className="skeleton-line" style={{ width: '35%', height: '16px', marginBottom: '16px' }} />
                  <div className="skeleton-line" style={{ width: '80%', height: '22px', marginBottom: '14px' }} />
                  <div className="skeleton-line" style={{ width: '100%', height: '14px', marginBottom: '8px' }} />
                  <div className="skeleton-line" style={{ width: '90%', height: '14px' }} />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="content-error-panel" role="alert">
              <AlertCircle size={22} className="error-icon" />
              <div className="error-body">
                <h4>Unable to load research publications</h4>
                <p>{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && filteredArticles.length === 0 && (
            <div className="content-empty-panel">
              <Terminal size={32} />
              <h3>No matching research publications found</h3>
              <p>Try refining your search terms or selecting a different category filter.</p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
              >
                Reset Filters
              </button>
            </div>
          )}

          {!loading && !error && filteredArticles.length > 0 && (
            <div className="all-research-grid">
              {filteredArticles.map((paper, index) => {
                const Icon = iconMap[paper.slug] || Terminal;
                const num = paper.number || String(index + 1).padStart(2, '0');

                return (
                  <article
                    key={paper.slug || index}
                    className="all-research-card project-card-interactive"
                    onClick={() => handleCardClick(paper.slug)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCardClick(paper.slug);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Read research paper: ${paper.title}`}
                  >
                    <div className="card-top-bar">
                      <div className="card-icon-wrap">
                        <Icon size={20} />
                      </div>
                      <span className="card-num mono">/{num}</span>
                      <span className="card-category mono">{paper.category}</span>
                    </div>

                    <h2 className="card-title">{paper.title}</h2>
                    <p className="card-summary">{paper.summary}</p>

                    {paper.tags && paper.tags.length > 0 && (
                      <div className="card-tags-row">
                        {paper.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="tag-chip mono">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="card-bottom-bar">
                      <span className="read-time mono">
                        <Clock size={12} /> {paper.readTimeMinutes || 8} MIN READ
                      </span>
                      <span className="card-action-link">
                        Read Paper <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
