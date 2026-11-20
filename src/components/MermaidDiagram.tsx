"use client";

import { useEffect, useId, useRef, useState } from "react";

interface Props {
  code: string;
  label?: string;
}

export default function MermaidDiagram({ code, label }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId().replace(/[:]/g, "");
  const [open, setOpen] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!open) return;

    import("mermaid").then(async (mod) => {
      const mermaid = mod.default;
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? "dark" : "base",
        securityLevel: "strict",
        themeVariables: {
          fontFamily: "var(--font-tajawal), sans-serif",
          primaryColor: isDark ? "#22312C" : "#E4ECE9",
          primaryTextColor: isDark ? "#EFE6D2" : "#1E2A28",
          primaryBorderColor: "var(--accent)",
          lineColor: "var(--accent)",
        },
      });
      try {
        const { svg } = await mermaid.render(`mmd-${id}`, code.trim());
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      } catch {
        if (!cancelled) setError(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [code, id, open]);

  return (
    <div className="diagram-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mb-3 font-ui text-sm font-medium"
        style={{ color: "var(--primary)" }}
        aria-expanded={open}
      >
        {open ? "▾" : "◂"} {label || "مخطط توضيحي"}
      </button>

      {open && (
        <div className="scroll-x">
          {error ? (
            <p className="font-ui text-sm" style={{ color: "var(--ink-soft)" }}>
              تعذّر عرض المخطط.
            </p>
          ) : (
            <div ref={ref} aria-hidden="true" />
          )}
        </div>
      )}

      <p className="diagram-note">
        <span aria-hidden>ⓘ</span>
        هذه المشجرة ليست من تأليف الكاتب، إنما هي مجرد رسمة توضيحية أضافها فريق الموقع لتسهيل
        القراءة والتصفح، ولا تُعدّ جزءاً من النص الأصلي للكتاب.
      </p>
    </div>
  );
}
