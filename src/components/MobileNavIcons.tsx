export type MobileNavSectionId =
  | 'inicio'
  | 'sobre'
  | 'servicos'
  | 'trabalhos'
  | 'antes-depois'
  | 'como-funciona'
  | 'duvidas'
  | 'agendar-visita'
  | 'contato';

interface MobileNavIconProps {
  sectionId: MobileNavSectionId;
  className?: string;
}

const BASE_SVG_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.65,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
};

export function MobileNavIcon({ sectionId, className = 'h-5 w-5' }: MobileNavIconProps) {
  switch (sectionId) {
    case 'inicio':
      // Casa minimalista com detalhe de folha + surgimento suave do contorno
      return (
        <svg {...BASE_SVG_PROPS} className={`nav-icon-svg nav-icon-inicio ${className}`}>
          <path
            pathLength={100}
            className="nav-anim-home-outline"
            d="M3.5 10.5L12 3.75L20.5 10.5V19.25C20.5 19.94 19.94 20.5 19.25 20.5H4.75C4.06 20.5 3.5 19.94 3.5 19.25V10.5Z"
          />
          <path
            className="nav-anim-home-leaf"
            d="M12 16.5V13.25C12 11.45 13.45 10 15.25 10C15.25 11.8 13.8 13.25 12 13.25"
          />
        </svg>
      );

    case 'sobre':
      // Árvore com raízes estilizadas + movimento delicado da copa/folhas
      return (
        <svg {...BASE_SVG_PROPS} className={`nav-icon-svg nav-icon-sobre ${className}`}>
          <g className="nav-anim-tree-canopy">
            <path d="M12 3.25C8.9 3.25 6.5 5.45 6.5 8.2C6.5 10.5 8.15 12.2 10.25 12.65" />
            <path d="M12 3.25C15.1 3.25 17.5 5.45 17.5 8.2C17.5 10.5 15.85 12.2 13.75 12.65" />
            <path d="M9.5 7.75C10.5 6.75 13.5 6.75 14.5 7.75" />
          </g>
          <path d="M12 8.75V18" />
          <path d="M12 18C10.4 18.85 8.4 19.6 6.25 20.25" />
          <path d="M12 18C13.6 18.85 15.6 19.6 17.75 20.25" />
          <path d="M12 18V20.75" />
        </svg>
      );

    case 'servicos':
      // Tesoura de poda minimalista + movimento discreto das lâminas
      return (
        <svg {...BASE_SVG_PROPS} className={`nav-icon-svg nav-icon-servicos ${className}`}>
          <g className="nav-anim-shear-top">
            <path d="M19.25 4.75L9.75 14.25" />
            <circle cx="7.25" cy="16.75" r="2.25" />
          </g>
          <g className="nav-anim-shear-bottom">
            <path d="M4.75 4.75L14.25 14.25" />
            <circle cx="16.75" cy="16.75" r="2.25" />
          </g>
          <circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none" />
        </svg>
      );

    case 'trabalhos':
      // Moldura fotográfica com paisagem natural + transição suave entre molduras
      return (
        <svg {...BASE_SVG_PROPS} className={`nav-icon-svg nav-icon-trabalhos ${className}`}>
          <rect
            className="nav-anim-gallery-frame"
            x="3.5"
            y="4.5"
            width="17"
            height="15"
            rx="2.5"
          />
          <g className="nav-anim-gallery-scene">
            <circle cx="8.75" cy="9.25" r="1.4" />
            <path d="M4.75 16.75L9.25 12.25L12.75 15.5L15.75 12.5L19.25 16.75" />
          </g>
        </svg>
      );

    case 'antes-depois':
      // Duas folhas representando transformação + movimento de transformação entre os elementos
      return (
        <svg {...BASE_SVG_PROPS} className={`nav-icon-svg nav-icon-antes-depois ${className}`}>
          <g className="nav-anim-leaf-before">
            <path d="M4.5 15.5C4.5 11.75 7.25 9.25 10.75 9.25C10.75 12.75 8.25 15.5 4.5 15.5Z" />
            <path d="M4.5 15.5L3.5 17.5" />
          </g>
          <g className="nav-anim-leaf-after">
            <path d="M12.25 14.75C12.25 8.9 15.85 5 20.5 4.75C20.25 9.65 16.85 14.75 12.25 14.75Z" />
            <path d="M12.25 14.75L10.75 18.5" />
          </g>
        </svg>
      );

    case 'como-funciona':
      // Caminho paisagístico com etapas + preenchimento sequencial do caminho
      return (
        <svg {...BASE_SVG_PROPS} className={`nav-icon-svg nav-icon-como-funciona ${className}`}>
          <path
            pathLength={100}
            className="nav-anim-path-line"
            d="M5.5 18.75C5.5 15.5 10.5 15 12 12C13.5 9 18.5 8.5 18.5 5.25"
          />
          <circle className="nav-anim-path-dot-1" cx="5.5" cy="18.75" r="1.75" />
          <circle className="nav-anim-path-dot-2" cx="12" cy="12" r="1.75" />
          <circle className="nav-anim-path-dot-3" cx="18.5" cy="5.25" r="1.75" />
        </svg>
      );

    case 'duvidas':
      // Balão de diálogo com interrogação + pulsação suave da interrogação
      return (
        <svg {...BASE_SVG_PROPS} className={`nav-icon-svg nav-icon-duvidas ${className}`}>
          <path d="M20.25 11.75C20.25 16 16.55 19.5 12 19.5C10.55 19.5 9.15 19.15 7.95 18.5L4 19.75L5.2 16.1C4.45 14.85 3.75 13.35 3.75 11.75C3.75 7.5 7.45 4 12 4C16.55 4 20.25 7.5 20.25 11.75Z" />
          <g className="nav-anim-question-pulse">
            <path d="M9.85 9.4C10.1 8.2 11.05 7.5 12.1 7.5C13.35 7.5 14.2 8.25 14.2 9.3C14.2 10.45 13.15 10.95 12.1 11.65V12.5" />
            <circle cx="12.1" cy="15.25" r="0.85" fill="currentColor" stroke="none" />
          </g>
        </svg>
      );

    case 'agendar-visita':
      // Calendário com detalhe botânico e confirmação animada
      return (
        <svg {...BASE_SVG_PROPS} className={`nav-icon-svg nav-icon-agendar ${className}`}>
          <rect x="3.75" y="5.5" width="16.5" height="14.75" rx="2.25" />
          <path d="M8 3.75V6.75" />
          <path d="M16 3.75V6.75" />
          <path d="M3.75 9.75H20.25" />
          <path
            pathLength={100}
            className="nav-anim-calendar-check"
            d="M8.5 14.65L10.75 16.75L15.25 12.25"
          />
          <path d="M17.25 6.75C17.25 5.65 18.2 4.75 19.35 4.75C19.35 5.9 18.4 6.75 17.25 6.75Z" />
        </svg>
      );

    case 'contato':
      // Balão de comunicação + pequena expansão suave
      return (
        <svg {...BASE_SVG_PROPS} className={`nav-icon-svg nav-icon-contato ${className}`}>
          <g className="nav-anim-contact-expand">
            <path d="M20.25 11.5C20.25 15.65 16.55 19 12 19C10.4 19 8.9 18.6 7.65 17.9L3.75 19.25L5.05 15.65C4.25 14.45 3.75 13.05 3.75 11.5C3.75 7.35 7.45 4 12 4C16.55 4 20.25 7.35 20.25 11.5Z" />
            <path d="M8.5 10.5H15.5" />
            <path d="M8.5 13.75H13.25" />
          </g>
        </svg>
      );
  }
}
