import { Building2, Mail, MapPin, ArrowUpRight } from 'lucide-react';
import { COMPANY } from '../config/company';
import { SITE_CONFIG } from '../config/siteConfig';
import type { LegalDocKey } from '../data/legalDocs';
import { buildGeneralWhatsAppUrl } from '../utils/whatsapp';
import { hasActiveNonEssentialTracking } from '../utils/consent';
import { scrollRevealDirectiveProps } from '../utils/scrollReveal';
import { InstagramIcon, WhatsAppIcon } from './Icons';

interface ContactAndFooterProps {
  onOpenLegalDoc: (doc: LegalDocKey) => void;
  onOpenConsentModal: () => void;
}

export function ContactAndFooter({
  onOpenLegalDoc,
  onOpenConsentModal,
}: ContactAndFooterProps) {
  const whatsappUrl = buildGeneralWhatsAppUrl();
  const showCookiePrefs = hasActiveNonEssentialTracking(SITE_CONFIG.trackingConfig);
  const revealLeft = scrollRevealDirectiveProps();
  const revealRight = scrollRevealDirectiveProps(80);
  const revealFooter = scrollRevealDirectiveProps(80);

  return (
    <>
      {/* Contato */}
      <section
        id="contato"
        aria-labelledby="contato-heading"
        className="bg-[#FAF8F2] py-20 sm:py-24 lg:py-28"
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
          <div className="grid items-start gap-12 lg:grid-cols-12">
            <div data-scroll-reveal={revealLeft['data-scroll-reveal']} className={`${revealLeft.className} lg:col-span-6`}>
              <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#298637]">
                Contato
              </p>
              <h2
                id="contato-heading"
                className="mt-3 font-editorial text-3xl font-semibold leading-[1.1] text-[#10291C] sm:text-4xl lg:text-[3rem] text-balance"
              >
                Vamos transformar seu espaço verde?
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-[#10291C]/80">
                Converse diretamente com {COMPANY.responsibleName} pelo WhatsApp, envie fotos do
                local ou acompanhe publicações recentes no Instagram.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-lg bg-[#84C62B] px-6 py-3 text-sm font-semibold text-[#10291C] transition-colors hover:bg-[#95d63c]"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  <span>Conversar no WhatsApp</span>
                </a>

                <a
                  href={COMPANY.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-[#10291C]/25 bg-white px-5 py-3 text-sm font-semibold text-[#10291C] transition-colors hover:border-[#298637]"
                >
                  <InstagramIcon className="h-4 w-4 text-[#298637]" />
                  <span>Ver Instagram</span>
                  <ArrowUpRight className="h-4 w-4 opacity-70" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div
              data-scroll-reveal={revealRight['data-scroll-reveal']}
              className={`${revealRight.className} grid gap-4 sm:grid-cols-2 lg:col-span-6 lg:grid-cols-1`}
            >
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="social-card-underline relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-[#BBA98D]/45 bg-[#F5F3E9] p-5 transition-colors hover:border-[#298637]"
              >
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#10291C] text-[#84C62B]">
                    <WhatsAppIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#298637]">
                      WhatsApp oficial
                    </p>
                    <p className="mt-0.5 text-base font-semibold tabular-nums text-[#10291C]">
                      {COMPANY.whatsapp.display}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-[#10291C]/60" aria-hidden="true" />
              </a>

              <a
                href={COMPANY.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-card-underline relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-[#BBA98D]/45 bg-[#F5F3E9] p-5 transition-colors hover:border-[#298637]"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#10291C] text-[#84C62B]">
                    <InstagramIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#298637]">
                      Instagram
                    </p>
                    <p className="mt-0.5 truncate text-base font-semibold text-[#10291C]">
                      {COMPANY.instagram.handle}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-[#10291C]/60" aria-hidden="true" />
              </a>

              <div className="flex items-center gap-4 rounded-2xl border border-[#BBA98D]/45 bg-[#F5F3E9] p-5">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#10291C] text-[#84C62B]">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#298637]">
                    Região de atendimento
                  </p>
                  <p className="mt-0.5 text-base font-semibold text-[#10291C]">
                    {COMPANY.serviceArea}
                  </p>
                </div>
              </div>

              {/* E-mail e identificação PJ provisórios — texto informativo sem link mailto ativo */}
              <div className="rounded-2xl border border-dashed border-[#BBA98D]/70 bg-[#F5F3E9]/85 p-5">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#10291C]/10 text-[#10291C]">
                    <Mail className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#298637]">
                        E-mail de contato
                      </p>
                      <span className="rounded border border-[#BBA98D]/70 bg-white px-2 py-0.5 text-[11px] font-semibold text-[#10291C]">
                        Dado provisório
                      </span>
                    </div>
                    <p className="break-all font-mono text-sm font-semibold text-[#10291C]">
                      {COMPANY.email.value}
                    </p>
                    <p className="text-xs leading-relaxed text-[#10291C]/75">
                      {COMPANY.email.disabledLinkNotice}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-3 border-t border-[#BBA98D]/40 pt-3.5 text-xs leading-relaxed text-[#10291C]/80">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#298637]" aria-hidden="true" />
                  <p>
                    <strong className="text-[#10291C]">{COMPANY.tradeName}</strong> ({COMPANY.entityType}) ·{' '}
                    {COMPANY.legalName.provisionalLabel} · {COMPANY.cnpj.provisionalLabel}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rodapé escuro com identidade preservada, dados empresariais provisórios identificados e documentos jurídicos */}
      <footer className="bg-[#10291C] py-14 text-[#F5F3E9] pb-[calc(6rem+var(--anchor-bottom-compensation,0px))] sm:pb-[calc(4rem+var(--anchor-bottom-compensation,0px))]">
        <div
          data-scroll-reveal={revealFooter['data-scroll-reveal']}
          className={`${revealFooter.className} mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10`}
        >
          <div className="grid gap-10 border-b border-white/15 pb-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <a
                href="#inicio"
                aria-label="Voltar ao início da página"
                className="inline-flex items-center rounded-lg bg-[#F5F3E9] px-3 py-1.5"
              >
                <img
                  src="/images/marca/logo-jl.png"
                  alt={COMPANY.tradeName}
                  width={1024}
                  height={690}
                  loading="lazy"
                  className="h-12 w-auto object-contain"
                />
              </a>

              <div className="mt-4 max-w-md space-y-1.5 text-sm leading-relaxed text-[#F5F3E9]/85">
                <p className="font-semibold text-[#F5F3E9]">
                  {COMPANY.tradeName} ({COMPANY.entityType})
                </p>
                <p className="text-xs text-[#F5F3E9]/80">
                  Atendimento em {COMPANY.serviceArea} · Responsável: {COMPANY.responsibleName}
                </p>
                <dl className="mt-3 space-y-1 border-t border-white/10 pt-3 text-xs text-[#F5F3E9]/80">
                  <div className="flex flex-wrap gap-x-1.5">
                    <dt className="text-[#BBA98D]">Razão social (provisório):</dt>
                    <dd>{COMPANY.legalName.value}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-1.5">
                    <dt className="text-[#BBA98D]">CNPJ (provisório):</dt>
                    <dd className="tabular-nums">{COMPANY.cnpj.value}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-1.5">
                    <dt className="text-[#BBA98D]">WhatsApp oficial:</dt>
                    <dd className="tabular-nums">{COMPANY.whatsapp.display}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-1.5">
                    <dt className="text-[#BBA98D]">E-mail (provisório, sem link ativo):</dt>
                    <dd className="font-mono">{COMPANY.email.value}</dd>
                  </div>
                </dl>
                <p className="pt-2 text-[11px] leading-relaxed text-[#F5F3E9]/65">
                  {COMPANY.provisionalReplacementNotice}
                </p>
              </div>
            </div>

            <div className="md:col-span-3">
              <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#BBA98D]">
                Navegação
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-[#F5F3E9]/80">
                <li>
                  <a href="#sobre" className="hover:text-[#84C62B]">
                    Sobre a JL
                  </a>
                </li>
                <li>
                  <a href="#servicos" className="hover:text-[#84C62B]">
                    Serviços
                  </a>
                </li>
                <li>
                  <a href="#trabalhos" className="hover:text-[#84C62B]">
                    Trabalhos realizados
                  </a>
                </li>
                <li>
                  <a href="#agendar-visita" className="hover:text-[#84C62B]">
                    Agendar visita
                  </a>
                </li>
                <li>
                  <a href="#contato" className="hover:text-[#84C62B]">
                    Contato
                  </a>
                </li>
              </ul>
            </div>

            <div className="md:col-span-4">
              <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#BBA98D]">
                Transparência e LGPD
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-[#F5F3E9]/80">
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenLegalDoc('terms')}
                    className="text-left underline-offset-4 hover:text-[#84C62B] hover:underline"
                  >
                    Termos de Uso
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenLegalDoc('privacy')}
                    className="text-left underline-offset-4 hover:text-[#84C62B] hover:underline"
                  >
                    Política de Privacidade
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenLegalDoc('cookies')}
                    className="text-left underline-offset-4 hover:text-[#84C62B] hover:underline"
                  >
                    Política de Cookies
                  </button>
                </li>
                {showCookiePrefs && (
                  <li>
                    <button
                      type="button"
                      onClick={onOpenConsentModal}
                      className="text-left underline-offset-4 hover:text-[#84C62B] hover:underline"
                    >
                      Preferências de Cookies
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 text-xs text-[#F5F3E9]/65 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {COMPANY.tradeName}. {COMPANY.serviceArea}.
            </p>
            <p>
              <a
                href={SITE_CONFIG.credits.url}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[#84C62B]"
              >
                {SITE_CONFIG.credits.label}
              </a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
