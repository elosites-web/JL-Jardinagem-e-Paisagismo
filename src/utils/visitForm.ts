import type { PropertyType, VisitPeriod } from './whatsapp';

export interface VisitFormState {
  fullName: string;
  phone: string;
  city: string;
  neighborhood: string;
  propertyType: PropertyType | '';
  selectedServices: string[];
  preferredDate: string;
  preferredPeriod: VisitPeriod | '';
  notes: string;
  consentChecked: boolean;
}

export type VisitFormErrors = Partial<Record<keyof VisitFormState, string>>;

export const VISIT_FIELD_LIMITS = {
  fullName: 80,
  phone: 15,
  city: 60,
  neighborhood: 60,
  notes: 400,
} as const;

export const INITIAL_VISIT_FORM_STATE: VisitFormState = {
  fullName: '',
  phone: '',
  city: '',
  neighborhood: '',
  propertyType: '',
  selectedServices: [],
  preferredDate: '',
  preferredPeriod: '',
  notes: '',
  consentChecked: false,
};

export function extractDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatBrazilianPhone(raw: string): string {
  let digits = extractDigits(raw);
  if (digits.length >= 12 && digits.startsWith('55')) {
    digits = digits.slice(2);
  }
  digits = digits.slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function getTodayIsoDate(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isValidIsoDate(dateStr: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);
  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

export function isPastDate(dateStr: string, todayIso: string): boolean {
  if (!isValidIsoDate(dateStr)) return false;
  return dateStr < todayIso;
}

export function validateVisitForm(
  form: VisitFormState,
  todayIso: string = getTodayIsoDate(),
): VisitFormErrors {
  const errors: VisitFormErrors = {};

  const fullName = form.fullName.trim();
  if (fullName.length < 3) {
    errors.fullName = 'Informe seu nome completo (mínimo de 3 caracteres).';
  } else if (fullName.length > VISIT_FIELD_LIMITS.fullName) {
    errors.fullName = `O nome pode ter no máximo ${VISIT_FIELD_LIMITS.fullName} caracteres.`;
  }

  const phoneDigits = extractDigits(form.phone);
  if (phoneDigits.length > 0 && (phoneDigits.length < 10 || phoneDigits.length > 11)) {
    errors.phone = 'Informe um telefone/WhatsApp com DDD válido (10 ou 11 dígitos) ou deixe em branco.';
  }

  const city = form.city.trim();
  if (city.length < 2) {
    errors.city = 'Informe a cidade do atendimento.';
  } else if (city.length > VISIT_FIELD_LIMITS.city) {
    errors.city = `A cidade pode ter no máximo ${VISIT_FIELD_LIMITS.city} caracteres.`;
  }

  const neighborhood = form.neighborhood.trim();
  if (neighborhood.length < 2) {
    errors.neighborhood = 'Informe o bairro aproximado.';
  } else if (neighborhood.length > VISIT_FIELD_LIMITS.neighborhood) {
    errors.neighborhood = `O bairro pode ter no máximo ${VISIT_FIELD_LIMITS.neighborhood} caracteres.`;
  }

  if (!form.propertyType) {
    errors.propertyType = 'Selecione o tipo de imóvel.';
  }

  if (form.selectedServices.length === 0) {
    errors.selectedServices = 'Selecione pelo menos um serviço de interesse.';
  }

  if (!form.preferredDate) {
    errors.preferredDate = 'Escolha uma data de preferência.';
  } else if (!isValidIsoDate(form.preferredDate)) {
    errors.preferredDate = 'Informe uma data válida.';
  } else if (isPastDate(form.preferredDate, todayIso)) {
    errors.preferredDate = 'Não é possível selecionar uma data passada.';
  }

  if (!form.preferredPeriod) {
    errors.preferredPeriod = 'Selecione o período de preferência.';
  }

  if (form.notes.trim().length > VISIT_FIELD_LIMITS.notes) {
    errors.notes = `As observações podem ter no máximo ${VISIT_FIELD_LIMITS.notes} caracteres.`;
  }

  if (!form.consentChecked) {
    errors.consentChecked =
      'É necessário confirmar que está ciente do encaminhamento pelo WhatsApp conforme a Política de Privacidade.';
  }

  return errors;
}
