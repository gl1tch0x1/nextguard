import React from 'react';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog.jsx';
import { Button } from './button.jsx';
import { cn } from '../../lib/utils.js';

/**
 * Animate UI & Shadcn AlertDialog Component
 * Reference: https://animate-ui.com/docs/components/base/alert-dialog
 */
export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Continue',
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'destructive', // 'destructive' | 'info' | 'success'
  children
}) {
  const Icon = variant === 'destructive' ? AlertTriangle : variant === 'success' ? CheckCircle2 : Info;

  const handleConfirm = async () => {
    if (onConfirm) await onConfirm();
    if (onOpenChange) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="480px">
      <div className="alert-dialog-inner">
        <div className={cn('alert-dialog-icon-badge', `variant-${variant}`)}>
          <Icon size={22} />
        </div>

        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children && <div className="alert-dialog-body">{children}</div>}

        <DialogFooter className="alert-dialog-actions">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange && onOpenChange(false)}
          >
            {cancelLabel}
          </Button>

          <Button
            variant={variant === 'destructive' ? 'destructive' : 'primary'}
            size="sm"
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}

export default AlertDialog;
