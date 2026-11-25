import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { GALLERY_CATEGORY_LABELS, type GalleryPhoto } from '../data/gallery';

interface LightboxModalProps {
  photos: readonly GalleryPhoto[];
  activeIndex: number | null;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
  returnFocusTo?: HTMLElement | null;
}

export function LightboxModal({
  photos,
  activeIndex,
  onClose,
  onNavigate,
  returnFocusTo,
}: LightboxModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const isOpen = activeIndex !== null && activeIndex >= 0 && activeIndex < photos.length;
  const currentPhoto = isOpen ? photos[activeIndex] : null;

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 10);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'ArrowLeft' && activeIndex !== null) {
        event.preventDefault();
        onNavigate((activeIndex - 1 + photos.length) % photos.length);
        return;
      }
      if (event.key === 'ArrowRight' && activeIndex !== null) {
        event.preventDefault();
        onNavigate((activeIndex + 1) % photos.length);
        return;
      }
      if (event.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
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
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (returnFocusTo && document.contains(returnFocusTo)) {
        returnFocusTo.focus();
      }
    };
  }, [isOpen, activeIndex, photos.length, onClose, onNavigate, returnFocusTo]);

  if (!isOpen || !currentPhoto || activeIndex === null) {
    return null;
  }

  const prevIndex = (activeIndex - 1 + photos.length) % photos.length;
  const nextIndex = (activeIndex + 1) % photos.length;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Visualização ampliada: ${currentPhoto.alt}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#091810]/94 p-3 sm:p-6 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative flex max-h-[94dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#10291C] text-[#F5F3E9] shadow-2xl">
        {/* Topo do lightbox */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
          <p className="min-w-0 text-xs font-medium tracking-wider uppercase text-[#BBA98D]">
            {GALLERY_CATEGORY_LABELS[currentPhoto.category]} ·{' '}
            {currentPhoto.aiEnhanced ? 'Portfólio JL' : 'Trabalho real JL'}
          </p>

          <div className="flex items-center gap-3 shrink-0">
            <span className="font-mono text-xs tabular-nums text-[#F5F3E9]/70">
              {activeIndex + 1} / {photos.length}
            </span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Fechar visualização ampliada"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-[#F5F3E9] transition-colors hover:bg-white/10"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Imagem principal ajustada com espaço para descrição completa */}
        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-[#0b1d13] p-3 sm:p-5">
          <button
            type="button"
            onClick={() => onNavigate(prevIndex)}
            aria-label="Foto anterior"
            className="absolute left-2 sm:left-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#10291C]/85 text-[#F5F3E9] backdrop-blur-sm transition-colors hover:border-[#84C62B] hover:text-[#84C62B]"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>

          <img
            src={currentPhoto.src}
            alt={currentPhoto.alt}
            width={currentPhoto.width}
            height={currentPhoto.height}
            decoding="async"
            className="max-h-[58dvh] sm:max-h-[66dvh] w-auto max-w-full rounded-lg object-contain"
          />

          <button
            type="button"
            onClick={() => onNavigate(nextIndex)}
            aria-label="Próxima foto"
            className="absolute right-2 sm:right-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#10291C]/85 text-[#F5F3E9] backdrop-blur-sm transition-colors hover:border-[#84C62B] hover:text-[#84C62B]"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Legenda completa sem cortes */}
        <div className="shrink-0 border-t border-white/10 bg-[#10291C] px-4 py-3.5 sm:px-6">
          <p className="text-sm font-medium leading-relaxed text-[#F5F3E9] break-words sm:text-[15px]">
            {currentPhoto.alt}
          </p>
        </div>
      </div>
    </div>
  );
}
