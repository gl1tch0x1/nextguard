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
  RefreshCw,
  Sparkles,
  Calendar,
  Lock,
  Tag
} from 'lucide-react';
import { apiRequest } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button } from '../ui/button.jsx';
import { CopyButton } from '../ui/copy-button.jsx';
import { Badge } from '../ui/badge.jsx';
import { ImageLightbox } from '../ui/index.js';
import CyberHeroBanner from './CyberHeroBanner.jsx';
import { RESEARCH_DETAILS } from '../../data/researchDetails.js';

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

  // Fetch paper from database via API, deeply merging with local rich whitepaper data
  useEffect(() => {
    if (!articleSlug) return;
    setLoading(true);
    setError(null);

    const localPaper = RESEARCH_DETAILS[articleSlug] || null;

    apiRequest(`/research/${articleSlug}`)
      .then((data) => {
        if (data?.research) {
          const merged = {
            ...localPaper,
            ...data.research,
            // Keep rich fields from local paper if database version lacks them
            keyFindings: (data.research.keyFindings && data.research.keyFindings.length > 0)
              ? data.research.keyFindings
              : localPaper?.keyFindings || [],
            threatModel: (data.research.threatModel && typeof data.research.threatModel === 'object')
              ? data.research.threatModel
              : localPaper?.threatModel || null,
            sections: (data.research.sections && data.research.sections.length > 0)
              ? data.research.sections
              : localPaper?.sections || [],
            architecturePoC: data.research.architecturePoC || localPaper?.architecturePoC || '',
            pocImages: (data.research.pocImages && data.research.pocImages.length > 0)
              ? data.research.pocImages
              : localPaper?.pocImages || [],
            remediationChecklist: (data.research.remediationChecklist && data.research.remediationChecklist.length > 0)
              ? data.research.remediationChecklist
              : localPaper?.remediationChecklist || [],
            bannerImage: data.research.bannerImage || localPaper?.bannerImage || ''
          };
          setArticle(merged);
        } else if (localPaper) {
          setArticle(localPaper);
        } else {
          setError('Research publication not found in database.');
        }
      })
      .catch((err) => {
        if (localPaper) {
          setArticle(localPaper);
        } else {
          setError(err.message || 'Unable to connect to research database.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [articleSlug]);

  // Fetch all research papers for sequential navigation & related papers
  useEffect(() => {
    apiRequest('/research')
      .then((data) => {
        if (data?.research && Array.isArray(data.research) && data.research.length > 0) {
          setLivePapersList(data.research);
        } else {
          setLivePapersList(Object.values(RESEARCH_DETAILS));
        }
      })
      .catch(() => {
        setLivePapersList(Object.values(RESEARCH_DETAILS));
      });
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

  // Smart Formatter for Section Bodies: handles paragraphs, numbered lists, and bullet points
  const renderFormattedBody = (rawText) => {
    if (!rawText) return null;

    const paragraphs = rawText.split(/\n\s*\n/);

    return paragraphs.map((para, pIdx) => {
      const trimmed = para.trim();

      // Check if paragraph is an itemized list (- **Phase A**: ...)
      if (trimmed.startsWith('- ') || trimmed.includes('\n- ')) {
        const lines = trimmed.split('\n').filter((l) => l.trim().startsWith('- '));
        if (lines.length > 0) {
          return (
            <ul key={pIdx} className="article-bullet-list">
              {lines.map((line, lIdx) => {
                const cleanLine = line.replace(/^-\s*/, '');
                const boldMatch = cleanLine.match(/^\*\*(.*?)\*\*(.*)/);
                if (boldMatch) {
                  return (
                    <li key={lIdx} className="article-bullet-item">
                      <span className="article-bullet-dot" />
                      <div>
                        <strong style={{ color: '#f8fafc', fontWeight: 600 }}>{boldMatch[1]}</strong>
                        <span style={{ color: '#cbd5e1' }}>{boldMatch[2]}</span>
                      </div>
                    </li>
                  );
                }
                return (
                  <li key={lIdx} className="article-bullet-item">
                    <span className="article-bullet-dot" />
                    <span>{cleanLine}</span>
                  </li>
                );
              })}
            </ul>
          );
        }
      }

      // Check if paragraph is a numbered list (1. ..., 2. ...)
      if (/^\d+\.\s/.test(trimmed) || trimmed.includes('\n1. ')) {
        const lines = trimmed.split('\n').filter((l) => /^\d+\.\s/.test(l.trim()));
        if (lines.length > 0) {
          return (
            <ol key={pIdx} className="article-ordered-list">
              {lines.map((line, lIdx) => {
                const text = line.replace(/^\d+\.\s*/, '');
                return <li key={lIdx}>{text}</li>;
              })}
            </ol>
          );
        }
      }

      return (
        <p key={pIdx} className="section-body-text">
          {trimmed}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className="research-detail-root" style={{ minHeight: '80vh', padding: '120px 20px' }}>
        <div className="spec-canvas-container" style={{ maxWidth: '900px' }}>
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
        <div className="spec-canvas-container" style={{ maxWidth: '700px', textAlign: 'center' }}>
          <div className="content-error-panel" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <AlertCircle size={36} className="error-icon" style={{ marginBottom: '16px', color: '#ff5f56' }} />
            <h3>Research Publication Not Found</h3>
            <p style={{ maxWidth: '500px', margin: '0 auto 24px', color: '#cbd5e1' }}>
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
      title: `${article.title} (Hero Topology Architecture)`,
      caption: 'High-resolution official research publication hero architecture topology.'
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
        <div className="spec-canvas-container research-detail-header-inner">
          <div className="research-header-left">
            <button
              type="button"
              className="btn-back-research"
              onClick={onBack}
              title="Return to Research & Labs feed"
            >
              <ArrowLeft size={14} />
              <span>All Research & Labs</span>
            </button>
            <span className="header-divider" style={{ color: '#475569' }}>/</span>
            <span className="header-category-tag" style={{ color: '#baff66', fontWeight: 600 }}>
              {article.category || 'CYBER RESEARCH'}
            </span>
            <span className="header-divider" style={{ color: '#475569' }}>/</span>
            <span className="header-current-title" style={{ color: '#e2e8f0', maxWidth: '380px' }}>
              {article.title}
            </span>
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
              className="btn-share-paper"
              onClick={handleShare}
              title="Copy direct link to this research paper"
            >
              {copiedLink ? <Check size={14} color="#baff66" /> : <Share2 size={14} />}
              <span>{copiedLink ? 'Link Copied!' : 'Share Paper'}</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onContact && onContact(article.title)}
              style={{ padding: '6px 12px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <span>Engage Team</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Flagship Header Section */}
      <section className="research-hero-section">
        <div className="spec-canvas-container">
          <div className="spec-meta-pills-row" style={{ marginBottom: '16px' }}>
            <span className="spec-code-tag">RESEARCH-PUB /{article.number || '01'}</span>
            <span className="spec-category-tag">{article.category || 'CYBER RESEARCH'}</span>
            <span className="spec-status-beacon">
              <span className="beacon-pulse" />
              PEER REVIEWED & VERIFIED
            </span>
          </div>

          <h1 className="research-hero-title">{article.title}</h1>
          
          {article.subtitle && (
            <p className="research-hero-subtitle">{article.subtitle}</p>
          )}

          <p className="spec-hero-lead-summary" style={{ maxWidth: '880px', marginBottom: '24px' }}>
            {article.summary}
          </p>

          {/* Author & Publication Metadata Bar */}
          <div className="research-meta-bar">
            <div className="meta-author-box">
              <div className="author-avatar">
                <UserCheck size={18} />
              </div>
              <div className="author-details">
                <span className="author-name">{article.authorName || 'NexGuard Research Team'}</span>
                <span className="author-role">{article.authorRole || 'Security Researcher'}</span>
              </div>
            </div>

            <div className="meta-divider-vertical" />

            <div className="meta-item">
              <span className="meta-label">PUBLICATION DATE</span>
              <span className="meta-val" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={12} color="#baff66" />
                <span>{article.publishedDate || 'October 2026'}</span>
              </span>
            </div>

            <div className="meta-divider-vertical" />

            <div className="meta-item">
              <span className="meta-label">ESTIMATED STUDY</span>
              <span className="meta-val mono" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#baff66' }}>
                <Clock size={12} />
                <span>{article.readTimeMinutes || 12} MIN READ</span>
              </span>
            </div>

            {article.tags && article.tags.length > 0 && (
              <>
                <div className="meta-divider-vertical" />
                <div className="research-tags-strip" style={{ marginLeft: 'auto' }}>
                  {article.tags.map((tag) => (
                    <span key={tag} className="research-tag-pill">
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
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
                  <ArrowUpRight size={13} /> Click to Expand High-Res Architecture Topology
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
      <section className="research-body-section">
        <div className="spec-canvas-container research-layout-centered">
          <main className="research-article-main">
            {/* Key Findings Card with High-Contrast Bullets (Fixed Layout) */}
            {article.keyFindings && article.keyFindings.length > 0 && (
              <div className="key-findings-card">
                <div className="findings-head">
                  <CheckCircle2 size={19} color="#baff66" />
                  <h3>Key Security Findings & Threat Intelligence Takeaways</h3>
                </div>
                <ul className="findings-list">
                  {article.keyFindings.map((finding, idx) => {
                    const colonIdx = finding.indexOf(':');
                    const hasColon = colonIdx > -1 && colonIdx < 50;
                    const title = hasColon ? finding.slice(0, colonIdx) : null;
                    const body = hasColon ? finding.slice(colonIdx + 1).trim() : finding;

                    return (
                      <li key={idx}>
                        <CheckCircle2 size={16} color="#baff66" className="bullet-green" />
                        <div>
                          {title ? (
                            <>
                              <strong style={{ color: '#f8fafc', fontWeight: 600 }}>{title}: </strong>
                              <span style={{ color: '#cbd5e1' }}>{body}</span>
                            </>
                          ) : (
                            <span style={{ color: '#cbd5e1' }}>{finding}</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Threat Modeling & Attack Vector Matrix (Interactive Dossier) */}
            {article.threatModel && (
              <div className="threat-framework-card">
                <div className="framework-head" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={18} color="#5be7ef" />
                    <h4 style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#5be7ef', letterSpacing: '0.06em' }}>
                      THREAT MODELING & ATTACK VECTOR MATRIX
                    </h4>
                  </div>
                  {article.threatModel.framework && (
                    <span className="framework-pill" style={{ margin: 0, color: '#5be7ef', borderColor: 'rgba(91, 231, 239, 0.3)' }}>
                      {article.threatModel.framework}
                    </span>
                  )}
                </div>

                <div className="threat-matrix-two-col">
                  {/* Left: MITRE Techniques */}
                  {article.threatModel.techniques && article.threatModel.techniques.length > 0 && (
                    <div className="matrix-col">
                      <span className="matrix-col-title">EMULATED TECHNIQUES & ATT&CK PRIMITIVES</span>
                      <ul className="techniques-badge-list">
                        {article.threatModel.techniques.map((tech, tIdx) => (
                          <li key={tIdx} className="tech-badge-item">
                            <span className="tech-accent-dot" />
                            <span>{tech}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Right: Telemetry Sources */}
                  {article.threatModel.telemetrySources && article.threatModel.telemetrySources.length > 0 && (
                    <div className="matrix-col">
                      <span className="matrix-col-title">TELEMETRY SOURCES & SENSOR FEEDS</span>
                      <ul className="telemetry-badge-list">
                        {article.threatModel.telemetrySources.map((tel, telIdx) => (
                          <li key={telIdx} className="telemetry-badge-item">
                            <Activity size={13} color="#5be7ef" style={{ flexShrink: 0 }} />
                            <code>{tel}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Structured Sections / Formatted Body */}
            {article.sections && article.sections.length > 0 ? (
              <div className="article-sections-flow">
                {article.sections.map((sec, idx) => (
                  <article key={sec.id || idx} className="article-section-block">
                    <h2>{sec.heading}</h2>
                    {renderFormattedBody(sec.body)}
                    {sec.technicalDetails && (
                      <div className="technical-deep-dive" style={{ background: 'rgba(10, 15, 22, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '16px 20px', marginTop: '16px' }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#baff66', fontWeight: 600 }}>
                          Technical Architecture Detail
                        </h4>
                        <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
                          {sec.technicalDetails}
                        </p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : article.content ? (
              <div className="article-sections-flow">
                {renderFormattedBody(article.content)}
              </div>
            ) : null}

            {/* Architecture PoC Code Box in IDE Terminal Window */}
            {article.architecturePoC && (
              <div className="poc-code-wrapper">
                <div className="poc-code-head">
                  <div className="poc-head-left">
                    <span className="poc-window-dots">
                      <span className="dot dot-red" />
                      <span className="dot dot-yellow" />
                      <span className="dot dot-green" />
                    </span>
                    <span className="poc-tab-title">
                      <FileCode size={13} color="#baff66" />
                      <span>detection-rule.sigma.yaml</span>
                    </span>
                    <span className="poc-status-badge mono">SIGMA v1.0 · PRODUCTION SPECIFICATION</span>
                  </div>
                  <CopyButton
                    value={article.architecturePoC}
                    label="Copy Detection Rule"
                    variant="cyber"
                    size="sm"
                  />
                </div>
                <div className="poc-code-body-wrap">
                  <pre className="poc-code-body mono">
                    <code>{article.architecturePoC}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* PoC Figures Gallery */}
            {article.pocImages && article.pocImages.length > 0 && (
              <div className="poc-figures-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Terminal size={17} color="#baff66" />
                  <h3 style={{ margin: 0, fontSize: '17px', color: '#f8fafc', fontWeight: 750 }}>
                    Technical PoC Evidence & Forensic Telemetry Artifacts
                  </h3>
                </div>
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

            {/* Remediation & Hardening Roadmap */}
            {article.remediationChecklist && article.remediationChecklist.length > 0 && (
              <div className="remediation-checklist-card">
                <div className="checklist-head">
                  <ShieldCheck size={20} color="#baff66" />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 700, color: '#f8fafc' }}>
                      Recommended Remediation & Detection Roadmap
                    </h3>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      Actionable engineering steps for blue teams and SecOps pipelines
                    </span>
                  </div>
                </div>
                <ul className="checklist-items">
                  {article.remediationChecklist.map((item, idx) => {
                    const text = typeof item === 'object' ? (item.step || item.title || item.detail) : item;
                    const colonIdx = text.indexOf(':');
                    const hasColon = colonIdx > -1 && colonIdx < 50;
                    const lead = hasColon ? text.slice(0, colonIdx) : null;
                    const rest = hasColon ? text.slice(colonIdx + 1).trim() : text;

                    return (
                      <li key={idx}>
                        <span className="step-counter">0{idx + 1}</span>
                        <div>
                          {lead ? (
                            <>
                              <strong style={{ color: '#f8fafc', fontWeight: 600 }}>{lead}: </strong>
                              <span style={{ color: '#cbd5e1' }}>{rest}</span>
                            </>
                          ) : (
                            <span>{text}</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Author Attribution Dossier Card */}
            <div className="article-author-card">
              <div className="author-avatar-wrap">
                <UserCheck size={26} color="#baff66" />
              </div>
              <div className="author-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', color: '#f8fafc', fontWeight: 700 }}>
                    {article.authorName || 'NexGuard Research Team'}
                  </h3>
                  <span className="verified-writer-pill">
                    <Check size={11} /> VERIFIED INVESTIGATOR
                  </span>
                </div>
                <span className="author-role mono" style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '8px' }}>
                  {article.authorRole || 'Lead Security Researcher'}
                </span>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.6 }}>
                  Conducting offensive capability research, low-level hypervisor escape vectors, and automated zero-trust telemetry engineering at NexGuard Security Labs.
                </p>
              </div>
              <div className="author-action">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onContact && onContact(article.title)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                >
                  <span>Consult Lead Researcher</span>
                  <ArrowUpRight size={14} />
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
        <div className="spec-canvas-container">
          <div className="research-cta-banner">
            <div>
              <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#baff66', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em' }}>
                <ShieldCheck size={14} /> COLLABORATIVE DEFENSE & RESEARCH INQUIRIES
              </span>
              <h2>Have technical inquiries regarding this research?</h2>
              <p>
                Speak directly with our threat intelligence and red-team practitioners. We provide scoped detection engineering engagements, purple team validations, and bespoke adversarial simulations.
              </p>
            </div>
            <div className="banner-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onContact && onContact(article.title)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
              >
                <span>Initiate Technical Scoping</span>
                <ArrowUpRight size={15} />
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onBack}
              >
                <span>All Research Publications</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Connected Research Publications Grid */}
      {livePapersList.length > 1 && (
        <section className="related-research-section">
          <div className="spec-canvas-container">
            <div className="section-heading" style={{ marginBottom: '32px' }}>
              <div>
                <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#baff66', fontSize: '11px', fontWeight: 700 }}>
                  <Terminal size={14} /> CONTINUOUS SECURITY LAB RESEARCH
                </div>
                <h2 style={{ fontSize: 'clamp(1.8rem, 2.4vw, 2.2rem)', fontWeight: 750, color: '#f8fafc', margin: '8px 0 10px' }}>
                  Explore Connected Investigations
                </h2>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '13.5px', maxWidth: '640px', lineHeight: 1.6 }}>
                Explore our laboratory investigations into offensive techniques, LLM robustness, kernel security, and resilient cyber architectures.
              </p>
            </div>

            <div className="project-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {livePapersList
                .filter((p) => p.slug !== article.slug)
                .slice(0, 3)
                .map((p, idx) => {
                  const OtherIcon = iconMap[p.slug] || Terminal;
                  return (
                    <article
                      key={p.slug || idx}
                      className="project-card project-card-interactive"
                      onClick={() => handleNavigateToPaper(p.slug)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="project-top">
                        <div className="project-icon">
                          <OtherIcon size={20} />
                        </div>
                        <span style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: '#64748b' }}>
                          0{idx + 1} / RESEARCH
                        </span>
                        <ArrowUpRight size={15} style={{ marginLeft: 'auto', color: '#94a3b8' }} />
                      </div>
                      <span className="project-label">{p.category || 'CYBER RESEARCH'}</span>
                      <h3>{p.title}</h3>
                      <p>{p.summary}</p>
                      {p.tags && p.tags.length > 0 && (
                        <div className="project-stack">
                          {p.tags.slice(0, 3).map((t) => (
                            <span key={t}>{t}</span>
                          ))}
                        </div>
                      )}
                      <span className="card-link" style={{ marginTop: 'auto', paddingTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#baff66', fontSize: '12px', fontWeight: 600 }}>
                        Read whitepaper <ArrowUpRight size={13} />
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
