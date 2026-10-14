import React, { useState } from 'react';
import {
  ShieldCheck,
  Cpu,
  Terminal,
  Cloud,
  BrainCircuit,
  Layers3,
  Maximize2,
  Sparkles,
  ExternalLink
} from 'lucide-react';

const CANONICAL_BANNER_MAP = {
  'zero-day-hypervisor-corruption': '/uploads/hypervisor_banner.webp',
  'ebpf-rootkit-evasion-memory-forensics': '/uploads/ebpf_rootkit_banner.webp',
  'cloud-identity-oidc-supply-chain-poisoning': '/uploads/cloud_oidc_banner.webp',
  'instructor-field-report-kerberos-delegation': '/uploads/kerberos_banner.webp',
  'continuous-purple-teaming-telemetry': '/uploads/purple_team_banner.webp',
  'indirect-prompt-injection-mitigation': '/uploads/prompt_guard_banner.webp',
  'zero-trust-spa-session-boundaries': '/uploads/zero_trust_banner.webp'
};

export default function CyberHeroBanner({
  bannerImage,
  title,
  slug,
  category = 'OFFENSIVE SECURITY',
  number = '01',
  onClickZoom
}) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Resolve authentic banner image with guaranteed high-res fallback
  const effectiveBanner =
    bannerImage && !bannerImage.includes('cyber_banner_1791882575878')
      ? bannerImage
      : CANONICAL_BANNER_MAP[slug] || '/uploads/hypervisor_banner.webp';

  return (
    <div
      className="research-hero-banner-wrap"
      style={{
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        marginTop: '28px',
        marginBottom: '32px',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        boxShadow: '0 0 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(56, 189, 248, 0.12)',
        background: '#040810'
      }}
    >
      {/* 1. Header Bar on top of Banner */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          background: 'linear-gradient(180deg, rgba(2, 6, 23, 0.92) 0%, rgba(2, 6, 23, 0.4) 80%, transparent 100%)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#00e599',
              boxShadow: '0 0 8px #00e599'
            }}
          />
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '11px',
              letterSpacing: '0.08em',
              color: '#38bdf8',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}
          >
            RESEARCH HERO BANNER · .WEBP OPTIMIZED
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '10px',
              fontFamily: 'var(--mono)',
              color: '#94a3b8',
              background: 'rgba(15, 23, 42, 0.8)',
              padding: '3px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(56, 189, 248, 0.25)'
            }}
          >
            REF: NG-RESEARCH /{number}
          </span>
          {onClickZoom && (
            <button
              type="button"
              onClick={onClickZoom}
              title="Click to expand high-resolution banner in Lightbox"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '10px',
                fontFamily: 'var(--mono)',
                color: '#e2e8f0',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '4px',
                padding: '3px 9px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Maximize2 size={12} />
              <span>EXPAND</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Hero Banner Image */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxHeight: '480px',
          aspectRatio: '16/9',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: onClickZoom ? 'pointer' : 'default',
          background: 'radial-gradient(ellipse at center, #09131f 0%, #020610 100%)'
        }}
        onClick={onClickZoom}
      >
        <img
          src={effectiveBanner}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: imgError ? 'none' : 'block',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
            opacity: imgLoaded ? 1 : 0.95
          }}
          loading="eager"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />

        {/* Fallback if file failed to load */}
        {imgError && (
          <div
            style={{
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              color: '#38bdf8',
              textAlign: 'center'
            }}
          >
            <ShieldCheck size={48} />
            <b style={{ fontSize: '16px', color: '#ffffff' }}>{title}</b>
            <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: '#94a3b8' }}>
              OFFICIAL RESEARCH WHITE PAPER ARTIFACT
            </span>
          </div>
        )}
      </div>

      {/* 3. Footer Caption Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 18px',
          background: 'linear-gradient(0deg, rgba(2, 6, 23, 0.95) 0%, rgba(2, 6, 23, 0.5) 80%, transparent 100%)',
          borderTop: '1px solid rgba(56, 189, 248, 0.15)'
        }}
      >
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: '11px',
            color: '#cbd5e1',
            letterSpacing: '0.04em'
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: '10px',
            color: '#00e599',
            letterSpacing: '0.06em'
          }}
        >
          HIGH-RESOLUTION SPECIFICATION
        </span>
      </div>
    </div>
  );
}
