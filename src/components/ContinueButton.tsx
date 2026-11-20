"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ContinueButton({ bookSlug }: { bookSlug: string }) {
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`maktabati-progress:${bookSlug}`);
      if (raw) {
        const saved = JSON.parse(raw) as { chapterPath: string };
        if (saved.chapterPath) setHref(saved.chapterPath);
      }
    } catch {
      /* تجاهل */
    }
  }, [bookSlug]);

  if (!href) return null;

  return (
    <Link href={href} className="btn">
      تابع من حيث توقفت
    </Link>
  );
}
