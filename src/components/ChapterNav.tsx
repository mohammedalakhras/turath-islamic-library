import Link from "next/link";

interface NavItem {
  href: string;
  title: string;
}

export default function ChapterNav({
  prev,
  next,
}: {
  prev: NavItem | null;
  next: NavItem | null;
}) {
  if (!prev && !next) return null;
  return (
    <nav
      aria-label="تنقّل بين الفصول"
      className="mt-10 flex gap-3 border-t pt-6 font-ui"
      style={{ borderColor: "var(--border)" }}
    >
      {prev ? (
        <Link href={prev.href} className="card flex-1 px-4 py-3">
          <span className="block text-xs" style={{ color: "var(--ink-soft)" }}>
            الفصل السابق
          </span>
          {prev.title}
        </Link>
      ) : (
        <span className="flex-1" />
      )}
      {next ? (
        <Link href={next.href} className="card flex-1 px-4 py-3 text-left">
          <span className="block text-xs" style={{ color: "var(--ink-soft)" }}>
            الفصل التالي
          </span>
          {next.title}
        </Link>
      ) : (
        <span className="flex-1" />
      )}
    </nav>
  );
}
