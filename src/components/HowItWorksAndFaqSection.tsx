import { CheckCircle2, ClipboardCheck, Leaf, MapPin, type LucideIcon } from 'lucide-react';
import { FAQ_ITEMS, PROCESS_STEPS } from '../data/faqAndProcess';
import { scrollRevealDirectiveProps, type ScrollRevealDelayMs } from '../utils/scrollReveal';
import { FaqAccordion } from './FaqAccordion';
import { SectionWaveDivider } from './SectionWaveDivider';

const PROCESS_STEP_ICONS: readonly LucideIcon[] = [
  Leaf,
  MapPin,
  ClipboardCheck,
  CheckCircle2,
];

const STEP_REVEAL_DELAYS: readonly (ScrollRevealDelayMs | undefined)[] = [
  undefined,
  120,
  240,
  360,
];

export function HowItWorksAndFaqSection() {
  const revealProcessHeader = scrollRevealDirectiveProps();
  const revealFaqSection = scrollRevealDirectiveProps();
  const revealFaqIntro = scrollRevealDirectiveProps(80);
  const revealFaqList = scrollRevealDirectiveProps(160);

  return (
    <>
      {/* Como funciona */}
      <section
        id="como-funciona"
        aria-labelledby="como-funciona-heading"
        className="border-b border-[#BBA98D]/35 bg-[#F5F3E9] pt-6 pb-20 sm:pt-8 sm:pb-24 lg:pt-10 lg:pb-28"
      >
        <SectionWaveDivider
          testId="como-funciona-wave-divider"
          backgroundClassName="bg-[#F5F3E9]"
          anchorTargetIds={['como-funciona', 'duvidas']}
        />
        <div className="mx-auto max-w-[1280px] px-4 pt-10 sm:px-6 sm:pt-12 lg:px-10 lg:pt-14">
          <div
            data-scroll-reveal={revealProcessHeader['data-scroll-reveal']}
            className={`${revealProcessHeader.className} max-w-2xl`}
          >
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#298637]">
              Como funciona
            </p>
            <h2
              id="como-funciona-heading"
              className="mt-3 font-editorial text-3xl font-semibold leading-[1.12] text-[#10291C] sm:text-4xl lg:text-[2.75rem] text-balance"
            >
              Um processo claro, da conversa inicial à execução no seu espaço.
            </h2>
          </div>

          <ol className="mt-12 grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step, index) => {
              const StepIcon = PROCESS_STEP_ICONS[index] ?? Leaf;
              const revealStep = scrollRevealDirectiveProps(STEP_REVEAL_DELAYS[index]);
              return (
                <li
                  key={step.number}
                  data-scroll-reveal={revealStep['data-scroll-reveal']}
                  className={`${revealStep.className} how-it-works-card relative flex flex-col justify-between rounded-2xl border border-[#BBA98D]/45 bg-[#FAF8F2] p-6 sm:p-7`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <span
                        aria-hidden="true"
                        className="how-it-works-icon-badge inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#BBA98D]/45 bg-[#F5F3E9] text-[#298637]"
                      >
                        <StepIcon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                      </span>
                      <span className="font-display text-5xl font-semibold leading-none tracking-tight tabular-nums text-forest sm:text-6xl">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="mt-5 font-editorial text-2xl font-semibold leading-snug text-[#10291C]">
                      {step.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-[#10291C]/80">
                      {step.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Perguntas frequentes */}
      <section
        id="duvidas"
        aria-labelledby="duvidas-heading"
        className="border-b border-[#BBA98D]/35 bg-[#FAF8F2] py-20 sm:py-24 lg:py-28"
      >
        <div
          data-scroll-reveal={revealFaqSection['data-scroll-reveal']}
          className={`${revealFaqSection.className} mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10`}
        >
          <div className="grid gap-12 lg:grid-cols-12">
            <div
              data-scroll-reveal={revealFaqIntro['data-scroll-reveal']}
              className={`${revealFaqIntro.className} lg:col-span-5`}
            >
              <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#298637]">
                Perguntas frequentes
              </p>
              <h2
                id="duvidas-heading"
                className="mt-3 font-editorial text-3xl font-semibold leading-[1.12] text-[#10291C] sm:text-4xl text-balance"
              >
                Dúvidas comuns antes de solicitar seu orçamento.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#10291C]/80 sm:text-base">
                Caso precise de uma orientação específica para o seu jardim ou terreno, envie uma
                mensagem diretamente pelo WhatsApp.
              </p>
            </div>

            <div
              data-scroll-reveal={revealFaqList['data-scroll-reveal']}
              className={`${revealFaqList.className} lg:col-span-7`}
            >
              <FaqAccordion items={FAQ_ITEMS} defaultOpenId={FAQ_ITEMS[0].id} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
