import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { LEGAL_DOCUMENTS, type LegalDocKey } from '../data/legalDocs';

interface LegalModalProps {
  activeDoc: LegalDocKey | null;
  onClose: () => void;
}

export function LegalModal({ activeDoc, onClose }: LegalModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!activeDoc) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = window.setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 10);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
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
      if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
        previousFocusRef.current.focus();
      }
    };
  }, [activeDoc, onClose]);

  if (!activeDoc) {
    return null;
  }

  const doc = LEGAL_DOCUMENTS[activeDoc];

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#091810]/85 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#BBA98D]/45 bg-[#F5F3E9] text-[#10291C] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#BBA98D]/40 bg-[#10291C] px-6 py-5 text-[#F5F3E9]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#84C62B]">
              Documento informativo · Atualizado em {doc.lastUpdated}
            </p>
            <h2 id="legal-modal-title" className="mt-1 font-editorial text-2xl font-semibold sm:text-3xl">
              {doc.title}
            </h2>
            <p className="mt-1 text-xs text-[#F5F3E9]/75">{doc.subtitle}</p>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label={`Fechar ${doc.title}`}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/20 text-[#F5F3E9] transition-colors hover:bg-white/10"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6 text-sm leading-relaxed text-[#10291C]/85">
          {doc.sections.map((section) => (
            <section key={section.heading}>
              <h3 className="font-editorial text-xl font-semibold text-[#10291C]">
                {section.heading}
              </h3>
              <div className="mt-2 space-y-2.5">
                {section.paragraphs.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="flex justify-end border-t border-[#BBA98D]/40 bg-[#FAF8F2] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[42px] rounded-lg bg-[#10291C] px-5 py-2 text-sm font-semibold text-[#F5F3E9] transition-colors hover:bg-[#1a3f2c]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
