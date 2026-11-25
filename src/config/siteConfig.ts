import { COMPANY } from './company';

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
  // Modo protótipo privado: manter false na versão pública até aprovação expressa dos pares ilustrativos
  isPrototypeMode: true,
  showBeforeAfterSimulations: true,
  // Arquitetura preparada para futuras ferramentas baseadas em consentimento (desativadas por padrão)
  trackingConfig: {
    googleAnalyticsId: '',
    googleTagManagerId: '',
    metaPixelId: '',
    enabled: false,
  },
  legal: {
    lastUpdated: '24 de novembro de 2026',
    privacyChannelDescription: `WhatsApp oficial ${COMPANY.whatsapp.display}`,
    // Dados pendentes de confirmação com o cliente antes da publicação definitiva
    pendingItems: [
      { key: 'legalName', label: `Confirmação da razão social oficial da pessoa jurídica (atualmente: ${COMPANY.legalName.value})`, status: 'pendente' },
      { key: 'cnpj', label: `Substituição do CNPJ provisório (${COMPANY.cnpj.value}) pelo CNPJ definitivo`, status: 'pendente' },
      { key: 'officialEmail', label: `Confirmação do e-mail oficial para contato e LGPD (substituir ${COMPANY.email.value} e só então ativar link)`, status: 'pendente' },
      { key: 'domain', label: 'Domínio definitivo de produção para ativação de canonical, sitemap e remoção de noindex, nofollow', status: 'pendente' },
      { key: 'hostingProvider', label: 'Identificação do provedor de hospedagem e política de registros técnicos (logs)', status: 'pendente' },
      { key: 'retentionPolicy', label: 'Prazo definido de guarda/descarte de conversas e orçamentos no WhatsApp', status: 'pendente' },
      { key: 'photoRights', label: 'Confirmação formal de direito de uso das 30 fotografias de trabalhos', status: 'pendente' },
      { key: 'beforeAfterApproval', label: 'Aprovação expressa das simulações ou substituição por pares autênticos antes/depois', status: 'pendente' },
    ] satisfies PendingPublicationItem[],
  },
} as const;
