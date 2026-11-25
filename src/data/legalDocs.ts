import { COMPANY } from '../config/company';
import { SITE_CONFIG } from '../config/siteConfig';

export type LegalDocKey = 'terms' | 'privacy' | 'cookies';

export interface LegalSection {
  heading: string;
  paragraphs: readonly string[];
}

export interface LegalDocument {
  key: LegalDocKey;
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: readonly LegalSection[];
}

const CORPORATE_IDENTIFICATION_PARAGRAPH = `Identificação da empresa (${COMPANY.entityType}): Nome fantasia ${COMPANY.tradeName}; ${COMPANY.legalName.provisionalLabel}; ${COMPANY.cnpj.provisionalLabel}; responsável: ${COMPANY.responsibleName}; região de atendimento: ${COMPANY.serviceArea}; WhatsApp oficial: ${COMPANY.whatsapp.display}; Instagram: ${COMPANY.instagram.url}; ${COMPANY.email.provisionalLabel} (${COMPANY.email.disabledLinkNotice}).`;

export const LEGAL_DOCUMENTS: Record<LegalDocKey, LegalDocument> = {
  terms: {
    key: 'terms',
    title: 'Termos de Uso',
    subtitle: 'Condições de acesso e utilização deste site institucional',
    lastUpdated: SITE_CONFIG.legal.lastUpdated,
    sections: [
      {
        heading: '1. Identificação e finalidade institucional do site',
        paragraphs: [
          `Este site tem caráter exclusivamente institucional e comercial, destinado a apresentar os serviços de jardinagem e paisagismo da ${COMPANY.tradeName} (${COMPANY.entityType}), com atuação em ${COMPANY.serviceArea}, e facilitar o contato do visitante via WhatsApp oficial (${COMPANY.whatsapp.display}).`,
          CORPORATE_IDENTIFICATION_PARAGRAPH,
          `${COMPANY.provisionalReplacementNotice} Não há realização de compras online, cadastro de contas, pagamentos eletrônicos ou contratação automatizada por meio desta página.`,
        ],
      },
      {
        heading: '2. Condições de utilização',
        paragraphs: [
          'O visitante compromete-se a utilizar o site de forma lícita, ética e compatível com a legislação brasileira vigente, abstendo-se de inserir informações inverídicas ou de tentar comprometer a disponibilidade e a segurança da página.',
        ],
      },
      {
        heading: '3. Propriedade intelectual e fotografias do portfólio',
        paragraphs: [
          `A marca, o logotipo oficial da ${COMPANY.tradeName}, os textos, a identidade visual e a organização desta página são protegidos pela legislação de propriedade intelectual aplicável.`,
          'As 30 fotografias exibidas na seção "Trabalhos realizados" retratam serviços compartilhados pela JL e destinam-se exclusivamente à apresentação visual do portfólio, sendo vedada sua reprodução, redistribuição ou uso comercial sem autorização prévia.',
        ],
      },
      {
        heading: '4. Imagens ilustrativas e simulações geradas por IA',
        paragraphs: [
          `As imagens sinalizadas como "Imagem ilustrativa" (seção inicial) e "Simulação ilustrativa • imagens geradas por IA" (seção Antes e depois, quando exibida) são representações conceituais e não correspondem a obras ou projetos reais executados pela ${COMPANY.tradeName}.`,
        ],
      },
      {
        heading: '5. Solicitação de visitas e orçamentos',
        paragraphs: [
          'O preenchimento do formulário "Agende uma visita" gera uma mensagem estruturada para que o próprio visitante revise e envie pelo WhatsApp. O envio da solicitação não confirma automaticamente um agendamento, visita técnica, prazo ou contratação de serviço.',
          `A disponibilidade, a data, o horário, o escopo técnico, eventual fornecimento de materiais e as condições comerciais do atendimento serão tratados diretamente entre o solicitante e o responsável (${COMPANY.responsibleName}).`,
        ],
      },
      {
        heading: '6. Links e serviços de terceiros',
        paragraphs: [
          `O site disponibiliza links externos para o WhatsApp oficial (${COMPANY.whatsapp.display}) e para o perfil oficial no Instagram (${COMPANY.instagram.handle}), além do crédito de desenvolvimento. Enquanto o endereço de e-mail oficial não for confirmado, o e-mail provisório (${COMPANY.email.value}) é exibido apenas para referência do protótipo, sem link de envio ativo. Ao acessar plataformas de terceiros, o visitante passa a estar sujeito aos termos de uso e políticas de privacidade dos respectivos provedores.`,
        ],
      },
      {
        heading: '7. Legislação aplicável e canal de atendimento',
        paragraphs: [
          'Estes Termos de Uso respeitam a legislação brasileira, inclusive os princípios do Código Civil e do Código de Defesa do Consumidor (Lei nº 8.078/1990), quando aplicável.',
          `Dúvidas sobre o site ou sobre os serviços devem ser encaminhadas pelo canal oficial de atendimento: ${SITE_CONFIG.legal.privacyChannelDescription}.`,
        ],
      },
    ],
  },
  privacy: {
    key: 'privacy',
    title: 'Política de Privacidade',
    subtitle: 'Transparência sobre o tratamento de dados pessoais (Lei nº 13.709/2018 — LGPD)',
    lastUpdated: SITE_CONFIG.legal.lastUpdated,
    sections: [
      {
        heading: '1. Controlador e canal de contato',
        paragraphs: [
          CORPORATE_IDENTIFICATION_PARAGRAPH,
          `Canal oficial ativo para solicitações relacionadas à privacidade e proteção de dados: ${SITE_CONFIG.legal.privacyChannelDescription}. ${COMPANY.provisionalReplacementNotice}`,
        ],
      },
      {
        heading: '2. Dados pessoais tratados e princípio da minimização',
        paragraphs: [
          'Este site não possui banco de dados próprio, sistema de login ou envio automático em segundo plano. Enquanto você preenche o formulário "Agende uma visita", os dados informados permanecem salvos apenas temporariamente no armazenamento de sessão do próprio navegador (sessionStorage, chave jl:visit-form:draft:v1), com validade máxima de 2 horas, exclusivamente como rascunho para evitar perda acidental caso você navegue pela página ou atualize a aba.',
          'A caixa de ciência sobre privacidade nunca é armazenada no rascunho e precisa ser confirmada novamente caso os dados sejam recuperados. Os campos solicitados limitam-se ao necessário para preparar o atendimento inicial: nome completo, telefone/WhatsApp (opcional), cidade, bairro, tipo de imóvel, serviços de interesse, data e período de preferência e observações opcionais sobre o espaço. Não solicitamos endereço residencial completo, CPF ou dados pessoais sensíveis.',
        ],
      },
      {
        heading: '3. Finalidade e base legal do tratamento',
        paragraphs: [
          'Os dados têm como finalidade exclusiva estruturar a mensagem de solicitação de visita para avaliação e elaboração de orçamento presencial.',
          'O tratamento fundamenta-se na execução de procedimentos preliminares relacionados a contrato do qual o titular seja parte, a pedido do próprio titular, conforme o artigo 7º, inciso V, da Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).',
          'A caixa de ciência exibida no formulário atesta que o visitante compreende o encaminhamento voluntário da mensagem pelo WhatsApp e não representa autorização genérica para envio de publicidade.',
        ],
      },
      {
        heading: '4. Encaminhamento pelo WhatsApp e serviços de terceiros',
        paragraphs: [
          'Ao confirmar a solicitação, o navegador abre o WhatsApp com os dados organizados na mensagem para que você mesmo revise o conteúdo e decida enviá-lo.',
          'A partir do momento em que você envia a mensagem no WhatsApp ou acessa o Instagram por meio dos links do site, o tratamento das mensagens e metadados também passa a observar as políticas e infraestruturas dessas plataformas de terceiros, o que pode envolver transferência internacional de dados conforme as regras dos respectivos provedores.',
        ],
      },
      {
        heading: '5. Registros técnicos de hospedagem',
        paragraphs: [
          'Embora esta aplicação não armazene dados do formulário em servidores próprios, o provedor responsável pela hospedagem do site pode gerar registros técnicos de acesso (como endereço IP, data, hora e agente de navegação) estritamente para fins de segurança, estabilidade e entrega da página.',
        ],
      },
      {
        heading: '6. Retenção, descarte e segurança',
        paragraphs: [
          'Os dados digitados no formulário nunca são gravados em localStorage, cookies ou bancos de dados do site, tampouco são enviados a servidores externos ou ferramentas de analytics/publicidade. O rascunho temporário fica restrito ao sessionStorage da sessão atual no seu navegador por no máximo 2 horas (ou até o encerramento da sessão/aba), sendo validado e sanitizado ao ser restaurado, com descarte automático de datas expiradas.',
          'Mecanismo de exclusão: você pode apagar integralmente o rascunho a qualquer momento clicando na opção "Limpar formulário" e confirmando a limpeza, encerrando a sessão do navegador ou limpando os dados de sessão nas configurações do navegador. Ao clicar para abrir o WhatsApp, o rascunho não é apagado automaticamente para permitir que você revise ou ajuste suas informações caso não conclua o envio no aplicativo.',
          `As mensagens efetivamente enviadas por você no WhatsApp permanecem na conversa mantida entre o solicitante e o atendimento da ${COMPANY.tradeName} pelo tempo necessário ao orçamento, atendimento ou cumprimento de eventual obrigação legal, recomendando-se que a comunicação em produção ocorra sempre sob conexão HTTPS.`,
        ],
      },
      {
        heading: '7. Direitos do titular (artigo 18 da LGPD)',
        paragraphs: [
          `Nos termos do artigo 18 da LGPD, você pode solicitar confirmação da existência de tratamento, acesso aos dados tratados em eventual atendimento, correção de dados incompletos ou desatualizados, eliminação quando aplicável, informação sobre compartilhamentos e demais direitos previstos em lei, diretamente pelo ${SITE_CONFIG.legal.privacyChannelDescription}.`,
        ],
      },
    ],
  },
  cookies: {
    key: 'cookies',
    title: 'Política de Cookies',
    subtitle: 'Inventário transparente de cookies e armazenamento local',
    lastUpdated: SITE_CONFIG.legal.lastUpdated,
    sections: [
      {
        heading: '1. Identificação do responsável e escopo desta política',
        paragraphs: [
          CORPORATE_IDENTIFICATION_PARAGRAPH,
          COMPANY.provisionalReplacementNotice,
        ],
      },
      {
        heading: '2. O que são cookies e tecnologias semelhantes',
        paragraphs: [
          'Cookies são pequenos arquivos de texto que podem ser gravados no navegador durante a visita a um site. Tecnologias semelhantes incluem armazenamento local (localStorage e sessionStorage) e scripts de medição.',
        ],
      },
      {
        heading: '3. Inventário real utilizado neste site',
        paragraphs: [
          'Atualmente, este site não utiliza cookies (essenciais ou não essenciais), não grava informações em localStorage e não executa ferramentas de análise de tráfego (como Google Analytics ou Google Tag Manager) nem pixels de publicidade (como Meta Pixel).',
          'Uso estritamente funcional de sessionStorage (chave jl:visit-form:draft:v1): utilizamos exclusivamente o armazenamento temporário de sessão no próprio navegador para salvamento automático (AutoSave) e recuperação do rascunho do formulário "Agende uma visita" durante a navegação na mesma sessão, com validade máxima de 2 horas. Nenhum dado do rascunho é transmitido a servidores, compartilhado com terceiros ou persistido após o prazo de 2 horas/fechamento da sessão, e a caixa de ciência sobre privacidade nunca é salva. Você pode excluir o rascunho manualmente a qualquer instante pelo botão "Limpar formulário" ou pelas configurações de limpeza de dados do navegador.',
          'Por não haver cookies ou scripts não essenciais de medição ou publicidade ativos nesta etapa, nenhum banner intrusivo de consentimento é exibido automaticamente durante a navegação.',
        ],
      },
      {
        heading: '4. Arquitetura futura condicionada a consentimento',
        paragraphs: [
          'Caso o responsável venha a ativar ferramentas de medição ou publicidade no futuro, nenhuma tecnologia não essencial será executada antes da autorização expressa do visitante por meio de painel de consentimento com opções equivalentes para aceitar, rejeitar ou personalizar categorias, bem como possibilidade de revogação a qualquer momento pelo rodapé.',
        ],
      },
      {
        heading: '5. Plataformas externas acessadas por links',
        paragraphs: [
          `Ao clicar em links para o WhatsApp oficial (${COMPANY.whatsapp.display}) ou Instagram (${COMPANY.instagram.handle}), você será direcionado a serviços externos que possuem suas próprias políticas de cookies e privacidade, fora do controle direto deste site.`,
        ],
      },
    ],
  },
};
