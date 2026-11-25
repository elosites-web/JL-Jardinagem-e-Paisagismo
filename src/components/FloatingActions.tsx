import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
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
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 560);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (hideFloatingButtons) {
    return null;
  }

  const whatsappUrl = buildGeneralWhatsAppUrl();

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-30 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {showBackToTop && (
        <button
          type="button"
          onClick={() => {
            const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
          }}
          aria-label="Voltar ao topo da página"
          className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#BBA98D]/60 bg-[#F5F3E9]/95 text-[#10291C] shadow-md backdrop-blur-sm transition-colors hover:border-[#298637] hover:bg-white"
        >
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

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
