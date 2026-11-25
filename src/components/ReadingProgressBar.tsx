import { useEffect, useRef, useState } from 'react';
import {
  computeReadingProgress,
  computeTipTranslateX,
  toProgressPercentage,
} from '../utils/readingProgress';

const TIP_WIDTH_PX = 8;

export function ReadingProgressBar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const trackWidthRef = useRef<number>(
    typeof window !== 'undefined' ? document.documentElement.clientWidth : 0,
  );
  const lastPercentRef = useRef<number>(0);
  const [ariaPercent, setAriaPercent] = useState(0);

  useEffect(() => {
    let rafId = 0;

    const measureAndPaint = () => {
      rafId = 0;

      const docEl = document.documentElement;
      const scrollY = window.scrollY || docEl.scrollTop || 0;
      const progress = computeReadingProgress({
        scrollY,
        scrollHeight: docEl.scrollHeight,
        clientHeight: docEl.clientHeight || window.innerHeight,
      });

      const trackEl = trackRef.current;
      if (trackEl) {
        const trackWidth = trackWidthRef.current || docEl.clientWidth;
        const tipX = computeTipTranslateX(progress, trackWidth, TIP_WIDTH_PX);
        trackEl.style.setProperty('--reading-progress', progress.toFixed(5));
        trackEl.style.setProperty('--reading-tip-x', `${tipX.toFixed(2)}px`);
        trackEl.style.setProperty('--reading-tip-opacity', progress > 0.002 ? '1' : '0');
      }

      const nextPercent = toProgressPercentage(progress);
      if (nextPercent !== lastPercentRef.current) {
        lastPercentRef.current = nextPercent;
        setAriaPercent(nextPercent);
      }
    };

    const scheduleUpdate = () => {
      if (rafId !== 0) return;
      rafId = window.requestAnimationFrame(measureAndPaint);
    };

    const syncTrackWidth = () => {
      const width = trackRef.current?.clientWidth || document.documentElement.clientWidth;
      trackWidthRef.current = width;
      scheduleUpdate();
    };

    syncTrackWidth();

    let trackResizeObserver: ResizeObserver | null = null;
    let docResizeObserver: ResizeObserver | null = null;

    if (typeof ResizeObserver !== 'undefined') {
      if (trackRef.current) {
        trackResizeObserver = new ResizeObserver(syncTrackWidth);
        trackResizeObserver.observe(trackRef.current);
      }
      docResizeObserver = new ResizeObserver(scheduleUpdate);
      docResizeObserver.observe(document.documentElement);
    }

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', syncTrackWidth, { passive: true });

    return () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
      trackResizeObserver?.disconnect();
      docResizeObserver?.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', syncTrackWidth);
    };
  }, []);

  return (
    <div
      ref={trackRef}
      role="progressbar"
      aria-label="Progresso de leitura da página"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={ariaPercent}
      aria-valuetext={`${ariaPercent}%`}
      className="reading-progress-track relative z-20 h-[3px] w-full overflow-x-clip bg-[#091810]/90"
    >
      <div
        aria-hidden="true"
        className="reading-progress-fill pointer-events-none absolute inset-0 origin-left"
      />
      <span
        aria-hidden="true"
        className="reading-progress-tip pointer-events-none absolute top-0 left-0 h-[3px] w-[8px] rounded-full"
      />
    </div>
  );
}
