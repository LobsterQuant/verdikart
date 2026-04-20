"use client";

import { useId } from "react";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** Formatted string shown on the right side of the label row. */
  displayValue: string;
  /** Optional helper text rendered under the track (e.g. data provenance). */
  helper?: string;
  disabled?: boolean;
  /** Accessible name override — defaults to `label`. */
  ariaLabel?: string;
}

/**
 * Keyboard-accessible range slider. Wraps a native <input type="range"> so tab,
 * arrow keys, Page Up/Down, Home and End all work without extra wiring. Styled
 * to match the site's accent (mint) — thumb + filled track share colour.
 */
export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  displayValue,
  helper,
  disabled = false,
  ariaLabel,
}: SliderProps) {
  const inputId = useId();
  const fillPct = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <div className={disabled ? "opacity-60" : ""}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
        <span className="tabular-nums text-sm font-semibold text-foreground">
          {displayValue}
        </span>
      </div>
      <input
        id={inputId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={ariaLabel ?? label}
        className="verdikart-slider h-1.5 w-full cursor-pointer appearance-none rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed"
        style={{
          background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${fillPct}%, rgb(var(--card-border-rgb, 148 163 184 / 0.25)) ${fillPct}%, rgb(var(--card-border-rgb, 148 163 184 / 0.25)) 100%)`,
        }}
      />
      {helper && <p className="mt-1.5 text-xs text-text-tertiary">{helper}</p>}
    </div>
  );
}
