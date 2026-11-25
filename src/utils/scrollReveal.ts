export const SCROLL_REVEAL_ATTR = 'data-scroll-reveal';
export const SCROLL_REVEAL_SELECTOR = `[${SCROLL_REVEAL_ATTR}]`;

export type ScrollRevealState = 'hidden' | 'visible' | 'settled';

export interface ScrollRevealMountCheckParams {
  rectTop: number;
  viewportHeight: number;
  hasIntersectionObserver: boolean;
  reducedMotion: boolean;
}

export interface ScrollRevealIntersectCheckParams {
  isIntersecting: boolean;
  boundingClientRectTop: number;
  rootBoundsBottom: number | null;
  viewportHeight: number;
}

/**
 * Determina se um bloco com a diretiva scroll-reveal deve aparecer já revelado na montagem:
 * - quando reduced-motion está ativo;
 * - quando IntersectionObserver não é suportado;
 * - quando o bloco já está visível ou acima da viewport inicial.
 */
export function shouldRevealOnMount({
  rectTop,
  viewportHeight,
  hasIntersectionObserver,
  reducedMotion,
}: ScrollRevealMountCheckParams): boolean {
  if (reducedMotion || !hasIntersectionObserver) return true;
  if (viewportHeight <= 0) return true;
  return rectTop <= viewportHeight * 0.94;
}

/**
 * Determina se uma entrada do IntersectionObserver (ou leitura equivalente)
 * deve disparar a transição suave de entrada.
 */
export function shouldRevealOnIntersect({
  isIntersecting,
  boundingClientRectTop,
  rootBoundsBottom,
  viewportHeight,
}: ScrollRevealIntersectCheckParams): boolean {
  if (isIntersecting) return true;
  const bottomLimit = rootBoundsBottom ?? viewportHeight;
  if (bottomLimit <= 0) return false;
  return boundingClientRectTop < bottomLimit;
}

export type ScrollRevealDelayMs = 80 | 120 | 160 | 240 | 320 | 360;

export function scrollRevealDirectiveProps(delayMs?: ScrollRevealDelayMs) {
  const delayClass = delayMs ? ` scroll-reveal-delay-${delayMs}` : '';
  return {
    'data-scroll-reveal': 'hidden' as ScrollRevealState,
    className: `scroll-reveal${delayClass}`,
  };
}

const COVERFLOW_STAGGER_DELAYS: readonly (ScrollRevealDelayMs | undefined)[] = [
  undefined,
  80,
  160,
  240,
];

const GALLERY_GRID_STAGGER_DELAYS: readonly (ScrollRevealDelayMs | undefined)[] = [
  undefined,
  80,
  160,
  240,
  320,
];

export function getCoverflowRevealDelay(absDelta: number): ScrollRevealDelayMs | undefined {
  const clamped = Math.max(0, Math.min(COVERFLOW_STAGGER_DELAYS.length - 1, Math.floor(absDelta)));
  return COVERFLOW_STAGGER_DELAYS[clamped];
}

export function getGalleryGridRevealDelay(index: number): ScrollRevealDelayMs | undefined {
  const safeIndex = Math.max(0, Math.floor(index));
  return GALLERY_GRID_STAGGER_DELAYS[safeIndex % GALLERY_GRID_STAGGER_DELAYS.length];
}
