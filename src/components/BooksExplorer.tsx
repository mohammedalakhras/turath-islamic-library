"use client";

import { useMemo, useState } from "react";
import type { Book } from "@/lib/types";
import BookCard from "./BookCard";

export default function BooksExplorer({
  books,
  categories,
}: {
  books: Book[];
  categories: string[];
}) {
  const [filter, setFilter] = useState("الكل");

  const visible = useMemo(
    () => (filter === "الكل" ? books : books.filter((b) => b.category === filter)),
    [books, filter]
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="تصفية حسب التصنيف">
        {["الكل", ...categories].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className="rounded-full border px-3.5 py-1.5 font-ui text-sm transition-colors"
            style={{
              background: filter === cat ? "var(--primary)" : "var(--surface)",
              color: filter === cat ? "var(--primary-contrast)" : "var(--ink-soft)",
              borderColor: filter === cat ? "var(--primary)" : "var(--border)",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="font-ui text-sm" style={{ color: "var(--ink-soft)" }}>
          لا توجد كتب في هذا التصنيف حالياً.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((book) => (
            <BookCard key={book.slug} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
