import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveActiveSectionId, type SectionRectSnapshot } from './scrollSpy';

const SAMPLE_SECTIONS: SectionRectSnapshot[] = [
  { id: 'inicio', top: 0, bottom: 700, height: 700 },
  { id: 'sobre', top: 700, bottom: 1400, height: 700 },
  { id: 'servicos', top: 1400, bottom: 2200, height: 800 },
  { id: 'agendar-visita', top: 2200, bottom: 3000, height: 800 },
  { id: 'contato', top: 3000, bottom: 3500, height: 500 },
];

function shiftSections(scrollY: number): SectionRectSnapshot[] {
  return SAMPLE_SECTIONS.map((s) => ({
    ...s,
    top: s.top - scrollY,
    bottom: s.bottom - scrollY,
  }));
}

test('resolveActiveSectionId returns first section at top of page', () => {
  const active = resolveActiveSectionId({
    sections: shiftSections(0),
    headerBottom: 77,
    viewportHeight: 844,
    scrollY: 0,
    maxScrollY: 3100,
  });
  assert.equal(active, 'inicio');
});

test('resolveActiveSectionId accounts for dynamic header height when section aligns below header', () => {
  // #servicos começa exatamente em y=77 (borda inferior do header)
  const scrollY = 1400 - 77;
  const active = resolveActiveSectionId({
    sections: shiftSections(scrollY),
    headerBottom: 77,
    viewportHeight: 844,
    scrollY,
    maxScrollY: 3100,
  });
  assert.equal(active, 'servicos');
});

test('resolveActiveSectionId switches smoothly during vertical scroll', () => {
  const scrollY = 2160;
  const active = resolveActiveSectionId({
    sections: shiftSections(scrollY),
    headerBottom: 77,
    viewportHeight: 844,
    scrollY,
    maxScrollY: 3100,
  });
  assert.equal(active, 'agendar-visita');
});

test('resolveActiveSectionId selects last section when scrolled to page bottom', () => {
  const maxScrollY = 3944 - 844; // 3100 (contato + 444px footer)
  const active = resolveActiveSectionId({
    sections: shiftSections(maxScrollY),
    headerBottom: 77,
    viewportHeight: 844,
    scrollY: maxScrollY,
    maxScrollY,
  });
  assert.equal(active, 'contato');
});

test('resolveActiveSectionId handles empty sections list safely', () => {
  const active = resolveActiveSectionId({
    sections: [],
    headerBottom: 77,
    viewportHeight: 844,
    scrollY: 100,
    maxScrollY: 1000,
  });
  assert.equal(active, '');
});
