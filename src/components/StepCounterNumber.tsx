import { useEffect, useRef, useState } from 'react';
import { SCROLL_REVEAL_ATTR } from '../utils/scrollReveal';
import {
  computeStepCounterFrame,
  formatStepNumber,
  getStepCounterDurationMs,
  parseStepTarget,
} from '../utils/stepCounter';

type CounterState = 'idle' | 'counting' | 'complete';

export interface StepCounterNumberProps {
  stepNumber: string;
  delayMs?: number;
}

export function StepCounterNumber({ stepNumber, delayMs = 0 }: StepCounterNumberProps) {
  const targetValue = parseStepTarget(stepNumber);
  const padLength = Math.max(2, stepNumber.length);
  const targetLabel = formatStepNumber(targetValue, padLength);
  const initialLabel = formatStepNumber(0, padLength);

  const spanRef = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState<string>(initialLabel);
  const [counterState, setCounterState] = useState<CounterState>('idle');

  useEffect(() => {
    const spanEl = spanRef.current;
    if (!spanEl || typeof window === 'undefined') return;

    const motionQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;

    let rafId = 0;
    let cancelled = false;
    let hasStarted = false;
    let lastFormatted = initialLabel;

    const finishImmediately = () => {
      if (cancelled) return;
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      hasStarted = true;
      spanEl.style.setProperty('--step-fill-progress', '1');
      if (lastFormatted !== targetLabel) {
        lastFormatted = targetLabel;
        setDisplayValue(targetLabel);
      }
      setCounterState('complete');
    };

    if (motionQuery?.matches || targetValue === 0) {
      finishImmediately();
      return;
    }

    const cardEl = spanEl.closest<HTMLElement>(`[${SCROLL_REVEAL_ATTR}]`);
    if (!cardEl) {
      finishImmediately();
      return;
    }

    const startCounterAnimation = () => {
      if (cancelled || hasStarted) return;
      hasStarted = true;

      if (motionQuery?.matches) {
        finishImmediately();
        return;
      }

      const durationMs = getStepCounterDurationMs(targetValue);
      let startTime: number | null = null;
      setCounterState('counting');

      const step = (timestamp: number) => {
        if (cancelled) return;
        if (startTime === null) {
          startTime = timestamp;
        }

        const frame = computeStepCounterFrame({
          elapsedMs: timestamp - startTime,
          delayMs,
          durationMs,
          targetValue,
          padLength,
          reducedMotion: Boolean(motionQuery?.matches),
        });

        spanEl.style.setProperty('--step-fill-progress', String(frame.progress));

        if (frame.formatted !== lastFormatted) {
          lastFormatted = frame.formatted;
          setDisplayValue(frame.formatted);
        }

        if (frame.isComplete) {
          rafId = 0;
          setCounterState('complete');
          return;
        }

        rafId = window.requestAnimationFrame(step);
      };

      rafId = window.requestAnimationFrame(step);
    };

    const handleCardState = (state: string | null) => {
      if (state !== 'visible' && state !== 'settled') return false;

      if (state === 'settled') {
        const rect = cardEl.getBoundingClientRect();
        if (rect.bottom < 0) {
          finishImmediately();
          return true;
        }
      }

      startCounterAnimation();
      return true;
    };

    let cardObserver: MutationObserver | null = null;

    if (!handleCardState(cardEl.getAttribute(SCROLL_REVEAL_ATTR))) {
      spanEl.style.setProperty('--step-fill-progress', '0');

      if (typeof MutationObserver !== 'undefined') {
        cardObserver = new MutationObserver(() => {
          if (handleCardState(cardEl.getAttribute(SCROLL_REVEAL_ATTR))) {
            cardObserver?.disconnect();
            cardObserver = null;
          }
        });
        cardObserver.observe(cardEl, {
          attributes: true,
          attributeFilter: [SCROLL_REVEAL_ATTR],
        });
      } else {
        finishImmediately();
      }
    }

    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      cardObserver?.disconnect();
      cardObserver = null;
      finishImmediately();
    };

    motionQuery?.addEventListener?.('change', handleReducedMotionChange);

    return () => {
      cancelled = true;
      cardObserver?.disconnect();
      motionQuery?.removeEventListener?.('change', handleReducedMotionChange);
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [delayMs, initialLabel, padLength, targetLabel, targetValue]);

  return (
    <span
      ref={spanRef}
      data-counter-state={counterState}
      className="how-it-works-step-number font-display text-5xl font-semibold leading-none tracking-tight tabular-nums text-forest sm:text-6xl"
    >
      {displayValue}
    </span>
  );
}
