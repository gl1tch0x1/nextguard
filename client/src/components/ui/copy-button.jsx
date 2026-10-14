import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '../../lib/utils.js';

/**
 * Animate UI Copy Button
 * Reference: https://animate-ui.com/docs/components/buttons/copy
 * Features: Morphing copy/check icons, spring scale, and animated tooltip
 */
export function CopyButton({
  value,
  label = '',
  className = '',
  size = 'default',
  variant = 'outline',
  onCopy
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    if (!value) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopied(true);
      if (onCopy) onCopy(value);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.warn('Failed to copy to clipboard', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn('animate-copy-btn', copied && 'is-copied', className)}
      title={copied ? 'Copied to clipboard!' : 'Copy to clipboard'}
      aria-label="Copy code or value"
    >
      <span className="copy-icon-slot">
        {copied ? (
          <Check size={14} className="copy-check-icon" />
        ) : (
          <Copy size={14} className="copy-default-icon" />
        )}
      </span>

      {label && <span className="copy-label">{label}</span>}

      {/* Floating Animated Feedback Tooltip */}
      <span className={cn('copy-tooltip-bubble', copied && 'is-visible')}>
        {copied ? 'Copied!' : 'Copy'}
      </span>
    </button>
  );
}

export default CopyButton;
