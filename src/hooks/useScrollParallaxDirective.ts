import { useEffect } from 'react';
import {
  SCROLL_PARALLAX_ATTR,
  SCROLL_PARALLAX_SCALE_ATTR,
  SCROLL_PARALLAX_SELECTOR,
  computeScrollParallaxOffset,
} from '../utils/scrollParallax';

const DEFAULT_AMPLITUDE_PX = 10;

function parsePositiveNumber(raw: string | null, fallback?: number): number | undefined {
  if (raw === null || raw.trim() === '') return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Diretiva global leve de parallax em scroll baseada em `requestAnimationFrame`
 * e variáveis CSS (`--scroll-parallax-y`), respeitando `prefers-reduced-motion`.
 */
export function useScrollParallaxDirective(): void {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const motionQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;

    let prefersReducedMotion = Boolean(motionQuery?.matches);
    const lastValues = new WeakMap<HTMLElement, string>();
    let elements = Array.from(
      document.querySelectorAll<HTMLElement>(SCROLL_PARALLAX_SELECTOR),
    );
    let rafId = 0;

    const resetAll = () => {
      for (const el of elements) {
        if (!el.isConnected) continue;
        if (lastValues.get(el) !== '0px') {
          el.style.setProperty('--scroll-parallax-y', '0px');
          lastValues.set(el, '0px');
        }
      }
    };

    const updateAll = () => {
      rafId = 0;
      if (prefersReducedMotion) {
        resetAll();
        return;
      }

      const viewportHeight = window.innerHeight;
      if (viewportHeight <= 0) return;

      // Batch DOM reads before DOM writes to avoid layout thrashing
      const measurements = elements
        .filter((el) => el.isConnected)
        .map((el) => {
          const rect = el.getBoundingClientRect();
          const amplitudePx =
            parsePositiveNumber(el.getAttribute(SCROLL_PARALLAX_ATTR), DEFAULT_AMPLITUDE_PX) ??
            DEFAULT_AMPLITUDE_PX;
          const scale = parsePositiveNumber(el.getAttribute(SCROLL_PARALLAX_SCALE_ATTR));
          return { el, rect, amplitudePx, scale };
        });

      for (const { el, rect, amplitudePx, scale } of measurements) {
        const offset = computeScrollParallaxOffset({
          rectTop: rect.top,
          rectHeight: rect.height,
          viewportHeight,
          amplitudePx,
          scale,
        });
        const formatted = `${offset}px`;
        if (lastValues.get(el) !== formatted) {
          el.style.setProperty('--scroll-parallax-y', formatted);
          lastValues.set(el, formatted);
        }
      }
    };

    const scheduleUpdate = () => {
      if (prefersReducedMotion || rafId !== 0) return;
      rafId = window.requestAnimationFrame(updateAll);
    };

    const refreshElements = () => {
      elements = Array.from(document.querySelectorAll<HTMLElement>(SCROLL_PARALLAX_SELECTOR));
      scheduleUpdate();
    };

    const mutationObserver =
      typeof MutationObserver !== 'undefined'
        ? new MutationObserver((mutations) => {
            for (const mutation of mutations) {
              if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
                refreshElements();
                break;
              }
            }
          })
        : null;

    mutationObserver?.observe(document.body, { childList: true, subtree: true });

    const handleMotionChange = (event: MediaQueryListEvent) => {
      prefersReducedMotion = event.matches;
      if (prefersReducedMotion) {
        if (rafId !== 0) {
          window.cancelAnimationFrame(rafId);
          rafId = 0;
        }
        resetAll();
      } else {
        scheduleUpdate();
      }
    };

    updateAll();

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    motionQuery?.addEventListener?.('change', handleMotionChange);

    return () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
      mutationObserver?.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      motionQuery?.removeEventListener?.('change', handleMotionChange);
    };
  }, []);
}
