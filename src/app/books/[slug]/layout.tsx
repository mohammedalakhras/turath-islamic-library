import { notFound } from "next/navigation";
import { getAllBookSlugs, getChapterSummaries } from "@/lib/content";
import BookShell from "@/components/BookShell";

export default function BookLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  if (!getAllBookSlugs().includes(params.slug)) notFound();

  const chapters = getChapterSummaries(params.slug);
  const bookUrl = `/books/${params.slug}/`;

  return (
    <BookShell bookSlug={params.slug} bookUrl={bookUrl} chapters={chapters}>
      {children}
    </BookShell>
  );
}
