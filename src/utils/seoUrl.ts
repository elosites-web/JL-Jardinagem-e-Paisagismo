export const SITE_ORIGIN = 'https://jljardinagem.netlify.app';
export const SITE_URL = `${SITE_ORIGIN}/`;
export const OG_IMAGE_PATH = '/images/og-jl-jardinagem-paisagismo.jpg';
export const OG_IMAGE_URL = `${SITE_ORIGIN}${OG_IMAGE_PATH}`;
export const OG_IMAGE_TYPE = 'image/jpeg';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_ALT =
  'JL Jardinagem e Paisagismo em Jundiaí e região — Transformamos espaços em natureza, beleza e vida, com fotografia de canteiro paisagístico residencial';

/**
 * Normaliza uma URL de site para origem HTTPS absoluta sem barra final.
 */
export function normalizeHttpsSiteOrigin(rawSiteUrl: string = SITE_URL): string {
  if (typeof rawSiteUrl !== 'string') return '';
  const trimmed = rawSiteUrl.trim();
  if (!trimmed) return '';

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return '';
    }
    if (!parsed.hostname) {
      return '';
    }
    return `https://${parsed.host}`;
  } catch {
    return '';
  }
}

/**
 * Resolve a URL absoluta HTTPS da OG image a partir da URL base configurada
 * (ou caminho relativo caso uma origem vazia seja informada explicitamente).
 */
export function resolveOgImageUrl(
  rawSiteUrl: string = SITE_URL,
  imagePath: string = OG_IMAGE_PATH,
): string {
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  const origin = normalizeHttpsSiteOrigin(rawSiteUrl);
  return origin ? `${origin}${normalizedPath}` : normalizedPath;
}
