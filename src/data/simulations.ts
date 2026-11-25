export interface BeforeAfterPair {
  id: string;
  title: string;
  subtitle: string;
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  isIllustrative: boolean;
}

export const BEFORE_AFTER_PAIRS: readonly BeforeAfterPair[] = [
  {
    id: 'jardim-residencial',
    title: 'Revitalização de jardins residenciais',
    subtitle:
      'Recuperação do gramado, composição de canteiros e plantio ornamental para criar ambientes mais naturais e acolhedores.',
    beforeSrc: '/images/antes-depois/jardim-antes.webp',
    afterSrc: '/images/antes-depois/jardim-depois.webp',
    beforeAlt:
      'Imagem ilustrativa gerada por IA de jardim residencial com gramado falhado e canteiro vazio junto ao muro antes da revitalização paisagística',
    afterAlt:
      'Imagem ilustrativa gerada por IA da mesma área externa após recuperação do gramado, composição de canteiros e plantio ornamental',
    isIllustrative: true,
  },
  {
    id: 'corredor-lateral',
    title: 'Caminhos e harmonização paisagística',
    subtitle:
      'Composição de caminhos com placas de pedra, pedriscos e vegetação ornamental, unindo funcionalidade, beleza e valorização dos ambientes externos.',
    beforeSrc: '/images/antes-depois/caminho-antes.webp',
    afterSrc: '/images/antes-depois/caminho-depois.webp',
    beforeAlt:
      'Imagem ilustrativa gerada por IA de corredor lateral em terra batida antes da implantação de caminho de pedra e paisagismo',
    afterAlt:
      'Imagem ilustrativa gerada por IA do mesmo corredor após harmonização paisagística com caminho de placas de pedra, pedriscos e vegetação ornamental',
    isIllustrative: true,
  },
  {
    id: 'rocada-terreno',
    title: 'Roçada e organização de terrenos',
    subtitle:
      'Controle da vegetação, corte de mato e organização de áreas externas, proporcionando espaços mais limpos e bem cuidados.',
    beforeSrc: '/images/antes-depois/terreno-antes.webp',
    afterSrc: '/images/antes-depois/terreno-depois.webp',
    beforeAlt:
      'Imagem ilustrativa gerada por IA de terreno tomado por vegetação alta e mato antes do serviço de roçada e limpeza',
    afterAlt:
      'Imagem ilustrativa gerada por IA do mesmo terreno após roçada de terrenos, corte da vegetação e organização da área externa',
    isIllustrative: true,
  },
];
