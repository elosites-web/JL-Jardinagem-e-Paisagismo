export function toggleAccordionItem(currentOpenId: string | null, targetId: string): string | null {
  return currentOpenId === targetId ? null : targetId;
}

export type AccordionNavKey = 'ArrowDown' | 'ArrowUp' | 'Home' | 'End';

export function resolveAccordionFocusIndex(
  currentIndex: number,
  totalItems: number,
  key: string,
): number | null {
  if (totalItems <= 0) return null;

  switch (key) {
    case 'ArrowDown':
      return (currentIndex + 1) % totalItems;
    case 'ArrowUp':
      return (currentIndex - 1 + totalItems) % totalItems;
    case 'Home':
      return 0;
    case 'End':
      return totalItems - 1;
    default:
      return null;
  }
}
