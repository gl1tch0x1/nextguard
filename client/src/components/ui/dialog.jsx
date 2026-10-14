import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils.js';

/**
 * Shadcn UI & Animate UI Dialog Component
 * Reference: https://animate-ui.com/docs/components/radix/dialog
 * Features: Spring entry, backdrop blur, ESC key dismiss, focus management
 */
export function Dialog({
  open,
  onOpenChange,
  children,
  className = '',
  maxWidth = '540px'
}) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onOpenChange) {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return createPortal(
    <div className="animate-dialog-root" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="animate-dialog-backdrop"
        onClick={() => onOpenChange && onOpenChange(false)}
      />

      {/* Centered Panel */}
      <div className="animate-dialog-container">
        <div
          className={cn('animate-dialog-content', className)}
          style={{ maxWidth }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}

          <button
            type="button"
            className="animate-dialog-close"
            onClick={() => onOpenChange && onOpenChange(false)}
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function DialogHeader({ className = '', children }) {
  return <div className={cn('dialog-header', className)}>{children}</div>;
}

export function DialogTitle({ className = '', children }) {
  return <h3 className={cn('dialog-title', className)}>{children}</h3>;
}

export function DialogDescription({ className = '', children }) {
  return <p className={cn('dialog-description', className)}>{children}</p>;
}

export function DialogFooter({ className = '', children }) {
  return <div className={cn('dialog-footer', className)}>{children}</div>;
}

export default Dialog;
