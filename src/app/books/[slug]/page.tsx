import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  absoluteUrl,
  getAllBookSlugs,
  getBookMeta,
  getChapterSummaries,
  withBase,
} from "@/lib/content";
import MermaidDiagram from "@/components/MermaidDiagram";
import ContinueButton from "@/components/ContinueButton";

export function generateStaticParams() {
  return getAllBookSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const meta = getBookMeta(params.slug);
  const url = absoluteUrl(`/books/${params.slug}/`);
  return {
    title: meta.title,
    description: meta.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "book",
      title: meta.title,
      description: meta.summary,
      url,
      ...(meta.cover ? { images: [{ url: absoluteUrl(meta.cover) }] } : {}),
    },
  };
}

export default function BookPage({ params }: { params: { slug: string } }) {
  if (!getAllBookSlugs().includes(params.slug)) notFound();

  const meta = getBookMeta(params.slug);
  const chapters = getChapterSummaries(params.slug);
  const firstChapter = chapters[0];
  const bookUrl = `/books/${params.slug}/`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: meta.title,
    author: { "@type": "Person", name: meta.author },
    bookFormat: "https://schema.org/EBook",
    inLanguage: "ar",
    url: absoluteUrl(bookUrl),
    description: meta.summary,
    ...(meta.pdf ? { workExample: { "@type": "Book", url: absoluteUrl(meta.pdf) } } : {}),
  };

  return (
    <article className="py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="مسار التصفح" className="mb-4 font-ui text-sm" style={{ color: "var(--ink-soft)" }}>
        <Link href="/" style={{ color: "var(--ink-soft)" }}>الرئيسية</Link>
        <span className="mx-2">/</span>
        <span>{meta.title}</span>
      </nav>

      <h1 className="font-read text-2xl font-bold leading-snug md:text-3xl" style={{ color: "var(--ink)" }}>
        {meta.title}
      </h1>

      <p className="mt-2 font-ui" style={{ color: "var(--ink-soft)" }}>
        من تأليف {meta.author}
        {meta.era ? `، يعود إلى ${meta.era}` : ""}، وتصنيفه عند فريق الموقع: {meta.category}.
      </p>

      <div className="mt-5 flex flex-wrap gap-2.5">
        {firstChapter && (
          <Link href={`${bookUrl}${firstChapter.slug}/`} className="btn btn-primary">
            ابدأ القراءة
          </Link>
        )}
        <ContinueButton bookSlug={params.slug} />
        {meta.pdf && (
          <a href={withBase(meta.pdf)} download className="btn">
            تحميل PDF
          </a>
        )}
      </div>

      {meta.summary && (
        <div className="card mt-6 max-w-measure p-4 font-ui leading-7" style={{ color: "var(--ink-soft)" }}>
          {meta.summary}
        </div>
      )}

      {meta.intro && <p className="book-text mt-6 max-w-measure">{meta.intro}</p>}

      {meta.structureDiagram && (
        <div className="mt-6 max-w-measure">
          <MermaidDiagram code={meta.structureDiagram} label={meta.structureDiagramLabel} />
        </div>
      )}

      {chapters.length > 0 && (
        <section className="mt-8 max-w-measure">
          <h2 className="mb-3 font-read text-xl font-bold" style={{ color: "var(--ink)" }}>
            فصول الكتاب
          </h2>
          <ul className="space-y-1">
            {chapters.map((ch) => (
              <li key={ch.slug}>
                <Link href={`${bookUrl}${ch.slug}/`} className="toc-link">
                  {ch.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
