import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "مكتبتي — أرشيف الكتب التراثية والأثرية",
    short_name: "مكتبتي",
    description: "مكتبة إلكترونية حرة لقراءة وتحميل الكتب التراثية والأثرية كاملة ومجاناً.",
    start_url: ".",
    display: "standalone",
    background_color: "#F2EAD3",
    theme_color: "#16423C",
    lang: "ar",
    dir: "rtl",
    icons: [{ src: "favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
