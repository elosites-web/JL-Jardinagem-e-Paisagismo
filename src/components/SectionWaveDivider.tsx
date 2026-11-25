import { useEffect, useRef, useState } from 'react';
import { computeSvgParallaxOffset } from '../utils/cursorParallax';
import { ANCHOR_NAVIGATE_START_EVENT } from '../utils/scrollSpy';
import { shouldRevealOnIntersect, shouldRevealOnMount } from '../utils/scrollReveal';

export function SectionWaveDivider() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDrawn, setIsDrawn] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  });

  useEffect(() => {
    if (isDrawn) return;

    const el = containerRef.current;
    if (!el || typeof window === 'undefined') return;

    const motionQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    const prefersReducedMotion = Boolean(motionQuery?.matches);
    const hasIO = typeof IntersectionObserver !== 'undefined';

    if (
      shouldRevealOnMount({
        rectTop: el.getBoundingClientRect().top,
        viewportHeight: window.innerHeight,
        hasIntersectionObserver: hasIO,
        reducedMotion: prefersReducedMotion,
      })
    ) {
      if (prefersReducedMotion || !hasIO) {
        setIsDrawn(true);
        return;
      }
      const rafId = window.requestAnimationFrame(() => setIsDrawn(true));
      return () => window.cancelAnimationFrame(rafId);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (
            shouldRevealOnIntersect({
              isIntersecting: entry.isIntersecting,
              boundingClientRectTop: entry.boundingClientRect.top,
              rootBoundsBottom: entry.rootBounds?.bottom ?? null,
              viewportHeight: window.innerHeight,
            })
          ) {
            setIsDrawn(true);
            observer.disconnect();
            break;
          }
        }
      },
      {
        threshold: [0, 0.15],
        rootMargin: '0px 0px -24px 0px',
      },
    );

    observer.observe(el);

    const handleAnchorNavigateStart = (event: Event) => {
      const targetId = (event as CustomEvent<{ targetId?: string }>).detail?.targetId;
      if (targetId === 'servicos' || targetId === 'sobre') {
        setIsDrawn(true);
        observer.disconnect();
      }
    };

    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsDrawn(true);
        observer.disconnect();
      }
    };

    window.addEventListener(ANCHOR_NAVIGATE_START_EVENT, handleAnchorNavigateStart);
    motionQuery?.addEventListener?.('change', handleReducedMotionChange);

    return () => {
      observer.disconnect();
      window.removeEventListener(ANCHOR_NAVIGATE_START_EVENT, handleAnchorNavigateStart);
      motionQuery?.removeEventListener?.('change', handleReducedMotionChange);
    };
  }, [isDrawn]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || typeof window === 'undefined') return;

    const motionQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    const coarsePointerQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(pointer: coarse)')
        : null;

    const applyOffset = (x: number, y: number) => {
      svg.style.setProperty('--wave-parallax-x', `${x}px`);
      svg.style.setProperty('--wave-parallax-y', `${y}px`);
    };

    if (motionQuery?.matches || coarsePointerQuery?.matches) {
      applyOffset(0, 0);
      return;
    }

    let rafId: number | null = null;
    let latestPoint: { x: number; y: number } | null = null;

    const scheduleUpdate = (x: number, y: number) => {
      latestPoint = { x, y };
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        if (!latestPoint) return;
        applyOffset(latestPoint.x, latestPoint.y);
      });
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const offset = computeSvgParallaxOffset({
        clientX: event.clientX,
        clientY: event.clientY,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      });
      scheduleUpdate(offset.x, offset.y);
    };

    const resetParallax = () => {
      scheduleUpdate(0, 0);
    };

    const handleMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        applyOffset(0, 0);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', resetParallax);
    window.addEventListener('blur', resetParallax);
    motionQuery?.addEventListener?.('change', handleMotionChange);

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      document.documentElement.removeEventListener('mouseleave', resetParallax);
      window.removeEventListener('blur', resetParallax);
      motionQuery?.removeEventListener?.('change', handleMotionChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-testid="about-services-wave-divider"
      className="relative w-full overflow-hidden bg-[#F5F3E9] select-none"
    >
      <svg
        ref={svgRef}
        viewBox="0 0 1440 52"
        preserveAspectRatio="none"
        data-sprouted={isDrawn ? 'true' : 'false'}
        className="wave-divider-parallax block h-11 w-full sm:h-12 lg:h-[52px]"
        fill="none"
      >
        <path
          d="M0 18 C 320 8, 620 34, 940 18 C 1180 6, 1320 26, 1440 16"
          stroke="#10291C"
          strokeOpacity="0.16"
          strokeWidth="1"
          strokeDasharray="4 8"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M0 24 C 260 6, 520 42, 760 24 C 1000 6, 1220 40, 1440 20 L 1440 32 C 1200 48, 960 14, 720 32 C 480 50, 240 14, 0 32 Z"
          fill="#10291C"
          fillOpacity="0.09"
        />
        <path
          d="M0 26 C 240 13.5, 480 41, 720 28.5 C 960 16, 1200 41, 1440 25"
          pathLength={1}
          stroke="#10291C"
          strokeWidth="2.75"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          data-drawn={isDrawn ? 'true' : 'false'}
          className="wave-divider-draw-path"
        />
        <path
          d="M0 32 C 280 44, 540 14, 820 30 C 1080 44, 1260 16, 1440 29"
          stroke="#10291C"
          strokeOpacity="0.32"
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}


