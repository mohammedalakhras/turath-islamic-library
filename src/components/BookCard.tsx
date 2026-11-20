"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Book } from "@/lib/types";
import { withBase } from "@/lib/site";

export default function BookCard({ book }: { book: Book }) {
  const [hasProgress, setHasProgress] = useState(false);

  useEffect(() => {
    try {
      setHasProgress(!!localStorage.getItem(`maktabati-progress:${book.slug}`));
    } catch {
      /* تجاهل */
    }
  }, [book.slug]);

  return (
    <Link
      href={`/books/${book.slug}/`}
      className="card group flex flex-col overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-soft"
      data-category={book.category}
    >
      <div
        className="flex aspect-[3/4] items-center justify-center font-read text-3xl"
        style={{ background: "var(--accent-soft)", color: "var(--primary)" }}
      >
        {book.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={withBase(book.cover)}
            alt={`غلاف كتاب ${book.title}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden>📖</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="mb-1 font-ui text-xs" style={{ color: "var(--accent)" }}>
          {book.category}
        </p>
        <h3 className="mb-1 font-read text-base font-bold leading-snug" style={{ color: "var(--ink)" }}>
          {book.title}
        </h3>
        <p className="font-ui text-sm" style={{ color: "var(--ink-soft)" }}>
          {book.author}
        </p>
        <span
          className="mt-3 font-ui text-xs font-bold"
          style={{ color: hasProgress ? "var(--accent)" : "var(--ink-soft)" }}
        >
          {hasProgress ? "تابع القراءة ←" : `${book.chaptersCount} فصلاً`}
        </span>
      </div>
    </Link>
  );
}
