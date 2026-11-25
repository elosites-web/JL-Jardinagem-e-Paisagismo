import { useRef, useState, type KeyboardEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FaqItem } from '../data/faqAndProcess';
import { resolveAccordionFocusIndex, toggleAccordionItem } from '../utils/accordion';

interface FaqAccordionProps {
  items: readonly FaqItem[];
  defaultOpenId?: string | null;
}

export function FaqAccordion({ items, defaultOpenId = null }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const nextIndex = resolveAccordionFocusIndex(index, items.length, event.key);
    if (nextIndex === null) return;

    event.preventDefault();
    triggerRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="space-y-3.5">
      {items.map((item, index) => {
        const isExpanded = openId === item.id;
        const triggerId = `faq-trigger-${item.id}`;
        const panelId = `faq-panel-${item.id}`;

        return (
          <div
            key={item.id}
            data-open={isExpanded ? 'true' : 'false'}
            className={`faq-item-card rounded-2xl border transition-[background-color,border-color,box-shadow,transform,scale,translate] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 ${
              isExpanded
                ? 'border-[#298637]/45 bg-white shadow-[0_12px_30px_-16px_rgba(16,41,28,0.22)] hover:border-[#298637]/60 hover:bg-[#FCFBF7] hover:shadow-[0_18px_36px_-16px_rgba(16,41,28,0.28)]'
                : 'border-[#BBA98D]/45 bg-[#F5F3E9]/70 hover:border-[#298637]/45 hover:bg-[#FAF8F2] hover:shadow-[0_14px_28px_-16px_rgba(16,41,28,0.18)]'
            }`}
          >
            <h3>
              <button
                ref={(el) => {
                  triggerRefs.current[index] = el;
                }}
                id={triggerId}
                type="button"
                aria-expanded={isExpanded}
                aria-controls={panelId}
                onClick={() => setOpenId((current) => toggleAccordionItem(current, item.id))}
                onKeyDown={(event) => handleKeyDown(event, index)}
                className="faq-trigger-button group flex min-h-[60px] w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left text-base font-semibold text-[#10291C] transition-[color,transform,scale,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.01] hover:text-[#298637] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-offwhite motion-reduce:transition-none motion-reduce:hover:scale-100 sm:px-6 sm:py-5 sm:text-lg"
              >
                <span className="leading-snug">{item.question}</span>
                <span
                  aria-hidden="true"
                  className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                    isExpanded
                      ? 'border-[#298637] bg-[#298637] text-[#F5F3E9] shadow-xs'
                      : 'border-[#BBA98D]/55 bg-[#FAF8F2] text-[#298637] group-hover:border-[#298637]/45 group-hover:bg-[#298637]/10'
                  }`}
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                      isExpanded ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              aria-hidden={!isExpanded}
              data-open={isExpanded ? 'true' : 'false'}
              className="faq-accordion-panel"
            >
              <div className="faq-accordion-inner">
                <div className="faq-accordion-content px-5 pb-5 text-sm leading-relaxed text-[#10291C]/80 sm:px-6 sm:pb-6 sm:text-base">
                  <div className="border-t border-[#BBA98D]/30 pt-3.5 pr-6 sm:pr-10">
                    <p className="faq-accordion-text">{item.answer}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
