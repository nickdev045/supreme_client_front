type QuantityStepperProps = {
  value: number;
  min?: number;
  max: number;
  disabled?: boolean;
  fullWidth?: boolean;
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
  onChange,
  decreaseLabel,
  increaseLabel,
}: QuantityStepperProps) {
  return (
    <div
      className={[
        "flex h-11 items-center rounded-[10px] border border-[var(--border)] bg-white",
        fullWidth ? "w-full" : "w-fit",
      ].join(" ")}
    >
      <button
        type="button"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center border-0 bg-transparent text-lg leading-none font-semibold text-[var(--navy)] disabled:opacity-50"
        aria-label={decreaseLabel}
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        −
      </button>
      <span className="flex h-11 min-w-[2rem] flex-1 items-center justify-center text-center text-sm leading-none font-semibold tabular-nums text-[var(--navy)]">
        {value}
      </span>
      <button
        type="button"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center border-0 bg-transparent text-lg leading-none font-semibold text-[var(--navy)] disabled:opacity-50"
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
