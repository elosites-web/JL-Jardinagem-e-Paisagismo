import { ArrowDownRight, Calendar } from 'lucide-react';
import { COMPANY } from '../config/company';
import { buildGeneralWhatsAppUrl } from '../utils/whatsapp';
import { WhatsAppIcon } from './Icons';

export function HeroSection() {
  const whatsappUrl = buildGeneralWhatsAppUrl();

  return (
    <section
      id="inicio"
      aria-labelledby="hero-heading"
      className="relative min-h-[640px] lg:min-h-[760px] flex items-center bg-[#10291C] pt-[76px] text-[#F5F3E9] overflow-hidden"
    >
      {/* Fotografia de fundo responsiva com carregamento prioritário */}
      <div className="absolute inset-x-3 top-[86px] bottom-3 sm:inset-x-6 sm:bottom-5 lg:inset-x-8 lg:top-[90px] lg:bottom-6">
        <picture className="block h-full w-full">
          <source
            media="(max-width: 767px)"
            srcSet="/images/hero/hero-jardim-mobile.webp"
            type="image/webp"
          />
          <img
            src="/images/hero/hero-jardim-desktop.webp"
            alt="Jardim residencial brasileiro com gramado cuidado, caminho de placas de pedra e folhagens tropicais"
            width={1920}
            height={1080}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="h-full w-full rounded-2xl object-cover object-center shadow-lg animate-fade-in lg:object-[72%_center]"
          />
        </picture>

        {/* Scrim editorial garantindo alto contraste WCAG AA/AAA sobre a imagem */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-[#10291C]/95 via-[#10291C]/75 to-[#10291C]/45 md:bg-gradient-to-r md:from-[#10291C]/95 md:via-[#10291C]/75 md:to-[#10291C]/20"
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 sm:py-24 lg:px-10 lg:py-28">
        <div className="max-w-2xl">
          <p className="mb-5 text-xs font-medium tracking-[0.18em] uppercase text-[#BBA98D]">
            {COMPANY.serviceArea}
          </p>

          <h1
            id="hero-heading"
            className="font-editorial text-[clamp(2.35rem,4.6vw,4.15rem)] font-semibold leading-[1.06] tracking-[-0.015em] text-[#F5F3E9] text-balance"
          >
            Transformamos espaços em natureza, beleza e vida.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#F5F3E9]/90 sm:text-lg">
            Jardinagem e paisagismo em {COMPANY.serviceArea}. Do cuidado com o gramado à
            transformação de ambientes externos, deixe seu espaço mais bonito e acolhedor.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3.5 sm:gap-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-lg bg-[#84C62B] px-6 py-3 text-sm font-semibold text-[#10291C] shadow-sm transition-colors hover:bg-[#95d63c] whitespace-nowrap"
            >
              <WhatsAppIcon className="h-5 w-5 shrink-0" />
              <span>Solicitar orçamento</span>
            </a>

            <a
              href="#agendar-visita"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-[#F5F3E9]/40 bg-[#10291C]/55 px-5 py-3 text-sm font-semibold text-[#F5F3E9] backdrop-blur-sm transition-colors hover:border-[#84C62B] hover:bg-[#10291C]/80 whitespace-nowrap"
            >
              <Calendar className="h-4 w-4 shrink-0 text-[#84C62B]" aria-hidden="true" />
              <span>Agendar visita</span>
            </a>

            <a
              href="#trabalhos"
              className="inline-flex min-h-[44px] items-center gap-1.5 px-2 py-2 text-sm font-medium text-[#F5F3E9]/90 underline decoration-[#BBA98D]/60 underline-offset-4 transition-colors hover:text-[#84C62B] hover:decoration-[#84C62B] whitespace-nowrap"
            >
              <span>Conhecer nossos trabalhos</span>
              <ArrowDownRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
