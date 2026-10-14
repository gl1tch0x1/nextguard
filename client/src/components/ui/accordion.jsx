import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils.js';

/**
 * Animate UI & Shadcn Accordion
 * Reference: https://animate-ui.com/docs/components/radix/accordion
 * Features: Smooth height unfolding, rotating chevron, accessible keyboard navigation
 */
export function Accordion({
  items = [],
  defaultValue = null,
  allowMultiple = false,
  className = ''
}) {
  const [openItems, setOpenItems] = useState(() => {
    if (defaultValue) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    }
    return [];
  });

  const toggleItem = (id) => {
    setOpenItems((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      return allowMultiple ? [...prev, id] : [id];
    });
  };

  return (
    <div className={cn('animate-accordion-root', className)}>
      {items.map((item, index) => {
        const itemId = item.id || `item-${index}`;
        const isOpen = openItems.includes(itemId);

        return (
          <div
            key={itemId}
            className={cn('animate-accordion-item', isOpen && 'is-open')}
          >
            <button
              type="button"
              className="animate-accordion-trigger"
              onClick={() => toggleItem(itemId)}
              aria-expanded={isOpen}
            >
              <span className="accordion-trigger-text">
                {item.number && <span className="accordion-num">{item.number}</span>}
                <span className="accordion-title">{item.title}</span>
                {item.badge && <span className="accordion-badge">{item.badge}</span>}
              </span>

              <ChevronDown
                size={16}
                className={cn('accordion-chevron', isOpen && 'is-rotated')}
              />
            </button>

            <div
              className={cn('animate-accordion-content-wrapper', isOpen && 'is-expanded')}
              style={{
                maxHeight: isOpen ? '600px' : '0px',
                opacity: isOpen ? 1 : 0
              }}
            >
              <div className="animate-accordion-body">
                {item.content || item.description}
                {item.bullets?.length > 0 && (
                  <ul className="accordion-bullet-list">
                    {item.bullets.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Accordion;
