import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildGeneralWhatsAppUrl,
  buildServiceWhatsAppUrl,
  buildVisitMessage,
  buildVisitWhatsAppUrl,
  formatIsoDatePtBr,
} from './whatsapp';

test('buildGeneralWhatsAppUrl encodes official message for 5511951062408', () => {
  const url = buildGeneralWhatsAppUrl();
  assert.ok(url.startsWith('https://wa.me/5511951062408?text='));
  const decoded = decodeURIComponent(url.split('?text=')[1]);
  assert.equal(
    decoded,
    'Olá, Júlio! Conheci seu site e gostaria de solicitar um orçamento de jardinagem e paisagismo.',
  );
});

test('buildServiceWhatsAppUrl includes specific service name', () => {
  const url = buildServiceWhatsAppUrl('Caminhos de pedra ou dormentes');
  const decoded = decodeURIComponent(url.split('?text=')[1]);
  assert.equal(
    decoded,
    'Olá, Júlio! Gostaria de solicitar um orçamento para Caminhos de pedra ou dormentes.',
  );
});

test('buildVisitMessage formats all fields cleanly and omits blank optional fields', () => {
  const msg = buildVisitMessage({
    fullName: 'Maria Silva',
    phone: '',
    city: 'Jundiaí',
    neighborhood: 'Eloy Chaves',
    propertyType: 'residencial',
    selectedServices: ['Corte de grama', 'Adubagem'],
    preferredDate: '2026-12-10',
    preferredPeriod: 'manha',
    notes: '   ',
  });

  assert.match(msg, /Maria Silva/);
  assert.doesNotMatch(msg, /Telefone\/WhatsApp/);
  assert.match(msg, /Jundiaí/);
  assert.match(msg, /Eloy Chaves/);
  assert.match(msg, /Residencial/);
  assert.match(msg, /Corte de grama, Adubagem/);
  assert.match(msg, /10\/12\/2026/);
  assert.match(msg, /Manhã/);
  assert.doesNotMatch(msg, /Observações/);
});

test('buildVisitWhatsAppUrl encodes structured message safely', () => {
  const url = buildVisitWhatsAppUrl({
    fullName: 'João & Ana',
    phone: '(11) 99999-8888',
    city: 'Itupeva',
    neighborhood: 'Centro',
    propertyType: 'condominio',
    selectedServices: ['Podas e plantio'],
    preferredDate: '2026-12-01',
    preferredPeriod: 'flexivel',
    notes: 'Área lateral com declive',
  });

  assert.ok(url.startsWith('https://wa.me/5511951062408?text='));
  const decoded = decodeURIComponent(url.split('?text=')[1]);
  assert.match(decoded, /João & Ana/);
  assert.match(decoded, /\(11\) 99999-8888/);
  assert.match(decoded, /Condomínio/);
  assert.match(decoded, /Área lateral com declive/);
  assert.equal(formatIsoDatePtBr('2026-12-01'), '01/12/2026');
});
