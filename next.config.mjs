/**
 * هذا الملف هو الحل الجذري لمشكلة الروابط المكسورة (404) التي واجهتها سابقاً.
 *
 * المشكلة الأصلية: المستودع كان "turath-islamic-library"، أي أن الموقع يُنشر على
 *   https://username.github.io/turath-islamic-library/
 * وليس على جذر الدومين، فكل الروابط والأصول (CSS/JS) يجب أن تبدأ بـ
 *   /turath-islamic-library/  وإلا أشارت إلى عنوان خاطئ (ومن هنا جاء الـ 404
 *   و"عدم ظهور أي تنسيق").
 *
 * الحل هنا: نستخرج اسم المستودع تلقائياً من متغير البيئة الذي توفره GitHub Actions
 * (GITHUB_REPOSITORY = "owner/repo") أثناء البناء، ونحسب الـ basePath تلقائياً —
 * فلا حاجة لتعديل أي رقم أو اسم يدوياً بعد الآن، ولا يمكن تكرار نفس الخطأ.
 */
const repoFromEnv = process.env.GITHUB_REPOSITORY?.split("/")?.[1];
const isUserOrOrgRootSite = repoFromEnv ? /\.github\.io$/i.test(repoFromEnv) : true;
const basePath = repoFromEnv && !isUserOrOrgRootSite ? `/${repoFromEnv}` : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",            // تصدير HTML ثابت بالكامل لكل صفحة: أرشفة فورية وكاملة
  trailingSlash: true,          // يولّد books/slug/index.html بدل books/slug.html (أنسب لاستضافة ثابتة)
  images: { unoptimized: true },// لا يوجد خادم تحسين صور على GitHub Pages
  basePath,
  assetPrefix: basePath || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
