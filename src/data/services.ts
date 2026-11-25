export type ServiceId =
  | 'adubagem'
  | 'caminhos'
  | 'corte-grama'
  | 'harmonizacao'
  | 'vasos'
  | 'manutencao'
  | 'podas-plantio'
  | 'rocada';

export interface ServiceItem {
  id: ServiceId;
  number: string;
  name: string;
  description: string;
  iconName:
    | 'sprout'
    | 'route'
    | 'scissors'
    | 'compass'
    | 'flower2'
    | 'calendarCheck'
    | 'trees'
    | 'shovel';
}

export const SERVICES_LIST: readonly ServiceItem[] = [
  {
    id: 'adubagem',
    number: '01',
    name: 'Adubagem',
    description: 'Cuidado com o solo e nutrição das plantas para fortalecer o jardim.',
    iconName: 'sprout',
  },
  {
    id: 'caminhos',
    number: '02',
    name: 'Caminhos de pedra ou dormentes',
    description: 'Composição de caminhos que integram circulação e jardim com harmonia.',
    iconName: 'route',
  },
  {
    id: 'corte-grama',
    number: '03',
    name: 'Corte de grama',
    description: 'Cuidado com a aparência, nivelamento e altura do gramado.',
    iconName: 'scissors',
  },
  {
    id: 'harmonizacao',
    number: '04',
    name: 'Harmonização paisagística',
    description: 'Combinação de plantas, formas e elementos para valorizar o ambiente.',
    iconName: 'compass',
  },
  {
    id: 'vasos',
    number: '05',
    name: 'Vasos decorativos',
    description: 'Composição com vasos e plantas ornamentais para áreas internas e externas.',
    iconName: 'flower2',
  },
  {
    id: 'manutencao',
    number: '06',
    name: 'Manutenção de jardins',
    description: 'Cuidados periódicos com áreas verdes, definidos conforme orçamento.',
    iconName: 'calendarCheck',
  },
  {
    id: 'podas-plantio',
    number: '07',
    name: 'Podas e plantio',
    description: 'Cuidados com a vegetação existente e implantação de novas plantas.',
    iconName: 'trees',
  },
  {
    id: 'rocada',
    number: '08',
    name: 'Roçada de terrenos',
    description: 'Controle da vegetação e limpeza conforme condições e avaliação do terreno.',
    iconName: 'shovel',
  },
];
