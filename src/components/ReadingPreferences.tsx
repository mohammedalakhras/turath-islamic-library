"use client";

import { useEffect, useRef, useState } from "react";

type Theme = "light" | "dark" | "sepia";
const THEME_KEY = "maktabati-theme";
const SCALE_KEY = "maktabati-font-scale";
const SCALE_STEPS = [0.9, 1, 1.1, 1.2, 1.3];

const THEMES: { id: Theme; label: string; swatch: string }[] = [
  { id: "light", label: "نهاري", swatch: "#F2EAD3" },
  { id: "sepia", label: "سيبيا", swatch: "#EADFC5" },
  { id: "dark", label: "ليلي", swatch: "#15110D" },
];

export default function ReadingPreferences() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [scaleIndex, setScaleIndex] = useState(1);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
    const savedScale = Number(localStorage.getItem(SCALE_KEY));
    if (savedTheme) setTheme(savedTheme);
    if (!Number.isNaN(savedScale) && SCALE_STEPS.includes(savedScale)) {
      setScaleIndex(SCALE_STEPS.indexOf(savedScale));
    }
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function applyTheme(next: Theme) {
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
  }

  function applyScale(index: number) {
    const clamped = Math.max(0, Math.min(SCALE_STEPS.length - 1, index));
    setScaleIndex(clamped);
    const value = SCALE_STEPS[clamped];
    document.documentElement.style.setProperty("--reading-scale", String(value));
    localStorage.setItem(SCALE_KEY, String(value));
  }

  const activeTheme = theme ?? "light";

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn !px-3"
        aria-expanded={open}
        aria-label="إعدادات القراءة: الخط والوضع الليلي"
      >
        <span aria-hidden className="font-ui text-sm font-bold">Aa</span>
      </button>

      {open && (
        <div
          className="card absolute start-0 top-12 z-50 w-64 animate-fade-in p-4 shadow-soft"
          role="menu"
        >
          <p className="mb-2 font-ui text-xs text-ink-soft">حجم الخط</p>
          <div className="mb-4 flex items-center justify-between gap-2">
            <button
              type="button"
              className="btn !rounded-lg !px-3 !py-1.5"
              onClick={() => applyScale(scaleIndex - 1)}
              disabled={scaleIndex === 0}
              aria-label="تصغير الخط"
            >
              أ-
            </button>
            <span className="font-ui text-xs text-ink-soft">
              {Math.round(SCALE_STEPS[scaleIndex] * 100)}٪
            </span>
            <button
              type="button"
              className="btn !rounded-lg !px-3 !py-1.5"
              onClick={() => applyScale(scaleIndex + 1)}
              disabled={scaleIndex === SCALE_STEPS.length - 1}
              aria-label="تكبير الخط"
            >
              أ+
            </button>
          </div>

          <p className="mb-2 font-ui text-xs text-ink-soft">وضع القراءة</p>
          <div className="flex gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTheme(t.id)}
                className="flex flex-1 flex-col items-center gap-1.5 rounded-lg border py-2 font-ui text-[.72rem]"
                style={{
                  borderColor: activeTheme === t.id ? "var(--accent)" : "var(--border)",
                  borderWidth: activeTheme === t.id ? 2 : 1,
                  color: "var(--ink)",
                }}
                aria-pressed={activeTheme === t.id}
              >
                <span
                  className="h-5 w-5 rounded-full border"
                  style={{ background: t.swatch, borderColor: "var(--border)" }}
                  aria-hidden
                />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
