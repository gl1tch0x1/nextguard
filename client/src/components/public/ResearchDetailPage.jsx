import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Share2,
  Terminal,
  FileCode,
  Layers3,
  BrainCircuit,
  Activity,
  Copy,
  Check,
  BookOpen,
  UserCheck,
  Cpu,
  Cloud,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { apiRequest } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button } from '../ui/button.jsx';
import { CopyButton } from '../ui/copy-button.jsx';
import { Badge } from '../ui/badge.jsx';
import { ImageLightbox } from '../ui/index.js';
import CyberHeroBanner from './CyberHeroBanner.jsx';

const iconMap = {
  'continuous-purple-teaming-telemetry': Terminal,
  'indirect-prompt-injection-mitigation': BrainCircuit,
  'zero-trust-spa-session-boundaries': Layers3,
  'ebpf-rootkit-evasion-memory-forensics': Cpu,
  'cloud-identity-oidc-supply-chain-poisoning': Cloud,
  'zero-day-hypervisor-corruption': ShieldCheck,
  'instructor-field-report-kerberos-delegation': Terminal
};

export default function ResearchDetailPage({
  articleSlug,
  onBack,
  onContact
}) {
  const { user } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [article, setArticle] = useState(null);
  const [livePapersList, setLivePapersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Scroll to top on mount / slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [articleSlug]);

  // Fetch paper from database via API
  useEffect(() => {
    if (!articleSlug) return;
    setLoading(true);
    setError(null);

    apiRequest(`/research/${articleSlug}`)
      .then((data) => {
        if (data?.research) {
          setArticle(data.research);
        } else {
          setError('Research publication not found in database.');
        }
      })
      .catch((err) => {
        setError(err.message || 'Unable to connect to research database.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [articleSlug]);

  // Fetch all research papers for sequential navigation & related papers
  useEffect(() => {
    apiRequest('/research')
      .then((data) => {
        if (data?.research && Array.isArray(data.research)) {
          setLivePapersList(data.research);
        }
      })
      .catch(() => {});
  }, []);

  const handleNavigateToPaper = (slug) => {
    window.location.hash = `#research/${slug}`;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyCode = () => {
    if (navigator.clipboard && article?.architecturePoC) {
      navigator.clipboard.writeText(article.architecturePoC);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="research-detail-root" style={{ minHeight: '80vh', padding: '120px 20px' }}>
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

  if (error || !article) {
    return (
      <div className="research-detail-root" style={{ minHeight: '80vh', padding: '120px 20px' }}>
        <div className="container" style={{ maxWidth: '700px', textAlign: 'center' }}>
          <div className="content-error-panel" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <AlertCircle size={36} className="error-icon" style={{ marginBottom: '16px' }} />
            <h3>Research Publication Not Found</h3>
            <p style={{ maxWidth: '500px', margin: '0 auto 24px' }}>
              {error || `No published research publication exists matching slug: "${articleSlug}".`}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button type="button" className="btn btn-secondary" onClick={onBack}>
                <ArrowLeft size={15} /> All Research
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

  const allViewerImages = [
    ...(article.bannerImage ? [{
      url: article.bannerImage,
      title: `${article.title} (Hero Banner)`,
      caption: 'High-resolution official research publication hero banner specification.'
    }] : []),
    ...(article.pocImages || [])
  ];

  const Icon = iconMap[article.slug] || Terminal;
  const currentIdx = livePapersList.findIndex((p) => p.slug === article.slug);
  const prevPaper = currentIdx > 0 ? livePapersList[currentIdx - 1] : null;
  const nextPaper = currentIdx >= 0 && currentIdx < livePapersList.length - 1 ? livePapersList[currentIdx + 1] : null;

  return (
    <div className="research-detail-root">
      {/* 1. Sticky Navigation & Breadcrumbs Bar */}
      <header className="research-detail-header">
        <div className="container research-detail-header-inner">
          <div className="research-header-left">
            <button
              type="button"
              className="btn-back-research"
              onClick={onBack}
              title="Return to Research & Labs feed"
            >
              <ArrowLeft size={15} />
              <span>All Research & Labs</span>
            </button>
            <span className="header-divider">/</span>
            <span className="header-category-tag">{article.category || 'CYBER RESEARCH'}</span>
            <span className="header-divider">/</span>
            <span className="header-current-title">{article.title}</span>
          </div>

          <div className="research-header-right">
            {user?.role === 'instructor' && (
              <button
                type="button"
                className="btn-back-research"
                style={{ borderColor: 'var(--accent-emerald)', color: 'var(--accent-emerald)' }}
                onClick={() => {
                  window.location.hash = '#platform';
                }}
              >
                <span>Edit In CMS</span>
              </button>
            )}

            <button
              type="button"
              className="btn-share-research"
              onClick={handleShare}
              title="Copy direct link to this research paper"
            >
              <Share2 size={14} />
              <span>{copiedLink ? 'Link Copied!' : 'Share Paper'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Flagship Header Section */}
      <section className="research-article-hero">
        <div className="container">
          <div className="article-hero-eyebrow">
            <span className="eyebrow-accent-dot" />
            <span className="mono">PUBLICATION /{article.number || '01'}</span>
            <span className="eyebrow-slash">·</span>
            <span>{article.category || 'CYBER RESEARCH'}</span>
            <span className="eyebrow-slash">·</span>
            <span className="mono">{article.publishedDate || 'October 2026'}</span>
          </div>

          <h1 className="article-hero-title">{article.title}</h1>
          {article.subtitle && <p className="article-hero-subtitle">{article.subtitle}</p>}
          <p className="article-hero-lead">{article.summary}</p>

          <div className="article-meta-bar">
            <div className="article-meta-item">
              <span className="meta-label">PRIMARY INVESTIGATOR</span>
              <span className="meta-val">{article.authorName || 'NexGuard Research Team'}</span>
            </div>
            <div className="article-meta-divider" />
            <div className="article-meta-item">
              <span className="meta-label">ROLE</span>
              <span className="meta-val">{article.authorRole || 'Security Researcher'}</span>
            </div>
            <div className="article-meta-divider" />
            <div className="article-meta-item">
              <span className="meta-label">ESTIMATED STUDY</span>
              <span className="meta-val mono">
                <Clock size={13} /> {article.readTimeMinutes || 10} MIN READ
              </span>
            </div>
          </div>

          {/* Interactive Hero Banner / Architectural Diagram */}
          <div className="article-hero-banner-wrapper">
            {article.bannerImage ? (
              <div
                className="article-banner-image-container"
                onClick={() => {
                  setLightboxIndex(0);
                  setLightboxOpen(true);
                }}
                role="button"
                tabIndex={0}
                title="Click to expand high-resolution architecture diagram"
              >
                <img
                  src={article.bannerImage}
                  alt={`${article.title} Architecture Banner`}
                  className="article-banner-image"
                  loading="eager"
                />
                <div className="banner-expand-badge mono">
                  <ArrowUpRight size={13} /> Click to Expand High-Res
                </div>
              </div>
            ) : (
              <CyberHeroBanner
                title={article.title}
                category={article.category}
                number={article.number}
              />
            )}
          </div>
        </div>
      </section>

      {/* 3. Deep-Dive Body Layout */}
      <section className="research-article-body">
        <div className="container article-layout-grid">
          {/* Main Article Content Column */}
          <main className="article-content-col">
            {/* Threat Model Box */}
            {article.threatModel && typeof article.threatModel === 'object' && (
              <div className="threat-matrix-card">
                <div className="matrix-header">
                  <ShieldCheck size={18} />
                  <h3>Threat Model & Attack Vector Matrix</h3>
                </div>
                <div className="matrix-grid">
                  {article.threatModel.cvssScore && (
                    <div className="matrix-item">
                      <span className="matrix-label">CVSS Base Score</span>
                      <span className="matrix-val mono severity-high">
                        {article.threatModel.cvssScore}
                      </span>
                    </div>
                  )}
                  {article.threatModel.vector && (
                    <div className="matrix-item">
                      <span className="matrix-label">Vector String</span>
                      <span className="matrix-val mono code-val">{article.threatModel.vector}</span>
                    </div>
                  )}
                  {article.threatModel.mitreTactic && (
                    <div className="matrix-item">
                      <span className="matrix-label">MITRE ATT&CK</span>
                      <span className="matrix-val mono">{article.threatModel.mitreTactic}</span>
                    </div>
                  )}
                  {article.threatModel.impact && (
                    <div className="matrix-item">
                      <span className="matrix-label">Severity Profile</span>
                      <span className="matrix-val mono">{article.threatModel.impact}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Key Findings Checklist */}
            {article.keyFindings && article.keyFindings.length > 0 && (
              <div className="key-findings-panel">
                <h3>Key Security Findings</h3>
                <div className="findings-list">
                  {article.keyFindings.map((finding, idx) => (
                    <div key={idx} className="finding-row">
                      <CheckCircle2 size={16} className="finding-check-icon" />
                      <p>{finding}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sections / Structured Content */}
            {article.sections && article.sections.length > 0 ? (
              <div className="article-sections-flow">
                {article.sections.map((sec, idx) => (
                  <article key={idx} className="article-section-block">
                    <h2>{sec.heading}</h2>
                    <p className="section-body-text">{sec.body}</p>
                    {sec.technicalDetails && (
                      <div className="technical-deep-dive">
                        <h4>Technical Architecture</h4>
                        <p>{sec.technicalDetails}</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : article.content ? (
              <div className="article-sections-flow">
                <div className="section-body-text" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  {article.content}
                </div>
              </div>
            ) : null}

            {/* Architecture PoC Code Box */}
            {article.architecturePoC && (
              <div className="architecture-poc-panel">
                <div className="poc-header-row">
                  <div className="poc-title-group">
                    <Terminal size={16} />
                    <span className="mono">VERIFIED POC SPECIFICATION / DETECTION LOGIC</span>
                  </div>
                  <CopyButton
                    value={article.architecturePoC}
                    label="Copy Code"
                    variant="cyber"
                    size="sm"
                  />
                </div>
                <div className="poc-code-wrapper">
                  <pre className="mono code-pre">
                    <code>{article.architecturePoC}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* PoC Figures Gallery */}
            {article.pocImages && article.pocImages.length > 0 && (
              <div className="poc-figures-section">
                <h3 className="subheading-accent">Technical PoC Evidence & Memory Analysis</h3>
                <div className="poc-figures-grid">
                  {article.pocImages.map((img, i) => (
                    <div
                      key={i}
                      className="poc-figure-card"
                      onClick={() => {
                        const targetIdx = article.bannerImage ? i + 1 : i;
                        setLightboxIndex(targetIdx);
                        setLightboxOpen(true);
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="poc-figure-img-wrap">
                        <img src={img.url} alt={img.title || 'PoC Evidence'} loading="lazy" />
                        <div className="poc-figure-hover-badge mono">
                          <ArrowUpRight size={13} /> View Full Res
                        </div>
                      </div>
                      <div className="poc-figure-info">
                        <h4 className="mono">{img.title}</h4>
                        <p>{img.caption}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Remediation Checklist */}
            {article.remediationChecklist && article.remediationChecklist.length > 0 && (
              <div className="remediation-checklist-panel">
                <h3>Recommended Remediation & Hardening</h3>
                <div className="remediation-grid">
                  {article.remediationChecklist.map((item, idx) => (
                    <div key={idx} className="remediation-item">
                      <div className="remediation-num mono">0{idx + 1}</div>
                      <div>
                        <h4>{item.step || item.title || item}</h4>
                        {item.detail && <p>{item.detail}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Author Attribution Card */}
            <div className="article-author-card">
              <div className="author-avatar-wrap">
                <UserCheck size={28} />
              </div>
              <div className="author-info">
                <h3>{article.authorName || 'NexGuard Research Team'}</h3>
                <span className="author-role mono">{article.authorRole || 'Security Researcher'}</span>
                <p>
                  Conducting offensive capability research, low-level hypervisor escape vectors, and automated zero-trust telemetry engineering at NexGuard Security Labs.
                </p>
              </div>
              <div className="author-action">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onContact && onContact(article.title)}
                >
                  Request Technical Review <ArrowUpRight size={14} />
                </button>
              </div>
            </div>

            {/* Sequential Paper Pager */}
            {(prevPaper || nextPaper) && (
              <nav className="research-paper-pager" aria-label="Paper Navigation">
                {prevPaper ? (
                  <button
                    type="button"
                    className="paper-pager-card pager-prev"
                    onClick={() => handleNavigateToPaper(prevPaper.slug)}
                    title={`Previous: ${prevPaper.title}`}
                  >
                    <div className="pager-meta">
                      <ArrowLeft size={13} />
                      <span>PREVIOUS RESEARCH</span>
                    </div>
                    <span className="pager-title">{prevPaper.title}</span>
                  </button>
                ) : <div />}

                {nextPaper ? (
                  <button
                    type="button"
                    className="paper-pager-card pager-next"
                    onClick={() => handleNavigateToPaper(nextPaper.slug)}
                    title={`Next: ${nextPaper.title}`}
                  >
                    <div className="pager-meta">
                      <span>NEXT RESEARCH</span>
                      <ArrowUpRight size={13} />
                    </div>
                    <span className="pager-title">{nextPaper.title}</span>
                  </button>
                ) : <div />}
              </nav>
            )}
          </main>
        </div>
      </section>

      {/* 4. Bottom Scoping CTA Banner */}
      <section className="research-bottom-cta-section">
        <div className="container">
          <div className="research-cta-banner">
            <div>
              <span className="eyebrow">
                <span className="eyebrow-line" /> COLLABORATIVE DEFENSE
              </span>
              <h2>Have inquiries regarding this research?</h2>
              <p>
                Speak with our threat intelligence and red-team practitioners. We provide scoped detection engineering engagements and purple team validations.
              </p>
            </div>
            <div className="banner-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onContact && onContact(article.title)}
              >
                Initiate Scoping Inquiry <ArrowUpRight size={15} />
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onBack}
              >
                Back to All Articles
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Connected Research Publications Grid */}
      {livePapersList.length > 1 && (
        <section className="related-research-section">
          <div className="container">
            <div className="section-heading">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-line" /> CONTINUOUS RESEARCH
                </div>
                <h2>Explore Connected Investigations</h2>
              </div>
              <p>
                Explore our laboratory investigations into offensive techniques, LLM robustness, and resilient architectures.
              </p>
            </div>

            <div className="project-grid">
              {livePapersList
                .filter((p) => p.slug !== article.slug)
                .map((p, idx) => {
                  const OtherIcon = iconMap[p.slug] || Terminal;
                  return (
                    <article
                      key={p.slug || idx}
                      className="project-card project-card-interactive"
                      onClick={() => {
                        window.location.hash = `#research/${p.slug}`;
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="project-top">
                        <div className="project-icon">
                          <OtherIcon size={21} />
                        </div>
                        <span>0{idx + 1} / RESEARCH</span>
                        <ArrowUpRight size={16} />
                      </div>
                      <span className="project-label">{p.category || 'CYBER RESEARCH'}</span>
                      <h3>{p.title}</h3>
                      <p>{p.summary}</p>
                      {p.tags && p.tags.length > 0 && (
                        <div className="project-stack">
                          {p.tags.map((t) => (
                            <span key={t}>{t}</span>
                          ))}
                        </div>
                      )}
                      <span className="card-link" style={{ marginTop: 'auto', paddingTop: '12px' }}>
                        Read paper <ArrowUpRight size={14} />
                      </span>
                    </article>
                  );
                })}
            </div>
          </div>
        </section>
      )}

      {/* Fullscreen Interactive PoC Lightbox Modal */}
      <ImageLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={allViewerImages}
        currentIndex={lightboxIndex}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
