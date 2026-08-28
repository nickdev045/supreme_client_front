export const btn = {
  primary:
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border-2 border-[var(--navy)] bg-[var(--navy)] px-5 py-2.5 text-[0.9rem] font-semibold text-[var(--cream)] transition-[color,background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-[var(--navy-hover)] hover:bg-[var(--navy-hover)] hover:shadow-[var(--shadow)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-[var(--navy)] disabled:hover:bg-[var(--navy)] disabled:hover:shadow-none",
  accent:
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border-2 border-[var(--tomato)] bg-[var(--tomato)] px-5 py-2.5 text-[0.9rem] font-semibold text-white transition-[color,background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:bg-white hover:text-[var(--tomato)] hover:shadow-[var(--shadow)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[var(--tomato)] disabled:hover:text-white disabled:hover:shadow-none",
  outline:
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border-2 border-[var(--navy)] bg-transparent px-5 py-2.5 text-[0.9rem] font-semibold text-[var(--navy)] transition-[color,background-color,transform] duration-200 hover:-translate-y-px hover:bg-[var(--navy)] hover:text-[var(--cream)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-[var(--navy)]",
  outlineLight:
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border-2 border-[var(--cream)] bg-transparent px-5 py-2.5 text-[0.9rem] font-semibold text-[var(--cream)] transition-[color,background-color,transform] duration-200 hover:-translate-y-px hover:bg-[var(--cream)] hover:text-[var(--navy)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60",
  quiet:
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--navy)] transition-[color,background-color,border-color] duration-200 hover:border-[var(--navy)] hover:bg-[var(--navy)] hover:text-[var(--cream)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-[var(--border)] disabled:hover:bg-white disabled:hover:text-[var(--navy)]",
  dangerQuiet:
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition-[color,background-color,border-color] duration-200 hover:border-[var(--tomato)] hover:bg-[var(--tomato)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50",
  icon:
    "inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-[10px] border border-transparent text-[var(--navy)] transition-[color,background-color,border-color] duration-200 hover:border-[var(--navy)] hover:bg-[var(--cream)] disabled:cursor-not-allowed disabled:opacity-50",
  iconDanger:
    "inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-[10px] border border-transparent text-[var(--tomato)] transition-[color,background-color,border-color] duration-200 hover:border-[var(--tomato)] hover:bg-[rgba(199,62,46,0.12)] disabled:cursor-not-allowed disabled:opacity-50",
  sm: "px-[0.85rem] py-[0.4rem] text-[0.8rem]",
} as const;

export const fieldClass =
  "w-full rounded-[10px] border border-[var(--border)] bg-white px-[0.85rem] py-[0.65rem] text-[0.95rem] text-[var(--text)] outline-none transition focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-[var(--navy)]";

export const labelClass =
  "mb-[0.35rem] block text-[0.85rem] font-semibold text-[var(--navy)]";
