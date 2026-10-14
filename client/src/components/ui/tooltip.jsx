import React, { useState } from 'react';
import { cn } from '../../lib/utils.js';

/**
 * Animate UI & Shadcn Tooltip Component
 * Reference: https://animate-ui.com/docs/components/animate/tooltip
 * Features: Floating animated bubble, arrow indicator, micro-spring scale
 */
export function Tooltip({
  content,
  children,
  position = 'top', // 'top' | 'bottom' | 'left' | 'right'
  className = '',
  delay = 100
}) {
  const [visible, setVisible] = useState(false);
  const [timer, setTimer] = useState(null);

  const handleMouseEnter = () => {
    const t = setTimeout(() => setVisible(true), delay);
    setTimer(t);
  };

  const handleMouseLeave = () => {
    if (timer) clearTimeout(timer);
    setVisible(false);
  };

  if (!content) return children;

  return (
    <div
      className="animate-tooltip-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      <div
        role="tooltip"
        className={cn(
          'animate-tooltip-bubble',
          `pos-${position}`,
          visible && 'is-visible',
          className
        )}
      >
        <span className="tooltip-text">{content}</span>
        <span className="tooltip-arrow" />
      </div>
    </div>
  );
}

export default Tooltip;
