// دوال آمنة للاستخدام من أي مكان (خادم أو متصفح) — لا تعتمد على fs/path،
// بخلاف content.ts الذي يُقرأ فيه المحتوى من القرص وقت البناء فقط.

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.github.io";
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** رابط مطلق كامل (دومين + basePath + مسار)، يُستخدم في metadataBase والـ sitemap وJSON-LD */
export function absoluteUrl(pathname: string): string {
  const clean = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_URL}${BASE_PATH}${clean}`;
}

/** يحسب رابط أصل عام (pdf/غلاف) مع مراعاة الـ basePath عند النشر على GitHub Pages */
export function withBase(assetPath: string): string {
  if (!assetPath.startsWith("/")) return `${BASE_PATH}/${assetPath}`;
  return `${BASE_PATH}${assetPath}`;
}
