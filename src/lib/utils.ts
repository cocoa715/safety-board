/**
 * 다양한 날짜 형식을 YYYY-MM-DD로 정규화
 * 지원: YYYYMMDD, YYYY-MM-DD, YYYY.MM.DD, YYYY/MM/DD
 */
export function normalizeDate(raw: string): string {
  if (!raw) return "";
  if (/^\d{8}/.test(raw)) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  }
  const match = raw.match(/(\d{4})[-./](\d{2})[-./](\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  return raw;
}

/**
 * YYYY-MM-DD 형식 날짜가 최근 N일 이내인지 판단
 */
export function isRecent(dateStr: string, days: number = 7): boolean {
  const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return false;
  const post = new Date(+match[1], +match[2] - 1, +match[3]);
  return Date.now() - post.getTime() < days * 24 * 60 * 60 * 1000;
}

/**
 * 외부 사이트 href를 절대 URL로 변환
 * - 빈 값 / javascript: → fallback(목록 페이지)
 * - http(s)://  → 그대로 사용
 * - /path/...   → origin + path
 * - 상대 경로   → baseUrl + href
 */
export function resolveHref(
  href: string,
  baseUrl: string,
  listUrl: string,
): string {
  if (!href || href.startsWith("javascript:")) return listUrl;
  if (href.startsWith("http")) return href;
  if (href.startsWith("/")) {
    try {
      const origin = new globalThis.URL(listUrl).origin;
      return `${origin}${href}`;
    } catch {
      return listUrl;
    }
  }
  return `${baseUrl}${href}`;
}
