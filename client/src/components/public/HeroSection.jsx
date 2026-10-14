import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  ScanSearch,
  Network,
  Code2,
  Terminal,
  Activity,
  CheckCircle2,
  LockKeyhole,
  GraduationCap,
  BrainCircuit,
  Play,
  RotateCcw
} from 'lucide-react';
import { Button } from '../ui/button.jsx';

// 3 Core Security Layers for the Attack Surface Graph
const SECURITY_LAYERS = [
  {
    id: 'perimeter',
    step: '01',
    title: 'Perimeter Gateway',
    subtitle: 'WAF & DDoS Mitigation',
    target: 'edge.nexguard.io:443',
    status: 'SECURE',
    statusClass: 'status-emerald',
    port: '443 / TLS 1.3',
    threat: '0 Surface Bypasses',
    detail: 'Cloudflare origin cloaking, automated rate limiting, and mTLS verification enforced.'
  },
  {
    id: 'auth',
    step: '02',
    title: 'Auth & Logic Engine',
    subtitle: 'Zero-Trust Policy Core',
    target: 'api.auth.nexguard.io:8443',
    status: 'VERIFIED',
    statusClass: 'status-lime',
    port: '8443 / GraphQL',
    threat: 'BOLA & IDOR Defended',
    detail: 'Cryptographic token validation, RBAC tenant isolation, and strict schema validation.'
  },
  {
    id: 'mesh',
    step: '03',
    title: 'Internal Data Mesh',
    subtitle: 'Microsegmentation',
    target: 'mesh.internal:9000',
    status: 'ISOLATED',
    statusClass: 'status-cyan',
    port: '9000 / gRPC',
    threat: 'Egress Filtering Active',
    detail: 'Ephemeral credentials, AES-256 GCM encryption at rest, and zero lateral movement paths.'
  }
];

// Offensive Penetration Tests
const EXPLOIT_TESTS = [
  {
    id: 'bola',
    name: 'Broken Object Level Authorization',
    code: 'BOLA / IDOR',
    target: 'POST /api/v2/tenants/{id}/vault',
    severity: 'CVSS 9.8',
    status: 'BLOCKED',
    result: '403 Forbidden',
    summary: 'Forged tenant header rejected by Zero-Trust gateway signature engine.'
  },
  {
    id: 'ssrf',
    name: 'Cloud Metadata Exfiltration',
    code: 'IMDSv2 SSRF',
    target: 'POST /webhook?url=169.254.169.254',
    severity: 'CVSS 8.6',
    status: 'FILTERED',
    result: 'Egress Dropped',
    summary: 'Metadata hop-limit filter and loopback sandbox prevented credential leak.'
  },
  {
    id: 'jwt',
    name: 'JWT Algorithm Confusion (RS256/HS256)',
    code: 'SIGNATURE FORGERY',
    target: 'Authorization: Bearer eyJhbGci...',
    severity: 'CVSS 9.1',
    status: 'REJECTED',
    result: 'Invalid Signature',
    summary: 'Public key forgery blocked by strict asymmetric certificate validation.'
  }
];

export default function HeroSection() {
  const [activeLayerIdx, setActiveLayerIdx] = useState(1); // Default to Auth engine
  const [activeTab, setActiveTab] = useState('graph'); // 'graph' | 'exploits' | 'terminal'
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditSuccess, setAuditSuccess] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([
    { type: 'info', text: '[INFO] NexGuard Offensive Operations Engine v4.2 initialized' },
    { type: 'info', text: '[INFO] Target scope: api.nexguard.io · 142 endpoints mapped' },
    { type: 'scan', text: '[SCAN] Simulating external recon & WAF boundary probe...' },
    { type: 'pass', text: '[PASS] Edge perimeter secure: 0 open bypasses identified' },
    { type: 'scan', text: '[TEST] Fuzzing authentication endpoints with BOLA payloads...' },
    { type: 'pass', text: '[PASS] Zero-Trust policy enforced: Request blocked with HTTP 403' },
    { type: 'pass', text: '[PASS] Cloud SSRF probe neutralized: Metadata egress filter active' }
  ]);

  const activeLayer = SECURITY_LAYERS[activeLayerIdx];

  const handleTriggerAudit = () => {
    if (isAuditing) return;
    setIsAuditing(true);
    setAuditSuccess(false);

    setTerminalLogs((prev) => [
      ...prev,
      { type: 'scan', text: '[AUDIT] Running full offensive penetration test suite...' }
    ]);

    setTimeout(() => {
      setTerminalLogs((prev) => [
        ...prev,
        { type: 'pass', text: '[PASS] Verified 142 endpoints · Zero critical vulnerabilities' },
        { type: 'pass', text: '[COMPLETE] Posture verified: 99.4% Resilience Score' }
      ]);
      setIsAuditing(false);
      setAuditSuccess(true);

      setTimeout(() => setAuditSuccess(false), 3000);
    }, 1000);
  };

  const handleTestExploit = (test) => {
    setActiveTab('terminal');
    setTerminalLogs((prev) => [
      ...prev,
      { type: 'scan', text: `[TEST] Simulating ${test.name} (${test.target})...` },
      { type: 'pass', text: `[RESULT] ${test.status} (${test.result}) — ${test.summary}` }
    ]);
  };

  return (
    <section className="hero section-grid" id="home">
      <div className="hero-grid-lines" />
      <div className="container hero-layout">
        {/* Left Hero Copy */}
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            OFFENSIVE SECURITY <span className="eyebrow-slash">/</span> INTELLIGENT ENGINEERING
          </div>

          <h1>
            Think like an attacker.<br />
            <span className="hero-headline-accent">Build beyond</span><br />
            the threat.
          </h1>

          <p className="hero-lede">
            Adversary emulation, ring-0 vulnerability research, secure architecture reviews, and high-impact cyber engineering for security-critical environments.
          </p>

          <div className="hero-actions">
            <Button
              as="a"
              href="#contact"
              variant="primary"
              size="lg"
            >
              Discuss a security project <ArrowUpRight size={16} />
            </Button>
            <Button
              as="a"
              href="#academy"
              variant="secondary"
              size="lg"
            >
              Explore the academy <ArrowDownRight size={16} />
            </Button>
          </div>

          <div className="hero-meta">
            <span>
              <span className="status-dot" /> SCOPED ADVERSARY EMULATION
            </span>
            <span className="meta-divider" />
            <span>RESEARCH · ENGINEERING · EDUCATION</span>
          </div>
        </div>

        {/* Right Hero Interactive Security Operations Console */}
        <div className="hero-visual sleek-security-console">
          {/* 1. Window Header Bar */}
          <div className="console-window-bar">
            <div className="console-window-dots">
              <span className="window-dot dot-red" />
              <span className="window-dot dot-amber" />
              <span className="window-dot dot-green" />
              <span className="console-title mono">nexguard // telemetry-console</span>
            </div>

            <div className="console-status-pill">
              <span className="pulse-dot-green" />
              <span className="mono">VERIFIED ACTIVE</span>
            </div>
          </div>

          {/* 2. Key Telemetry Ribbon */}
          <div className="console-telemetry-ribbon">
            <div className="telemetry-block">
              <span className="telemetry-label">TARGET SCOPE</span>
              <span className="telemetry-value mono">api.nexguard.io</span>
            </div>
            <div className="telemetry-divider" />
            <div className="telemetry-block">
              <span className="telemetry-label">ENDPOINTS</span>
              <span className="telemetry-value mono">142 Scoped</span>
            </div>
            <div className="telemetry-divider" />
            <div className="telemetry-block">
              <span className="telemetry-label">DEFENSIVE POSTURE</span>
              <span className="telemetry-score mono">99.4% RESILIENT</span>
            </div>
          </div>

          {/* 3. Navigation Tabs */}
          <div className="console-tabs-bar">
            <button
              type="button"
              className={`console-tab ${activeTab === 'graph' ? 'active' : ''}`}
              onClick={() => setActiveTab('graph')}
            >
              <Network size={13} />
              <span>Attack Surface</span>
            </button>
            <button
              type="button"
              className={`console-tab ${activeTab === 'exploits' ? 'active' : ''}`}
              onClick={() => setActiveTab('exploits')}
            >
              <Activity size={13} />
              <span>Exploit Vectors</span>
            </button>
            <button
              type="button"
              className={`console-tab ${activeTab === 'terminal' ? 'active' : ''}`}
              onClick={() => setActiveTab('terminal')}
            >
              <Terminal size={13} />
              <span>Audit Console</span>
            </button>
          </div>

          {/* 4. Main Console Display Area */}
          <div className="console-main-canvas">
            {/* VIEW 1: ATTACK SURFACE TOPOLOGY */}
            {activeTab === 'graph' && (
              <div className="canvas-view graph-view technical-topology-view">
                <div className="topology-nodes-grid">
                  {SECURITY_LAYERS.map((layer, idx) => {
                    const isSelected = activeLayerIdx === idx;
                    return (
                      <div
                        key={layer.id}
                        className={`topology-node-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setActiveLayerIdx(idx)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setActiveLayerIdx(idx);
                          }
                        }}
                      >
                        <div className="topology-card-header">
                          <span className="topology-step mono">STAGE {layer.step}</span>
                          <span className={`topology-status-badge ${layer.statusClass} mono`}>
                            {layer.status}
                          </span>
                        </div>
                        <h4 className="topology-title">{layer.title}</h4>
                        <span className="topology-target mono">{layer.target}</span>
                        <div className="topology-port-tag mono">{layer.port}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW 2: EXPLOIT TESTS */}
            {activeTab === 'exploits' && (
              <div className="canvas-view exploits-view">
                <div className="exploits-list">
                  {EXPLOIT_TESTS.map((test) => (
                    <div key={test.id} className="exploit-item-card">
                      <div className="exploit-header-row">
                        <div className="exploit-title-group">
                          <span className="exploit-code mono">{test.code}</span>
                          <span className="exploit-full-name">{test.name}</span>
                        </div>
                        <span className="exploit-severity-badge mono">{test.severity}</span>
                      </div>

                      <div className="exploit-detail-row">
                        <span className="exploit-target mono">{test.target}</span>
                        <span className="exploit-status-badge mono">
                          <CheckCircle2 size={11} /> {test.status}
                        </span>
                      </div>

                      <div className="exploit-footer-row">
                        <span className="exploit-summary-text">{test.summary}</span>
                        <button
                          type="button"
                          className="btn-test-exploit mono"
                          onClick={() => handleTestExploit(test)}
                        >
                          <Play size={10} /> Emulate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 3: TERMINAL LOGS */}
            {activeTab === 'terminal' && (
              <div className="canvas-view terminal-view">
                <div className="terminal-logs-window">
                  {terminalLogs.map((log, i) => (
                    <div key={i} className={`terminal-log-row log-${log.type} mono`}>
                      {log.text}
                    </div>
                  ))}
                </div>
                <div className="terminal-actions-bar">
                  <button
                    type="button"
                    className="terminal-action-btn mono"
                    onClick={handleTriggerAudit}
                    disabled={isAuditing}
                  >
                    {isAuditing ? 'Testing...' : '▶ Run Verification'}
                  </button>
                  <button
                    type="button"
                    className="terminal-action-btn mono"
                    onClick={() =>
                      setTerminalLogs([
                        { type: 'info', text: '[INFO] Logs refreshed. Zero-Trust telemetry stream active.' }
                      ])
                    }
                  >
                    <RotateCcw size={10} /> Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 5. Lower Verification Drawer */}
          <div className="console-lower-drawer">
            <div className="drawer-header">
              <div className="drawer-layer-title">
                <span className="drawer-step mono">STAGE {activeLayer.step}</span>
                <span className="drawer-name">{activeLayer.title}</span>
                <span className="drawer-port mono">{activeLayer.port}</span>
              </div>
              <span className={`drawer-badge ${activeLayer.statusClass} mono`}>
                {activeLayer.threat}
              </span>
            </div>

            <p className="drawer-detail-text">{activeLayer.detail}</p>

            <div className="drawer-action-row">
              <div className="drawer-status-line">
                <span className="status-dot live-blink" />
                <span className="mono">CONTINUOUS OFFENSIVE MONITORING</span>
              </div>
              <button
                type="button"
                className={`btn-audit-trigger mono ${isAuditing ? 'auditing' : ''} ${auditSuccess ? 'success' : ''}`}
                onClick={handleTriggerAudit}
                disabled={isAuditing}
              >
                <span>{isAuditing ? 'VERIFYING...' : auditSuccess ? 'PASSED ✓' : 'RUN AUDIT →'}</span>
              </button>
            </div>
          </div>

          {/* 6. Console Footing */}
          <div className="console-footing">
            <span className="mono">FIG 01. / SECURITY ARCHITECTURE MATRIX</span>
            <a href="#services" className="caption-link mono">
              VIEW METHODOLOGY →
            </a>
          </div>
        </div>
      </div>

      <div className="hero-bottom container">
        <span>CORE DISCIPLINES</span>
        <div>
          <span><ScanSearch size={15} /> OFFENSIVE SECURITY</span>
          <span><Code2 size={15} /> SECURE SYSTEMS</span>
          <span><GraduationCap size={16} /> PRACTICAL ACADEMY</span>
          <span><BrainCircuit size={15} /> RESEARCH & LABS</span>
        </div>
      </div>
    </section>
  );
}
