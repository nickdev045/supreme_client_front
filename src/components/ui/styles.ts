export const btn = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-[10px] border-2 border-[var(--navy)] bg-[var(--navy)] px-5 py-2.5 text-[0.9rem] font-semibold text-[var(--cream)] transition hover:-translate-y-px hover:bg-[var(--navy-light)] hover:shadow-[var(--shadow)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60",
  accent:
    "inline-flex items-center justify-center gap-2 rounded-[10px] border-2 border-[var(--tomato)] bg-[var(--tomato)] px-5 py-2.5 text-[0.9rem] font-semibold text-white transition hover:-translate-y-px hover:brightness-105 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60",
  outline:
    "inline-flex items-center justify-center gap-2 rounded-[10px] border-2 border-[var(--navy)] bg-transparent px-5 py-2.5 text-[0.9rem] font-semibold text-[var(--navy)] transition hover:-translate-y-px hover:bg-[var(--navy)] hover:text-[var(--cream)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60",
  outlineLight:
    "inline-flex items-center justify-center gap-2 rounded-[10px] border-2 border-[var(--cream)] bg-transparent px-5 py-2.5 text-[0.9rem] font-semibold text-[var(--cream)] transition hover:-translate-y-px hover:bg-[var(--cream)] hover:text-[var(--navy)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60",
  sm: "px-[0.85rem] py-[0.4rem] text-[0.8rem]",
} as const;

export const fieldClass =
  "w-full rounded-[10px] border border-[var(--border)] bg-white px-[0.85rem] py-[0.65rem] text-[0.95rem] text-[var(--text)] outline-none transition focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-[var(--navy)]";

export const labelClass =
  "mb-[0.35rem] block text-[0.85rem] font-semibold text-[var(--navy)]";
