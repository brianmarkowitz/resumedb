"use client";

import clsx from "clsx";
import type { QueryMode } from "@/lib/resumedb/types";

type ModeToggleProps = {
  mode: QueryMode;
  onChange: (mode: QueryMode) => void;
};

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="mode-toggle" role="group" aria-label="Display mode">
      <button
        type="button"
        onClick={() => onChange("simple")}
        className={clsx("mode-toggle__btn", mode === "simple" && "mode-toggle__btn--active")}
      >
        Simple
      </button>
      <button
        type="button"
        onClick={() => onChange("pro")}
        className={clsx("mode-toggle__btn", mode === "pro" && "mode-toggle__btn--active")}
      >
        Pro
      </button>
    </div>
  );
}
