import { useLayoutEffect } from 'react';
import { ANCHOR_NAVIGATE_START_EVENT } from '../utils/scrollSpy';
import {
  SCROLL_REVEAL_ATTR,
  SCROLL_REVEAL_SELECTOR,
  shouldRevealOnIntersect,
  shouldRevealOnMount,
} from '../utils/scrollReveal';

const SETTLE_FALLBACK_MS = 950;

/**
 * Diretiva global baseada em IntersectionObserver que aplica revelação suave
 * (opacity + translateY) conforme as seções entram na viewport, sem deslocar
 * as âncoras principais nem interferir em sticky/3D após assentamento.
 */
export function useScrollRevealDirective(): void {
  useLayoutEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>(SCROLL_REVEAL_SELECTOR));
    if (elements.length === 0) return;

    const motionQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    const prefersReducedMotion = Boolean(motionQuery?.matches);
    const hasIO = typeof IntersectionObserver !== 'undefined';

    const settleTimers = new WeakMap<HTMLElement, number>();
    let observer: IntersectionObserver | null = null;

    const markSettled = (el: HTMLElement) => {
      const existingTimer = settleTimers.get(el);
      if (existingTimer !== undefined) {
        window.clearTimeout(existingTimer);
        settleTimers.delete(el);
      }
      el.setAttribute(SCROLL_REVEAL_ATTR, 'settled');
      observer?.unobserve(el);
    };

    const revealElement = (el: HTMLElement, immediate = false) => {
      const currentState = el.getAttribute(SCROLL_REVEAL_ATTR);
      if (currentState === 'visible' || currentState === 'settled') return;

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

    const viewportHeight = window.innerHeight;
    const pendingElements: HTMLElement[] = [];

    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      if (
        shouldRevealOnMount({
          rectTop: rect.top,
          viewportHeight,
          hasIntersectionObserver: hasIO,
          reducedMotion: prefersReducedMotion,
        })
      ) {
        revealElement(el, true);
      } else {
        pendingElements.push(el);
      }
    }

    if (pendingElements.length === 0) return;

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

    for (const el of pendingElements) {
      observer.observe(el);
    }

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
      for (const el of elements) {
        markSettled(el);
      }
      observer?.disconnect();
    };

    window.addEventListener(ANCHOR_NAVIGATE_START_EVENT, handleAnchorNavigateStart);
    motionQuery?.addEventListener?.('change', handleReducedMotionChange);

    return () => {
      observer?.disconnect();
      window.removeEventListener(ANCHOR_NAVIGATE_START_EVENT, handleAnchorNavigateStart);
      motionQuery?.removeEventListener?.('change', handleReducedMotionChange);
      for (const el of elements) {
        const timer = settleTimers.get(el);
        if (timer !== undefined) {
          window.clearTimeout(timer);
          settleTimers.delete(el);
        }
      }
    };
  }, []);
}
