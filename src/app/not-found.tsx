import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-measure px-4 py-20 text-center md:px-6">
      <h1 className="font-read text-3xl font-bold" style={{ color: "var(--ink)" }}>
        هذه الصفحة غير موجودة
      </h1>
      <p className="mt-3 font-ui" style={{ color: "var(--ink-soft)" }}>
        قد يكون الرابط قديماً أو غير صحيح. يمكنك العودة إلى الصفحة الرئيسية ومتابعة تصفح الكتب من
        هناك.
      </p>
      <Link href="/" className="btn btn-primary mt-6 inline-flex">
        العودة إلى المكتبة
      </Link>
    </main>
  );
}
