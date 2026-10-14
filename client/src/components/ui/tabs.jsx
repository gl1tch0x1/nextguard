import React, { useRef, useState, useEffect } from 'react';
import { cn } from '../../lib/utils.js';

/**
 * Animate UI & Shadcn Animated Tabs
 * Reference: https://animate-ui.com/docs/components/animate/tabs
 * Features: Gliding active indicator with dynamic bounds measurement, keyboard navigation
 */
export function Tabs({
  tabs = [],
  activeTab,
  onChange,
  className = '',
  pillClassName = '',
  size = 'default'
}) {
  const containerRef = useRef(null);
  const tabRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    const activeEl = tabRefs.current[activeTab];
    const container = containerRef.current;

    if (activeEl && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeEl.getBoundingClientRect();

      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
        opacity: 1
      });
    }
  }, [activeTab, tabs]);

  return (
    <div
      ref={containerRef}
      role="tablist"
      className={cn('animate-tabs-container', className)}
    >
      {/* Sliding Active Highlight Pill */}
      <div
        className={cn('animate-tab-indicator', pillClassName)}
        style={{
          transform: `translateX(${indicatorStyle.left}px)`,
          width: `${indicatorStyle.width}px`,
          opacity: indicatorStyle.opacity
        }}
      />

      {tabs.map((tab) => {
        const isActive = activeTab === (tab.id || tab.value || tab);
        const tabKey = tab.id || tab.value || tab;
        const tabLabel = tab.label || tab.name || tab;
        const tabCount = tab.count !== undefined ? tab.count : null;

        return (
          <button
            key={tabKey}
            ref={(el) => (tabRefs.current[tabKey] = el)}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange && onChange(tabKey)}
            className={cn(
              'animate-tab-item',
              isActive && 'is-active',
              size === 'sm' && 'tab-size-sm'
            )}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            <span className="tab-title">{tabLabel}</span>
            {tabCount !== null && <span className="tab-badge">{tabCount}</span>}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
