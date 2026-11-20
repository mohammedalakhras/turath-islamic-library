"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { ChapterSummary } from "@/lib/types";

interface Props {
  bookSlug: string;
  bookUrl: string;
  chapters: ChapterSummary[];
  children: ReactNode;
}

export default function BookShell({ bookUrl, chapters, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // أغلق الدرج تلقائياً عند تغيّر الصفحة (اختيار فصل)
  useEffect(() => setOpen(false), [pathname]);

  const Toc = (
    <nav aria-label="فهرس الكتاب">
      <p className="mb-3 font-read text-sm" style={{ color: "var(--ink-soft)" }}>
        فهرس الكتاب
      </p>
      <ul className="space-y-0.5">
        <li>
          <Link href={bookUrl} className="toc-link" data-active={pathname === bookUrl}>
            صفحة الكتاب الرئيسية
          </Link>
        </li>
        {chapters.map((ch) => {
          const href = `${bookUrl}${ch.slug}/`;
          return (
            <li key={ch.slug}>
              <Link href={href} className="toc-link" data-active={pathname === href}>
                {ch.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <div className="mx-auto max-w-[1100px] px-4 md:px-6">
      <div className="grid gap-8 md:grid-cols-[1fr_270px] md:items-start">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn mb-4 md:hidden"
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            ☰ فهرس الكتاب
          </button>
          {children}
        </div>

        {/* قائمة ثابتة على الشاشات الواسعة */}
        <aside className="sticky top-20 hidden border-s ps-5 md:block" style={{ borderColor: "var(--border)" }}>
          {Toc}
        </aside>
      </div>

      {/* قائمة قابلة للطي (Off-canvas) على الجوال */}
      {open && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="إغلاق الفهرس"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/35"
          />
          <div
            className="absolute inset-y-0 right-0 w-[82vw] max-w-[320px] overflow-y-auto p-5 pt-16 shadow-soft"
            style={{ background: "var(--surface)" }}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn absolute end-4 top-4 !h-9 !w-9 !p-0"
              aria-label="إغلاق"
            >
              ✕
            </button>
            {Toc}
          </div>
        </div>
      )}
    </div>
  );
}
