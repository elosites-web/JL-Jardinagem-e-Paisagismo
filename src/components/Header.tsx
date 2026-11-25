import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from 'react';
import { flushSync } from 'react-dom';
import { COMPANY } from '../config/company';
import { SITE_CONFIG } from '../config/siteConfig';
import { useActiveSection } from '../hooks/useActiveSection';
import { navigateToAnchorHref, syncHeaderHeightCssVar } from '../utils/anchorNavigation';
import { MobileNavIcon, type MobileNavSectionId } from './MobileNavIcons';
import { ReadingProgressBar } from './ReadingProgressBar';

interface HeaderProps {
  onMobileMenuChange: (open: boolean) => void;
}

interface DesktopNavLink {
  href: string;
  sectionId: MobileNavSectionId;
  label: string;
}

const DESKTOP_NAV_LINKS: readonly DesktopNavLink[] = [
  { href: '#sobre', sectionId: 'sobre', label: 'Sobre' },
  { href: '#servicos', sectionId: 'servicos', label: 'Serviços' },
  { href: '#trabalhos', sectionId: 'trabalhos', label: 'Trabalhos' },
  { href: '#como-funciona', sectionId: 'como-funciona', label: 'Como funciona' },
  { href: '#duvidas', sectionId: 'duvidas', label: 'Dúvidas' },
  { href: '#contato', sectionId: 'contato', label: 'Contato' },
];

interface MobileNavLink {
  href: string;
  sectionId: MobileNavSectionId;
  label: string;
}

export function Header({ onMobileMenuChange }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMenuEntering, setIsMenuEntering] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const mobileLinks = useMemo<MobileNavLink[]>(
    () => [
      { href: '#inicio', sectionId: 'inicio', label: 'Início' },
      { href: '#sobre', sectionId: 'sobre', label: 'Sobre a JL' },
      { href: '#servicos', sectionId: 'servicos', label: 'Serviços' },
      { href: '#trabalhos', sectionId: 'trabalhos', label: 'Trabalhos realizados' },
      ...(SITE_CONFIG.showBeforeAfterSimulations
        ? [{ href: '#antes-depois', sectionId: 'antes-depois' as const, label: 'Antes e depois' }]
        : []),
      { href: '#como-funciona', sectionId: 'como-funciona', label: 'Como funciona' },
      { href: '#duvidas', sectionId: 'duvidas', label: 'Perguntas frequentes' },
      { href: '#agendar-visita', sectionId: 'agendar-visita', label: 'Agendar visita' },
      { href: '#contato', sectionId: 'contato', label: 'Contato' },
    ],
    [],
  );

  const trackedSectionIds = useMemo(
    () => mobileLinks.map((item) => item.sectionId),
    [mobileLinks],
  );

  const { activeSectionId, setActiveSection } = useActiveSection(trackedSectionIds);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
      const heroEl = document.getElementById('inicio');
      if (heroEl) {
        const headerBottom = headerRef.current?.getBoundingClientRect().bottom ?? 77;
        setIsPastHero(heroEl.getBoundingClientRect().bottom <= headerBottom + 16);
      } else {
        setIsPastHero(window.scrollY > 560);
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  useEffect(() => {
    onMobileMenuChange(menuOpen);
  }, [menuOpen, onMobileMenuChange]);

  useEffect(() => {
    if (!menuOpen) {
      setIsMenuEntering(false);
      return;
    }

    setIsMenuEntering(true);
    const enterTimer = window.setTimeout(() => {
      setIsMenuEntering(false);
    }, 760);

    return () => {
      window.clearTimeout(enterTimer);
    };
  }, [menuOpen]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    window.setTimeout(() => menuButtonRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      drawerRef.current?.focus({ preventScroll: true });
    }, 20);

    const desktopMediaQuery =
      typeof window.matchMedia === 'function' ? window.matchMedia('(min-width: 1024px)') : null;
    const handleDesktopViewport = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setMenuOpen(false);
      }
    };
    desktopMediaQuery?.addEventListener?.('change', handleDesktopViewport);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key === 'Tab' && drawerRef.current) {
        const drawerFocusables = Array.from(
          drawerRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        );
        const focusables = [menuButtonRef.current, ...drawerFocusables].filter(
          (el): el is HTMLElement => el !== null,
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        } else if (!focusables.includes(document.activeElement as HTMLElement)) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      desktopMediaQuery?.removeEventListener?.('change', handleDesktopViewport);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [closeMenu, menuOpen]);

  useLayoutEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;

    const updateHeaderHeight = () => {
      syncHeaderHeightCssVar(headerEl);
    };

    updateHeaderHeight();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateHeaderHeight);
      resizeObserver.observe(headerEl);
    }

    window.addEventListener('resize', updateHeaderHeight, { passive: true });
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  const handleMobileNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
    sectionId: MobileNavSectionId,
  ) => {
    event.preventDefault();
    const isKeyboardActivation = event.detail === 0;

    setActiveSection(sectionId);

    // Libera imediatamente o bloqueio de scroll e remove o overlay antes de navegar
    document.body.style.overflow = '';
    flushSync(() => {
      setMenuOpen(false);
    });

    window.requestAnimationFrame(() => {
      navigateToAnchorHref(href, { moveFocus: isKeyboardActivation });
    });
  };

  return (
    <>
      <header
        ref={headerRef}
        data-scrolled={isScrolled ? 'true' : 'false'}
        className={`fixed inset-x-0 top-0 z-[45] overflow-x-clip transition-all duration-300 ${
          isScrolled
            ? 'border-b border-[#F5F3E9]/22 bg-[#10291C]/78 backdrop-blur-xl backdrop-saturate-150 shadow-[0_14px_38px_-12px_rgba(9,24,16,0.52)]'
            : 'border-b border-white/12 bg-[#10291C]/60 backdrop-blur-md backdrop-saturate-125'
        }`}
      >
        <ReadingProgressBar />

        <div className="relative overflow-hidden">
          <div
            className={`relative z-10 mx-auto flex h-[76px] max-w-[1280px] items-center justify-between gap-4 px-4 transition-all duration-300 sm:px-6 lg:gap-8 lg:px-10 ${
              isScrolled ? 'bg-gradient-to-b from-white/[0.06] via-transparent to-transparent' : ''
            }`}
          >
          {/* Logo oficial legível em emblema claro para preservar contraste e marca */}
          <a
            href="#inicio"
            aria-label={`${COMPANY.tradeName} — ir para o início`}
            className="group inline-flex shrink-0 items-center rounded-lg bg-[#F5F3E9] px-3 py-1.5 shadow-sm transition-[transform,box-shadow] duration-200 hover:scale-[1.01] motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-[0_0_18px_2px_rgba(132,198,43,0.45)]"
          >
            <img
              src="/images/marca/logo-jl.png"
              alt={COMPANY.tradeName}
              width={1024}
              height={690}
              className="h-10 w-auto rounded-md object-contain transition-shadow duration-200 motion-reduce:transition-none group-focus-visible:ring-2 group-focus-visible:ring-[#84C62B] group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[#10291C] sm:h-11"
            />
          </a>

          {/* Navegação desktop com sticky, transição sutil de blur/fundo após a hero e scrollspy */}
          <nav
            aria-label="Navegação principal"
            data-past-hero={isPastHero ? 'true' : 'false'}
            className={`hidden items-center gap-6 rounded-xl border px-4 py-1.5 text-sm font-medium text-[#F5F3E9]/95 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 lg:sticky lg:top-0 lg:flex ${
              isPastHero
                ? 'border-[#F5F3E9]/16 bg-[#10291C]/50 backdrop-blur-md shadow-[0_8px_24px_-10px_rgba(9,24,16,0.5)]'
                : 'border-transparent bg-transparent'
            }`}
          >
            {DESKTOP_NAV_LINKS.map((item) => {
              const isActive = activeSectionId === item.sectionId;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  data-active={isActive ? 'true' : 'false'}
                  aria-current={isActive ? 'location' : undefined}
                  onClick={() => setActiveSection(item.sectionId)}
                  className={`group relative whitespace-nowrap shrink-0 py-1 transition-colors duration-200 ${
                    isActive
                      ? 'text-[#84C62B] drop-shadow-[0_1px_2px_rgba(9,24,16,0.45)]'
                      : 'text-[#F5F3E9]/92 drop-shadow-[0_1px_1px_rgba(9,24,16,0.35)] hover:text-[#84C62B]'
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 -bottom-0.5 h-[2px] origin-center rounded-full bg-[#84C62B] transition-[transform,opacity] duration-250 ease-out motion-reduce:transition-none ${
                      isActive
                        ? 'scale-x-100 opacity-100 shadow-[0_0_8px_rgba(132,198,43,0.65)]'
                        : 'scale-x-0 opacity-0 group-hover:scale-x-75 group-hover:opacity-65'
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          {/* Ação principal desktop + botão hambúrguer mobile */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#agendar-visita"
              className="hidden whitespace-nowrap shrink-0 rounded-lg bg-[#84C62B] px-4 py-2.5 text-sm font-semibold text-[#10291C] shadow-sm transition-colors hover:bg-[#95d63c] lg:inline-flex"
            >
              Agendar visita
            </a>

            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
              aria-label={menuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-drawer"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/25 bg-white/[0.06] text-[#F5F3E9] transition-colors hover:bg-white/15 lg:hidden"
            >
              <span className="relative flex h-5 w-5 items-center justify-center" aria-hidden="true">
                <span
                  className={`absolute h-[2px] w-[20px] rounded-full bg-current transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                    menuOpen ? 'translate-y-0 rotate-45' : '-translate-y-[6px] rotate-0'
                  }`}
                />
                <span
                  className={`absolute h-[2px] w-[20px] rounded-full bg-current transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none ${
                    menuOpen ? 'scale-x-0 opacity-0' : 'scale-x-100 opacity-100'
                  }`}
                />
                <span
                  className={`absolute h-[2px] w-[20px] rounded-full bg-current transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                    menuOpen ? 'translate-y-0 -rotate-45' : 'translate-y-[6px] rotate-0'
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        {/* Camada decorativa jateada no vidro: curvas de canteiros, palmeiras, folhagens, vaso ornamental e tesoura de poda */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-0 select-none overflow-hidden transition-opacity duration-300 ${
            isScrolled ? 'opacity-100' : 'opacity-75'
          }`}
        >
          {/* Brilho especular superior do vidro */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F5F3E9]/35 to-transparent" />

          {/* Linhas orgânicas jateadas de caminhos e curvas paisagísticas */}
          <svg
            viewBox="0 0 1440 76"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            fill="none"
          >
            <path
              d="M-20 58 C 220 18, 460 70, 760 40 C 1030 14, 1240 64, 1460 28"
              stroke="#F5F3E9"
              strokeOpacity="0.14"
              strokeWidth="1.2"
            />
            <path
              d="M-20 68 C 280 34, 540 78, 860 52 C 1100 32, 1290 66, 1460 44"
              stroke="#BBA98D"
              strokeOpacity="0.16"
              strokeWidth="1"
              strokeDasharray="4 7"
            />
          </svg>

          {/* Gravura jateada 1: Palmeira e ramo botânico tropical (esquerda / centro-esquerda) */}
          <svg
            viewBox="0 0 180 76"
            className="absolute top-0 left-[52%] h-full w-[152px] -translate-x-1/2 sm:left-[20%] sm:w-[140px] sm:translate-x-0 lg:left-[17.5%] lg:w-[175px]"
            fill="none"
          >
            <defs>
              <linearGradient id="sandblast-leaf-left" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F5F3E9" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#BBA98D" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            {/* Folhas de palmeira jateadas */}
            <path
              d="M44 76 C45 55, 52 38, 62 24"
              stroke="#F5F3E9"
              strokeOpacity="0.24"
              strokeWidth="1.35"
              strokeLinecap="round"
            />
            <path
              d="M62 24 C46 18, 30 22, 18 33 C33 31, 48 29, 62 24 Z"
              fill="url(#sandblast-leaf-left)"
              stroke="#F5F3E9"
              strokeOpacity="0.22"
              strokeWidth="1.05"
            />
            <path
              d="M62 24 C50 10, 34 6, 20 11 C36 14, 50 18, 62 24 Z"
              fill="url(#sandblast-leaf-left)"
              stroke="#F5F3E9"
              strokeOpacity="0.2"
              strokeWidth="1.05"
            />
            <path
              d="M62 24 C66 10, 80 5, 96 10 C82 15, 71 19, 62 24 Z"
              fill="url(#sandblast-leaf-left)"
              stroke="#F5F3E9"
              strokeOpacity="0.22"
              strokeWidth="1.05"
            />
            <path
              d="M62 24 C78 19, 94 24, 106 36 C90 32, 76 29, 62 24 Z"
              fill="url(#sandblast-leaf-left)"
              stroke="#F5F3E9"
              strokeOpacity="0.2"
              strokeWidth="1.05"
            />
            {/* Folhagem complementar e pedras de caminho */}
            <path
              d="M118 76 C122 58, 132 45, 146 37"
              stroke="#BBA98D"
              strokeOpacity="0.24"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M131 53 C124 44, 125 34, 134 30 C138 38, 137 47, 131 53 Z"
              fill="#F5F3E9"
              fillOpacity="0.09"
              stroke="#F5F3E9"
              strokeOpacity="0.22"
              strokeWidth="1"
            />
            <path
              d="M142 42 C148 33, 159 32, 166 39 C158 45, 149 46, 142 42 Z"
              fill="#F5F3E9"
              fillOpacity="0.09"
              stroke="#F5F3E9"
              strokeOpacity="0.22"
              strokeWidth="1"
            />
            <ellipse
              cx="94"
              cy="65"
              rx="10"
              ry="3.6"
              stroke="#F5F3E9"
              strokeOpacity="0.18"
              strokeWidth="1"
            />
            <ellipse
              cx="111"
              cy="69"
              rx="7"
              ry="2.6"
              stroke="#BBA98D"
              strokeOpacity="0.2"
              strokeWidth="1"
            />
          </svg>

          {/* Gravura jateada 2: Vaso decorativo com planta ornamental e pisadas de pedra (centro-direita) */}
          <svg
            viewBox="0 0 175 76"
            className="hidden md:block absolute top-0 right-[18%] h-full w-[165px] lg:right-[15.5%]"
            fill="none"
          >
            <defs>
              <linearGradient id="sandblast-leaf-right" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F5F3E9" stopOpacity="0.17" />
                <stop offset="100%" stopColor="#84C62B" stopOpacity="0.06" />
              </linearGradient>
            </defs>
            {/* Vaso ornamental estilizado */}
            <path
              d="M68 48 H94 L89 70 C89 72, 86 73, 81 73 C76 73, 73 72, 73 70 L68 48 Z"
              fill="#F5F3E9"
              fillOpacity="0.08"
              stroke="#F5F3E9"
              strokeOpacity="0.24"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <path
              d="M65 48 H97"
              stroke="#BBA98D"
              strokeOpacity="0.26"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            {/* Hastes e folhas saindo do vaso */}
            <path
              d="M81 48 C81 36, 76 26, 68 18"
              stroke="#F5F3E9"
              strokeOpacity="0.24"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
            <path
              d="M81 48 C82 33, 88 22, 97 15"
              stroke="#F5F3E9"
              strokeOpacity="0.24"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
            <path
              d="M68 18 C59 17, 54 24, 58 31 C65 31, 70 25, 68 18 Z"
              fill="url(#sandblast-leaf-right)"
              stroke="#F5F3E9"
              strokeOpacity="0.22"
              strokeWidth="1.05"
            />
            <path
              d="M97 15 C106 14, 111 21, 107 28 C100 28, 95 22, 97 15 Z"
              fill="url(#sandblast-leaf-right)"
              stroke="#F5F3E9"
              strokeOpacity="0.22"
              strokeWidth="1.05"
            />
            <path
              d="M82 32 C78 21, 82 11, 88 7 C92 15, 90 25, 82 32 Z"
              fill="#F5F3E9"
              fillOpacity="0.1"
              stroke="#F5F3E9"
              strokeOpacity="0.24"
              strokeWidth="1.05"
            />
            {/* Placas de pedra / caminho lateral */}
            <rect
              x="16"
              y="55"
              width="20"
              height="8"
              rx="2.5"
              stroke="#F5F3E9"
              strokeOpacity="0.16"
              strokeWidth="1"
            />
            <rect
              x="40"
              y="62"
              width="16"
              height="7"
              rx="2"
              stroke="#BBA98D"
              strokeOpacity="0.18"
              strokeWidth="1"
            />
            {/* Ramo fino à direita do vaso */}
            <path
              d="M122 68 C132 52, 144 42, 158 36"
              stroke="#F5F3E9"
              strokeOpacity="0.18"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
            <circle cx="143" cy="46" r="2.2" fill="#84C62B" fillOpacity="0.22" />
            <circle cx="158" cy="36" r="2.5" stroke="#F5F3E9" strokeOpacity="0.22" strokeWidth="1" />
          </svg>

          {/* Gravura jateada 3: Ramo de poda e broto (extremidade direita em telas maiores) */}
          <svg
            viewBox="0 0 110 76"
            className="hidden sm:block absolute top-0 right-20 h-full w-[96px] lg:right-2 lg:w-[110px]"
            fill="none"
          >
            <path
              d="M20 76 C32 54, 48 36, 72 20"
              stroke="#F5F3E9"
              strokeOpacity="0.2"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M44 46 C36 36, 39 24, 50 22 C54 32, 52 40, 44 46 Z"
              fill="#F5F3E9"
              fillOpacity="0.09"
              stroke="#F5F3E9"
              strokeOpacity="0.22"
              strokeWidth="1.05"
            />
            <path
              d="M59 31 C67 21, 79 21, 84 30 C76 37, 66 37, 59 31 Z"
              fill="#F5F3E9"
              fillOpacity="0.09"
              stroke="#F5F3E9"
              strokeOpacity="0.22"
              strokeWidth="1.05"
            />
            <path
              d="M72 20 C76 12, 85 9, 93 12 C88 19, 80 22, 72 20 Z"
              fill="#84C62B"
              fillOpacity="0.12"
              stroke="#F5F3E9"
              strokeOpacity="0.24"
              strokeWidth="1.05"
            />
            <circle cx="96" cy="52" r="2.2" stroke="#BBA98D" strokeOpacity="0.24" strokeWidth="1" />
            <circle cx="84" cy="61" r="1.5" fill="#F5F3E9" fillOpacity="0.18" />
          </svg>
        </div>
        </div>
      </header>

      {/* Menu hambúrguer mobile posicionado exatamente abaixo do cabeçalho uniforme */}
      {menuOpen && (
        <div
          id="mobile-nav-drawer"
          ref={drawerRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
          className="animate-mobile-drawer-in fixed inset-x-0 bottom-0 top-[var(--header-height,80px)] z-40 flex flex-col bg-gradient-to-b from-[#10291C]/97 via-[#10291C]/98 to-[#0B1D13] backdrop-blur-xl text-[#F5F3E9] outline-none lg:hidden"
        >
          <nav
            aria-label="Navegação mobile"
            className="mx-auto flex w-full max-w-[640px] flex-1 flex-col justify-between overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6"
          >
            <ul className="space-y-1.5">
              {mobileLinks.map((link, index) => {
                const isActive = activeSectionId === link.sectionId;
                return (
                  <li
                    key={link.href}
                    style={{ '--stagger-index': index } as CSSProperties}
                    className="animate-mobile-item-in"
                  >
                    <a
                      href={link.href}
                      data-active={isActive ? 'true' : 'false'}
                      data-entering={isMenuEntering ? 'true' : 'false'}
                      aria-current={isActive ? 'location' : undefined}
                      onClick={(event) => handleMobileNavClick(event, link.href, link.sectionId)}
                      className={`mobile-nav-item group relative flex min-h-[48px] items-center gap-3.5 overflow-hidden rounded-xl border px-3.5 py-2.5 text-[16px] transition-[background-color,border-color,color,box-shadow] duration-200 sm:text-[17px] ${
                        isActive
                          ? 'border-[#84C62B]/35 bg-gradient-to-r from-[#84C62B]/18 via-[#298637]/16 to-transparent font-semibold text-[#F5F3E9] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                          : 'border-transparent bg-transparent font-medium text-[#F5F3E9]/88 hover:border-white/10 hover:bg-white/[0.05] hover:text-[#F5F3E9]'
                      }`}
                    >
                      {/* Indicador lateral em verde-lima reservado para a seção ativa */}
                      <span
                        aria-hidden="true"
                        className={`absolute top-2 bottom-2 left-0 w-[3px] rounded-r-full transition-all duration-200 ${
                          isActive
                            ? 'scale-y-100 bg-[#84C62B] opacity-100 shadow-[0_0_10px_rgba(132,198,43,0.6)]'
                            : 'scale-y-50 bg-[#84C62B]/0 opacity-0'
                        }`}
                      />

                      <span
                        aria-hidden="true"
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-[background-color,color,box-shadow] duration-200 ${
                          isActive
                            ? 'bg-[#84C62B]/18 text-[#84C62B] shadow-[0_0_14px_rgba(132,198,43,0.28)]'
                            : 'bg-white/[0.05] text-[#F5F3E9]/72 group-hover:bg-white/[0.09] group-hover:text-[#84C62B]'
                        }`}
                      >
                        <MobileNavIcon sectionId={link.sectionId} className="h-[19px] w-[19px]" />
                      </span>

                      <span className="flex-1 truncate leading-snug">{link.label}</span>

                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#84C62B] shadow-[0_0_8px_rgba(132,198,43,0.85)]"
                        />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 border-t border-white/10 pt-5">
              <a
                href="#agendar-visita"
                onClick={(event) => handleMobileNavClick(event, '#agendar-visita', 'agendar-visita')}
                className="flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-xl bg-[#84C62B] px-5 py-3 text-base font-semibold text-[#10291C] shadow-[0_10px_24px_-8px_rgba(132,198,43,0.45)] transition-colors hover:bg-[#95d63c]"
              >
                <MobileNavIcon sectionId="agendar-visita" className="h-[18px] w-[18px]" />
                <span>Agendar visita presencial</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
