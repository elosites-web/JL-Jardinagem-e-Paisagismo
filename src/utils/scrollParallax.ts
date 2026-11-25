export const SCROLL_PARALLAX_ATTR = 'data-scroll-parallax';
export const SCROLL_PARALLAX_SCALE_ATTR = 'data-parallax-scale';
export const SCROLL_PARALLAX_SELECTOR = `[${SCROLL_PARALLAX_ATTR}]`;

export interface ScrollParallaxInput {
  rectTop: number;
  rectHeight: number;
  viewportHeight: number;
  amplitudePx: number;
  scale?: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundTo2(value: number): number {
  const rounded = Math.round(value * 100) / 100;
  return Object.is(rounded, -0) ? 0 : rounded;
}

/**
 * Calcula o deslocamento vertical sutil (em px) proporcional à posição do
 * elemento na viewport durante a rolagem. Quando `scale > 1` é informado,
 * limita o deslocamento máximo ao recuo seguro interno da moldura para evitar
 * exposição de bordas.
 */
export function computeScrollParallaxOffset({
  rectTop,
  rectHeight,
  viewportHeight,
  amplitudePx,
  scale,
}: ScrollParallaxInput): number {
  if (
    !Number.isFinite(rectTop) ||
    !Number.isFinite(rectHeight) ||
    !Number.isFinite(viewportHeight) ||
    !Number.isFinite(amplitudePx) ||
    rectHeight <= 0 ||
    viewportHeight <= 0 ||
    amplitudePx <= 0
  ) {
    return 0;
  }

  let effectiveAmplitude = amplitudePx;
  if (scale !== undefined && Number.isFinite(scale) && scale > 1) {
    const safeHeadroom = ((scale - 1) * rectHeight) / 2 - 0.5;
    effectiveAmplitude = Math.min(amplitudePx, Math.max(0, safeHeadroom));
  }

  if (effectiveAmplitude <= 0) {
    return 0;
  }

  const elementCenter = rectTop + rectHeight / 2;
  const viewportCenter = viewportHeight / 2;
  const travelHalfSpan = (viewportHeight + rectHeight) / 2;
  if (travelHalfSpan <= 0) {
    return 0;
  }

  const normalized = clamp((elementCenter - viewportCenter) / travelHalfSpan, -1, 1);
  return roundTo2(-normalized * effectiveAmplitude);
}
