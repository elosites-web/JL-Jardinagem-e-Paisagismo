import { dispatchAnchorNavigateEnd, dispatchAnchorNavigateStart } from './scrollSpy';

export const HEADER_HEIGHT_CSS_VAR = '--header-height';
export const ANCHOR_BOTTOM_COMPENSATION_CSS_VAR = '--anchor-bottom-compensation';

export function extractInternalAnchorId(
  href: string | null,
  currentOrigin?: string,
  currentPathname?: string,
): string | null {
  if (!href) return null;
  const trimmed = href.trim();
  if (!trimmed || trimmed === '#') return null;

  if (trimmed.startsWith('#')) {
    const rawId = trimmed.slice(1);
    if (!rawId) return null;
    try {
      return decodeURIComponent(rawId);
    } catch {
      return rawId;
    }
  }

  if (!currentOrigin) return null;

  try {
    const parsed = new URL(trimmed, currentOrigin);
    if (parsed.origin !== currentOrigin) return null;
    if (currentPathname && parsed.pathname !== currentPathname) return null;
    const rawId = parsed.hash.slice(1);
    if (!rawId) return null;
    return decodeURIComponent(rawId);
  } catch {
    return null;
  }
}

export interface AlignedScrollParams {
  elementTopInViewport: number;
  currentScrollY: number;
  headerBottom: number;
  maxScrollY: number;
}

export function computeAlignedScrollTop({
  elementTopInViewport,
  currentScrollY,
  headerBottom,
  maxScrollY,
}: AlignedScrollParams): number {
  const documentTop = elementTopInViewport + currentScrollY;
  if (documentTop <= 0) return 0;

  const rawTarget = documentTop - headerBottom;
  const safeMax = Math.max(0, maxScrollY);
  return Math.min(safeMax, Math.max(0, rawTarget));
}

export interface ScrollShortfallParams {
  elementTopInViewport: number;
  currentScrollY: number;
  headerBottom: number;
  scrollHeight: number;
  viewportHeight: number;
}

export function computeScrollShortfall({
  elementTopInViewport,
  currentScrollY,
  headerBottom,
  scrollHeight,
  viewportHeight,
}: ScrollShortfallParams): number {
  const documentTop = elementTopInViewport + currentScrollY;
  if (documentTop <= headerBottom) return 0;

  const desiredScrollY = documentTop - headerBottom;
  const maxScrollY = Math.max(0, scrollHeight - viewportHeight);
  return Math.max(0, desiredScrollY - maxScrollY);
}

export function syncHeaderHeightCssVar(headerEl: HTMLElement | null): number {
  if (!headerEl || typeof document === 'undefined') return 0;
  const rect = headerEl.getBoundingClientRect();
  const height = rect.height > 0 ? rect.height : headerEl.offsetHeight;
  if (height > 0) {
    document.documentElement.style.setProperty(HEADER_HEIGHT_CSS_VAR, `${height}px`);
  }
  return height;
}

export function getLiveHeaderBottom(): number {
  if (typeof document === 'undefined') return 0;
  const header = document.querySelector('header');
  if (header) {
    const bottom = header.getBoundingClientRect().bottom;
    if (bottom > 0) return bottom;
  }

  const rawVar = getComputedStyle(document.documentElement)
    .getPropertyValue(HEADER_HEIGHT_CSS_VAR)
    .trim();
  const parsed = Number.parseFloat(rawVar);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function focusElementWithoutScroll(targetEl: HTMLElement): void {
  const hadTabIndex = targetEl.hasAttribute('tabindex');
  if (!hadTabIndex) {
    targetEl.setAttribute('tabindex', '-1');
    const cleanupTabIndex = () => {
      targetEl.removeAttribute('tabindex');
    };
    targetEl.addEventListener('blur', cleanupTabIndex, { once: true });
  }
  targetEl.focus({ preventScroll: true });
}

let cancelActiveSettlement: (() => void) | null = null;

function watchScrollSettlement(targetTop: number, onSettled: () => void): void {
  if (cancelActiveSettlement) {
    cancelActiveSettlement();
    cancelActiveSettlement = null;
  }

  if (Math.abs(window.scrollY - targetTop) < 0.5) {
    window.requestAnimationFrame(onSettled);
    return;
  }

  const supportsScrollEnd = 'onscrollend' in window;
  let finished = false;
  let idleTimer = 0;
  let maxWaitTimer = 0;

  const cleanup = () => {
    window.removeEventListener('scroll', scheduleIdleCheck);
    window.removeEventListener('scrollend', handleScrollEnd);
    window.clearTimeout(idleTimer);
    window.clearTimeout(maxWaitTimer);
    if (cancelActiveSettlement === cleanup) {
      cancelActiveSettlement = null;
    }
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    cleanup();
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(onSettled);
    });
  };

  const handleScrollEnd = () => {
    finish();
  };

  const scheduleIdleCheck = () => {
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(finish, supportsScrollEnd ? 350 : 150);
  };

  cancelActiveSettlement = cleanup;
  window.addEventListener('scroll', scheduleIdleCheck, { passive: true });
  if (supportsScrollEnd) {
    window.addEventListener('scrollend', handleScrollEnd, { once: true });
  }
  idleTimer = window.setTimeout(finish, supportsScrollEnd ? 600 : 180);
  maxWaitTimer = window.setTimeout(finish, 4000);
}

export interface NavigateAnchorOptions {
  behavior?: ScrollBehavior;
  moveFocus?: boolean;
  updateHistory?: boolean;
}

export function navigateToAnchorId(
  targetId: string,
  options: NavigateAnchorOptions = {},
): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;

  const targetEl = document.getElementById(targetId);
  if (!targetEl) return false;

  const rootStyle = document.documentElement.style;
  rootStyle.setProperty(ANCHOR_BOTTOM_COMPENSATION_CSS_VAR, '0px');

  const headerBottom = getLiveHeaderBottom();
  const rect = targetEl.getBoundingClientRect();
  const currentScrollY = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight;
  const viewportHeight = window.innerHeight;

  const shortfall = computeScrollShortfall({
    elementTopInViewport: rect.top,
    currentScrollY,
    headerBottom,
    scrollHeight,
    viewportHeight,
  });

  if (shortfall > 0.5) {
    rootStyle.setProperty(ANCHOR_BOTTOM_COMPENSATION_CSS_VAR, `${Math.ceil(shortfall)}px`);
  }

  const updatedMaxScrollY = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );

  const targetTop = computeAlignedScrollTop({
    elementTopInViewport: targetEl.getBoundingClientRect().top,
    currentScrollY: window.scrollY,
    headerBottom,
    maxScrollY: updatedMaxScrollY,
  });

  if (options.updateHistory !== false) {
    const nextHash = `#${targetId}`;
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, '', nextHash);
    }
  }

  const resolvedBehavior: ScrollBehavior =
    options.behavior ?? (prefersReducedMotion() ? 'auto' : 'smooth');

  if (options.moveFocus) {
    focusElementWithoutScroll(targetEl);
  }

  dispatchAnchorNavigateStart(targetId);

  window.scrollTo({ top: targetTop, behavior: resolvedBehavior });

  const alignAfterSettle = () => {
    const liveHeaderBottom = getLiveHeaderBottom();
    const liveRect = targetEl.getBoundingClientRect();
    const documentTop = liveRect.top + window.scrollY;

    if (documentTop <= 0) {
      if (window.scrollY > 0.5) {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
      dispatchAnchorNavigateEnd(targetId);
      return;
    }

    const drift = liveRect.top - liveHeaderBottom;
    if (Math.abs(drift) > 0.5) {
      rootStyle.setProperty(ANCHOR_BOTTOM_COMPENSATION_CSS_VAR, '0px');
      const liveShortfall = computeScrollShortfall({
        elementTopInViewport: targetEl.getBoundingClientRect().top,
        currentScrollY: window.scrollY,
        headerBottom: liveHeaderBottom,
        scrollHeight: document.documentElement.scrollHeight,
        viewportHeight: window.innerHeight,
      });
      if (liveShortfall > 0.5) {
        rootStyle.setProperty(ANCHOR_BOTTOM_COMPENSATION_CSS_VAR, `${Math.ceil(liveShortfall)}px`);
      }

      const maxScrollAfter = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const correctedTop = computeAlignedScrollTop({
        elementTopInViewport: targetEl.getBoundingClientRect().top,
        currentScrollY: window.scrollY,
        headerBottom: liveHeaderBottom,
        maxScrollY: maxScrollAfter,
      });

      window.scrollTo({ top: correctedTop, behavior: 'auto' });
    }

    dispatchAnchorNavigateEnd(targetId);
  };

  if (resolvedBehavior === 'auto') {
    window.requestAnimationFrame(alignAfterSettle);
  } else {
    watchScrollSettlement(targetTop, alignAfterSettle);
  }

  return true;
}

export function navigateToAnchorHref(
  href: string | null,
  options: NavigateAnchorOptions = {},
): boolean {
  if (typeof window === 'undefined') return false;
  const id = extractInternalAnchorId(href, window.location.origin, window.location.pathname);
  if (!id) return false;
  return navigateToAnchorId(id, options);
}
