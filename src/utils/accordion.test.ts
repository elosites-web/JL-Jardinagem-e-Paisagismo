import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveAccordionFocusIndex, toggleAccordionItem } from './accordion';

test('toggleAccordionItem opens closed item, switches active item, and collapses open item', () => {
  assert.equal(toggleAccordionItem(null, 'servicos'), 'servicos');
  assert.equal(toggleAccordionItem('servicos', 'regiao'), 'regiao');
  assert.equal(toggleAccordionItem('regiao', 'regiao'), null);
});

test('resolveAccordionFocusIndex wraps ArrowDown/ArrowUp and jumps Home/End properly', () => {
  assert.equal(resolveAccordionFocusIndex(0, 5, 'ArrowDown'), 1);
  assert.equal(resolveAccordionFocusIndex(4, 5, 'ArrowDown'), 0);
  assert.equal(resolveAccordionFocusIndex(0, 5, 'ArrowUp'), 4);
  assert.equal(resolveAccordionFocusIndex(2, 5, 'ArrowUp'), 1);
  assert.equal(resolveAccordionFocusIndex(3, 5, 'Home'), 0);
  assert.equal(resolveAccordionFocusIndex(1, 5, 'End'), 4);
  assert.equal(resolveAccordionFocusIndex(0, 5, 'Enter'), null);
  assert.equal(resolveAccordionFocusIndex(0, 0, 'ArrowDown'), null);
});
