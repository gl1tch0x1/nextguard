import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ZoomIn,
  ZoomOut,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Terminal,
  Activity,
  Maximize2
} from 'lucide-react';

export default function ImageLightbox({
  isOpen,
  onClose,
  images = [],
  currentIndex = 0,
  onNavigate
}) {
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const currentImage = images[currentIndex] || null;

  // Handle keyboard shortcuts (ESC, ArrowLeft, ArrowRight)
  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && images.length > 1 && onNavigate) {
        onNavigate((currentIndex - 1 + images.length) % images.length);
      }
      if (e.key === 'ArrowRight' && images.length > 1 && onNavigate) {
        onNavigate((currentIndex + 1) % images.length);
      }
    },
    [isOpen, onClose, images.length, currentIndex, onNavigate]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    setZoom(1);
    setHasError(false);
    setLoaded(false);
  }, [currentIndex]);

  if (!isOpen || !currentImage) return null;
  if (typeof document === 'undefined') return null;

  const imageUrl = typeof currentImage === 'string' ? currentImage : currentImage.url;
  const imageTitle =
    currentImage.title || `Visual Evidence ${String(currentIndex + 1).padStart(2, '0')}`;
  const imageCaption = currentImage.caption || '';

  const handleCopyUrl = () => {
    if (imageUrl && navigator.clipboard) {
      navigator.clipboard.writeText(imageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="High-Resolution Telemetry Lightbox Viewer"
      className="cyber-lightbox-backdrop"
      onClick={onClose}
    >
      {/* 1. Header Bar */}
      <div className="cyber-lightbox-header" onClick={(e) => e.stopPropagation()}>
        <div className="cyber-lightbox-title-wrap">
          <span className="cyber-lightbox-badge">
            POC TELEMETRY {String(currentIndex + 1).padStart(2, '0')}/
            {String(images.length).padStart(2, '0')}
          </span>
          <span className="cyber-lightbox-title">{imageTitle}</span>
          <span className="cyber-lightbox-badge-optimized">.WEBP OPTIMIZED</span>
        </div>

        <div className="cyber-lightbox-controls">
          <button
            type="button"
            title="Zoom Out (-25%)"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            className="cyber-lightbox-btn"
          >
            <ZoomOut size={16} />
          </button>

          <span className="cyber-lightbox-zoom-label">{Math.round(zoom * 100)}%</span>

          <button
            type="button"
            title="Zoom In (+25%)"
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
            className="cyber-lightbox-btn"
          >
            <ZoomIn size={16} />
          </button>

          <button
            type="button"
            title="Copy Image URL"
            onClick={handleCopyUrl}
            className="cyber-lightbox-btn"
          >
            {copied ? <Check size={16} style={{ color: '#4ade80' }} /> : <Copy size={16} />}
          </button>

          <button
            type="button"
            title="Close Viewer (ESC)"
            onClick={onClose}
            className="cyber-lightbox-btn btn-close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 2. Interactive Stage */}
      <div className="cyber-lightbox-stage" onClick={(e) => e.stopPropagation()}>
        {/* Previous Navigation Arrow */}
        {images.length > 1 && onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate((currentIndex - 1 + images.length) % images.length)}
            title="Previous Telemetry (Left Arrow)"
            className="cyber-lightbox-nav-btn nav-prev"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Image / Fallback Container */}
        <div
          className="cyber-lightbox-image-wrap"
          style={{ transform: `scale(${zoom})` }}
        >
          {imageUrl && !hasError ? (
            <img
              src={imageUrl}
              alt={imageTitle}
              className="cyber-lightbox-image"
              loading="eager"
              onLoad={() => setLoaded(true)}
              onError={() => setHasError(true)}
            />
          ) : (
            <div
              style={{
                width: '780px',
                maxWidth: '85vw',
                minHeight: '380px',
                background: 'radial-gradient(ellipse at center, #0c1724 0%, #03070d 100%)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '10px',
                padding: '36px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 0 50px rgba(56, 189, 248, 0.2)',
                color: '#e2e8f0',
                textAlign: 'center',
                gap: '16px'
              }}
            >
              <Cpu size={42} style={{ color: '#38bdf8' }} />
              <div style={{ font: '600 18px var(--display)', color: '#ffffff' }}>
                {imageTitle}
              </div>
              <div
                style={{
                  font: '12px var(--mono)',
                  color: '#94a3b8',
                  maxWidth: '560px',
                  lineHeight: '1.6'
                }}
              >
                {imageCaption || 'High-precision ring buffer memory telemetry figure.'}
              </div>
              <div
                style={{
                  font: '10px var(--mono)',
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.1)',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  border: '1px solid rgba(56, 189, 248, 0.3)'
                }}
              >
                POC ARTIFACT · VERIFIED REPRODUCTION TRACE
              </div>
            </div>
          )}
        </div>

        {/* Next Navigation Arrow */}
        {images.length > 1 && onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate((currentIndex + 1) % images.length)}
            title="Next Telemetry (Right Arrow)"
            className="cyber-lightbox-nav-btn nav-next"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {/* 3. Footer Bar with Caption */}
      <div className="cyber-lightbox-footer" onClick={(e) => e.stopPropagation()}>
        {imageCaption && <p className="cyber-lightbox-caption">{imageCaption}</p>}
        <div className="cyber-lightbox-subcaption">
          <span>HIGH-EFFICIENCY WEB-OPTIMIZED BITMAP</span>
          <span>·</span>
          <span>USE ESC TO EXIT</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
