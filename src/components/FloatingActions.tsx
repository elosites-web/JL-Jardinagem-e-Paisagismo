import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { shouldShowBackToTop } from '../utils/backToTop';
import { buildGeneralWhatsAppUrl } from '../utils/whatsapp';
import { WhatsAppIcon } from './Icons';

interface FloatingActionsProps {
  hideFloatingButtons: boolean;
}

export function FloatingActions({ hideFloatingButtons }: FloatingActionsProps) {
  const [showWhatsAppAfterDelay, setShowWhatsAppAfterDelay] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowWhatsAppAfterDelay(true);
    }, 30000);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let rafId = 0;

    const syncBackToTop = () => {
      rafId = 0;
      const nextVisible = shouldShowBackToTop({
        scrollY: window.scrollY,
        viewportWidth: window.innerWidth,
      });
      setShowBackToTop((prev) => (prev === nextVisible ? prev : nextVisible));
    };

    const scheduleSync = () => {
      if (rafId !== 0) return;
      rafId = window.requestAnimationFrame(syncBackToTop);
    };

    syncBackToTop();
    window.addEventListener('scroll', scheduleSync, { passive: true });
    window.addEventListener('resize', scheduleSync, { passive: true });
    return () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', scheduleSync);
      window.removeEventListener('resize', scheduleSync);
    };
  }, []);

  if (hideFloatingButtons) {
    return null;
  }

  const whatsappUrl = buildGeneralWhatsAppUrl();

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-30 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      <button
        type="button"
        data-visible={showBackToTop ? 'true' : 'false'}
        aria-hidden={!showBackToTop}
        tabIndex={showBackToTop ? 0 : -1}
        onClick={() => {
          const reduced =
            typeof window.matchMedia === 'function' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
        }}
        title="Voltar ao topo"
        aria-label="Voltar ao topo da página"
        className="back-to-top-button inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#BBA98D]/65 bg-[#F5F3E9]/95 text-[#10291C] shadow-lg backdrop-blur-sm hover:border-[#298637] hover:bg-white hover:text-[#298637] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#84C62B] focus-visible:ring-offset-2 sm:h-11 sm:w-11"
      >
        <ArrowUp className="h-4.5 w-4.5 sm:h-4 sm:w-4" aria-hidden="true" />
      </button>

      {showWhatsAppAfterDelay && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Solicitar orçamento pelo WhatsApp"
          className="whatsapp-pulse whatsapp-floating-cta pointer-events-auto inline-flex h-12 items-center gap-2.5 rounded-full bg-[#84C62B] px-4 text-sm font-semibold text-[#10291C] ring-1 ring-[#10291C]/25 hover:bg-[#95d63c] hover:scale-[1.03]"
        >
          <WhatsAppIcon className="h-5 w-5 text-[#10291C]" />
          <span className="hidden sm:inline">Orçamento</span>
        </a>
      )}
    </div>
  );
}
