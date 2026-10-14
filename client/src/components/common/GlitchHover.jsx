import React, { useRef, useEffect } from 'react';
import { PowerGlitch } from 'powerglitch';

/**
 * Precision-tuned options for a smooth, high-fidelity cyber glitch on hover.
 * Balances chromatic aberration, micro-shake, and slice displacement
 * without feeling chaotic, jittery, or jarring.
 */
export const SMOOTH_HOVER_GLITCH_CONFIG = {
  playMode: 'hover',
  createContainers: true,
  hideOverflow: false,
  timing: {
    duration: 380,
    iterations: Infinity,
    easing: 'ease-in-out'
  },
  glitchTimeSpan: {
    start: 0.0,
    end: 1.0
  },
  shake: {
    velocity: 14,
    amplitudeX: 0.04,
    amplitudeY: 0.04
  },
  slice: {
    count: 5,
    velocity: 18,
    minHeight: 0.03,
    maxHeight: 0.14,
    hueRotate: true
  },
  pulse: false
};

/**
 * Custom hook for smooth glitch on hover only.
 * Directly integrates PowerGlitch core engine with React refs.
 * @param {object} customOptions - Optional overrides for the glitch configuration.
 */
export function useSmoothGlitch(customOptions = {}) {
  const ref = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const mergedOptions = {
      ...SMOOTH_HOVER_GLITCH_CONFIG,
      ...customOptions
    };

    try {
      instanceRef.current = PowerGlitch.glitch(ref.current, mergedOptions);
    } catch (err) {
      console.warn('PowerGlitch init error:', err);
    }

    return () => {
      try {
        instanceRef.current?.stopGlitch?.();
      } catch (_) {}
    };
  }, []);

  return {
    ref,
    startGlitch: () => instanceRef.current?.startGlitch?.(),
    stopGlitch: () => instanceRef.current?.stopGlitch?.()
  };
}

/**
 * Reusable wrapper component that triggers a smooth glitch effect on hover only.
 */
export default function GlitchHover({
  children,
  className = '',
  style = {},
  options = {},
  as: Tag = 'span'
}) {
  const glitch = useSmoothGlitch(options);

  return (
    <Tag
      ref={glitch.ref}
      className={`glitch-hover-wrapper ${className}`}
      style={{
        display: 'inline-block',
        cursor: 'pointer',
        ...style
      }}
    >
      {children}
    </Tag>
  );
}
