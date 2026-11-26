import { useRef, useState } from 'react';
import { Calendar, MoveHorizontal } from 'lucide-react';
import { COMPANY } from '../config/company';
import { SITE_CONFIG } from '../config/siteConfig';
import { BEFORE_AFTER_PAIRS } from '../data/simulations';
import { scrollRevealDirectiveProps } from '../utils/scrollReveal';

export function BeforeAfterSection() {
  const [selectedPairId, setSelectedPairId] = useState(BEFORE_AFTER_PAIRS[0].id);
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const revealHeader = scrollRevealDirectiveProps();
  const revealContent = scrollRevealDirectiveProps(80);

  if (!SITE_CONFIG.showBeforeAfterSimulations) {
    return null;
  }

  const activePair =
    BEFORE_AFTER_PAIRS.find((pair) => pair.id === selectedPairId) ?? BEFORE_AFTER_PAIRS[0];

  const updateFromClientX = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const rawPct = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.min(100, Math.max(0, Math.round(rawPct))));
  };

  return (
    <section
      id="antes-depois"
      aria-labelledby="antes-depois-heading"
      className="border-b border-[#BBA98D]/35 bg-[#FAF8F2] py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div
          data-scroll-reveal={revealHeader['data-scroll-reveal']}
          className={`${revealHeader.className} max-w-3xl`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#298637]">
              Antes e Depois · Paisagismo
            </p>
          </div>

          <h2
            id="antes-depois-heading"
            className="mt-3 font-editorial text-3xl font-semibold leading-[1.12] text-[#10291C] sm:text-4xl lg:text-[2.75rem] text-balance"
          >
            Transformações que fazem a diferença.
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-[#10291C]/80 sm:text-base">
            Descubra como os serviços de jardinagem e paisagismo da JL podem renovar seu ambiente,
            trazendo mais beleza, organização e harmonia aos espaços externos.
          </p>

          <p className="mt-2 text-xs font-medium text-[#10291C]/70 sm:text-sm">
            Deslize para visualizar as possibilidades de transformação.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Selecionar cenário de antes e depois em paisagismo"
          className="mt-8 inline-flex max-w-full flex-wrap gap-1.5 rounded-xl border border-[#BBA98D]/40 bg-[#F5F3E9] p-1.5"
        >
          {BEFORE_AFTER_PAIRS.map((pair, idx) => {
            const isSelected = pair.id === activePair.id;
            return (
              <button
                key={pair.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  setSelectedPairId(pair.id);
                  setSliderPosition(50);
                }}
                className={`min-h-[42px] rounded-lg px-4 py-2 text-xs font-semibold whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#10291C] text-[#F5F3E9] shadow-xs'
                    : 'text-[#10291C]/80 hover:bg-white/80 hover:text-[#10291C]'
                }`}
              >
                0{idx + 1}. {pair.title}
              </button>
            );
          })}
        </div>

        <div
          data-scroll-reveal={revealContent['data-scroll-reveal']}
          className={`${revealContent.className} mt-8 grid items-center gap-8 lg:grid-cols-12`}
        >
          <div className="lg:col-span-8">
            <div
              ref={containerRef}
              data-scroll-parallax="14"
              data-parallax-scale="1.08"
              style={{ touchAction: 'pan-y' }}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                updateFromClientX(event.clientX);
              }}
              onPointerMove={(event) => {
                if (event.buttons === 1) {
                  updateFromClientX(event.clientX);
                }
              }}
              className="relative aspect-[4/3] w-full cursor-ew-resize select-none overflow-hidden rounded-2xl border border-[#BBA98D]/50 bg-[#10291C]/10 shadow-sm"
            >
              {/* Imagem Depois (base completa) */}
              <img
                key={`${activePair.id}-after`}
                src={activePair.afterSrc}
                alt={activePair.afterAlt}
                width={1200}
                height={900}
                decoding="sync"
                className="scroll-parallax-media pointer-events-none h-full w-full object-cover"
              />

              {/* Imagem Antes (recortada com clip-path) */}
              <div
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                className="pointer-events-none absolute inset-0"
              >
                <img
                  key={`${activePair.id}-before`}
                  src={activePair.beforeSrc}
                  alt={activePair.beforeAlt}
                  width={1200}
                  height={900}
                  decoding="sync"
                  className="scroll-parallax-media h-full w-full object-cover"
                />
              </div>

              {/* Pré-carregamento invisível dos outros cenários para troca instantânea */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-0 left-0 h-px w-px overflow-hidden opacity-0"
              >
                {BEFORE_AFTER_PAIRS.filter((p) => p.id !== activePair.id).map((pair) => (
                  <span key={pair.id}>
                    <img src={pair.beforeSrc} alt="" decoding="sync" />
                    <img src={pair.afterSrc} alt="" decoding="sync" />
                  </span>
                ))}
              </div>

              {/* Rótulos visíveis Antes e Depois */}
              <span className="pointer-events-none absolute top-4 left-4 rounded bg-[#10291C]/85 px-3 py-1 text-xs font-semibold text-[#F5F3E9] backdrop-blur-sm">
                Antes
              </span>
              <span className="pointer-events-none absolute top-4 right-4 rounded bg-[#84C62B] px-3 py-1 text-xs font-semibold text-[#10291C] shadow-sm">
                Depois
              </span>

              {/* Linha e pegador visual */}
              <div
                aria-hidden="true"
                style={{ left: `${sliderPosition}%` }}
                className="pointer-events-none absolute inset-y-0 -translate-x-1/2 flex flex-col items-center"
              >
                <div className="h-full w-0.5 bg-[#F5F3E9] shadow" />
                <div className="absolute top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#F5F3E9] bg-[#10291C] text-[#84C62B] shadow-lg">
                  <MoveHorizontal className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Controle acessível por teclado e toque */}
            <div className="mt-4 flex items-center gap-4">
              <label
                htmlFor="before-after-range"
                className="text-xs font-semibold text-[#10291C]/80 whitespace-nowrap"
              >
                Comparador:
              </label>
              <input
                id="before-after-range"
                type="range"
                min={0}
                max={100}
                value={sliderPosition}
                onChange={(event) => setSliderPosition(Number(event.target.value))}
                aria-label={`Comparar antes e depois para ${activePair.title}`}
                className="h-2 w-full cursor-pointer accent-[#298637]"
              />
              <span className="font-mono text-xs font-medium tabular-nums text-[#10291C]/75">
                {sliderPosition}%
              </span>
            </div>
          </div>

          <aside className="rounded-2xl border border-[#BBA98D]/45 bg-[#F5F3E9] p-6 sm:p-8 lg:col-span-4">
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#298637]">
              Cuidado em cada detalhe
            </p>
            <h3 className="mt-2 font-editorial text-2xl font-semibold text-[#10291C]">
              {activePair.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#10291C]/80">{activePair.subtitle}</p>
            <div className="mt-6 border-t border-[#BBA98D]/35 pt-6">
              <p className="text-xs leading-relaxed text-[#10291C]/75">
                Atendimento presencial em {COMPANY.serviceArea} para transformação de ambientes
                externos sob medida.
              </p>
              <a
                href="#agendar-visita"
                aria-label={`Quero transformar meu espaço — agendar visita para orçamento presencial (${activePair.title})`}
                className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-[#84C62B] px-5 py-3 text-sm font-semibold text-[#10291C] shadow-sm transition-colors hover:bg-[#95d63c]"
              >
                <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Quero transformar meu espaço</span>
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
