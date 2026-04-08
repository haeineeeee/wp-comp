/** Google API URL → PostCache 매칭 유틸리티 */

/** URL 정규화: 프로토콜, www, trailing slash, 쿼리, 프래그먼트 제거 */
export function normalizeUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[?#].*$/, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

/** URL에서 마지막 경로 세그먼트(slug) 추출 */
function extractSlug(url: string): string {
  const normalized = normalizeUrl(url);
  const segments = normalized.split("/").filter(Boolean);
  return segments[segments.length - 1] || "";
}

interface PostForMatching {
  id: string;
  slug: string;
}

/**
 * PostCache 목록과 사이트 URL로부터 매칭용 Map 2개를 생성합니다.
 * - urlMap: normalizedUrl → postCacheId (정확 매칭)
 * - slugMap: slug → postCacheId (폴백)
 */
export function buildPostMaps(
  posts: PostForMatching[],
  siteUrl: string
): { urlMap: Map<string, string>; slugMap: Map<string, string> } {
  const urlMap = new Map<string, string>();
  const slugMap = new Map<string, string>();
  const normalizedSite = normalizeUrl(siteUrl);

  for (const post of posts) {
    // 전체 URL 매칭: siteUrl + slug
    const fullUrl = `${normalizedSite}/${post.slug}`;
    urlMap.set(fullUrl, post.id);

    // slug 폴백 (동일 slug가 여러 사이트에 있으면 마지막 것이 남음,
    // 하지만 이 함수는 단일 사이트용이므로 괜찮음)
    slugMap.set(post.slug.toLowerCase(), post.id);
  }

  return { urlMap, slugMap };
}

/** Google API에서 받은 page URL을 PostCache ID에 매칭 */
export function matchUrlToPostId(
  pageUrl: string,
  urlMap: Map<string, string>,
  slugMap: Map<string, string>
): string | null {
  // 1차: 정규화된 전체 URL 매칭
  const normalized = normalizeUrl(pageUrl);
  const byUrl = urlMap.get(normalized);
  if (byUrl) return byUrl;

  // 2차: slug 폴백
  const slug = extractSlug(pageUrl);
  if (slug) {
    const bySlug = slugMap.get(slug.toLowerCase());
    if (bySlug) return bySlug;
  }

  return null;
}
