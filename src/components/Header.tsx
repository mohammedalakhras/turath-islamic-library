import Link from "next/link";
import ReadingPreferences from "./ReadingPreferences";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-40 flex items-center gap-3 border-b px-4 py-3 md:px-6"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <Link href="/" className="flex items-center gap-2.5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-read text-lg"
          style={{ background: "var(--primary)", color: "var(--primary-contrast)" }}
          aria-hidden
        >
          {/* ضع شعارك هنا لاحقاً: استبدل هذا بـ <Image src="/logo.svg" .../> */}
          م
        </span>
        <span className="font-read text-lg font-bold leading-tight" style={{ color: "var(--ink)" }}>
          مكتبتي
          <small className="block font-ui text-[.7rem] font-normal" style={{ color: "var(--ink-soft)" }}>
            أرشيف الكتب التراثية والأثرية
          </small>
        </span>
      </Link>

      <div className="flex-1" />

      <ReadingPreferences />
    </header>
  );
}
