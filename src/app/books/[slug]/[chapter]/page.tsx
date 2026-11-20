import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  absoluteUrl,
  getAllBookSlugs,
  getBookMeta,
  getChapterData,
  getChapterSummaries,
} from "@/lib/content";
import MermaidDiagram from "@/components/MermaidDiagram";
import ReadingProgress from "@/components/ReadingProgress";
import ChapterNav from "@/components/ChapterNav";

export function generateStaticParams() {
  return getAllBookSlugs().flatMap((slug) =>
    getChapterSummaries(slug).map((ch) => ({ slug, chapter: ch.slug }))
  );
}

export function generateMetadata({
  params,
}: {
  params: { slug: string; chapter: string };
}): Metadata {
  const bookMeta = getBookMeta(params.slug);
  const chapter = getChapterData(params.slug, params.chapter);
  if (!chapter) return {};
  const url = absoluteUrl(`/books/${params.slug}/${params.chapter}/`);
  const firstParagraph = chapter.sections[0]?.paragraphs[0] ?? "";
  const description = `${chapter.title} — من كتاب ${bookMeta.title} لـ${bookMeta.author}. ${firstParagraph}`.slice(
    0,
    300
  );
  return {
    title: `${chapter.title} — ${bookMeta.title}`,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", title: chapter.title, description, url },
  };
}

export default function ChapterPage({
  params,
}: {
  params: { slug: string; chapter: string };
}) {
  if (!getAllBookSlugs().includes(params.slug)) notFound();

  const bookMeta = getBookMeta(params.slug);
  const chapters = getChapterSummaries(params.slug);
  const chapter = getChapterData(params.slug, params.chapter);
  if (!chapter) notFound();

  const bookUrl = `/books/${params.slug}/`;
  const chapterPath = `${bookUrl}${params.chapter}/`;

  const index = chapters.findIndex((c) => c.slug === params.chapter);
  const prevCh = index > 0 ? chapters[index - 1] : null;
  const nextCh = index >= 0 && index < chapters.length - 1 ? chapters[index + 1] : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Chapter",
    name: chapter.title,
    isPartOf: { "@type": "Book", name: bookMeta.title, author: { "@type": "Person", name: bookMeta.author } },
    url: absoluteUrl(chapterPath),
    inLanguage: "ar",
  };

  let paragraphCounter = 0;

  return (
    <article className="py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingProgress bookSlug={params.slug} chapterPath={chapterPath} />

      <nav aria-label="مسار التصفح" className="mb-4 font-ui text-sm" style={{ color: "var(--ink-soft)" }}>
        <Link href="/" style={{ color: "var(--ink-soft)" }}>الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link href={bookUrl} style={{ color: "var(--ink-soft)" }}>{bookMeta.title}</Link>
        <span className="mx-2">/</span>
        <span>{chapter.title}</span>
      </nav>

      <h1 className="font-read text-2xl font-bold leading-snug md:text-3xl" style={{ color: "var(--ink)" }}>
        {chapter.title}
      </h1>

      {chapter.diagram && (
        <div className="mt-5 max-w-measure">
          <MermaidDiagram code={chapter.diagram} label={chapter.diagramLabel} />
        </div>
      )}

      <div className="book-text mt-6 max-w-measure">
        {chapter.sections.map((section, sIdx) => (
          <section key={sIdx}>
            {section.heading && (
              <h2 className="mb-4 mt-8 font-bold first:mt-0" style={{ color: "var(--ink)" }}>
                {section.heading}
              </h2>
            )}
            {section.paragraphs.map((text, pIdx) => {
              paragraphCounter += 1;
              const id = `p-${paragraphCounter}`;
              return (
                <p key={pIdx} id={id}>
                  <a href={`#${id}`} className="pilcrow" aria-label="رابط دائم لهذه الفقرة">
                    #
                  </a>
                  {text}
                </p>
              );
            })}
          </section>
        ))}
      </div>

      <div className="max-w-measure">
        <ChapterNav
          prev={prevCh ? { href: `${bookUrl}${prevCh.slug}/`, title: prevCh.title } : null}
          next={nextCh ? { href: `${bookUrl}${nextCh.slug}/`, title: nextCh.title } : null}
        />
      </div>
    </article>
  );
}
