import { useLayoutEffect } from 'react';
import { ANCHOR_NAVIGATE_START_EVENT } from '../utils/scrollSpy';
import {
  SCROLL_REVEAL_ATTR,
  SCROLL_REVEAL_SELECTOR,
  shouldRevealOnIntersect,
  shouldRevealOnMount,
} from '../utils/scrollReveal';

const SETTLE_FALLBACK_MS = 1200;

/**
 * Diretiva global baseada em IntersectionObserver que aplica revelação suave
 * (opacity + translateY) conforme as seções entram na viewport, sem deslocar
 * as âncoras principais nem interferir em sticky/3D após assentamento.
 */
export function useScrollRevealDirective(): void {
  useLayoutEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const motionQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    let prefersReducedMotion = Boolean(motionQuery?.matches);
    const hasIO = typeof IntersectionObserver !== 'undefined';

    const registeredElements = new WeakSet<HTMLElement>();
    const trackedElements = new Set<HTMLElement>();
    const pendingElements = new Set<HTMLElement>();
    const settleTimers = new WeakMap<HTMLElement, number>();
    const rafTimers = new Set<number>();
    let scrollSweepRaf = 0;
    let observer: IntersectionObserver | null = null;

    const markSettled = (el: HTMLElement) => {
      const existingTimer = settleTimers.get(el);
      if (existingTimer !== undefined) {
        window.clearTimeout(existingTimer);
        settleTimers.delete(el);
      }
      pendingElements.delete(el);
      el.setAttribute(SCROLL_REVEAL_ATTR, 'settled');
      observer?.unobserve(el);
    };

    const revealElement = (el: HTMLElement, immediate = false) => {
      const currentState = el.getAttribute(SCROLL_REVEAL_ATTR);
      if (currentState === 'visible' || currentState === 'settled') return;

      pendingElements.delete(el);
      observer?.unobserve(el);

      if (immediate || prefersReducedMotion) {
        markSettled(el);
        return;
      }

      el.setAttribute(SCROLL_REVEAL_ATTR, 'visible');

      const handleTransitionEnd = (event: TransitionEvent) => {
        if (event.target !== el) return;
        if (event.propertyName === 'opacity' || event.propertyName === 'transform') {
          el.removeEventListener('transitionend', handleTransitionEnd);
          markSettled(el);
        }
      };

      el.addEventListener('transitionend', handleTransitionEnd);
      const fallbackTimer = window.setTimeout(() => {
        el.removeEventListener('transitionend', handleTransitionEnd);
        markSettled(el);
      }, SETTLE_FALLBACK_MS);
      settleTimers.set(el, fallbackTimer);
    };

    if (!prefersReducedMotion && hasIO) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const target = entry.target;
            if (!(target instanceof HTMLElement)) continue;

            if (
              shouldRevealOnIntersect({
                isIntersecting: entry.isIntersecting,
                boundingClientRectTop: entry.boundingClientRect.top,
                rootBoundsBottom: entry.rootBounds?.bottom ?? null,
                viewportHeight: window.innerHeight,
              })
            ) {
              revealElement(target, false);
            }
          }
        },
        {
          threshold: [0, 0.06],
          rootMargin: '0px 0px -36px 0px',
        },
      );
    }

    const sweepPendingElements = () => {
      scrollSweepRaf = 0;
      if (pendingElements.size === 0) return;

      const viewportHeight = window.innerHeight;
      for (const el of Array.from(pendingElements)) {
        if (!el.isConnected) {
          pendingElements.delete(el);
          observer?.unobserve(el);
          continue;
        }
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0) {
          revealElement(el, true);
        } else if (rect.top <= viewportHeight * 0.96) {
          revealElement(el, false);
        }
      }
    };

    const scheduleScrollSweep = () => {
      if (pendingElements.size === 0 || scrollSweepRaf !== 0) return;
      scrollSweepRaf = window.requestAnimationFrame(sweepPendingElements);
    };

    const registerElement = (el: HTMLElement, isDynamicMount: boolean) => {
      if (registeredElements.has(el)) return;
      registeredElements.add(el);
      trackedElements.add(el);

      const currentState = el.getAttribute(SCROLL_REVEAL_ATTR);
      if (currentState === 'visible' || currentState === 'settled') return;

      if (prefersReducedMotion || !hasIO || !observer) {
        markSettled(el);
        return;
      }

      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      if (!isDynamicMount) {
        if (
          shouldRevealOnMount({
            rectTop: rect.top,
            viewportHeight,
            hasIntersectionObserver: true,
            reducedMotion: false,
          })
        ) {
          revealElement(el, true);
        } else {
          pendingElements.add(el);
          observer.observe(el);
        }
        return;
      }

      if (rect.bottom < 0) {
        revealElement(el, true);
      } else if (rect.top <= viewportHeight * 0.94) {
        const rafOuter = window.requestAnimationFrame(() => {
          rafTimers.delete(rafOuter);
          const rafInner = window.requestAnimationFrame(() => {
            rafTimers.delete(rafInner);
            revealElement(el, false);
          });
          rafTimers.add(rafInner);
        });
        rafTimers.add(rafOuter);
      } else {
        pendingElements.add(el);
        observer.observe(el);
      }
    };

    for (const el of document.querySelectorAll<HTMLElement>(SCROLL_REVEAL_SELECTOR)) {
      registerElement(el, false);
    }

    const mutationObserver =
      typeof MutationObserver !== 'undefined'
        ? new MutationObserver((mutations) => {
            for (const mutation of mutations) {
              for (const node of mutation.addedNodes) {
                if (!(node instanceof HTMLElement)) continue;
                if (node.matches(SCROLL_REVEAL_SELECTOR)) {
                  registerElement(node, true);
                }
                for (const child of node.querySelectorAll<HTMLElement>(SCROLL_REVEAL_SELECTOR)) {
                  registerElement(child, true);
                }
              }
            }
          })
        : null;

    mutationObserver?.observe(document.body, { childList: true, subtree: true });

    const handleAnchorNavigateStart = (event: Event) => {
      const custom = event as CustomEvent<{ targetId?: string }>;
      const targetId = custom.detail?.targetId;
      if (!targetId) return;

      const targetSection = document.getElementById(targetId);
      if (!targetSection) return;

      const targets = targetSection.matches(SCROLL_REVEAL_SELECTOR)
        ? [targetSection]
        : Array.from(targetSection.querySelectorAll<HTMLElement>(SCROLL_REVEAL_SELECTOR));

      for (const el of targets) {
        revealElement(el, false);
      }
    };

    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      prefersReducedMotion = true;
      for (const el of trackedElements) {
        markSettled(el);
      }
      observer?.disconnect();
    };

    window.addEventListener('scroll', scheduleScrollSweep, { passive: true });
    window.addEventListener(ANCHOR_NAVIGATE_START_EVENT, handleAnchorNavigateStart);
    motionQuery?.addEventListener?.('change', handleReducedMotionChange);

    return () => {
      observer?.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener('scroll', scheduleScrollSweep);
      window.removeEventListener(ANCHOR_NAVIGATE_START_EVENT, handleAnchorNavigateStart);
      motionQuery?.removeEventListener?.('change', handleReducedMotionChange);
      if (scrollSweepRaf !== 0) {
        window.cancelAnimationFrame(scrollSweepRaf);
      }
      for (const id of rafTimers) {
        window.cancelAnimationFrame(id);
      }
      for (const el of trackedElements) {
        const timer = settleTimers.get(el);
        if (timer !== undefined) {
          window.clearTimeout(timer);
          settleTimers.delete(el);
        }
      }
    };
  }, []);
}
