import { useEffect, useState } from 'react';
import { AboutSection } from './components/AboutSection';
import { BeforeAfterSection } from './components/BeforeAfterSection';
import { ConsentManagerModal } from './components/ConsentManagerModal';
import { ContactAndFooter } from './components/ContactAndFooter';
import { FloatingActions } from './components/FloatingActions';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { HowItWorksAndFaqSection } from './components/HowItWorksAndFaqSection';
import { LegalModal } from './components/LegalModal';
import { PortfolioGallerySection } from './components/PortfolioGallerySection';
import { ServicesSection } from './components/ServicesSection';
import { VisitRequestSection } from './components/VisitRequestSection';
import type { LegalDocKey } from './data/legalDocs';
import { useScrollRevealDirective } from './hooks/useScrollRevealDirective';
import { extractInternalAnchorId, navigateToAnchorId } from './utils/anchorNavigation';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocKey | null>(null);
  const [consentModalOpen, setConsentModalOpen] = useState(false);

  useScrollRevealDirective();

  const isAnyOverlayOpen =
    mobileMenuOpen || galleryModalOpen || activeLegalDoc !== null || consentModalOpen;

  useEffect(() => {
    const handleDocumentClick = (event: globalThis.MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const anchorId = extractInternalAnchorId(
        anchor.getAttribute('href'),
        window.location.origin,
        window.location.pathname,
      );
      if (!anchorId || !document.getElementById(anchorId)) return;

      event.preventDefault();
      navigateToAnchorId(anchorId, {
        moveFocus: event.detail === 0 || anchorId === 'conteudo-principal',
      });
    };

    const handleHashChange = () => {
      const anchorId = extractInternalAnchorId(window.location.hash);
      if (anchorId) {
        navigateToAnchorId(anchorId, { updateHistory: false });
      }
    };

    document.addEventListener('click', handleDocumentClick);
    window.addEventListener('hashchange', handleHashChange);

    if (window.location.hash) {
      const initialId = extractInternalAnchorId(window.location.hash);
      if (initialId) {
        window.requestAnimationFrame(() => {
          navigateToAnchorId(initialId, { behavior: 'auto', updateHistory: false });
        });
      }
    }

    return () => {
      document.removeEventListener('click', handleDocumentClick);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F3E9] text-[#10291C]">
      <a
        href="#conteudo-principal"
        className="skip-link sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-[#84C62B] focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-[#10291C]"
      >
        Pular para o conteúdo principal
      </a>

      <Header onMobileMenuChange={setMobileMenuOpen} />

      <main id="conteudo-principal">
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <PortfolioGallerySection onModalStateChange={setGalleryModalOpen} />
        <BeforeAfterSection />
        <HowItWorksAndFaqSection />
        <VisitRequestSection onOpenLegalDoc={setActiveLegalDoc} />
      </main>

      <ContactAndFooter
        onOpenLegalDoc={setActiveLegalDoc}
        onOpenConsentModal={() => setConsentModalOpen(true)}
      />

      <LegalModal activeDoc={activeLegalDoc} onClose={() => setActiveLegalDoc(null)} />

      <ConsentManagerModal
        isOpen={consentModalOpen}
        onClose={() => setConsentModalOpen(false)}
        onPreferencesChange={() => {}}
      />

      <FloatingActions hideFloatingButtons={isAnyOverlayOpen} />
    </div>
  );
}
