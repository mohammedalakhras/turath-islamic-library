import type { Metadata } from "next";
import { Amiri, Tajawal } from "next/font/google";
import Header from "@/components/Header";
import { SITE_URL, absoluteUrl } from "@/lib/content";
import "./globals.css";

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-amiri",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
});

const SITE_TITLE = "مكتبتي";
const SITE_DESCRIPTION =
  "مكتبتي — أرشيف إلكتروني حر لأمهات الكتب التراثية والأثرية، يتيح قراءة وتحميل نصوصها الكاملة مجاناً دون تحريف أو تلخيص، مع فهارس تفاعلية وبحث داخل نصوص كل كتاب.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_TITLE}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_TITLE,
  keywords: ["مكتبة إلكترونية", "كتب تراثية", "كتب أثرية", "تراث إسلامي", "مخطوطات", "كتب pdf"],
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    type: "website",
    locale: "ar_AR",
    siteName: SITE_TITLE,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  icons: { icon: "/favicon.svg" },
};

// يُطبَّق الوضع (ليلي/سيبيا/نهاري) وحجم الخط المحفوظان قبل أول رسم للصفحة
// لتفادي "وميض" تغيّر اللون بعد التحميل (FOUC)
const themeScript = `
(function(){
  try{
    var t = localStorage.getItem('maktabati-theme');
    if (t) document.documentElement.setAttribute('data-theme', t);
    var s = localStorage.getItem('maktabati-font-scale');
    if (s) document.documentElement.style.setProperty('--reading-scale', s);
  }catch(e){}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${amiri.variable} ${tajawal.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_TITLE,
              description: SITE_DESCRIPTION,
              url: absoluteUrl("/"),
              inLanguage: "ar",
            }),
          }}
        />
      </head>
      <body className="font-ui">
        <Header />
        {children}
      </body>
    </html>
  );
}
