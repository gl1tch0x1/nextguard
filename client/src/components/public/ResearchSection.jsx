import React from 'react';
import {
  ArrowUpRight,
  Activity,
  Terminal,
  BrainCircuit,
  Layers3,
  Cpu,
  Cloud,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const iconMap = {
  'continuous-purple-teaming-telemetry': Terminal,
  'indirect-prompt-injection-mitigation': BrainCircuit,
  'zero-trust-spa-session-boundaries': Layers3,
  'ebpf-rootkit-evasion-memory-forensics': Cpu,
  'cloud-identity-oidc-supply-chain-poisoning': Cloud,
  'zero-day-hypervisor-corruption': ShieldCheck,
  'instructor-field-report-kerberos-delegation': Terminal
};

export default function ResearchSection({
  publishedResearch = [],
  loading = false,
  error = null,
  onRetry,
  onSelectResearch
}) {
  // Display top 3 flagship papers on the homepage
  const displayedResearch = (publishedResearch || []).slice(0, 3);

  const handleCardClick = (slug) => {
    if (onSelectResearch) {
      onSelectResearch(slug);
    } else {
      window.location.hash = `#research/${slug}`;
    }
  };

  const handleViewAllPage = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (onSelectResearch) {
      onSelectResearch('all');
    } else {
      window.location.hash = '#research/all';
    }
  };

  return (
    <section className="research section-pad" id="research">
      <div className="container">
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> RESEARCH & LABS / {String(publishedResearch.length).padStart(2, '0')}
            </div>
            <h2>
              Build. Break safely.<br />
              <span>Understand why.</span>
            </h2>
          </div>
          <p>
            Peer-reviewed security research, kernel exploit mechanisms, and practical detection engineering roadmaps from NexGuard Security Labs.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="project-grid">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="project-card loading-skeleton-card" style={{ minHeight: '260px' }}>
                <div className="skeleton-line" style={{ width: '35%', height: '16px', marginBottom: '16px' }} />
                <div className="skeleton-line" style={{ width: '80%', height: '22px', marginBottom: '14px' }} />
                <div className="skeleton-line" style={{ width: '100%', height: '14px', marginBottom: '8px' }} />
                <div className="skeleton-line" style={{ width: '90%', height: '14px' }} />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="content-error-panel" role="alert">
            <AlertCircle size={22} className="error-icon" />
            <div className="error-body">
              <h4>Unable to load research publications</h4>
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
        {!loading && !error && publishedResearch.length === 0 && (
          <div className="content-empty-panel">
            <Terminal size={28} />
            <p>No research publications are currently published in the database.</p>
          </div>
        )}

        {/* Featured Flagship Papers Grid */}
        {!loading && !error && displayedResearch.length > 0 && (
          <div className="project-grid">
            {displayedResearch.map((p, index) => {
              const Icon = iconMap[p.slug] || Terminal;
              const number = p.number || String(index + 1).padStart(2, '0');
              const category = p.category || 'CYBER RESEARCH';

              return (
                <article
                  className="project-card project-card-interactive"
                  key={p.slug || index}
                  onClick={() => handleCardClick(p.slug)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCardClick(p.slug);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Read research paper: ${p.title}`}
                >
                  <div className="project-top">
                    <div className="project-icon">
                      <Icon size={21} />
                    </div>
                    <span>{number} / RESEARCH</span>
                    <ArrowUpRight size={16} className="project-arrow-icon" />
                  </div>
                  <span className="project-label">{category}</span>
                  <h3>{p.title}</h3>
                  <p>{p.summary}</p>
                  {p.tags && p.tags.length > 0 && (
                    <div className="project-stack">
                      {p.tags.slice(0, 4).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="project-card-footer">
                    <span className="card-link">
                      Read complete paper <ArrowUpRight size={13} />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Clean "Browse All Research" Action */}
        {!loading && !error && publishedResearch.length > 0 && (
          <div className="research-browse-all-container">
            <button
              type="button"
              className="btn btn-primary research-browse-all-btn"
              onClick={handleViewAllPage}
            >
              <span>Browse All Research</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        <div className="research-note">
          <Activity size={17} />
          <p>
            <b>Research in progress.</b> All disclosures follow ethical vulnerability disclosure standards and safe emulation principles.
          </p>
          <a href="#contact">
            Collaborate <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
