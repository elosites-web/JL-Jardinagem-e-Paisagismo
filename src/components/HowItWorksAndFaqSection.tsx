import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ChevronDown, ClipboardCheck, Leaf, MapPin, type LucideIcon } from 'lucide-react';
import { FAQ_ITEMS, PROCESS_STEPS } from '../data/faqAndProcess';
import { scrollRevealDirectiveProps } from '../utils/scrollReveal';

const PROCESS_STEP_ICONS: readonly LucideIcon[] = [
  Leaf,
  MapPin,
  ClipboardCheck,
  CheckCircle2,
];

const STEP_FADE_DELAY_CLASSES = [
  '[--fade-delay:0ms]',
  '[--fade-delay:150ms]',
  '[--fade-delay:300ms]',
  '[--fade-delay:450ms]',
] as const;

export function HowItWorksAndFaqSection() {
  const [openFaqId, setOpenFaqId] = useState<string | null>(FAQ_ITEMS[0].id);
  const revealProcessHeader = scrollRevealDirectiveProps();
  const revealFaqIntro = scrollRevealDirectiveProps();
  const revealFaqList = scrollRevealDirectiveProps(80);
  const processListRef = useRef<HTMLOListElement | null>(null);
  const [isProcessVisible, setIsProcessVisible] = useState(() => {
    if (typeof window === 'undefined') return true;
    return (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  });

  useEffect(() => {
    if (isProcessVisible) return;
    const target = processListRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsProcessVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -32px 0px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [isProcessVisible]);

  return (
    <>
      {/* Como funciona */}
      <section
        id="como-funciona"
        aria-labelledby="como-funciona-heading"
        className="border-b border-[#BBA98D]/35 bg-[#F5F3E9] py-20 sm:py-24 lg:py-28"
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
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

          <ol ref={processListRef} className="mt-12 grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step, index) => {
              const StepIcon = PROCESS_STEP_ICONS[index] ?? Leaf;
              return (
                <li
                  key={step.number}
                  className={`flex flex-col justify-between rounded-2xl border border-[#BBA98D]/45 bg-[#FAF8F2] p-6 sm:p-7 ${
                    isProcessVisible
                      ? `animate-fade-in ${STEP_FADE_DELAY_CLASSES[index] ?? '[--fade-delay:0ms]'}`
                      : 'opacity-0'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <span
                        aria-hidden="true"
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#BBA98D]/45 bg-[#F5F3E9] text-[#298637]"
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
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
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
              className={`${revealFaqList.className} divide-y divide-[#BBA98D]/45 border-y border-[#BBA98D]/45 lg:col-span-7`}
            >
              {FAQ_ITEMS.map((item) => {
                const isExpanded = openFaqId === item.id;
                const panelId = `faq-panel-${item.id}`;
                return (
                  <div key={item.id}>
                    <h3>
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-controls={panelId}
                        onClick={() => setOpenFaqId(isExpanded ? null : item.id)}
                        className="flex min-h-[56px] w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold text-[#10291C] transition-colors hover:text-[#298637] sm:text-lg"
                      >
                        <span>{item.question}</span>
                        <ChevronDown
                          aria-hidden="true"
                          className={`h-5 w-5 shrink-0 text-[#298637] transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </h3>
                    {isExpanded && (
                      <div
                        id={panelId}
                        className="pb-5 pr-8 text-sm leading-relaxed text-[#10291C]/80 sm:text-base"
                      >
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
