export interface CursorParallaxInput {
  clientX: number;
  clientY: number;
  viewportWidth: number;
  viewportHeight: number;
  maxShiftX?: number;
  maxShiftY?: number;
}

export interface CursorParallaxOffset {
  x: number;
  y: number;
}

const DEFAULT_MAX_SHIFT_X = 8;
const DEFAULT_MAX_SHIFT_Y = 3.5;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundTo2(value: number): number {
  const rounded = Math.round(value * 100) / 100;
  return Object.is(rounded, -0) ? 0 : rounded;
}

/**
 * Calcula um deslocamento sutil (em px) inverso à posição normalizada do cursor
 * na viewport para produzir profundidade leve sem expor bordas do SVG.
 */
export function computeSvgParallaxOffset({
  clientX,
  clientY,
  viewportWidth,
  viewportHeight,
  maxShiftX = DEFAULT_MAX_SHIFT_X,
  maxShiftY = DEFAULT_MAX_SHIFT_Y,
}: CursorParallaxInput): CursorParallaxOffset {
  if (
    !Number.isFinite(clientX) ||
    !Number.isFinite(clientY) ||
    !Number.isFinite(viewportWidth) ||
    !Number.isFinite(viewportHeight) ||
    viewportWidth <= 0 ||
    viewportHeight <= 0
  ) {
    return { x: 0, y: 0 };
  }

  const safeMaxX = Number.isFinite(maxShiftX) && maxShiftX > 0 ? maxShiftX : 0;
  const safeMaxY = Number.isFinite(maxShiftY) && maxShiftY > 0 ? maxShiftY : 0;

  const normX = clamp((clientX / viewportWidth) * 2 - 1, -1, 1);
  const normY = clamp((clientY / viewportHeight) * 2 - 1, -1, 1);

  return {
    x: roundTo2(-normX * safeMaxX),
    y: roundTo2(-normY * safeMaxY),
  };
}
