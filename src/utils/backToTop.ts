export const BACK_TO_TOP_MOBILE_BREAKPOINT = 768;
export const BACK_TO_TOP_MOBILE_THRESHOLD_PX = 400;
export const BACK_TO_TOP_DESKTOP_THRESHOLD_PX = 560;

export interface BackToTopVisibilityInput {
  scrollY: number;
  viewportWidth: number;
}

export function getBackToTopThreshold(viewportWidth: number): number {
  if (
    Number.isFinite(viewportWidth) &&
    viewportWidth > 0 &&
    viewportWidth < BACK_TO_TOP_MOBILE_BREAKPOINT
  ) {
    return BACK_TO_TOP_MOBILE_THRESHOLD_PX;
  }
  return BACK_TO_TOP_DESKTOP_THRESHOLD_PX;
}

export function shouldShowBackToTop({
  scrollY,
  viewportWidth,
}: BackToTopVisibilityInput): boolean {
  if (!Number.isFinite(scrollY) || scrollY <= 0) {
    return false;
  }
  return scrollY > getBackToTopThreshold(viewportWidth);
}
