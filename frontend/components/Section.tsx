"use client";

import React from "react";

export default function Section({ title, children, subtitle }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true);
  const id = React.useId();
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  // Manage expand/collapse using measured height so the section can grow without a fixed max-height
  React.useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const elRef = el; // capture a stable non-null reference for handlers

    function onTransitionEnd() {
      // after expanding, remove maxHeight to allow unlimited growth
      if (open) {
        elRef.style.maxHeight = 'none';
      }
      elRef.removeEventListener('transitionend', onTransitionEnd);
    }

    if (open) {
      elRef.style.display = 'block';
      elRef.style.opacity = '1';
      // set to current scroll height then let transition run
      elRef.style.maxHeight = elRef.scrollHeight + 'px';
      elRef.addEventListener('transitionend', onTransitionEnd);
    } else {
      // collapse: set explicit height then transition to 0
      elRef.style.maxHeight = elRef.scrollHeight + 'px';
      // force reflow
      void elRef.offsetHeight;
      elRef.style.opacity = '0';
      elRef.style.maxHeight = '0px';
    }

    return () => {
      try {
        elRef.removeEventListener('transitionend', onTransitionEnd);
      } catch (e) {
        // ignore if element removed
      }
    };
  }, [open]);

  return (
<section
  className="
    mb-10 pb-6
    border-b border-zinc-200 dark:border-zinc-800
  "
>
  {/* Header */}
  <div className="mb-4 flex items-center justify-between">
    <div className="relative pl-4">
      {/* Accent bar */}
      <span
        className="
          absolute left-1 top-1 bottom-1 w-1 rounded-full
          bg-zinc-800 dark:bg-zinc-300
        "
      />

      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>

      {subtitle ? (
        <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {subtitle}
        </div>
      ) : null}
    </div>

    <button
      aria-expanded={open}
      aria-controls={`section-${id}`}
      onClick={() => setOpen((s) => !s)}
      title={open ? "Collapse section" : "Expand section"}
      className="
        rounded-lg px-4 py-1.5 text-sm font-medium
        border border-zinc-200 dark:border-zinc-800
        bg-white dark:bg-zinc-900
        text-zinc-700 dark:text-zinc-300
        hover:bg-zinc-100 dark:hover:bg-zinc-800
        transition-colors
      "
    >
      {open ? "Collapse" : "Expand"}
    </button>
  </div>

  {/* Content */}
  <div
    id={`section-${id}`}
    className="overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out"
  >
    <div
      ref={contentRef}
      style={{
        maxHeight: open ? "none" : "0px",
        opacity: open ? 1 : 0,
      }}
      className="
        mt-3 rounded-xl border
        border-zinc-200 dark:border-zinc-800
        bg-zinc-50 dark:bg-zinc-900
        p-5
      "
    >
      {children}
    </div>
  </div>
</section>


  );
}
