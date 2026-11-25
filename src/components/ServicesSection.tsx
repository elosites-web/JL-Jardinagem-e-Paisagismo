import {
  Sprout,
  Route,
  Scissors,
  Compass,
  Flower2,
  CalendarCheck,
  Trees,
  Shovel,
  Calendar,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react';
import { SERVICES_LIST, type ServiceItem } from '../data/services';
import { scrollRevealDirectiveProps } from '../utils/scrollReveal';
import { buildServiceWhatsAppUrl } from '../utils/whatsapp';
import { WhatsAppIcon } from './Icons';

const SERVICE_ICONS: Record<ServiceItem['iconName'], LucideIcon> = {
  sprout: Sprout,
  route: Route,
  scissors: Scissors,
  compass: Compass,
  flower2: Flower2,
  calendarCheck: CalendarCheck,
  trees: Trees,
  shovel: Shovel,
};

function ServiceIcon({ name }: { name: ServiceItem['iconName'] }) {
  const Icon = SERVICE_ICONS[name];
  return (
    <Icon
      className="services-card-icon-svg h-[19px] w-[19px] text-[#298637] transition-[transform,color] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 group-focus-within:scale-110 group-hover:text-[#84C62B] group-focus-within:text-[#84C62B] motion-reduce:transition-colors motion-reduce:group-hover:scale-100 motion-reduce:group-focus-within:scale-100"
      strokeWidth={1.5}
      aria-hidden="true"
    />
  );
}

export function ServicesSection() {
  const revealHeader = scrollRevealDirectiveProps();
  const revealGrid = scrollRevealDirectiveProps(80);
  const revealNote = scrollRevealDirectiveProps(160);

  return (
    <section
      id="servicos"
      aria-labelledby="servicos-heading"
      className="border-b border-[#BBA98D]/35 bg-[#F5F3E9] py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div
          data-scroll-reveal={revealHeader['data-scroll-reveal']}
          className={`${revealHeader.className} flex flex-col gap-6 md:flex-row md:items-end md:justify-between`}
        >
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#298637]">
              Serviços
            </p>
            <h2
              id="servicos-heading"
              className="mt-3 font-editorial text-3xl font-semibold leading-[1.12] text-[#10291C] sm:text-4xl lg:text-[2.75rem] text-balance"
            >
              Soluções para cuidar e transformar sua área verde.
            </h2>
          </div>

          <a
            href="#agendar-visita"
            className="services-cta-link inline-flex min-h-[44px] w-fit items-center gap-2 rounded-lg border border-[#10291C]/25 bg-white/70 px-5 py-2.5 text-sm font-semibold text-[#10291C] transition-colors hover:border-[#298637] hover:bg-white whitespace-nowrap"
          >
            <span
              aria-hidden="true"
              className="services-cta-leaf inline-flex h-4 w-4 shrink-0 items-center justify-center text-[#298637]"
            >
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
                <path
                  d="M13.5 2.5C8.5 2.5 4.2 5.1 3.2 9.8C2.9 11.2 3.1 12.4 3.5 13.2C4.4 13.4 5.7 13.4 7.1 13C11.4 11.8 13.5 7.8 13.5 2.5Z"
                  fill="#84C62B"
                  fillOpacity="0.3"
                  stroke="currentColor"
                  strokeWidth="1.35"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3.2 13.2C5.4 10.7 8.1 8.1 11.2 5.6"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <Calendar className="h-4 w-4 text-[#298637]" strokeWidth={1.5} aria-hidden="true" />
            <span>Agendar visita</span>
          </a>
        </div>

        <div
          data-scroll-reveal={revealGrid['data-scroll-reveal']}
          className={`${revealGrid.className} services-grid-glow mt-12 grid gap-px rounded-2xl border border-[#BBA98D]/45 bg-[#BBA98D]/35 sm:grid-cols-2 lg:grid-cols-4`}
        >
          {SERVICES_LIST.map((service, index) => {
            const cornerClass = [
              index === 0 ? 'rounded-t-2xl sm:rounded-tr-none' : '',
              index === 1 ? 'sm:rounded-tr-2xl lg:rounded-tr-none' : '',
              index === 3 ? 'lg:rounded-tr-2xl' : '',
              index === 4 ? 'lg:rounded-bl-2xl' : '',
              index === 6 ? 'sm:rounded-bl-2xl lg:rounded-bl-none' : '',
              index === 7 ? 'rounded-b-2xl sm:rounded-bl-none' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <article
                key={service.id}
                className={`services-article-card group relative z-0 flex flex-col justify-between bg-[#F5F3E9] p-6 transition-[transform,background-color] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] hover:z-10 focus-within:z-10 hover:scale-[1.035] focus-within:scale-[1.035] hover:!rounded-2xl focus-within:!rounded-2xl hover:bg-[#FAF8F2] focus-within:bg-[#FAF8F2] hover:ring-1 focus-within:ring-1 hover:ring-[#BBA98D]/55 focus-within:ring-[#BBA98D]/55 motion-reduce:transition-colors motion-reduce:hover:scale-100 motion-reduce:focus-within:scale-100 sm:p-7 ${cornerClass}`}
              >
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="services-card-icon-badge inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#BBA98D]/45 bg-[#FAF8F2] transition-[transform,background-color,border-color] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 group-focus-within:scale-105 group-hover:border-[#10291C] group-focus-within:border-[#10291C] group-hover:bg-[#10291C] group-focus-within:bg-[#10291C] motion-reduce:transition-colors motion-reduce:group-hover:scale-100 motion-reduce:group-focus-within:scale-100">
                    <ServiceIcon name={service.iconName} />
                  </span>
                  <span className="font-mono text-xs font-medium tracking-wider tabular-nums text-[#10291C]/50 transition-colors duration-300 group-hover:text-[#298637]">
                    {service.number}
                  </span>
                </div>

                <h3 className="mt-5 font-editorial text-2xl font-semibold leading-snug text-[#10291C]">
                  {service.name}
                </h3>

                <p className="mt-2.5 text-sm leading-relaxed text-[#10291C]/80">
                  {service.description}
                </p>
              </div>

              <div className="mt-6 border-t border-[#BBA98D]/30 pt-4">
                <a
                  href={buildServiceWhatsAppUrl(service.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Solicitar orçamento para ${service.name} pelo WhatsApp`}
                  className="services-card-cta -mx-2 inline-flex min-h-[40px] origin-center items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[#10291C]"
                >
                  <WhatsAppIcon className="h-4 w-4 text-[#298637]" />
                  <span>Solicitar orçamento</span>
                  <ArrowUpRight
                    className="h-4 w-4 opacity-70 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                </a>
              </div>
              </article>
            );
          })}
        </div>

        <p
          data-scroll-reveal={revealNote['data-scroll-reveal']}
          className={`${revealNote.className} mt-6 text-xs leading-relaxed text-[#10291C]/70`}
        >
          O escopo de execução, o eventual fornecimento de materiais, mudas, insumos ou retirada de
          resíduos vegetais são avaliados e confirmados conforme cada orçamento.
        </p>
      </div>
    </section>
  );
}
