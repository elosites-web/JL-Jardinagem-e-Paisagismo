import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Home,
  MapPin,
  Phone,
  RotateCcw,
  ShieldCheck,
  Trash2,
  User,
} from 'lucide-react';
import { SERVICES_LIST } from '../data/services';
import type { LegalDocKey } from '../data/legalDocs';
import { useFormDraft } from '../hooks/useFormDraft';
import {
  formatBrazilianPhone,
  getTodayIsoDate,
  INITIAL_VISIT_FORM_STATE,
  validateVisitForm,
  VISIT_FIELD_LIMITS,
  type VisitFormErrors,
  type VisitFormState,
} from '../utils/visitForm';
import {
  hasPersistableFormContent,
  parseStoredVisitDraft,
  serializeStoredVisitDraft,
  VISIT_FORM_DRAFT_STORAGE_KEY,
  type PersistableVisitFormFields,
} from '../utils/visitFormDraft';
import {
  buildVisitMessage,
  buildVisitWhatsAppUrl,
  PROPERTY_TYPE_LABELS,
  VISIT_PERIOD_LABELS,
  type PropertyType,
  type VisitMessagePayload,
  type VisitPeriod,
} from '../utils/whatsapp';
import { navigateToAnchorId } from '../utils/anchorNavigation';
import { scrollRevealDirectiveProps } from '../utils/scrollReveal';
import { WhatsAppIcon } from './Icons';

interface VisitRequestSectionProps {
  onOpenLegalDoc: (doc: LegalDocKey) => void;
}

export function VisitRequestSection({ onOpenLegalDoc }: VisitRequestSectionProps) {
  const [form, setForm] = useState<VisitFormState>(INITIAL_VISIT_FORM_STATE);
  const [errors, setErrors] = useState<VisitFormErrors>({});
  const [confirmedPayload, setConfirmedPayload] = useState<VisitMessagePayload | null>(null);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const pendingScrollToFormStartRef = useRef(false);
  const fullNameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (confirmedPayload !== null || !pendingScrollToFormStartRef.current) {
      return;
    }
    pendingScrollToFormStartRef.current = false;

    const frameId = window.requestAnimationFrame(() => {
      navigateToAnchorId('formulario-visita', { updateHistory: false });
      fullNameInputRef.current?.focus({ preventScroll: true });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [confirmedPayload]);

  const todayIso = useMemo(() => getTodayIsoDate(), []);

  const handleRestoreDraft = useCallback((restored: PersistableVisitFormFields) => {
    setForm({
      ...INITIAL_VISIT_FORM_STATE,
      ...restored,
      consentChecked: false,
    });
    setErrors({});
    setConfirmedPayload(null);
  }, []);

  const persistableForm = useMemo<PersistableVisitFormFields>(
    () => ({
      fullName: form.fullName,
      phone: form.phone,
      city: form.city,
      neighborhood: form.neighborhood,
      propertyType: form.propertyType,
      selectedServices: form.selectedServices,
      preferredDate: form.preferredDate,
      preferredPeriod: form.preferredPeriod,
      notes: form.notes,
    }),
    [
      form.fullName,
      form.phone,
      form.city,
      form.neighborhood,
      form.propertyType,
      form.selectedServices,
      form.preferredDate,
      form.preferredPeriod,
      form.notes,
    ],
  );

  const { draftStatus, storageAvailable, saveNow, clearDraft } = useFormDraft<
    PersistableVisitFormFields,
    PersistableVisitFormFields
  >({
    storageKey: VISIT_FORM_DRAFT_STORAGE_KEY,
    value: persistableForm,
    isEmpty: (state) => !hasPersistableFormContent(state),
    serialize: (state, nowMs) => serializeStoredVisitDraft(state, nowMs),
    deserialize: (rawJson, nowMs) => parseStoredVisitDraft(rawJson, nowMs, getTodayIsoDate()),
    onRestore: handleRestoreDraft,
    debounceMs: 400,
  });

  const hasContent = hasPersistableFormContent(persistableForm);

  const handleConfirmClear = () => {
    clearDraft();
    setForm(INITIAL_VISIT_FORM_STATE);
    setErrors({});
    setConfirmedPayload(null);
    setConfirmingClear(false);
  };

  const updateField = <K extends keyof VisitFormState>(key: K, value: VisitFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
    if (confirmedPayload) {
      setConfirmedPayload(null);
    }
    if (confirmingClear) {
      setConfirmingClear(false);
    }
  };

  const toggleService = (serviceName: string) => {
    setForm((prev) => {
      const exists = prev.selectedServices.includes(serviceName);
      const nextServices = exists
        ? prev.selectedServices.filter((s) => s !== serviceName)
        : [...prev.selectedServices, serviceName];
      return { ...prev, selectedServices: nextServices };
    });
    setErrors((prev) => {
      if (!prev.selectedServices) return prev;
      const copy = { ...prev };
      delete copy.selectedServices;
      return copy;
    });
    if (confirmedPayload) {
      setConfirmedPayload(null);
    }
    if (confirmingClear) {
      setConfirmingClear(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveNow();
    const validationErrors = validateVisitForm(form, getTodayIsoDate());
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setConfirmedPayload(null);
      return;
    }

    const payload: VisitMessagePayload = {
      fullName: form.fullName,
      phone: form.phone,
      city: form.city,
      neighborhood: form.neighborhood,
      propertyType: form.propertyType as PropertyType,
      selectedServices: form.selectedServices,
      preferredDate: form.preferredDate,
      preferredPeriod: form.preferredPeriod as VisitPeriod,
      notes: form.notes,
    };

    setErrors({});
    setConfirmedPayload(payload);
  };

  const previewMessage = confirmedPayload ? buildVisitMessage(confirmedPayload) : '';
  const whatsappUrl = confirmedPayload ? buildVisitWhatsAppUrl(confirmedPayload) : '';
  const revealEditorial = scrollRevealDirectiveProps();
  const revealForm = scrollRevealDirectiveProps(80);

  return (
    <section
      id="agendar-visita"
      aria-labelledby="agendar-visita-heading"
      className="border-b border-[#BBA98D]/35 bg-[#F5F3E9] py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          {/* Coluna editorial explicativa (scroll-reveal no filho interno para preservar lg:sticky) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div data-scroll-reveal={revealEditorial['data-scroll-reveal']} className={revealEditorial.className}>
              <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#298637]">
                Agende uma visita
              </p>
              <h2
                id="agendar-visita-heading"
                className="mt-3 font-editorial text-3xl font-semibold leading-[1.12] text-[#10291C] sm:text-4xl lg:text-[2.75rem] text-balance"
              >
                Solicite uma visita para avaliação e orçamento presencial.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#10291C]/80">
                Preencha os detalhes do seu espaço para organizar sua solicitação. Ao final, você
                revisa a mensagem pronta e envia diretamente pelo seu WhatsApp.
              </p>

              <div className="mt-8 space-y-4 rounded-2xl border border-[#BBA98D]/45 bg-[#FAF8F2] p-6 text-sm leading-relaxed text-[#10291C]/85">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#298637]" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-[#10291C]">Privacidade e controle no envio</p>
                    <p className="mt-1">
                      Não gravamos seus dados em banco de dados, cookies ou localStorage, nem os
                      enviamos a servidores. Para evitar perda acidental enquanto você navega nesta
                      sessão, o rascunho permanece salvo temporariamente apenas no próprio navegador
                      (sessionStorage, válido por até 2 horas, sem guardar a caixa de ciência) até
                      que você limpe o formulário ou encerre a sessão.
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#BBA98D]/35 pt-4 text-xs leading-relaxed text-[#10291C]/75">
                  <strong className="text-[#10291C]">Aviso importante:</strong> Esta solicitação não
                  representa confirmação automática de agendamento. A disponibilidade, a data, o
                  horário e eventuais condições da visita serão combinados diretamente com o Júlio.
                </div>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <div data-scroll-reveal={revealForm['data-scroll-reveal']} className={`${revealForm.className} lg:col-span-7`}>
            <form
              id="formulario-visita"
              noValidate
              onSubmit={handleSubmit}
              onBlurCapture={() => saveNow()}
              className="rounded-2xl border border-[#BBA98D]/50 bg-[#FAF8F2] p-6 shadow-sm sm:p-8 lg:p-10"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Nome completo */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="visit-full-name"
                    className="flex items-center gap-2 text-sm font-semibold text-[#10291C]"
                  >
                    <User className="h-4 w-4 text-[#298637]" aria-hidden="true" />
                    <span>Nome completo *</span>
                  </label>
                  <div className="visit-field-shell mt-2">
                    <input
                      ref={fullNameInputRef}
                      id="visit-full-name"
                      name="fullName"
                      type="text"
                      inputMode="text"
                      autoComplete="name"
                      maxLength={VISIT_FIELD_LIMITS.fullName}
                      value={form.fullName}
                      onChange={(event) => updateField('fullName', event.target.value)}
                      aria-invalid={Boolean(errors.fullName)}
                      aria-describedby={errors.fullName ? 'error-full-name' : undefined}
                      placeholder="Como prefere ser chamado(a)"
                      className="block w-full rounded-lg border border-[#BBA98D]/60 bg-white px-4 py-3 text-sm text-[#10291C] placeholder:text-[#10291C]/45 focus:border-[#298637]"
                    />
                  </div>
                  {errors.fullName && (
                    <p id="error-full-name" className="mt-1.5 text-xs font-medium text-[#9e2a2b]">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Telefone/WhatsApp (opcional para minimização, com máscara brasileira) */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="visit-phone"
                    className="flex items-center gap-2 text-sm font-semibold text-[#10291C]"
                  >
                    <Phone className="h-4 w-4 text-[#298637]" aria-hidden="true" />
                    <span>Telefone / WhatsApp (opcional)</span>
                  </label>
                  <div className="visit-field-shell mt-2">
                    <input
                      id="visit-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={20}
                      value={form.phone}
                      onChange={(event) =>
                        updateField('phone', formatBrazilianPhone(event.target.value))
                      }
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? 'error-phone' : 'help-phone'}
                      placeholder="(11) 99999-9999"
                      className="block w-full rounded-lg border border-[#BBA98D]/60 bg-white px-4 py-3 text-sm text-[#10291C] placeholder:text-[#10291C]/45 focus:border-[#298637]"
                    />
                  </div>
                  <p id="help-phone" className="mt-1 text-xs text-[#10291C]/65">
                    Opcional — como o envio será feito pelo seu próprio WhatsApp, informe apenas se
                    desejar registrar outro número para retorno.
                  </p>
                  {errors.phone && (
                    <p id="error-phone" className="mt-1 text-xs font-medium text-[#9e2a2b]">
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Cidade */}
                <div>
                  <label
                    htmlFor="visit-city"
                    className="flex items-center gap-2 text-sm font-semibold text-[#10291C]"
                  >
                    <MapPin className="h-4 w-4 text-[#298637]" aria-hidden="true" />
                    <span>Cidade *</span>
                  </label>
                  <div className="visit-field-shell mt-2">
                    <input
                      id="visit-city"
                      name="city"
                      type="text"
                      inputMode="text"
                      autoComplete="address-level2"
                      maxLength={VISIT_FIELD_LIMITS.city}
                      value={form.city}
                      onChange={(event) => updateField('city', event.target.value)}
                      aria-invalid={Boolean(errors.city)}
                      aria-describedby={errors.city ? 'error-city' : undefined}
                      placeholder="Ex.: Jundiaí"
                      className="block w-full rounded-lg border border-[#BBA98D]/60 bg-white px-4 py-3 text-sm text-[#10291C] placeholder:text-[#10291C]/45 focus:border-[#298637]"
                    />
                  </div>
                  {errors.city && (
                    <p id="error-city" className="mt-1.5 text-xs font-medium text-[#9e2a2b]">
                      {errors.city}
                    </p>
                  )}
                </div>

                {/* Bairro */}
                <div>
                  <label
                    htmlFor="visit-neighborhood"
                    className="flex items-center gap-2 text-sm font-semibold text-[#10291C]"
                  >
                    <MapPin className="h-4 w-4 text-[#298637]" aria-hidden="true" />
                    <span>Bairro *</span>
                  </label>
                  <div className="visit-field-shell mt-2">
                    <input
                      id="visit-neighborhood"
                      name="neighborhood"
                      type="text"
                      inputMode="text"
                      autoComplete="address-level3"
                      maxLength={VISIT_FIELD_LIMITS.neighborhood}
                      value={form.neighborhood}
                      onChange={(event) => updateField('neighborhood', event.target.value)}
                      aria-invalid={Boolean(errors.neighborhood)}
                      aria-describedby={errors.neighborhood ? 'error-neighborhood' : undefined}
                      placeholder="Bairro aproximado (não informe rua/número)"
                      className="block w-full rounded-lg border border-[#BBA98D]/60 bg-white px-4 py-3 text-sm text-[#10291C] placeholder:text-[#10291C]/45 focus:border-[#298637]"
                    />
                  </div>
                  {errors.neighborhood && (
                    <p id="error-neighborhood" className="mt-1.5 text-xs font-medium text-[#9e2a2b]">
                      {errors.neighborhood}
                    </p>
                  )}
                </div>

                {/* Tipo de imóvel */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="visit-property-type"
                    className="flex items-center gap-2 text-sm font-semibold text-[#10291C]"
                  >
                    <Home className="h-4 w-4 text-[#298637]" aria-hidden="true" />
                    <span>Tipo de imóvel *</span>
                  </label>
                  <div className="visit-field-shell mt-2">
                    <select
                      id="visit-property-type"
                      name="propertyType"
                      value={form.propertyType}
                      onChange={(event) =>
                        updateField('propertyType', event.target.value as PropertyType | '')
                      }
                      aria-invalid={Boolean(errors.propertyType)}
                      aria-describedby={errors.propertyType ? 'error-property-type' : undefined}
                      className="block w-full rounded-lg border border-[#BBA98D]/60 bg-white px-4 py-3 text-sm text-[#10291C] focus:border-[#298637]"
                    >
                      <option value="">Selecione uma opção</option>
                      {(Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map((key) => (
                        <option key={key} value={key}>
                          {PROPERTY_TYPE_LABELS[key]}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.propertyType && (
                    <p id="error-property-type" className="mt-1.5 text-xs font-medium text-[#9e2a2b]">
                      {errors.propertyType}
                    </p>
                  )}
                </div>

                {/* Seleção múltipla dos 8 serviços */}
                <fieldset className="sm:col-span-2">
                  <legend className="text-sm font-semibold text-[#10291C]">
                    Serviços de interesse *
                  </legend>
                  <p className="mt-1 text-xs text-[#10291C]/70">
                    Selecione um ou mais serviços para a avaliação presencial.
                  </p>
                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    {SERVICES_LIST.map((service) => {
                      const isChecked = form.selectedServices.includes(service.name);
                      return (
                        <label
                          key={service.id}
                          className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm transition-colors ${
                            isChecked
                              ? 'border-[#298637] bg-[#298637]/10 font-medium text-[#10291C]'
                              : 'border-[#BBA98D]/50 bg-white text-[#10291C]/85 hover:border-[#298637]/60'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleService(service.name)}
                            className="h-4 w-4 shrink-0 accent-[#298637]"
                          />
                          <span>{service.name}</span>
                        </label>
                      );
                    })}
                  </div>
                  {errors.selectedServices && (
                    <p className="mt-1.5 text-xs font-medium text-[#9e2a2b]">
                      {errors.selectedServices}
                    </p>
                  )}
                </fieldset>

                {/* Data de preferência */}
                <div>
                  <label
                    htmlFor="visit-date"
                    className="flex items-center gap-2 text-sm font-semibold text-[#10291C]"
                  >
                    <Calendar className="h-4 w-4 text-[#298637]" aria-hidden="true" />
                    <span>Data de preferência *</span>
                  </label>
                  <div className="visit-field-shell mt-2">
                    <input
                      id="visit-date"
                      name="preferredDate"
                      type="date"
                      min={todayIso}
                      value={form.preferredDate}
                      onChange={(event) => updateField('preferredDate', event.target.value)}
                      aria-invalid={Boolean(errors.preferredDate)}
                      aria-describedby={errors.preferredDate ? 'error-date' : undefined}
                      className="block w-full rounded-lg border border-[#BBA98D]/60 bg-white px-4 py-3 text-sm text-[#10291C] focus:border-[#298637]"
                    />
                  </div>
                  {errors.preferredDate && (
                    <p id="error-date" className="mt-1.5 text-xs font-medium text-[#9e2a2b]">
                      {errors.preferredDate}
                    </p>
                  )}
                </div>

                {/* Período de preferência */}
                <div>
                  <label
                    htmlFor="visit-period"
                    className="flex items-center gap-2 text-sm font-semibold text-[#10291C]"
                  >
                    <Clock className="h-4 w-4 text-[#298637]" aria-hidden="true" />
                    <span>Período de preferência *</span>
                  </label>
                  <div className="visit-field-shell mt-2">
                    <select
                      id="visit-period"
                      name="preferredPeriod"
                      value={form.preferredPeriod}
                      onChange={(event) =>
                        updateField('preferredPeriod', event.target.value as VisitPeriod | '')
                      }
                      aria-invalid={Boolean(errors.preferredPeriod)}
                      aria-describedby={errors.preferredPeriod ? 'error-period' : undefined}
                      className="block w-full rounded-lg border border-[#BBA98D]/60 bg-white px-4 py-3 text-sm text-[#10291C] focus:border-[#298637]"
                    >
                      <option value="">Selecione um período</option>
                      {(Object.keys(VISIT_PERIOD_LABELS) as VisitPeriod[]).map((key) => (
                        <option key={key} value={key}>
                          {VISIT_PERIOD_LABELS[key]}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.preferredPeriod && (
                    <p id="error-period" className="mt-1.5 text-xs font-medium text-[#9e2a2b]">
                      {errors.preferredPeriod}
                    </p>
                  )}
                </div>

                {/* Informações adicionais */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="visit-notes" className="text-sm font-semibold text-[#10291C]">
                      Informações adicionais (opcional)
                    </label>
                    <span className="font-mono text-xs tabular-nums text-[#10291C]/60">
                      {form.notes.length}/{VISIT_FIELD_LIMITS.notes}
                    </span>
                  </div>
                  <div className="visit-field-shell mt-2">
                    <textarea
                      id="visit-notes"
                      name="notes"
                      rows={3}
                      maxLength={VISIT_FIELD_LIMITS.notes}
                      value={form.notes}
                      onChange={(event) => updateField('notes', event.target.value)}
                      placeholder="Ex.: tamanho aproximado da área, presença de vegetação alta ou detalhes que ajudem na visita."
                      className="block w-full rounded-lg border border-[#BBA98D]/60 bg-white px-4 py-3 text-sm text-[#10291C] placeholder:text-[#10291C]/45 focus:border-[#298637]"
                    />
                  </div>
                  {errors.notes && (
                    <p className="mt-1.5 text-xs font-medium text-[#9e2a2b]">{errors.notes}</p>
                  )}
                </div>

                {/* Checkbox obrigatório de ciência LGPD (inicialmente desmarcado) */}
                <div className="sm:col-span-2 border-t border-[#BBA98D]/35 pt-4">
                  <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-[#10291C]/85 sm:text-sm">
                    <input
                      type="checkbox"
                      checked={form.consentChecked}
                      onChange={(event) => updateField('consentChecked', event.target.checked)}
                      aria-invalid={Boolean(errors.consentChecked)}
                      className="mt-1 h-4 w-4 shrink-0 accent-[#298637]"
                    />
                    <span>
                      Estou ciente de que as informações fornecidas serão encaminhadas pelo WhatsApp
                      para atendimento da minha solicitação de visita e orçamento, conforme a{' '}
                      <button
                        type="button"
                        onClick={() => {
                          saveNow();
                          onOpenLegalDoc('privacy');
                        }}
                        className="font-semibold text-[#298637] underline underline-offset-2 hover:text-[#10291C]"
                      >
                        Política de Privacidade
                      </button>
                      .
                    </span>
                  </label>
                  {errors.consentChecked && (
                    <p className="mt-1.5 text-xs font-medium text-[#9e2a2b]">
                      {errors.consentChecked}
                    </p>
                  )}
                </div>
              </div>

              {!confirmedPayload ? (
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-lg bg-[#10291C] px-6 py-3 text-sm font-semibold text-[#F5F3E9] transition-colors hover:bg-[#1a3f2c]"
                  >
                    <WhatsAppIcon className="h-5 w-5 text-[#84C62B]" />
                    <span>Solicitar visita pelo WhatsApp</span>
                  </button>
                  <p className="text-xs text-[#10291C]/70">
                    Você revisará a mensagem antes de enviar.
                  </p>
                </div>
              ) : (
                <div
                  role="region"
                  aria-live="polite"
                  aria-label="Confirmação e revisão da mensagem para WhatsApp"
                  className="mt-7 rounded-xl border border-[#298637]/45 bg-white p-5"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#298637]"
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-[#10291C]">
                        Mensagem pronta para revisão no WhatsApp
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#10291C]/75">
                        Confira abaixo os dados que serão levados para o WhatsApp do Júlio. Nenhum
                        envio automático foi realizado; o envio só ocorre quando você confirmar no
                        aplicativo.
                      </p>

                      <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-[#BBA98D]/35 bg-[#FAF8F2] p-3.5 font-sans text-xs leading-relaxed text-[#10291C]">
                        {previewMessage}
                      </pre>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => saveNow()}
                          className="inline-flex min-h-[46px] items-center justify-center gap-2.5 rounded-lg bg-[#84C62B] px-5 py-2.5 text-sm font-semibold text-[#10291C] transition-colors hover:bg-[#95d63c]"
                        >
                          <WhatsAppIcon className="h-5 w-5" />
                          <span>Confirmar e abrir no WhatsApp</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            pendingScrollToFormStartRef.current = true;
                            setConfirmedPayload(null);
                          }}
                          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-[#BBA98D]/60 px-4 py-2 text-xs font-semibold text-[#10291C] transition-colors hover:bg-[#F5F3E9]"
                        >
                          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                          <span>Editar informações</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(hasContent || form.consentChecked) && (
                <div className="mt-5 flex min-h-[36px] flex-wrap items-center justify-between gap-3 border-t border-[#BBA98D]/30 pt-4">
                  <div
                    role="status"
                    aria-live="polite"
                    className="flex items-center gap-1.5 text-xs text-[#10291C]/75"
                  >
                    {storageAvailable && hasContent && draftStatus === 'saving' && (
                      <>
                        <Clock className="h-3.5 w-3.5 shrink-0 text-[#10291C]/60" aria-hidden="true" />
                        <span>Salvando rascunho...</span>
                      </>
                    )}
                    {storageAvailable && hasContent && draftStatus === 'saved' && (
                      <>
                        <Check className="h-3.5 w-3.5 shrink-0 text-[#298637]" aria-hidden="true" />
                        <span className="text-[#298637]">Rascunho salvo nesta sessão.</span>
                      </>
                    )}
                    {storageAvailable && hasContent && draftStatus === 'restored' && (
                      <>
                        <RotateCcw className="h-3.5 w-3.5 shrink-0 text-[#298637]" aria-hidden="true" />
                        <span className="text-[#298637]">Rascunho recuperado.</span>
                      </>
                    )}
                  </div>

                  {!confirmingClear ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (hasContent) {
                          setConfirmingClear(true);
                        } else {
                          handleConfirmClear();
                        }
                      }}
                      className="ml-auto inline-flex min-h-[34px] items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-[#10291C]/75 transition-colors hover:bg-[#10291C]/5 hover:text-[#10291C]"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Limpar formulário</span>
                    </button>
                  ) : (
                    <div
                      role="group"
                      aria-label="Confirmar limpeza do formulário"
                      className="ml-auto flex flex-wrap items-center gap-2"
                    >
                      <span className="text-xs font-medium text-[#10291C]/80">
                        Limpar dados salvos?
                      </span>
                      <button
                        type="button"
                        onClick={handleConfirmClear}
                        className="inline-flex min-h-[32px] items-center rounded-md bg-[#10291C] px-3 py-1 text-xs font-semibold text-[#F5F3E9] transition-colors hover:bg-[#1a3f2c]"
                      >
                        Confirmar limpeza
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingClear(false)}
                        className="inline-flex min-h-[32px] items-center rounded-md border border-[#BBA98D]/60 px-2.5 py-1 text-xs font-medium text-[#10291C] transition-colors hover:bg-white"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
