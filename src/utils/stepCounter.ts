export interface StepCounterFrameInput {
  elapsedMs: number;
  delayMs: number;
  durationMs: number;
  targetValue: number;
  padLength?: number;
  reducedMotion?: boolean;
}

export interface StepCounterFrame {
  value: number;
  formatted: string;
  progress: number;
  isComplete: boolean;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function parseStepTarget(label: string): number {
  const digits = label.replace(/\D+/g, '');
  if (!digits) return 0;
  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function formatStepNumber(value: number, padLength = 2): string {
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  const safePad = Number.isFinite(padLength) ? Math.max(1, Math.floor(padLength)) : 2;
  return String(safeValue).padStart(safePad, '0');
}

export function easeOutCubic(t: number): number {
  const clamped = clamp01(t);
  return 1 - Math.pow(1 - clamped, 3);
}

export function getStepCounterDurationMs(targetValue: number): number {
  const safeTarget = Number.isFinite(targetValue) ? Math.max(0, Math.floor(targetValue)) : 0;
  return 480 + safeTarget * 70;
}

export function computeStepCounterFrame({
  elapsedMs,
  delayMs,
  durationMs,
  targetValue,
  padLength = 2,
  reducedMotion = false,
}: StepCounterFrameInput): StepCounterFrame {
  const safeTarget = Number.isFinite(targetValue) ? Math.max(0, Math.floor(targetValue)) : 0;

  if (reducedMotion || durationMs <= 0 || safeTarget === 0) {
    return {
      value: safeTarget,
      formatted: formatStepNumber(safeTarget, padLength),
      progress: 1,
      isComplete: true,
    };
  }

  const safeDelay = Number.isFinite(delayMs) ? Math.max(0, delayMs) : 0;
  const activeElapsed = elapsedMs - safeDelay;

  if (activeElapsed <= 0) {
    return {
      value: 0,
      formatted: formatStepNumber(0, padLength),
      progress: 0,
      isComplete: false,
    };
  }

  if (activeElapsed >= durationMs) {
    return {
      value: safeTarget,
      formatted: formatStepNumber(safeTarget, padLength),
      progress: 1,
      isComplete: true,
    };
  }

  const rawProgress = clamp01(activeElapsed / durationMs);
  const easedProgress = easeOutCubic(rawProgress);
  const currentValue = Math.min(safeTarget, Math.round(easedProgress * safeTarget));

  return {
    value: currentValue,
    formatted: formatStepNumber(currentValue, padLength),
    progress: Math.round(easedProgress * 1000) / 1000,
    isComplete: false,
  };
}
