import { COMPANY } from '../config/company';

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const PROCESS_STEPS: readonly ProcessStep[] = [
  {
    number: '01',
    title: 'Conte sobre seu espaço',
    description: 'Descreva sua área verde, o tipo de imóvel e os cuidados que você deseja realizar.',
  },
  {
    number: '02',
    title: 'Solicite uma visita',
    description: `Envie sua solicitação pelo formulário ou WhatsApp para combinar uma avaliação presencial em ${COMPANY.serviceArea}.`,
  },
  {
    number: '03',
    title: 'Receba seu orçamento personalizado',
    description: 'Após entender as condições do local, apresentamos a proposta adequada ao serviço solicitado.',
  },
  {
    number: '04',
    title: 'Combine a execução do serviço',
    description: 'Com o orçamento aprovado, alinhamos diretamente com você a data e os detalhes do atendimento.',
  },
];

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    id: 'servicos',
    question: 'Quais serviços são oferecidos?',
    answer:
      `A ${COMPANY.tradeName} realiza adubagem, caminhos de pedra ou dormentes, corte de grama, harmonização paisagística, vasos decorativos, manutenção de jardins, podas e plantio, além de roçada de terrenos. Detalhes sobre fornecimento de materiais ou condições específicas são alinhados diretamente no orçamento.`,
  },
  {
    id: 'area',
    question: 'Onde atendem?',
    answer:
      `O atendimento é voltado para ${COMPANY.serviceArea}. Ao enviar sua mensagem pelo WhatsApp ou formulário, informe sua cidade e bairro para verificarmos a disponibilidade.`,
  },
  {
    id: 'orcamento',
    question: 'Como solicitar orçamento?',
    answer:
      `Você pode clicar nos botões de orçamento para conversar diretamente pelo WhatsApp (${COMPANY.whatsapp.display}) ou preencher o formulário na seção "Agende uma visita", que organiza seus dados em uma mensagem pronta para revisão e envio no WhatsApp.`,
  },
  {
    id: 'manutencao',
    question: 'É possível contratar manutenção?',
    answer:
      `Sim. Realizamos manutenção de jardins com cuidados periódicos nas áreas verdes, com frequência e escopo definidos conforme avaliação e orçamento combinado com ${COMPANY.responsibleName}.`,
  },
  {
    id: 'fotos',
    question: 'Posso enviar fotos do espaço?',
    answer:
      'Sim. Ao iniciar a conversa pelo WhatsApp, você pode enviar fotos e detalhes do ambiente para ajudar na compreensão inicial do espaço antes de combinar a visita presencial e o orçamento.',
  },
];
