"use client";

import { useEffect, useRef } from "react";

interface Props {
  bookSlug: string;
  chapterPath: string; // المسار الكامل لهذا الفصل، يُستخدم للتحقق عند العودة لاحقاً
}

function progressKey(bookSlug: string) {
  return `maktabati-progress:${bookSlug}`;
}

export default function ReadingProgress({ bookSlug, chapterPath }: Props) {
  const barRef = useRef<HTMLDivElement>(null);
  const restored = useRef(false);

  useEffect(() => {
    // استعادة آخر موضع قراءة إن كنا نعود لنفس الفصل تحديداً
    try {
      const raw = localStorage.getItem(progressKey(bookSlug));
      if (raw) {
        const saved = JSON.parse(raw) as { chapterPath: string; scrollRatio: number };
        if (saved.chapterPath === chapterPath && !restored.current) {
          restored.current = true;
          requestAnimationFrame(() => {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo(0, Math.max(0, scrollable * saved.scrollRatio));
          });
        }
      }
    } catch {
      /* localStorage قد لا يكون متاحاً (وضع خاص)، نتجاهل بصمت */
    }

    let ticking = false;
    function update() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      if (barRef.current) barRef.current.style.width = `${Math.min(100, ratio * 100)}%`;
      try {
        localStorage.setItem(
          progressKey(bookSlug),
          JSON.stringify({ chapterPath, scrollRatio: ratio, updatedAt: Date.now() })
        );
      } catch {
        /* تجاهل */
      }
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("beforeunload", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("beforeunload", update);
    };
  }, [bookSlug, chapterPath]);

  return <div ref={barRef} className="progress-bar" aria-hidden="true" />;
}
