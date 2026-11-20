import type { MetadataRoute } from "next";
import { absoluteUrl, getAllBookSlugs, getChapterSummaries } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
  ];

  for (const slug of getAllBookSlugs()) {
    entries.push({
      url: absoluteUrl(`/books/${slug}/`),
      changeFrequency: "monthly",
      priority: 0.8,
    });
    for (const ch of getChapterSummaries(slug)) {
      entries.push({
        url: absoluteUrl(`/books/${slug}/${ch.slug}/`),
        changeFrequency: "yearly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
