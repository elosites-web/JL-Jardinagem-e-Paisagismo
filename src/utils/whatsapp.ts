import { COMPANY } from '../config/company';

export const GENERAL_WHATSAPP_MESSAGE =
  'Olá, Júlio! Conheci seu site e gostaria de solicitar um orçamento de jardinagem e paisagismo.';

export type PropertyType = 'residencial' | 'comercial' | 'condominio' | 'terreno_chacara';
export type VisitPeriod = 'manha' | 'tarde' | 'flexivel';

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  residencial: 'Residencial',
  comercial: 'Comercial',
  condominio: 'Condomínio',
  terreno_chacara: 'Terreno / Chácara',
};

export const VISIT_PERIOD_LABELS: Record<VisitPeriod, string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  flexivel: 'Flexível',
};

export interface VisitMessagePayload {
  fullName: string;
  phone: string;
  city: string;
  neighborhood: string;
  propertyType: PropertyType;
  selectedServices: string[];
  preferredDate: string;
  preferredPeriod: VisitPeriod;
  notes: string;
}

export function buildWhatsAppUrl(message: string): string {
  return `${COMPANY.whatsapp.baseUrl}?text=${encodeURIComponent(message)}`;
}

export function buildGeneralWhatsAppUrl(): string {
  return buildWhatsAppUrl(GENERAL_WHATSAPP_MESSAGE);
}

export function buildServiceWhatsAppUrl(serviceName: string): string {
  const message = `Olá, Júlio! Gostaria de solicitar um orçamento para ${serviceName}.`;
  return buildWhatsAppUrl(message);
}

export function formatIsoDatePtBr(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) {
    return isoDate;
  }
  return `${match[3]}/${match[2]}/${match[1]}`;
}

export function buildVisitMessage(payload: VisitMessagePayload): string {
  const cleanName = payload.fullName.trim();
  const cleanPhone = payload.phone.trim();
  const cleanCity = payload.city.trim();
  const cleanNeighborhood = payload.neighborhood.trim();
  const cleanNotes = payload.notes.trim();

  const lines = [
    `*Solicitação de Visita para Orçamento Presencial — ${COMPANY.tradeName}*`,
    '',
    `• *Nome:* ${cleanName}`,
    ...(cleanPhone ? [`• *Telefone/WhatsApp:* ${cleanPhone}`] : []),
    `• *Cidade:* ${cleanCity}`,
    `• *Bairro:* ${cleanNeighborhood}`,
    `• *Tipo de imóvel:* ${PROPERTY_TYPE_LABELS[payload.propertyType]}`,
    `• *Serviços de interesse:* ${payload.selectedServices.join(', ')}`,
    `• *Data de preferência:* ${formatIsoDatePtBr(payload.preferredDate)}`,
    `• *Período de preferência:* ${VISIT_PERIOD_LABELS[payload.preferredPeriod]}`,
    ...(cleanNotes ? [`• *Observações:* ${cleanNotes}`] : []),
    '',
    '_Solicitação sujeita à confirmação de disponibilidade diretamente no atendimento._',
  ];

  return lines.join('\n');
}

export function buildVisitWhatsAppUrl(payload: VisitMessagePayload): string {
  return buildWhatsAppUrl(buildVisitMessage(payload));
}
