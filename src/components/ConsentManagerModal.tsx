import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';
import {
  acceptAllConsent,
  DEFAULT_CONSENT_PREFERENCES,
  hasActiveNonEssentialTracking,
  rejectNonEssentialConsent,
  type ConsentPreferences,
} from '../utils/consent';

interface ConsentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreferencesChange: (prefs: ConsentPreferences) => void;
}

/**
 * Arquitetura reutilizável para futuro gerenciamento de consentimento (LGPD).
 * Enquanto trackingConfig.enabled for false, nenhum banner é exibido nem gravado.
 */
export function ConsentManagerModal({
  isOpen,
  onClose,
  onPreferencesChange,
}: ConsentManagerModalProps) {
  const isTrackingActive = hasActiveNonEssentialTracking(SITE_CONFIG.trackingConfig);
  const [prefs, setPrefs] = useState<ConsentPreferences>(DEFAULT_CONSENT_PREFERENCES);
  const [showCustomize, setShowCustomize] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    if (!isTrackingActive) {
      setBannerVisible(false);
      return;
    }
    if (prefs.decidedAt === null) {
      setBannerVisible(true);
    }
  }, [isTrackingActive, prefs.decidedAt]);

  if (!isTrackingActive) {
    return null;
  }

  const commitPreferences = (next: ConsentPreferences) => {
    setPrefs(next);
    setBannerVisible(false);
    setShowCustomize(false);
    onPreferencesChange(next);
    onClose();
  };

  const showModal = isOpen || showCustomize;

  return (
    <>
      {bannerVisible && !showModal && (
        <aside
          aria-label="Gerenciamento de consentimento de cookies"
          className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-3xl rounded-2xl border border-[#BBA98D]/50 bg-[#10291C] p-5 text-[#F5F3E9] shadow-2xl sm:p-6"
        >
          <p className="text-sm font-semibold">Preferências de privacidade e cookies</p>
          <p className="mt-1.5 text-xs leading-relaxed text-[#F5F3E9]/80">
            Este site pode utilizar tecnologias de medição mediante sua autorização expressa.
            Nenhuma ferramenta não essencial é executada antes da sua escolha.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => commitPreferences(acceptAllConsent(new Date().toISOString()))}
              className="min-h-[42px] rounded-lg bg-[#84C62B] px-4 py-2 text-xs font-semibold text-[#10291C] hover:bg-[#95d63c]"
            >
              Aceitar todos
            </button>
            <button
              type="button"
              onClick={() => commitPreferences(rejectNonEssentialConsent(new Date().toISOString()))}
              className="min-h-[42px] rounded-lg border border-[#F5F3E9]/45 bg-[#10291C] px-4 py-2 text-xs font-semibold text-[#F5F3E9] hover:border-[#84C62B]"
            >
              Rejeitar não essenciais
            </button>
            <button
              type="button"
              onClick={() => setShowCustomize(true)}
              className="min-h-[42px] px-3 py-2 text-xs font-semibold text-[#F5F3E9] underline underline-offset-4 hover:text-[#84C62B]"
            >
              Personalizar preferências
            </button>
          </div>
        </aside>
      )}

      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="consent-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#091810]/85 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg rounded-2xl border border-[#BBA98D]/45 bg-[#F5F3E9] p-6 text-[#10291C] shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <h2 id="consent-modal-title" className="font-editorial text-2xl font-semibold">
                Preferências de Cookies
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowCustomize(false);
                  onClose();
                }}
                aria-label="Fechar preferências de cookies"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#BBA98D]/45"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div className="rounded-xl border border-[#BBA98D]/45 bg-white p-4">
                <p className="font-semibold">Essenciais (sempre ativos)</p>
                <p className="mt-1 text-xs text-[#10291C]/75">
                  Necessários para o funcionamento básico e seguro da navegação.
                </p>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#BBA98D]/45 bg-white p-4">
                <input
                  type="checkbox"
                  checked={prefs.analytics}
                  onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))}
                  className="mt-1 h-4 w-4 accent-[#298637]"
                />
                <span>
                  <strong className="block">Análise e desempenho</strong>
                  <span className="text-xs text-[#10291C]/75">
                    Medição agregada de acessos (Google Analytics / Tag Manager, quando ativados).
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#BBA98D]/45 bg-white p-4">
                <input
                  type="checkbox"
                  checked={prefs.marketing}
                  onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))}
                  className="mt-1 h-4 w-4 accent-[#298637]"
                />
                <span>
                  <strong className="block">Marketing</strong>
                  <span className="text-xs text-[#10291C]/75">
                    Mensuração de campanhas (Meta Pixel, quando ativado).
                  </span>
                </span>
              </label>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  commitPreferences(rejectNonEssentialConsent(new Date().toISOString()))
                }
                className="min-h-[42px] rounded-lg border border-[#10291C]/30 px-4 py-2 text-xs font-semibold"
              >
                Rejeitar não essenciais
              </button>
              <button
                type="button"
                onClick={() =>
                  commitPreferences({ ...prefs, decidedAt: new Date().toISOString() })
                }
                className="min-h-[42px] rounded-lg bg-[#10291C] px-4 py-2 text-xs font-semibold text-[#F5F3E9]"
              >
                Salvar preferências
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
