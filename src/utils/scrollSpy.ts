export interface SectionRectSnapshot {
  id: string;
  top: number;
  bottom: number;
  height: number;
}

export interface ResolveActiveSectionParams {
  sections: readonly SectionRectSnapshot[];
  headerBottom: number;
  viewportHeight: number;
  scrollY: number;
  maxScrollY: number;
}

export const ANCHOR_NAVIGATE_START_EVENT = 'jl:anchor-navigate-start';
export const ANCHOR_NAVIGATE_END_EVENT = 'jl:anchor-navigate-end';

export function resolveActiveSectionId({
  sections,
  headerBottom,
  viewportHeight,
  scrollY,
  maxScrollY,
}: ResolveActiveSectionParams): string {
  if (sections.length === 0) return '';

  // Topo absoluto da página: sempre destaca a primeira seção
  if (scrollY <= 12) {
    return sections[0].id;
  }

  // Fundo da página: destaca a última seção visível se ela entrou na área útil da viewport
  if (maxScrollY > 0 && scrollY >= maxScrollY - 12) {
    const lastSection = sections[sections.length - 1];
    if (lastSection.bottom > headerBottom && lastSection.top < viewportHeight * 0.85) {
      return lastSection.id;
    }
  }

  // Linha de leitura logo abaixo da borda inferior do cabeçalho dinâmico
  const availableHeight = Math.max(0, viewportHeight - headerBottom);
  const readingOffset = Math.min(96, Math.max(24, availableHeight * 0.22));
  const activationLine = headerBottom + readingOffset;

  for (const section of sections) {
    if (section.top <= activationLine && section.bottom > activationLine) {
      return section.id;
    }
  }

  let candidateId = sections[0].id;
  for (const section of sections) {
    if (section.top <= activationLine) {
      candidateId = section.id;
    } else {
      break;
    }
  }

  return candidateId;
}

export function dispatchAnchorNavigateStart(targetId: string): void {
  if (typeof window === 'undefined' || typeof CustomEvent === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<{ targetId: string }>(ANCHOR_NAVIGATE_START_EVENT, {
      detail: { targetId },
    }),
  );
}

export function dispatchAnchorNavigateEnd(targetId: string): void {
  if (typeof window === 'undefined' || typeof CustomEvent === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<{ targetId: string }>(ANCHOR_NAVIGATE_END_EVENT, {
      detail: { targetId },
    }),
  );
}
