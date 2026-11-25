import { COMPANY } from './company';
import {
  OG_IMAGE_ALT,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_TYPE,
  OG_IMAGE_URL,
  OG_IMAGE_WIDTH,
  SITE_ORIGIN,
  SITE_URL,
} from '../utils/seoUrl';

export interface PendingPublicationItem {
  key: string;
  label: string;
  status: 'pendente';
}

export const SITE_CONFIG = {
  brandName: COMPANY.tradeName,
  responsibleName: COMPANY.responsibleName,
  commercialNameConfirmed: COMPANY.legalName.confirmed,
  serviceArea: COMPANY.serviceArea,
  whatsapp: COMPANY.whatsapp,
  instagramUrl: COMPANY.instagram.url,
  instagramHandle: COMPANY.instagram.handle,
  credits: {
    label: 'Criado e desenvolvido por ēloSites',
    url: 'https://elosites.ia.br/',
  },
  // Modo protótipo privado: cenários visuais aprovados comercialmente pelo responsável técnico, mantendo sinalização ilustrativa
  isPrototypeMode: true,
  showBeforeAfterSimulations: true,
  beforeAfterApproval: {
    approved: true,
    approvedBy: COMPANY.responsibleName,
    technicalCapabilityConfirmed: true,
    keepIllustrativeClassification: true,
  },
  // Arquitetura preparada para futuras ferramentas baseadas em consentimento (desativadas por padrão)
  trackingConfig: {
    googleAnalyticsId: '',
    googleTagManagerId: '',
    metaPixelId: '',
    enabled: false,
  },
  // Configuração centralizada de domínio e OG image (deploy Netlify para apresentação comercial)
  seo: {
    siteUrl: SITE_URL,
    siteOrigin: SITE_ORIGIN,
    isProductionDomainConfigured: true,
    ogImage: {
      path: OG_IMAGE_PATH,
      url: OG_IMAGE_URL,
      type: OG_IMAGE_TYPE,
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      alt: OG_IMAGE_ALT,
    },
  },
  legal: {
    lastUpdated: '24 de novembro de 2026',
    privacyChannelDescription: `WhatsApp oficial ${COMPANY.whatsapp.display}`,
    // Dados pendentes de confirmação com o cliente antes da publicação definitiva
    pendingItems: [
      { key: 'legalName', label: `Confirmação da razão social oficial da pessoa jurídica (atualmente: ${COMPANY.legalName.value})`, status: 'pendente' },
      { key: 'cnpj', label: `Substituição do CNPJ provisório (${COMPANY.cnpj.value}) pelo CNPJ definitivo`, status: 'pendente' },
      { key: 'officialEmail', label: `Confirmação do e-mail oficial para contato e LGPD (substituir ${COMPANY.email.value} e só então ativar link)`, status: 'pendente' },
      { key: 'domain', label: `Migração eventual do endereço Netlify (${SITE_URL}) para domínio próprio definitivo, ativação de canonical/sitemap e remoção de noindex, nofollow na publicação final`, status: 'pendente' },
      { key: 'hostingProvider', label: 'Identificação do provedor de hospedagem e política de registros técnicos (logs)', status: 'pendente' },
      { key: 'retentionPolicy', label: 'Prazo definido de guarda/descarte de conversas e orçamentos no WhatsApp', status: 'pendente' },
      { key: 'photoRights', label: 'Confirmação formal de direito de uso das 30 fotografias de trabalhos', status: 'pendente' },
    ] satisfies PendingPublicationItem[],
  },
} as const;
