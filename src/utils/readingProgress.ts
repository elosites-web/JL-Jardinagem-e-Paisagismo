export interface ReadingProgressMetrics {
  scrollY: number;
  scrollHeight: number;
  clientHeight: number;
}

export function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function computeReadingProgress({
  scrollY,
  scrollHeight,
  clientHeight,
}: ReadingProgressMetrics): number {
  const maxScrollable = Math.max(0, scrollHeight - clientHeight);
  if (maxScrollable <= 0) return 0;
  return clampProgress(scrollY / maxScrollable);
}

export function toProgressPercentage(progress: number): number {
  return Math.round(clampProgress(progress) * 100);
}

export function computeTipTranslateX(
  progress: number,
  trackWidth: number,
  tipWidth: number,
): number {
  if (!Number.isFinite(trackWidth) || trackWidth <= 0) return 0;
  const clamped = clampProgress(progress);
  const safeTipWidth = Math.max(0, tipWidth);
  const maxX = Math.max(0, trackWidth - safeTipWidth);
  const rawX = clamped * trackWidth - safeTipWidth;
  return Math.min(maxX, Math.max(0, rawX));
}
