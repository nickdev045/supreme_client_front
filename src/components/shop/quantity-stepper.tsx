type QuantityStepperProps = {
  value: number;
  min?: number;
  max: number;
  disabled?: boolean;
  fullWidth?: boolean;
  compact?: boolean;
  onChange: (next: number) => void;
  decreaseLabel: string;
  increaseLabel: string;
};

export function QuantityStepper({
  value,
  min = 1,
  max,
  disabled = false,
  fullWidth = false,
  compact = false,
  onChange,
  decreaseLabel,
  increaseLabel,
}: QuantityStepperProps) {
  const controlSize = compact ? "h-9 w-9" : "h-11 w-11";
  return (
    <div
      className={[
        "flex min-w-0 items-center rounded-[10px] border border-[var(--border)] bg-white",
        compact ? "h-9" : "h-11",
        fullWidth ? "w-full" : "w-fit",
      ].join(" ")}
    >
      <button
        type="button"
        className={`inline-flex ${controlSize} shrink-0 items-center justify-center border-0 bg-transparent text-lg leading-none font-semibold text-[var(--navy)] transition-colors duration-200 hover:bg-[var(--cream)] disabled:opacity-50`}
        aria-label={decreaseLabel}
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        −
      </button>
      <span className="flex min-w-0 flex-1 items-center justify-center text-center text-sm leading-none font-semibold tabular-nums text-[var(--navy)]">
        {value}
      </span>
      <button
        type="button"
        className={`inline-flex ${controlSize} shrink-0 items-center justify-center border-0 bg-transparent text-lg leading-none font-semibold text-[var(--navy)] transition-colors duration-200 hover:bg-[var(--cream)] disabled:opacity-50`}
        aria-label={increaseLabel}
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        +
      </button>
    </div>
  );
}

export function maxOrderQuantity(stock: number): number {
  if (!Number.isFinite(stock)) return 0;
  return Math.max(0, Math.floor(stock));
}
