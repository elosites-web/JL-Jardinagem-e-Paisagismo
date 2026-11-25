import test from 'node:test';
import assert from 'node:assert/strict';
import { SITE_CONFIG } from '../config/siteConfig';
import { LEGAL_DOCUMENTS } from './legalDocs';
import { BEFORE_AFTER_PAIRS } from './simulations';

test('BEFORE_AFTER_PAIRS preserves illustrative classification, image assets, and commercial copy', () => {
  assert.equal(BEFORE_AFTER_PAIRS.length, 3);

  const expectedTitles = [
    'Revitalização de jardins residenciais',
    'Caminhos e harmonização paisagística',
    'Roçada e organização de terrenos',
  ];

  const expectedSrcs = [
    ['/images/antes-depois/jardim-antes.webp', '/images/antes-depois/jardim-depois.webp'],
    ['/images/antes-depois/caminho-antes.webp', '/images/antes-depois/caminho-depois.webp'],
    ['/images/antes-depois/terreno-antes.webp', '/images/antes-depois/terreno-depois.webp'],
  ];

  BEFORE_AFTER_PAIRS.forEach((pair, index) => {
    assert.equal(pair.isIllustrative, true);
    assert.equal(pair.title, expectedTitles[index]);
    assert.equal(pair.beforeSrc, expectedSrcs[index][0]);
    assert.equal(pair.afterSrc, expectedSrcs[index][1]);
    assert.match(pair.beforeAlt, /Imagem ilustrativa gerada por IA/i);
    assert.match(pair.afterAlt, /Imagem ilustrativa gerada por IA/i);
    assert.doesNotMatch(pair.title, /simula/i);
    assert.doesNotMatch(pair.subtitle, /simula/i);
    assert.doesNotMatch(pair.beforeAlt, /simula/i);
    assert.doesNotMatch(pair.afterAlt, /simula/i);
  });
});

test('SITE_CONFIG records responsible commercial approval and keeps illustrative classification', () => {
  assert.equal(SITE_CONFIG.showBeforeAfterSimulations, true);
  assert.equal(SITE_CONFIG.beforeAfterApproval.approved, true);
  assert.equal(SITE_CONFIG.beforeAfterApproval.approvedBy, 'Júlio César');
  assert.equal(SITE_CONFIG.beforeAfterApproval.technicalCapabilityConfirmed, true);
  assert.equal(SITE_CONFIG.beforeAfterApproval.keepIllustrativeClassification, true);

  const pendingKeys = SITE_CONFIG.legal.pendingItems.map((item) => item.key);
  assert.equal(pendingKeys.includes('beforeAfterApproval'), false);
});

test('LEGAL_DOCUMENTS.terms reflects Antes e Depois nomenclature and illustrative AI notice', () => {
  const section4 = LEGAL_DOCUMENTS.terms.sections.find((section) =>
    section.heading.startsWith('4.'),
  );
  assert.ok(section4);
  assert.equal(section4.heading, '4. Imagens ilustrativas na seção Antes e Depois');

  const combinedText = section4.paragraphs.join(' ');
  assert.match(combinedText, /Antes e Depois/);
  assert.match(
    combinedText,
    /Imagens ilustrativas geradas por IA, representativas dos serviços oferecidos pela JL\./,
  );
  assert.match(combinedText, /não de registros fotográficos de obras efetivamente executadas/);
  assert.match(combinedText, /Trabalhos realizados/);
});
