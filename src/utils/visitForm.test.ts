import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatBrazilianPhone,
  INITIAL_VISIT_FORM_STATE,
  isPastDate,
  validateVisitForm,
} from './visitForm';

test('formatBrazilianPhone formats 10 and 11 digit numbers properly', () => {
  assert.equal(formatBrazilianPhone('11951062408'), '(11) 95106-2408');
  assert.equal(formatBrazilianPhone('1145213344'), '(11) 4521-3344');
  assert.equal(formatBrazilianPhone('11'), '(11');
  assert.equal(formatBrazilianPhone(''), '');
});

test('isPastDate rejects dates strictly before today', () => {
  assert.equal(isPastDate('2026-11-23', '2026-11-24'), true);
  assert.equal(isPastDate('2026-11-24', '2026-11-24'), false);
  assert.equal(isPastDate('2026-12-01', '2026-11-24'), false);
});

test('validateVisitForm enforces required fields, future date, and consent checkbox', () => {
  const emptyErrors = validateVisitForm(INITIAL_VISIT_FORM_STATE, '2026-11-24');
  assert.ok(emptyErrors.fullName);
  assert.ok(emptyErrors.city);
  assert.ok(emptyErrors.neighborhood);
  assert.ok(emptyErrors.propertyType);
  assert.ok(emptyErrors.selectedServices);
  assert.ok(emptyErrors.preferredDate);
  assert.ok(emptyErrors.preferredPeriod);
  assert.ok(emptyErrors.consentChecked);
  // Phone is optional per LGPD data minimization when left empty
  assert.equal(emptyErrors.phone, undefined);
});

test('validateVisitForm rejects invalid partial phone and past date, accepts valid state', () => {
  const invalidErrors = validateVisitForm(
    {
      fullName: 'Carlos Mendes',
      phone: '11999',
      city: 'Jundiaí',
      neighborhood: 'Vila Arens',
      propertyType: 'residencial',
      selectedServices: ['Corte de grama'],
      preferredDate: '2026-11-20',
      preferredPeriod: 'tarde',
      notes: 'Jardim nos fundos',
      consentChecked: true,
    },
    '2026-11-24',
  );
  assert.ok(invalidErrors.phone);
  assert.ok(invalidErrors.preferredDate);

  const validErrors = validateVisitForm(
    {
      fullName: 'Carlos Mendes',
      phone: '(11) 98888-7777',
      city: 'Jundiaí',
      neighborhood: 'Vila Arens',
      propertyType: 'residencial',
      selectedServices: ['Corte de grama'],
      preferredDate: '2026-11-26',
      preferredPeriod: 'tarde',
      notes: 'Jardim nos fundos',
      consentChecked: true,
    },
    '2026-11-24',
  );
  assert.deepEqual(validErrors, {});
});
