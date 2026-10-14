import React, { useState } from 'react';
import { cn } from '../../lib/utils.js';

/**
 * Shadcn UI & Animate UI Animated Button
 * Supports variants: default, primary, secondary, outline, ghost, destructive, link
 * Supports Animate UI effects: hoverScale, tapScale, sheen, ripple
 */
export const Button = React.forwardRef(function Button(
  {
    children,
    className = '',
    variant = 'default',
    size = 'default',
    hoverScale = 1.02,
    tapScale = 0.97,
    sheen = false,
    ripple = true,
    onClick,
    disabled = false,
    as: Component = 'button',
    ...props
  },
  ref
) {
  const [ripples, setRipples] = useState([]);
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handlePointerDown = (e) => {
    if (disabled) return;
    setIsPressed(true);

    if (ripple && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple = {
        id: Date.now() + Math.random(),
        x,
        y,
        size: Math.max(rect.width, rect.height) * 2
      };

      setRipples((prev) => [...prev.slice(-3), newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    }
  };

  const handlePointerUp = () => setIsPressed(false);
  const handlePointerLeave = () => {
    setIsPressed(false);
    setIsHovered(false);
  };
  const handlePointerEnter = () => {
    if (!disabled) setIsHovered(true);
  };

  const variantClass = {
    default: 'btn-ui-default',
    primary: 'btn-ui-primary',
    secondary: 'btn-ui-secondary',
    outline: 'btn-ui-outline',
    ghost: 'btn-ui-ghost',
    destructive: 'btn-ui-destructive',
    link: 'btn-ui-link'
  }[variant] || 'btn-ui-default';

  const sizeClass = {
    default: 'btn-size-default',
    sm: 'btn-size-sm',
    lg: 'btn-size-lg',
    icon: 'btn-size-icon'
  }[size] || 'btn-size-default';

  const transformStyle = disabled
    ? {}
    : {
        transform: isPressed
          ? `scale(${tapScale})`
          : isHovered
          ? `scale(${hoverScale}) translateY(-1px)`
          : 'scale(1) translateY(0)',
        transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease, background-color 0.2s ease, border-color 0.2s ease'
      };

  return (
    <Component
      ref={ref}
      disabled={disabled}
      className={cn(
        'btn-ui',
        variantClass,
        sizeClass,
        sheen && 'btn-ui-sheen',
        className
      )}
      style={transformStyle}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      {...props}
    >
      <span className="btn-ui-content">{children}</span>

      {/* Animate UI Fluid Click Ripple */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="btn-ui-ripple"
          style={{
            top: r.y,
            left: r.x,
            width: r.size,
            height: r.size
          }}
        />
      ))}
    </Component>
  );
});

export default Button;
