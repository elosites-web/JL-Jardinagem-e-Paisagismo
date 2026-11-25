export const OG_IMAGE_PATH = '/images/og-jl-jardinagem-paisagismo.jpg';
export const OG_IMAGE_TYPE = 'image/jpeg';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_ALT =
  'JL Jardinagem e Paisagismo em Jundiaí e região — Transformamos espaços em natureza, beleza e vida, com fotografia de canteiro paisagístico residencial';

/**
 * Normaliza o domínio oficial de produção (VITE_SITE_URL) para origem HTTPS absoluta,
 * sem barra final. Retorna string vazia enquanto o domínio não estiver definido.
 */
export function normalizeHttpsSiteOrigin(rawSiteUrl?: string | null): string {
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
 * Resolve a URL da OG image: retorna URL absoluta HTTPS quando o domínio oficial
 * estiver configurado em VITE_SITE_URL ou o caminho relativo padronizado enquanto pendente.
 */
export function resolveOgImageUrl(
  rawSiteUrl?: string | null,
  imagePath: string = OG_IMAGE_PATH,
): string {
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  const origin = normalizeHttpsSiteOrigin(rawSiteUrl);
  return origin ? `${origin}${normalizedPath}` : normalizedPath;
}

/**
 * Atualiza as meta tags de imagem OG e Twitter no HTML quando houver URL resolvida
 * (como URL absoluta HTTPS em build de produção com VITE_SITE_URL definida).
 */
export function injectOgImageUrlsIntoHtml(html: string, imageUrl: string): string {
  if (!imageUrl || imageUrl === OG_IMAGE_PATH) {
    return html;
  }

  return html.replace(
    /(<meta\s+(?:property="(?:og:image|og:image:secure_url)"|name="twitter:image")\s+content=")([^"]+)(")/g,
    `$1${imageUrl}$3`,
  );
}
