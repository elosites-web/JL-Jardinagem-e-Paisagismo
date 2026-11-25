import { MapPin, Compass, ClipboardCheck } from 'lucide-react';
import { COMPANY } from '../config/company';
import { scrollRevealDirectiveProps } from '../utils/scrollReveal';

export function AboutSection() {
  const revealLeft = scrollRevealDirectiveProps();
  const revealRight = scrollRevealDirectiveProps(120);

  return (
    <section
      id="sobre"
      aria-labelledby="sobre-heading"
      className="border-b border-[#BBA98D]/35 bg-[#F5F3E9] py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div data-scroll-reveal={revealLeft['data-scroll-reveal']} className={`${revealLeft.className} lg:col-span-6`}>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#298637]">
              Sobre a JL
            </p>

            <h2
              id="sobre-heading"
              className="mt-3 font-editorial text-3xl font-semibold leading-[1.12] text-[#10291C] sm:text-4xl lg:text-[2.75rem] text-balance"
            >
              Cuidado técnico e sensibilidade para valorizar áreas externas.
            </h2>

            <p className="mt-6 text-base leading-relaxed text-[#10291C]/85 sm:text-lg">
              Cuidamos de cada detalhe para que seu espaço verde seja mais bonito, agradável e bem
              cuidado. Conheça nossos serviços de jardinagem e paisagismo em {COMPANY.serviceArea}.
            </p>

            <div className="mt-10 grid gap-6 border-t border-[#BBA98D]/45 pt-8 sm:grid-cols-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#10291C]">
                  <MapPin className="h-4 w-4 text-[#298637]" aria-hidden="true" />
                  <span>Atuação local</span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-[#10291C]/75">
                  Atendimento presencial em {COMPANY.serviceArea}.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#10291C]">
                  <Compass className="h-4 w-4 text-[#298637]" aria-hidden="true" />
                  <span>Projeto ao cuidado</span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-[#10291C]/75">
                  Da roçada e corte de grama à harmonização de canteiros.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#10291C]">
                  <ClipboardCheck className="h-4 w-4 text-[#298637]" aria-hidden="true" />
                  <span>Atendimento direto</span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-[#10291C]/75">
                  Conversa direta com {COMPANY.responsibleName} pelo WhatsApp.
                </p>
              </div>
            </div>
          </div>

          <div data-scroll-reveal={revealRight['data-scroll-reveal']} className={`${revealRight.className} lg:col-span-6`}>
            <figure className="overflow-hidden rounded-2xl border border-[#BBA98D]/40 bg-[#10291C]/5">
              <img
                src="/images/hero/hero-real-reserva.webp"
                alt="Área externa residencial com piscina, gramado aparado e canteiros junto ao muro executada pela JL"
                width={1080}
                height={1080}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />
              <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-[#BBA98D]/35 bg-[#F5F3E9] px-5 py-3.5 text-xs text-[#10291C]/75">
                <span>Registro real compartilhado pela {COMPANY.tradeName}</span>
                <span className="font-medium text-[#298637]">{COMPANY.serviceArea}</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
