export interface ConsentPreferences {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string | null;
}

export interface TrackingConfig {
  googleAnalyticsId: string;
  googleTagManagerId: string;
  metaPixelId: string;
  enabled: boolean;
}

export const DEFAULT_CONSENT_PREFERENCES: ConsentPreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  decidedAt: null,
};

/**
 * Determina se o banner/gerenciador de consentimento precisa ser exibido.
 * Enquanto ferramentas não essenciais estiverem desativadas na configuração,
 * nenhum banner ou armazenamento local é acionado.
 */
export function hasActiveNonEssentialTracking(config: TrackingConfig): boolean {
  if (!config.enabled) return false;
  return Boolean(
    config.googleAnalyticsId.trim() ||
      config.googleTagManagerId.trim() ||
      config.metaPixelId.trim(),
  );
}

export function canExecuteAnalytics(
  config: TrackingConfig,
  preferences: ConsentPreferences,
): boolean {
  return hasActiveNonEssentialTracking(config) && preferences.analytics;
}

export function canExecuteMarketing(
  config: TrackingConfig,
  preferences: ConsentPreferences,
): boolean {
  return hasActiveNonEssentialTracking(config) && preferences.marketing;
}

export function acceptAllConsent(isoNow: string): ConsentPreferences {
  return {
    essential: true,
    analytics: true,
    marketing: true,
    decidedAt: isoNow,
  };
}

export function rejectNonEssentialConsent(isoNow: string): ConsentPreferences {
  return {
    essential: true,
    analytics: false,
    marketing: false,
    decidedAt: isoNow,
  };
}
