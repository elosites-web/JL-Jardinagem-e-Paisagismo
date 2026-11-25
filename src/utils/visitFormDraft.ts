import { SERVICES_LIST } from '../data/services';
import {
  formatBrazilianPhone,
  getTodayIsoDate,
  INITIAL_VISIT_FORM_STATE,
  isPastDate,
  isValidIsoDate,
  VISIT_FIELD_LIMITS,
  type VisitFormState,
} from './visitForm';
import {
  PROPERTY_TYPE_LABELS,
  VISIT_PERIOD_LABELS,
  type PropertyType,
  type VisitPeriod,
} from './whatsapp';

export const VISIT_FORM_DRAFT_STORAGE_KEY = 'jl:visit-form:draft:v1';
export const VISIT_FORM_DRAFT_VERSION = 1;
export const VISIT_FORM_DRAFT_TTL_MS = 2 * 60 * 60 * 1000; // 2 horas

export type PersistableVisitFormFields = Omit<VisitFormState, 'consentChecked'>;

export interface StoredVisitFormDraft {
  version: typeof VISIT_FORM_DRAFT_VERSION;
  savedAt: number;
  expiresAt: number;
  data: PersistableVisitFormFields;
}

export type DraftDeserializeResult =
  | { status: 'empty' }
  | { status: 'corrupted' }
  | { status: 'expired' }
  | { status: 'valid'; data: PersistableVisitFormFields; discardedInvalidDate: boolean };

const VALID_PROPERTY_TYPES = new Set<string>(Object.keys(PROPERTY_TYPE_LABELS));
const VALID_VISIT_PERIODS = new Set<string>(Object.keys(VISIT_PERIOD_LABELS));
const VALID_SERVICE_NAMES = new Set<string>(SERVICES_LIST.map((service) => service.name));

function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').slice(0, maxLength);
}

export function hasPersistableFormContent(state: Partial<PersistableVisitFormFields>): boolean {
  return Boolean(
    state.fullName?.trim() ||
      state.phone?.trim() ||
      state.city?.trim() ||
      state.neighborhood?.trim() ||
      state.propertyType ||
      (state.selectedServices && state.selectedServices.length > 0) ||
      state.preferredDate ||
      state.preferredPeriod ||
      state.notes?.trim(),
  );
}

export function sanitizeDraftFields(
  raw: unknown,
  todayIso: string = getTodayIsoDate(),
): { data: PersistableVisitFormFields; discardedInvalidDate: boolean } {
  const emptyData: PersistableVisitFormFields = {
    fullName: INITIAL_VISIT_FORM_STATE.fullName,
    phone: INITIAL_VISIT_FORM_STATE.phone,
    city: INITIAL_VISIT_FORM_STATE.city,
    neighborhood: INITIAL_VISIT_FORM_STATE.neighborhood,
    propertyType: INITIAL_VISIT_FORM_STATE.propertyType,
    selectedServices: [],
    preferredDate: INITIAL_VISIT_FORM_STATE.preferredDate,
    preferredPeriod: INITIAL_VISIT_FORM_STATE.preferredPeriod,
    notes: INITIAL_VISIT_FORM_STATE.notes,
  };

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { data: emptyData, discardedInvalidDate: false };
  }

  const record = raw as Record<string, unknown>;

  const rawPropertyType = typeof record.propertyType === 'string' ? record.propertyType : '';
  const propertyType: PropertyType | '' = VALID_PROPERTY_TYPES.has(rawPropertyType)
    ? (rawPropertyType as PropertyType)
    : '';

  const rawPeriod = typeof record.preferredPeriod === 'string' ? record.preferredPeriod : '';
  const preferredPeriod: VisitPeriod | '' = VALID_VISIT_PERIODS.has(rawPeriod)
    ? (rawPeriod as VisitPeriod)
    : '';

  const selectedServices: string[] = Array.isArray(record.selectedServices)
    ? Array.from(
        new Set(
          record.selectedServices.filter(
            (item): item is string => typeof item === 'string' && VALID_SERVICE_NAMES.has(item),
          ),
        ),
      )
    : [];

  const rawDate = typeof record.preferredDate === 'string' ? record.preferredDate.trim() : '';
  let preferredDate = '';
  let discardedInvalidDate = false;
  if (rawDate) {
    if (isValidIsoDate(rawDate) && !isPastDate(rawDate, todayIso)) {
      preferredDate = rawDate;
    } else {
      discardedInvalidDate = true;
    }
  }

  return {
    discardedInvalidDate,
    data: {
      fullName: cleanText(record.fullName, VISIT_FIELD_LIMITS.fullName),
      phone: typeof record.phone === 'string' ? formatBrazilianPhone(record.phone) : '',
      city: cleanText(record.city, VISIT_FIELD_LIMITS.city),
      neighborhood: cleanText(record.neighborhood, VISIT_FIELD_LIMITS.neighborhood),
      propertyType,
      selectedServices,
      preferredDate,
      preferredPeriod,
      notes: cleanText(record.notes, VISIT_FIELD_LIMITS.notes),
    },
  };
}

export function serializeStoredVisitDraft(
  state: PersistableVisitFormFields | VisitFormState,
  nowMs: number = Date.now(),
): string {
  const { data } = sanitizeDraftFields({
    fullName: state.fullName,
    phone: state.phone,
    city: state.city,
    neighborhood: state.neighborhood,
    propertyType: state.propertyType,
    selectedServices: state.selectedServices,
    preferredDate: state.preferredDate,
    preferredPeriod: state.preferredPeriod,
    notes: state.notes,
  });

  const payload: StoredVisitFormDraft = {
    version: VISIT_FORM_DRAFT_VERSION,
    savedAt: nowMs,
    expiresAt: nowMs + VISIT_FORM_DRAFT_TTL_MS,
    data,
  };

  return JSON.stringify(payload);
}

export function parseStoredVisitDraft(
  rawJson: string | null,
  nowMs: number = Date.now(),
  todayIso: string = getTodayIsoDate(),
): DraftDeserializeResult {
  if (!rawJson) {
    return { status: 'empty' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { status: 'corrupted' };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { status: 'corrupted' };
  }

  const candidate = parsed as Record<string, unknown>;
  if (candidate.version !== VISIT_FORM_DRAFT_VERSION) {
    return { status: 'corrupted' };
  }

  if (
    typeof candidate.savedAt !== 'number' ||
    !Number.isFinite(candidate.savedAt) ||
    typeof candidate.expiresAt !== 'number' ||
    !Number.isFinite(candidate.expiresAt)
  ) {
    return { status: 'corrupted' };
  }

  if (candidate.savedAt > nowMs + 60_000) {
    return { status: 'corrupted' };
  }

  if (nowMs > candidate.expiresAt || nowMs - candidate.savedAt > VISIT_FORM_DRAFT_TTL_MS) {
    return { status: 'expired' };
  }

  const { data, discardedInvalidDate } = sanitizeDraftFields(candidate.data, todayIso);
  if (!hasPersistableFormContent(data)) {
    return { status: 'empty' };
  }

  return { status: 'valid', data, discardedInvalidDate };
}
