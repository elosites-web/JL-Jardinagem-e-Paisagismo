import { useCallback, useEffect, useRef, useState } from 'react';
import { getLiveHeaderBottom } from '../utils/anchorNavigation';
import {
  ANCHOR_NAVIGATE_END_EVENT,
  ANCHOR_NAVIGATE_START_EVENT,
  resolveActiveSectionId,
  type SectionRectSnapshot,
} from '../utils/scrollSpy';

export function useActiveSection(sectionIds: readonly string[]) {
  const [activeSectionId, setActiveSectionId] = useState<string>(() => sectionIds[0] ?? 'inicio');
  const sectionIdsRef = useRef(sectionIds);
  sectionIdsRef.current = sectionIds;

  const navigationLockRef = useRef<{ targetId: string | null; timerId: number | null }>({
    targetId: null,
    timerId: null,
  });

  const rafPendingRef = useRef<number | null>(null);

  const clearNavigationLock = useCallback(() => {
    if (navigationLockRef.current.timerId !== null && typeof window !== 'undefined') {
      window.clearTimeout(navigationLockRef.current.timerId);
    }
    navigationLockRef.current.targetId = null;
    navigationLockRef.current.timerId = null;
  }, []);

  const evaluateActiveSection = useCallback(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (navigationLockRef.current.targetId !== null) return;

    const snapshots: SectionRectSnapshot[] = [];
    for (const id of sectionIdsRef.current) {
      const el = document.getElementById(id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      snapshots.push({
        id,
        top: rect.top,
        bottom: rect.bottom,
        height: rect.height,
      });
    }

    if (snapshots.length === 0) return;

    const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const nextId = resolveActiveSectionId({
      sections: snapshots,
      headerBottom: getLiveHeaderBottom(),
      viewportHeight: window.innerHeight,
      scrollY: window.scrollY,
      maxScrollY,
    });

    if (nextId) {
      setActiveSectionId((prev) => (prev === nextId ? prev : nextId));
    }
  }, []);

  const scheduleEvaluation = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (rafPendingRef.current !== null) return;
    rafPendingRef.current = window.requestAnimationFrame(() => {
      rafPendingRef.current = null;
      evaluateActiveSection();
    });
  }, [evaluateActiveSection]);

  const setActiveWithLock = useCallback(
    (targetId: string) => {
      if (!sectionIdsRef.current.includes(targetId)) return;
      clearNavigationLock();
      setActiveSectionId(targetId);

      if (typeof window !== 'undefined') {
        navigationLockRef.current.targetId = targetId;
        navigationLockRef.current.timerId = window.setTimeout(() => {
          navigationLockRef.current.targetId = null;
          navigationLockRef.current.timerId = null;
          scheduleEvaluation();
        }, 1800);
      }
    },
    [clearNavigationLock, scheduleEvaluation],
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        () => {
          scheduleEvaluation();
        },
        {
          threshold: [0, 0.05, 0.15, 0.35, 0.6, 0.85],
        },
      );
      for (const el of elements) {
        observer.observe(el);
      }
    }

    const handleScrollEdgeCheck = () => {
      if (navigationLockRef.current.targetId !== null) return;
      const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (window.scrollY <= 24 || (maxScrollY > 0 && maxScrollY - window.scrollY <= 48)) {
        scheduleEvaluation();
      } else if (!observer) {
        scheduleEvaluation();
      }
    };

    const handleUserScrollIntent = () => {
      if (navigationLockRef.current.targetId !== null) {
        clearNavigationLock();
        scheduleEvaluation();
      }
    };

    const handleNavStart = (event: Event) => {
      const custom = event as CustomEvent<{ targetId?: string }>;
      const targetId = custom.detail?.targetId;
      if (targetId && sectionIdsRef.current.includes(targetId)) {
        setActiveWithLock(targetId);
      }
    };

    const handleNavEnd = () => {
      clearNavigationLock();
      scheduleEvaluation();
    };

    evaluateActiveSection();

    window.addEventListener('scroll', handleScrollEdgeCheck, { passive: true });
    window.addEventListener('resize', scheduleEvaluation, { passive: true });
    window.addEventListener('wheel', handleUserScrollIntent, { passive: true });
    window.addEventListener('touchstart', handleUserScrollIntent, { passive: true });
    window.addEventListener(ANCHOR_NAVIGATE_START_EVENT, handleNavStart);
    window.addEventListener(ANCHOR_NAVIGATE_END_EVENT, handleNavEnd);

    return () => {
      observer?.disconnect();
      clearNavigationLock();
      if (rafPendingRef.current !== null) {
        window.cancelAnimationFrame(rafPendingRef.current);
        rafPendingRef.current = null;
      }
      window.removeEventListener('scroll', handleScrollEdgeCheck);
      window.removeEventListener('resize', scheduleEvaluation);
      window.removeEventListener('wheel', handleUserScrollIntent);
      window.removeEventListener('touchstart', handleUserScrollIntent);
      window.removeEventListener(ANCHOR_NAVIGATE_START_EVENT, handleNavStart);
      window.removeEventListener(ANCHOR_NAVIGATE_END_EVENT, handleNavEnd);
    };
  }, [clearNavigationLock, evaluateActiveSection, scheduleEvaluation, sectionIds, setActiveWithLock]);

  return {
    activeSectionId,
    setActiveSection: setActiveWithLock,
  };
}
