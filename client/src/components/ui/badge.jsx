import React from 'react';
import { cn } from '../../lib/utils.js';

/**
 * Shadcn UI & Animate UI Badge Component
 * Variants: default, secondary, outline, destructive, cyber
 */
export function Badge({
  children,
  variant = 'default',
  pulse = false,
  className = '',
  ...props
}) {
  const variantClass = {
    default: 'badge-ui-default',
    secondary: 'badge-ui-secondary',
    outline: 'badge-ui-outline',
    destructive: 'badge-ui-destructive',
    cyber: 'badge-ui-cyber'
  }[variant] || 'badge-ui-default';

  return (
    <span className={cn('badge-ui', variantClass, className)} {...props}>
      {pulse && <span className="badge-pulse-dot" />}
      {children}
    </span>
  );
}

export default Badge;
