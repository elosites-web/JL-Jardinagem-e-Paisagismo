import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hasPersistableFormContent,
  parseStoredVisitDraft,
  serializeStoredVisitDraft,
  VISIT_FORM_DRAFT_TTL_MS,
  VISIT_FORM_DRAFT_VERSION,
} from './visitFormDraft';
import { INITIAL_VISIT_FORM_STATE, type VisitFormState } from './visitForm';

test('serializeStoredVisitDraft persists form fields and strictly excludes consentChecked', () => {
  const filled: VisitFormState = {
    fullName: 'Ana Paula Silva',
    phone: '+55 11 98765-4321',
    city: 'Jundiaí',
    neighborhood: 'Eloy Chaves',
    propertyType: 'residencial',
    selectedServices: ['Adubagem', 'Podas e plantio'],
    preferredDate: '2026-12-10',
    preferredPeriod: 'manha',
    notes: 'Jardim frontal com palmeiras.',
    consentChecked: true,
  };

  const nowMs = 1_795_564_800_000;
  const serialized = serializeStoredVisitDraft(filled, nowMs);
  assert.equal(serialized.includes('consentChecked'), false);

  const parsed = parseStoredVisitDraft(serialized, nowMs + 10_000, '2026-11-24');
  assert.equal(parsed.status, 'valid');
  if (parsed.status === 'valid') {
    assert.equal(parsed.data.fullName, 'Ana Paula Silva');
    assert.equal(parsed.data.phone, '(11) 98765-4321');
    assert.equal(parsed.data.city, 'Jundiaí');
    assert.equal(parsed.data.neighborhood, 'Eloy Chaves');
    assert.equal(parsed.data.propertyType, 'residencial');
    assert.deepEqual(parsed.data.selectedServices, ['Adubagem', 'Podas e plantio']);
    assert.equal(parsed.data.preferredDate, '2026-12-10');
    assert.equal(parsed.data.preferredPeriod, 'manha');
    assert.equal(parsed.data.notes, 'Jardim frontal com palmeiras.');
    assert.equal('consentChecked' in parsed.data, false);
  }
});

test('parseStoredVisitDraft discards expired drafts after 2 hours', () => {
  const nowMs = 1_795_564_800_000;
  const serialized = serializeStoredVisitDraft(
    { ...INITIAL_VISIT_FORM_STATE, fullName: 'João Pereira', city: 'Jundiaí' },
    nowMs,
  );

  const validJustBeforeExpiry = parseStoredVisitDraft(
    serialized,
    nowMs + VISIT_FORM_DRAFT_TTL_MS,
    '2026-11-24',
  );
  assert.equal(validJustBeforeExpiry.status, 'valid');

  const expired = parseStoredVisitDraft(
    serialized,
    nowMs + VISIT_FORM_DRAFT_TTL_MS + 1,
    '2026-11-24',
  );
  assert.equal(expired.status, 'expired');
});

test('parseStoredVisitDraft safely handles corrupted JSON, invalid version, and invalid fields', () => {
  const nowMs = 1_795_564_800_000;
  assert.equal(parseStoredVisitDraft(null, nowMs).status, 'empty');
  assert.equal(parseStoredVisitDraft('{invalid-json', nowMs).status, 'corrupted');
  assert.equal(parseStoredVisitDraft('[]', nowMs).status, 'corrupted');
  assert.equal(
    parseStoredVisitDraft(
      JSON.stringify({ version: 999, savedAt: nowMs, expiresAt: nowMs + 1000, data: {} }),
      nowMs,
    ).status,
    'corrupted',
  );

  const malicious = JSON.stringify({
    version: VISIT_FORM_DRAFT_VERSION,
    savedAt: nowMs,
    expiresAt: nowMs + 60_000,
    data: {
      fullName: 'Maria\u0000 Oliveira',
      propertyType: 'invalido',
      selectedServices: ['Adubagem', 'Serviço Inexistente', 'Adubagem'],
      preferredDate: '2026-11-20', // data passada -> deve ser descartada
      preferredPeriod: 'madrugada', // inválido -> deve virar ''
      consentChecked: true, // ignorado
    },
  });

  const result = parseStoredVisitDraft(malicious, nowMs, '2026-11-24');
  assert.equal(result.status, 'valid');
  if (result.status === 'valid') {
    assert.equal(result.discardedInvalidDate, true);
    assert.equal(result.data.fullName, 'Maria Oliveira');
    assert.equal(result.data.propertyType, '');
    assert.deepEqual(result.data.selectedServices, ['Adubagem']);
    assert.equal(result.data.preferredDate, '');
    assert.equal(result.data.preferredPeriod, '');
    assert.equal('consentChecked' in result.data, false);
  }
});

test('hasPersistableFormContent ignores empty states accurately', () => {
  assert.equal(hasPersistableFormContent(INITIAL_VISIT_FORM_STATE), false);
  assert.equal(hasPersistableFormContent({ ...INITIAL_VISIT_FORM_STATE, fullName: '   ' }), false);
  assert.equal(
    hasPersistableFormContent({ ...INITIAL_VISIT_FORM_STATE, selectedServices: ['Adubagem'] }),
    true,
  );
});
