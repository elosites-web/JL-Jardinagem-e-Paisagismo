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
    title: 'Jardim residencial e canteiro',
    subtitle: 'Simulação conceitual de recuperação de gramado e plantio ornamental junto ao muro.',
    beforeSrc: '/images/antes-depois/jardim-antes.webp',
    afterSrc: '/images/antes-depois/jardim-depois.webp',
    beforeAlt: 'Simulação ilustrativa de área frontal com gramado falhado e canteiro vazio antes do paisagismo',
    afterAlt: 'Simulação ilustrativa da mesma área frontal com gramado formado e canteiro com folhagens e pedras',
    isIllustrative: true,
  },
  {
    id: 'corredor-lateral',
    title: 'Corredor lateral com placas',
    subtitle: 'Simulação conceitual de caminho com placas, pedriscos e vegetação lateral.',
    beforeSrc: '/images/antes-depois/caminho-antes.webp',
    afterSrc: '/images/antes-depois/caminho-depois.webp',
    beforeAlt: 'Simulação ilustrativa de corredor lateral em terra batida antes da implantação de caminho',
    afterAlt: 'Simulação ilustrativa do mesmo corredor com caminho de placas, pedriscos e bordadura verde',
    isIllustrative: true,
  },
  {
    id: 'rocada-terreno',
    title: 'Roçada e organização de terreno',
    subtitle: 'Simulação conceitual de controle de vegetação alta e limpeza da área externa.',
    beforeSrc: '/images/antes-depois/terreno-antes.webp',
    afterSrc: '/images/antes-depois/terreno-depois.webp',
    beforeAlt: 'Simulação ilustrativa de terreno tomado por vegetação alta antes da roçada',
    afterAlt: 'Simulação ilustrativa do mesmo terreno com vegetação aparada e área externa organizada',
    isIllustrative: true,
  },
];
