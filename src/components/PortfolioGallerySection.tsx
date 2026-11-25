import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Grid2x2, Pause, Play, Maximize2 } from 'lucide-react';
import {
  FEATURED_GALLERY_PHOTOS,
  GALLERY_CATEGORY_LABELS,
  GALLERY_PHOTOS,
  type GalleryCategory,
  type GalleryPhoto,
} from '../data/gallery';
import {
  getCoverflowRevealDelay,
  getGalleryGridRevealDelay,
  scrollRevealDirectiveProps,
} from '../utils/scrollReveal';
import { LightboxModal } from './LightboxModal';

interface PortfolioGallerySectionProps {
  onModalStateChange: (open: boolean) => void;
}

const CAROUSEL_WINDOW_RADIUS = 3; // 7 itens simultâneos (-3..+3)

function circularDelta(index: number, activeIndex: number, length: number): number {
  let diff = index - activeIndex;
  const half = length / 2;
  if (diff > half) diff -= length;
  if (diff < -half) diff += length;
  return diff;
}

export function PortfolioGallerySection({ onModalStateChange }: PortfolioGallerySectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoplayPausedByUser, setIsAutoplayPausedByUser] = useState(false);
  const [isInteractionSuspended, setIsInteractionSuspended] = useState(false);
  const [isHoveredOrFocused, setIsHoveredOrFocused] = useState(false);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'todas' | GalleryCategory>('todas');
  const [lightboxState, setLightboxState] = useState<{
    photos: readonly GalleryPhoto[];
    index: number | null;
    triggerEl: HTMLElement | null;
  }>({
    photos: GALLERY_PHOTOS,
    index: null,
    triggerEl: null,
  });

  const sectionRef = useRef<HTMLElement>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const scrollStepRef = useRef<number>(-1);
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [hasCarouselAdvanced, setHasCarouselAdvanced] = useState(false);

  const featuredPhotos = FEATURED_GALLERY_PHOTOS;
  const totalFeatured = featuredPhotos.length;

  useEffect(() => {
    onModalStateChange(lightboxState.index !== null);
  }, [lightboxState.index, onModalStateChange]);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const viewportQuery = window.matchMedia('(max-width: 767px)');

    const syncQueries = () => {
      setPrefersReducedMotion(motionQuery.matches);
      setIsCompactViewport(viewportQuery.matches);
    };
    syncQueries();

    motionQuery.addEventListener('change', syncQueries);
    viewportQuery.addEventListener('change', syncQueries);
    return () => {
      motionQuery.removeEventListener('change', syncQueries);
      viewportQuery.removeEventListener('change', syncQueries);
    };
  }, []);

  // Observa visibilidade da seção para autoplay e scroll
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsSectionVisible(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.25 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const suspendAutoplayTemporarily = useCallback(() => {
    setIsInteractionSuspended(true);
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = window.setTimeout(() => {
      setIsInteractionSuspended(false);
    }, 8000);
  }, []);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current !== null) {
        window.clearTimeout(resumeTimerRef.current);
      }
    };
  }, []);

  // Progressão suave ligada ao scroll vertical dentro da seção (sem prender o scroll)
  useEffect(() => {
    if (prefersReducedMotion || !isSectionVisible) return;

    let rafId = 0;
    const handleScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        const el = sectionRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const viewportH = window.innerHeight;
        const travel = rect.height + viewportH * 0.5;
        const progress = Math.min(1, Math.max(0, (viewportH * 0.85 - rect.top) / travel));
        const mappedStep = Math.floor(progress * 4);
        if (scrollStepRef.current === -1) {
          scrollStepRef.current = mappedStep;
          return;
        }
        if (mappedStep !== scrollStepRef.current) {
          const delta = mappedStep > scrollStepRef.current ? 1 : -1;
          scrollStepRef.current = mappedStep;
          suspendAutoplayTemporarily();
          setHasCarouselAdvanced(true);
          setActiveIndex((prev) => (prev + delta + totalFeatured) % totalFeatured);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [isSectionVisible, prefersReducedMotion, suspendAutoplayTemporarily, totalFeatured]);

  // Autoplay apenas em repouso, visível, sem hover/foco/interação recente e sem reduced-motion
  useEffect(() => {
    if (
      prefersReducedMotion ||
      !isSectionVisible ||
      isAutoplayPausedByUser ||
      isInteractionSuspended ||
      isHoveredOrFocused ||
      lightboxState.index !== null
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      setHasCarouselAdvanced(true);
      setActiveIndex((prev) => (prev + 1) % totalFeatured);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [
    prefersReducedMotion,
    isSectionVisible,
    isAutoplayPausedByUser,
    isInteractionSuspended,
    isHoveredOrFocused,
    lightboxState.index,
    totalFeatured,
  ]);

  const goToIndex = useCallback(
    (nextIndex: number) => {
      suspendAutoplayTemporarily();
      setHasCarouselAdvanced(true);
      setActiveIndex(((nextIndex % totalFeatured) + totalFeatured) % totalFeatured);
    },
    [suspendAutoplayTemporarily, totalFeatured],
  );

  const openLightbox = (
    photos: readonly GalleryPhoto[],
    index: number,
    triggerEl: HTMLElement | null,
  ) => {
    setLightboxState({ photos, index, triggerEl });
  };

  // Janela limitada de no máximo 7 cards renderizados simultaneamente
  const visibleCards = useMemo(() => {
    return featuredPhotos
      .map((photo, index) => ({
        photo,
        index,
        delta: circularDelta(index, activeIndex, totalFeatured),
      }))
      .filter(({ delta }) => Math.abs(delta) <= CAROUSEL_WINDOW_RADIUS);
  }, [featuredPhotos, activeIndex, totalFeatured]);

  const filteredGridPhotos = useMemo(() => {
    if (activeCategory === 'todas') return GALLERY_PHOTOS;
    return GALLERY_PHOTOS.filter((photo) => photo.category === activeCategory);
  }, [activeCategory]);

  const activePhoto = featuredPhotos[activeIndex];
  const revealHeader = scrollRevealDirectiveProps();
  const revealControls = scrollRevealDirectiveProps(160);

  return (
    <section
      id="trabalhos"
      ref={sectionRef}
      aria-labelledby="trabalhos-heading"
      className="border-b border-[#BBA98D]/35 bg-[#10291C] py-20 text-[#F5F3E9] sm:py-24 lg:py-28 overflow-x-clip"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div
          data-scroll-reveal={revealHeader['data-scroll-reveal']}
          className={`${revealHeader.className} flex flex-col gap-6 md:flex-row md:items-end md:justify-between`}
        >
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#84C62B]">
              Trabalhos realizados
            </p>
            <h2
              id="trabalhos-heading"
              className="mt-3 font-editorial text-3xl font-semibold leading-[1.12] text-[#F5F3E9] sm:text-4xl lg:text-[2.85rem] text-balance"
            >
              A natureza em cada detalhe
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#F5F3E9]/80 sm:text-lg">
              Conheça alguns dos trabalhos compartilhados pela JL.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!prefersReducedMotion && (
              <button
                type="button"
                onClick={() => setIsAutoplayPausedByUser((prev) => !prev)}
                aria-pressed={isAutoplayPausedByUser}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3.5 py-2 text-xs font-semibold text-[#F5F3E9] transition-colors hover:border-[#84C62B] hover:text-[#84C62B]"
              >
                {isAutoplayPausedByUser ? (
                  <>
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Retomar</span>
                  </>
                ) : (
                  <>
                    <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Pausar</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowAllPhotos((prev) => !prev)}
              aria-expanded={showAllPhotos}
              aria-controls="todas-fotos-grid"
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-[#84C62B] px-4 py-2 text-sm font-semibold text-[#10291C] transition-colors hover:bg-[#95d63c]"
            >
              <Grid2x2 className="h-4 w-4" aria-hidden="true" />
              <span>
                {showAllPhotos
                  ? 'Ocultar grade completa'
                  : `Ver todas as fotos (${GALLERY_PHOTOS.length})`}
              </span>
            </button>
          </div>
        </div>

        {/* Carrossel 3D Coverflow / Cilindro com janela de até 7 itens */}
        <div
          className="mt-12 select-none overflow-hidden"
          onMouseEnter={() => setIsHoveredOrFocused(true)}
          onMouseLeave={() => setIsHoveredOrFocused(false)}
          onFocusCapture={() => setIsHoveredOrFocused(true)}
          onBlurCapture={() => setIsHoveredOrFocused(false)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              goToIndex(activeIndex - 1);
            } else if (event.key === 'ArrowRight') {
              event.preventDefault();
              goToIndex(activeIndex + 1);
            }
          }}
        >
          <div
            role="region"
            aria-roledescription="carrossel"
            aria-label="Destaques dos trabalhos realizados pela JL"
            style={{ touchAction: 'pan-y' }}
            onTouchStart={(event) => {
              const touch = event.touches[0];
              touchStartRef.current = { x: touch.clientX, y: touch.clientY };
            }}
            onTouchEnd={(event) => {
              if (!touchStartRef.current) return;
              const touch = event.changedTouches[0];
              const dx = touch.clientX - touchStartRef.current.x;
              const dy = touch.clientY - touchStartRef.current.y;
              touchStartRef.current = null;
              if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.3) {
                goToIndex(dx < 0 ? activeIndex + 1 : activeIndex - 1);
              }
            }}
            className="coverflow-stage relative mx-auto flex h-[370px] w-full items-center justify-center overflow-hidden sm:h-[430px] lg:h-[470px]"
          >
            {visibleCards.map(({ photo, index, delta }) => {
              const absDelta = Math.abs(delta);
              const isCenter = delta === 0;

              let transformValue = 'translate3d(0, 0, 0) scale(1)';
              let opacityValue = 1;

              if (prefersReducedMotion) {
                const spacing = isCompactViewport ? 240 : 340;
                transformValue = `translate3d(${delta * spacing}px, 0, 0) scale(${isCenter ? 1 : 0.88})`;
                opacityValue = isCenter ? 1 : absDelta === 1 ? 0.5 : 0;
              } else {
                const xStep = isCompactViewport ? 115 : 195;
                const translateX = delta * xStep;
                const translateZ = -absDelta * (isCompactViewport ? 85 : 115);
                const rotateY = delta * (isCompactViewport ? -14 : -18);
                const scale = Math.max(0.64, 1 - absDelta * 0.14);
                transformValue = `translate3d(${translateX}px, 0, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
                opacityValue = Math.max(0.24, 1 - absDelta * 0.25);
              }

              const revealCard = hasCarouselAdvanced
                ? { 'data-scroll-reveal': 'settled' as const, className: 'scroll-reveal' }
                : scrollRevealDirectiveProps(getCoverflowRevealDelay(absDelta));

              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={(event) => {
                    if (isCenter) {
                      openLightbox(featuredPhotos, index, event.currentTarget);
                    } else {
                      goToIndex(index);
                    }
                  }}
                  aria-label={
                    isCenter
                      ? `Ampliar foto: ${photo.alt}`
                      : `Selecionar trabalho: ${photo.alt}`
                  }
                  style={{
                    transform: transformValue,
                    opacity: opacityValue,
                    zIndex: 20 - absDelta,
                    transition: prefersReducedMotion
                      ? 'opacity 180ms ease'
                      : 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1), scale 300ms cubic-bezier(0.22, 1, 0.36, 1), opacity 420ms ease',
                  }}
                  className={`group absolute w-[260px] overflow-hidden rounded-2xl border bg-[#0b1d13] text-left shadow-2xl sm:w-[320px] lg:w-[360px] ${
                    isCenter
                      ? 'border-[#84C62B]/80 ring-1 ring-[#84C62B]/40 hover:scale-[1.03] motion-reduce:hover:scale-100'
                      : 'border-white/15 hover:border-white/35'
                  }`}
                >
                  <div
                    data-scroll-reveal={revealCard['data-scroll-reveal']}
                    data-scroll-parallax="10"
                    data-parallax-scale="1.08"
                    className={`${revealCard.className} relative aspect-square w-full overflow-hidden`}
                  >
                    <img
                      src={isCenter ? photo.src : photo.thumb}
                      srcSet={`${photo.thumb} 480w, ${photo.src} ${photo.width}w`}
                      sizes="(max-width: 640px) 260px, 360px"
                      alt={photo.alt}
                      width={photo.width}
                      height={photo.height}
                      loading="lazy"
                      decoding="async"
                      className="scroll-parallax-media h-full w-full object-cover shadow-lg shadow-forest/20 transition-[scale] duration-500 group-hover:scale-[1.03]"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#10291C]/90 via-transparent to-transparent"
                    />
                    {isCenter && (
                      <span className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#10291C]/80 text-[#F5F3E9] backdrop-blur-sm transition-colors group-hover:bg-[#84C62B] group-hover:text-[#10291C]">
                        <Maximize2 className="h-4 w-4" aria-hidden="true" />
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="text-[11px] font-medium tracking-wider uppercase text-[#BBA98D]">
                        {GALLERY_CATEGORY_LABELS[photo.category]}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm font-medium text-[#F5F3E9]">
                        {photo.alt}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Controles do carrossel */}
          <div
            data-scroll-reveal={revealControls['data-scroll-reveal']}
            className={`${revealControls.className} mt-6 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row`}
          >
            <div className="text-center sm:text-left">
              <p className="text-xs font-medium uppercase tracking-wider text-[#BBA98D]">
                Destaque {activeIndex + 1} de {totalFeatured} ·{' '}
                {activePhoto.aiEnhanced ? 'Portfólio JL' : 'Portfólio real'}
              </p>
              <p className="mt-0.5 min-h-[2.5rem] line-clamp-2 text-sm text-[#F5F3E9]/85 lg:min-h-[1.25rem]">
                {activePhoto.alt}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => goToIndex(activeIndex - 1)}
                aria-label="Trabalho anterior"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-[#F5F3E9] transition-colors hover:border-[#84C62B] hover:text-[#84C62B]"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>

              <div
                className="flex max-w-[230px] flex-wrap items-center justify-center gap-1.5 sm:max-w-none"
                role="tablist"
                aria-label="Selecionar destaque"
              >
                {featuredPhotos.map((photo, index) => (
                  <button
                    key={photo.id}
                    type="button"
                    role="tab"
                    aria-selected={index === activeIndex}
                    aria-label={`Ir para destaque ${index + 1}: ${photo.alt}`}
                    onClick={() => goToIndex(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      index === activeIndex
                        ? 'w-7 bg-[#84C62B]'
                        : 'w-2.5 bg-white/30 hover:bg-white/55'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => goToIndex(activeIndex + 1)}
                aria-label="Próximo trabalho"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-[#F5F3E9] transition-colors hover:border-[#84C62B] hover:text-[#84C62B]"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Grade completa sob demanda com todas as fotografias do acervo */}
        {showAllPhotos && (
          <div
            id="todas-fotos-grid"
            className="mt-14 border-t border-white/15 pt-12"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-editorial text-2xl font-semibold text-[#F5F3E9] sm:text-3xl">
                  Acervo completo de trabalhos ({filteredGridPhotos.length})
                </h3>
                <p className="mt-1 text-sm text-[#F5F3E9]/75">
                  Clique em qualquer fotografia para abrir em tela ampliada.
                </p>
              </div>

              <div
                role="group"
                aria-label="Filtrar fotos por categoria"
                className="flex flex-wrap gap-1.5 rounded-xl bg-white/5 p-1.5"
              >
                {(Object.keys(GALLERY_CATEGORY_LABELS) as Array<'todas' | GalleryCategory>).map(
                  (categoryKey) => {
                    const isActive = activeCategory === categoryKey;
                    return (
                      <button
                        key={categoryKey}
                        type="button"
                        onClick={() => setActiveCategory(categoryKey)}
                        className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                          isActive
                            ? 'bg-[#84C62B] text-[#10291C]'
                            : 'text-[#F5F3E9]/80 hover:bg-white/10 hover:text-[#F5F3E9]'
                        }`}
                      >
                        {GALLERY_CATEGORY_LABELS[categoryKey]}
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
              {filteredGridPhotos.map((photo, index) => {
                const revealGridPhoto = scrollRevealDirectiveProps(
                  getGalleryGridRevealDelay(index),
                );
                return (
                  <button
                    key={`${activeCategory}-${photo.id}`}
                    type="button"
                    data-scroll-reveal={revealGridPhoto['data-scroll-reveal']}
                    data-scroll-parallax="6"
                    data-parallax-scale="1.08"
                    onClick={(event) => openLightbox(filteredGridPhotos, index, event.currentTarget)}
                    aria-label={`Ampliar trabalho ${photo.id}: ${photo.alt}`}
                    className={`${revealGridPhoto.className} group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-[#0b1d13] text-left transition-colors hover:border-[#84C62B]`}
                  >
                  <img
                    src={photo.thumb}
                    alt={photo.alt}
                    width={photo.thumbWidth}
                    height={photo.thumbHeight}
                    loading="lazy"
                    decoding="async"
                    className="scroll-parallax-media h-full w-full object-cover transition-[scale] duration-300 group-hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#10291C]/85 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                  />
                    <span className="absolute inset-x-0 bottom-0 p-2.5 text-xs font-medium text-[#F5F3E9] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 line-clamp-2">
                      {photo.alt}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <LightboxModal
        photos={lightboxState.photos}
        activeIndex={lightboxState.index}
        returnFocusTo={lightboxState.triggerEl}
        onClose={() => setLightboxState((prev) => ({ ...prev, index: null }))}
        onNavigate={(nextIndex) => setLightboxState((prev) => ({ ...prev, index: nextIndex }))}
      />
    </section>
  );
}
