import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  ShieldCheck,
  Check,
  CheckCircle2,
  Clock,
  Layers3,
  FileText,
  AlertTriangle,
  LockKeyhole,
  Terminal,
  Share2,
  ScanSearch,
  Crosshair,
  Code2,
  Network,
  BrainCircuit,
  Award,
  AlertCircle,
  RefreshCw,
  Send,
  Sparkles,
  ChevronRight,
  Copy,
  CheckCheck,
  Sliders,
  Users,
  Calendar,
  Zap,
  Cpu,
  Database,
  ShieldAlert,
  Download,
  Building2,
  Mail,
  Shield,
  HelpCircle
} from 'lucide-react';
import { apiRequest } from '../../api/client.js';
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

export default function ServiceDetailPage({
  serviceSlug,
  onBack,
  onScopeService
}) {
  const [copied, setCopied] = useState(false);
  const [pocCopied, setPocCopied] = useState(false);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interactive Scope Sizing State
  const [selectedTier, setSelectedTier] = useState('standard');
  const [activeChainStep, setActiveChainStep] = useState(0);

  // Quick scoping form state
  const [scopeEmail, setScopeEmail] = useState('');
  const [scopeTimeline, setScopeTimeline] = useState('Immediate (Next 1–2 Weeks)');
  const [scopeSubmitted, setScopeSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!serviceSlug) return;

    setLoading(true);
    setError(null);

    apiRequest(`/services/${serviceSlug}`)
      .then((data) => {
        const localSpec = SERVICE_DETAILS[serviceSlug] || {};
        const apiData = data?.service || {};
        if (apiData.title || localSpec.title) {
          setService({
            ...localSpec,
            ...apiData,
            number: localSpec.number || apiData.number || '01',
            tagline: apiData.tagline || localSpec.tagline || 'Enterprise Cybersecurity & Verified Defensive Engineering',
            duration: apiData.duration || localSpec.duration || '2 – 3 Weeks',
            assessmentType: apiData.assessmentType || localSpec.assessmentType || 'Manual & Automated Adversary Simulation',
            compliance: apiData.compliance || localSpec.compliance || 'OWASP · MITRE ATT&CK · NIST CSF · ISO 27001',
            clearance: apiData.clearance || localSpec.clearance || 'Strict NDA · Zero-Retention Tenant Isolated Testing',
            threatContext: apiData.threatContext || localSpec.threatContext || '',
            bullets: (apiData.bullets && apiData.bullets.length > 0) ? apiData.bullets : (localSpec.bullets || []),
            corePillars: (apiData.corePillars && apiData.corePillars.length > 0) ? apiData.corePillars : (localSpec.corePillars || []),
            methodologySteps: (apiData.methodologySteps && apiData.methodologySteps.length > 0) ? apiData.methodologySteps : (localSpec.methodologyPhases || localSpec.methodologySteps || []),
            deliverables: (apiData.deliverables && apiData.deliverables.length > 0) ? apiData.deliverables : (localSpec.deliverables || []),
            caseStudy: apiData.caseStudy || localSpec.sampleFinding || localSpec.caseStudy || null
          });
        } else {
          setError('Service specification not found.');
        }
      })
      .catch((err) => {
        const localSpec = SERVICE_DETAILS[serviceSlug];
        if (localSpec) {
          setService(localSpec);
        } else {
          setError(err.message || 'Unable to connect to service database.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [serviceSlug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCopyPoc = (code) => {
    if (navigator.clipboard && code) {
      navigator.clipboard.writeText(code);
      setPocCopied(true);
      setTimeout(() => setPocCopied(false), 2500);
    }
  };

  const handleQuickScopeSubmit = (e) => {
    e.preventDefault();
    if (!scopeEmail) return;
    setScopeSubmitted(true);
    setTimeout(() => {
      onScopeService(`${service?.title} [Tier: ${selectedTier.toUpperCase()} | Timeline: ${scopeTimeline} | Client: ${scopeEmail}]`);
    }, 800);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -70;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="enterprise-spec-root" style={{ minHeight: '80vh', padding: '120px 24px' }}>
        <div className="spec-canvas-container">
          <div className="skeleton-line" style={{ width: '220px', height: '24px', marginBottom: '32px' }} />
          <div className="skeleton-line" style={{ width: '70%', height: '54px', marginBottom: '20px' }} />
          <div className="skeleton-line" style={{ width: '100%', height: '24px', marginBottom: '14px' }} />
          <div className="skeleton-line" style={{ width: '90%', height: '24px', marginBottom: '36px' }} />
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="enterprise-spec-root" style={{ minHeight: '80vh', padding: '120px 24px' }}>
        <div className="spec-canvas-container" style={{ maxWidth: '700px', textAlign: 'center' }}>
          <div className="content-error-panel" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <AlertCircle size={36} className="error-icon" style={{ marginBottom: '16px' }} />
            <h3>Service Specification Not Found</h3>
            <p style={{ maxWidth: '500px', margin: '0 auto 24px' }}>
              {error || `No published service specification exists matching slug: "${serviceSlug}".`}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button type="button" className="btn btn-secondary" onClick={onBack}>
                <ArrowLeft size={15} /> All Offerings
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

  const ServiceIcon = iconMap[service.slug] || ShieldCheck;
  const pillars = service.corePillars || [];
  const methodology = service.methodologySteps || [];
  const deliverables = service.deliverables || [];
  const finding = service.caseStudy || service.sampleFinding || null;

  // Sizing tiers
  const tierConfigs = {
    focused: {
      name: 'Focused Endpoint / LLM Audit',
      timeframe: '10 Business Days',
      team: '2 Principal Adversary Emulators',
      scope: 'Targeted assessment of 1–3 model endpoints, direct prompts, or autonomous tool bindings.',
      deliverables: 'Vulnerability Catalog · Exact PoC Replays · Remediation Patches · 30-Day Retest',
      fit: 'Teams preparing for their first production public AI feature release.'
    },
    standard: {
      name: 'Full GenAI Pipeline & RAG Infrastructure',
      timeframe: '15 Business Days (Recommended)',
      team: '2 Principal Red Teamers + 1 SecOps Lead',
      scope: 'Complete adversary emulation across LLMs, vector embeddings (Pinecone/Qdrant), RAG parsers, and tool executors.',
      deliverables: 'Executive CISO Briefing · Full Exploit Dossier · Policy-as-Code Guardrails · 60-Day Retest',
      fit: 'Enterprises running mission-critical internal AI agents and customer-facing RAG bots.'
    },
    enterprise: {
      name: 'Autonomous Agent Fleet & Continuous Red Teaming',
      timeframe: '4 Weeks / Continuous Retesting',
      team: 'Dedicated 4-Person Adversary Emulation Pod',
      scope: 'Multi-agent tool orchestration, unauthorized database mutations, fine-tuning extraction, and runtime firewall gates.',
      deliverables: 'Cryptographic Audit Vault · Production Semantic Firewall · Continuous Verification · Regulatory Attestation',
      fit: 'Financial, healthcare, and high-compliance enterprises operating multi-tenant AI clouds.'
    }
  };

  const activeTierConfig = tierConfigs[selectedTier];

  // Visual Kill Chain Simulation
  const killChainSteps = [
    {
      title: '01. Ingestion / Vector Poisoning',
      icon: <Database size={18} />,
      actor: 'External Adversary',
      summary: 'Adversary plants base64-encoded invisible override tokens inside an uploaded PDF/document.',
      risk: 'Indirect Injection Context Infiltration'
    },
    {
      title: '02. Semantic Embeddings Indexing',
      icon: <Cpu size={18} />,
      actor: 'Vector Store (Pinecone/Qdrant)',
      summary: 'RAG pipeline chunks and indexes the poisoned document into high-priority similarity vectors without sanitization.',
      risk: 'Knowledge Base Compromise'
    },
    {
      title: '03. Agent Execution Hijack',
      icon: <AlertTriangle size={18} />,
      actor: 'LLM Function Caller',
      summary: 'Model processes retrieved context, overrides system constraints, and triggers unauthorized external API calls or database updates.',
      risk: 'Privilege Escalation & Data Leakage'
    },
    {
      title: '04. NexGuard Runtime Interception',
      icon: <ShieldCheck size={18} />,
      actor: 'NexGuard Defense Engine',
      summary: 'Dual-phase semantic firewall inspects token sequence in <15ms, blocks the function invocation, and issues high-fidelity alerts.',
      risk: 'Threat Neutralized & Patched'
    }
  ];

  return (
    <div className="enterprise-spec-root">
      {/* 1. Global Ambient Backdrop Elements */}
      <div className="spec-ambient-glow glow-1" />
      <div className="spec-ambient-glow glow-2" />
      <div className="spec-cyber-grid-overlay" />

      {/* 2. Sticky Quick-Nav & Action Toolbar */}
      <header className="spec-sticky-navbar">
        <div className="spec-canvas-container spec-navbar-inner">
          <div className="spec-nav-breadcrumbs">
            <button
              type="button"
              className="spec-nav-back-btn"
              onClick={onBack}
              title="Return to Services Catalog"
            >
              <ArrowLeft size={14} />
              <span>Catalog</span>
            </button>
            <span className="spec-breadcrumb-slash">/</span>
            <span className="spec-breadcrumb-tag">{service.category}</span>
            <span className="spec-breadcrumb-slash">/</span>
            <span className="spec-breadcrumb-title">{service.title}</span>
          </div>

          <div className="spec-nav-jump-links">
            <button type="button" onClick={() => scrollToSection('overview')}>Overview</button>
            <button type="button" onClick={() => scrollToSection('scope-sizing')}>Sizing</button>
            <button type="button" onClick={() => scrollToSection('kill-chain')}>Kill Chain</button>
            <button type="button" onClick={() => scrollToSection('pillars')}>Pillars</button>
            <button type="button" onClick={() => scrollToSection('methodology')}>Methodology</button>
            <button type="button" onClick={() => scrollToSection('poc-finding')}>PoC Dossier</button>
            <button type="button" onClick={() => scrollToSection('deliverables')}>Deliverables</button>
          </div>

          <div className="spec-nav-cta-group">
            <button
              type="button"
              className="spec-share-btn"
              onClick={handleShare}
              title="Share specification link"
            >
              <Share2 size={13} />
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            <button
              type="button"
              className="spec-primary-action-btn"
              onClick={() => scrollToSection('scoping-intake')}
            >
              <Send size={13} />
              <span>Scope Project</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Hero Presentation Stage */}
      <section className="spec-hero-stage" id="overview">
        <div className="spec-canvas-container">
          <div className="spec-hero-grid">
            {/* Left Narrative Column */}
            <div className="spec-hero-left">
              <div className="spec-meta-pills-row">
                <span className="spec-code-tag mono">SEC-{service.number || '01'}</span>
                <span className="spec-category-tag">{service.category}</span>
                <span className="spec-status-beacon">
                  <span className="beacon-pulse" />
                  <span>ACTIVE ENGAGEMENT Q2 2026</span>
                </span>
              </div>

              <h1 className="spec-hero-main-title">{service.title}</h1>
              <p className="spec-hero-tagline-text">{service.tagline}</p>
              <p className="spec-hero-lead-summary">{service.summary}</p>

              {/* 4 Connected Stat Tiles */}
              <div className="spec-stats-bar">
                <div className="spec-stat-item">
                  <div className="stat-value mono">{service.duration}</div>
                  <div className="stat-label">Typical Delivery Window</div>
                </div>
                <div className="spec-stat-divider" />
                <div className="spec-stat-item">
                  <div className="stat-value mono">100% PoC</div>
                  <div className="stat-label">Evidence-Backed Proofs</div>
                </div>
                <div className="spec-stat-divider" />
                <div className="spec-stat-item">
                  <div className="stat-value mono">Zero-Retention</div>
                  <div className="stat-label">Isolated Testing Vault</div>
                </div>
                <div className="spec-stat-divider" />
                <div className="spec-stat-item">
                  <div className="stat-value mono">Retest Free</div>
                  <div className="stat-label">60-Day Re-Verification</div>
                </div>
              </div>

              {/* Dual Action CTAs */}
              <div className="spec-hero-action-buttons">
                <button
                  type="button"
                  className="btn btn-primary spec-hero-cta-btn"
                  onClick={() => scrollToSection('scoping-intake')}
                >
                  <span>Initiate Discovery & Scoping</span>
                  <ArrowUpRight size={16} />
                </button>

                <button
                  type="button"
                  className="btn btn-secondary spec-hero-secondary-btn"
                  onClick={() => scrollToSection('scope-sizing')}
                >
                  <Sliders size={15} />
                  <span>Configure Infrastructure Sizing</span>
                </button>
              </div>
            </div>

            {/* Right Engagement Specification Profile Card */}
            <div className="spec-hero-right">
              <div className="spec-profile-card">
                <div className="profile-card-top">
                  <div className="profile-icon-halo">
                    <ServiceIcon size={26} />
                  </div>
                  <div>
                    <h3 className="profile-card-heading">ENGAGEMENT SPECIFICATION</h3>
                    <span className="profile-card-subheading mono">GOV & ENTERPRISE COMPLIANT</span>
                  </div>
                </div>

                <div className="profile-spec-rows">
                  <div className="profile-spec-row">
                    <span className="row-label">Operational Window</span>
                    <span className="row-value mono text-accent">{service.duration}</span>
                  </div>
                  <div className="profile-spec-row">
                    <span className="row-label">Assessment Methodology</span>
                    <span className="row-value mono">{service.assessmentType}</span>
                  </div>
                  <div className="profile-spec-row">
                    <span className="row-label">Compliance Mappings</span>
                    <span className="row-value mono">{service.compliance}</span>
                  </div>
                  <div className="profile-spec-row">
                    <span className="row-label">Clearance & RoE</span>
                    <span className="row-value mono">{service.clearance}</span>
                  </div>
                  <div className="profile-spec-row">
                    <span className="row-label">Reporting Delivery</span>
                    <span className="row-value mono">Cryptographic PGP Vault + CISO Briefing</span>
                  </div>
                </div>

                <div className="profile-card-deliverables-box">
                  <span className="deliverables-box-title">Key Scope Inclusions:</span>
                  <div className="deliverables-checklist">
                    {service.bullets.slice(0, 4).map((b, i) => (
                      <div key={i} className="deliv-check-item">
                        <Check size={14} className="text-accent flex-shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="profile-card-book-btn"
                  onClick={() => scrollToSection('scoping-intake')}
                >
                  <span>Book Principal Engineer Scoping</span>
                  <ArrowUpRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Threat Context & Attack Surface Analysis */}
      <section className="spec-section-wrapper" id="threat-surface">
        <div className="spec-canvas-container">
          <div className="spec-section-header">
            <div className="sec-eyebrow">
              <LockKeyhole size={14} className="text-accent" />
              <span>ATTACK SURFACE & THREAT LANDSCAPE</span>
            </div>
            <h2>Why Modern Generative AI Systems Get Breached</h2>
            <p>
              Autonomous agents, RAG document pipelines, and LLM tool calling introduce novel vulnerabilities that bypass traditional Web Application Firewalls (WAFs).
            </p>
          </div>

          <div className="threat-context-wide-card">
            <p className="threat-context-lead-text">{service.threatContext}</p>
            <div className="threat-framework-pills">
              <span className="framework-pill">OWASP LLM Top 10 (2025 Standard)</span>
              <span className="framework-pill">MITRE ATLAS (Adversarial ML Matrix)</span>
              <span className="framework-pill">NIST AI Risk Management Framework 1.0</span>
              <span className="framework-pill">EU AI Act Technical Readiness</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Interactive Infrastructure Sizing Calculator */}
      <section className="spec-section-wrapper spec-section-darker" id="scope-sizing">
        <div className="spec-canvas-container">
          <div className="spec-section-header">
            <div className="sec-eyebrow">
              <Sliders size={14} className="text-accent" />
              <span>ENGAGEMENT SIZING MATRIX</span>
            </div>
            <h2>Select Your Deployment Architecture</h2>
            <p>Compare engagement scopes, assigned personnel, turnaround windows, and deliverables.</p>
          </div>

          <div className="spec-sizing-container">
            {/* Sizing Tabs */}
            <div className="sizing-tier-cards-row">
              {Object.entries(tierConfigs).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  className={`sizing-tier-card ${selectedTier === key ? 'active' : ''}`}
                  onClick={() => setSelectedTier(key)}
                >
                  <div className="tier-card-header">
                    <span className="tier-chip mono">{key.toUpperCase()}</span>
                    {key === 'standard' && <span className="tier-pop-badge">POPULAR</span>}
                  </div>
                  <h4>{config.name}</h4>
                  <div className="tier-time-highlight mono">{config.timeframe}</div>
                  <p className="tier-summary-text">{config.scope}</p>
                </button>
              ))}
            </div>

            {/* Sizing Active Breakdown Box */}
            <div className="sizing-active-breakdown-box">
              <div className="breakdown-grid">
                <div className="breakdown-item">
                  <div className="item-label mono"><Users size={14} className="text-accent" /> ASSIGNED OPERATORS</div>
                  <div className="item-value">{activeTierConfig.team}</div>
                  <p className="item-desc">Senior red-team operators assigned directly to your project under mutual NDA.</p>
                </div>
                <div className="breakdown-item">
                  <div className="item-label mono"><Calendar size={14} className="text-accent" /> ENGAGEMENT DURATION</div>
                  <div className="item-value mono">{activeTierConfig.timeframe}</div>
                  <p className="item-desc">Comprehensive manual exploitation, fuzzing, and telemetry reporting.</p>
                </div>
                <div className="breakdown-item">
                  <div className="item-label mono"><FileText size={14} className="text-accent" /> DELIVERABLES PACKAGE</div>
                  <div className="item-value">{activeTierConfig.deliverables}</div>
                  <p className="item-desc">{activeTierConfig.fit}</p>
                </div>
              </div>

              <div className="breakdown-footer-action">
                <span className="breakdown-guarantee">
                  <ShieldCheck size={14} className="text-accent" /> Free 60-Day Retesting Included on Remediated Findings
                </span>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => onScopeService(`${service.title} (${activeTierConfig.name})`)}
                >
                  <span>Select {selectedTier.toUpperCase()} & Continue</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Interactive Kill Chain & Neutralization Flow */}
      <section className="spec-section-wrapper" id="kill-chain">
        <div className="spec-canvas-container">
          <div className="spec-section-header">
            <div className="sec-eyebrow">
              <ShieldAlert size={14} className="text-accent" />
              <span>EXPLOITATION SIMULATION</span>
            </div>
            <h2>Interactive Adversarial Kill Chain & Defense Flow</h2>
            <p>Understand how a multi-stage attack manifests against generative AI and how NexGuard neutralizes it.</p>
          </div>

          <div className="kill-chain-interactive-board">
            <div className="chain-stages-horizontal">
              {killChainSteps.map((step, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`chain-stage-button ${activeChainStep === idx ? 'active' : ''}`}
                  onClick={() => setActiveChainStep(idx)}
                >
                  <div className="stage-top-meta">
                    <span className="stage-idx mono">0{idx + 1}</span>
                    <span className="stage-actor mono">{step.actor}</span>
                  </div>
                  <h4>{step.title}</h4>
                  <span className="stage-risk-pill mono">{step.risk}</span>
                </button>
              ))}
            </div>

            <div className="chain-active-panel">
              <div className="chain-panel-header">
                <span className="panel-actor-tag mono">ACTOR: {killChainSteps[activeChainStep].actor}</span>
                <span className="panel-risk-status mono">STATUS: {killChainSteps[activeChainStep].risk}</span>
              </div>
              <h3 className="chain-panel-title">{killChainSteps[activeChainStep].title}</h3>
              <p className="chain-panel-desc">{killChainSteps[activeChainStep].summary}</p>
              <div className="chain-panel-defense-box">
                <div className="defense-box-title">
                  <ShieldCheck size={15} className="text-accent" />
                  <span>NexGuard Mitigation Blueprint</span>
                </div>
                <p>
                  Deploy pre-call JSON schema validation gates, isolate untrusted document tokens in sandboxed memory spaces, and enforce least-privilege API scopes to prevent tool-misuse breakouts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Core Architecture Pillars */}
      {pillars.length > 0 && (
        <section className="spec-section-wrapper spec-section-darker" id="pillars">
          <div className="spec-canvas-container">
            <div className="spec-section-header">
              <div className="sec-eyebrow">
                <ShieldCheck size={14} className="text-accent" />
                <span>CORE DEFENSIVE PILLARS</span>
              </div>
              <h2>Comprehensive Technical Pillar Architecture</h2>
              <p>Four rigorous inspection disciplines executed throughout the engagement lifecycle.</p>
            </div>

            <div className="pillars-enterprise-grid">
              {pillars.map((pil, idx) => (
                <div key={idx} className="pillar-enterprise-card">
                  <div className="pillar-card-top-bar">
                    <span className="pillar-num-badge mono">PILLAR / 0{idx + 1}</span>
                    <ShieldCheck size={20} className="text-accent" />
                  </div>
                  <h3>{pil.title}</h3>
                  <p className="pillar-lead-desc">{pil.description || pil.desc}</p>

                  {(pil.checks || pil.points) && (
                    <div className="pillar-checklist-section">
                      <span className="checklist-subheading">Technical Verification Criteria:</span>
                      <ul>
                        {(pil.checks || pil.points).map((pt, pIdx) => (
                          <li key={pIdx}>
                            <Check size={14} className="text-accent flex-shrink-0" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. 4-Phase Operational Methodology */}
      {methodology.length > 0 && (
        <section className="spec-section-wrapper" id="methodology">
          <div className="spec-canvas-container">
            <div className="spec-section-header">
              <div className="sec-eyebrow">
                <Terminal size={14} className="text-accent" />
                <span>OPERATIONAL PHASES</span>
              </div>
              <h2>Structured 4-Phase Engagement Lifecycle</h2>
              <p>Transparent milestones from reconnaissance to live debrief and post-remediation verification.</p>
            </div>

            <div className="methodology-lifecycle-stack">
              {methodology.map((step, idx) => (
                <div key={idx} className="methodology-phase-row">
                  <div className="phase-marker-column">
                    <div className="phase-number-circle mono">{step.phase || `0${idx + 1}`}</div>
                    <div className="phase-vertical-line" />
                  </div>

                  <div className="phase-content-card">
                    <div className="phase-card-top">
                      <div>
                        <span className="phase-tag mono">PHASE {step.phase || idx + 1}</span>
                        <h3 className="phase-title">{step.name || step.title || `Phase ${step.phase || idx + 1}`}</h3>
                      </div>
                      {step.timeframe && (
                        <span className="phase-time-pill mono">
                          <Clock size={12} />
                          {step.timeframe}
                        </span>
                      )}
                    </div>

                    <p className="phase-description">{step.description || step.desc}</p>

                    {step.deliverable && (
                      <div className="phase-deliverable-bar">
                        <span className="deliv-bar-label mono">MILESTONE DELIVERABLE:</span>
                        <span className="deliv-bar-value">{step.deliverable}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 9. Real Redacted PoC Dossier */}
      {finding && (
        <section className="spec-section-wrapper spec-section-darker" id="poc-finding">
          <div className="spec-canvas-container">
            <div className="spec-section-header">
              <div className="sec-eyebrow">
                <AlertTriangle size={14} className="text-accent" />
                <span>REDACTED VULNERABILITY DOSSIER</span>
              </div>
              <h2>Evidence-Led Proof of Concept Finding</h2>
              <p>An authentic finding excerpt demonstrating our zero-false-positive documentation standard.</p>
            </div>

            <div className="poc-dossier-card">
              <div className="dossier-head">
                <div>
                  <div className="dossier-badges-row">
                    <span className="dossier-severity-badge">
                      <AlertTriangle size={13} /> {finding.severity || 'CRITICAL (CVSS 8.2)'}
                    </span>
                    {finding.cwe && <span className="dossier-cwe-badge mono">{finding.cwe}</span>}
                  </div>
                  <h3 className="dossier-title">{finding.title}</h3>
                </div>
              </div>

              <div className="dossier-section-block">
                <h4>Adversary Impact Assessment</h4>
                <p>{finding.impact}</p>
              </div>

              {finding.poc && (
                <div className="dossier-terminal-block">
                  <div className="terminal-top-row">
                    <div className="terminal-title mono">
                      <Terminal size={14} className="text-accent" />
                      <span>REPRODUCIBLE ADVERSARIAL TRANSCRIPT & EXPLOIT PAYLOAD</span>
                    </div>
                    <button
                      type="button"
                      className="terminal-copy-button"
                      onClick={() => handleCopyPoc(finding.poc)}
                    >
                      {pocCopied ? (
                        <>
                          <CheckCheck size={13} />
                          <span>Copied Payload</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy Raw Payload</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="terminal-code-body">
                    <code>{finding.poc}</code>
                  </pre>
                </div>
              )}

              {finding.remediation && (
                <div className="dossier-remediation-block">
                  <h4>Deterministic Guardrail Remediation</h4>
                  <p>{finding.remediation}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 10. Audit-Ready Deliverables Package */}
      {deliverables.length > 0 && (
        <section className="spec-section-wrapper" id="deliverables">
          <div className="spec-canvas-container">
            <div className="spec-section-header">
              <div className="sec-eyebrow">
                <FileText size={14} className="text-accent" />
                <span>DELIVERABLES PACKAGE</span>
              </div>
              <h2>Audit-Ready Artifacts for Executive & Engineering Teams</h2>
              <p>Everything delivered via cryptographic vault with full reproduction scripts and remediation guidance.</p>
            </div>

            <div className="deliverables-four-grid">
              {deliverables.map((item, dIdx) => (
                <div className="deliverable-quad-card" key={dIdx}>
                  <div className="quad-top-meta">
                    <span className="quad-num mono">0{dIdx + 1}</span>
                    <FileText size={20} className="text-accent" />
                  </div>
                  <h4>{typeof item === 'string' ? item : item.title}</h4>
                  <p>
                    {typeof item === 'object' && item.desc
                      ? item.desc
                      : 'Cryptographically signed audit document for board reporting, regulatory compliance, and developer remediation.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 11. Interactive Scoping Intake Form & Direct Discovery Call */}
      <section className="spec-section-wrapper spec-section-darker" id="scoping-intake">
        <div className="spec-canvas-container">
          <div className="spec-scoping-banner-box">
            <div className="banner-left-info">
              <span className="banner-badge mono">DIRECT PRINCIPAL ENGINEER INTAKE</span>
              <h2>Ready to schedule your {service.title}?</h2>
              <p>
                Submit your target parameters below to receive a customized scoping document within 24 hours under mutual NDA. Zero automated boilerplate.
              </p>

              <div className="banner-assurance-list">
                <div className="assurance-bullet">
                  <ShieldCheck size={16} className="text-accent" />
                  <span>Signed Mutual NDA before any discovery call or repository access.</span>
                </div>
                <div className="assurance-bullet">
                  <Clock size={16} className="text-accent" />
                  <span>24-Hour Scoping Turnaround with explicit fixed-bid cost & duration.</span>
                </div>
                <div className="assurance-bullet">
                  <LockKeyhole size={16} className="text-accent" />
                  <span>Zero-Disruption Mandate governed by formalized Rules of Engagement.</span>
                </div>
              </div>
            </div>

            <div className="banner-right-form-wrap">
              {scopeSubmitted ? (
                <div className="scoping-success-card">
                  <CheckCircle2 size={36} className="text-accent" />
                  <h3>Discovery Request Received</h3>
                  <p>Our principal offensive security team has received your inquiry for <strong>{service.title}</strong>.</p>
                  <span className="mono text-accent">Dispatching mutual NDA to {scopeEmail}...</span>
                </div>
              ) : (
                <form className="scoping-intake-form" onSubmit={handleQuickScopeSubmit}>
                  <div className="form-field-group">
                    <label>Corporate Email (Work Email Required)</label>
                    <div className="form-input-with-icon">
                      <Mail size={15} className="input-icon" />
                      <input
                        type="email"
                        required
                        placeholder="ciso@enterprise.com"
                        value={scopeEmail}
                        onChange={(e) => setScopeEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label>Target Execution Timeline</label>
                    <select
                      value={scopeTimeline}
                      onChange={(e) => setScopeTimeline(e.target.value)}
                    >
                      <option>Immediate (Next 1–2 Weeks)</option>
                      <option>Next 30 Days (Pre-Launch)</option>
                      <option>Upcoming Quarter (Q2/Q3 2026)</option>
                      <option>Ongoing / Continuous Red Teaming</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary btn-submit-scope">
                    <span>Request Formal Scoping Proposal</span>
                    <ArrowUpRight size={16} />
                  </button>

                  <span className="form-privacy-note">
                    <Shield size={12} /> Strictly confidential. Data never shared or ingested into public LLMs.
                  </span>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
