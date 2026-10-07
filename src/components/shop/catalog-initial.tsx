export function catalogInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

type CatalogInitialMarkProps = {
  name: string;
  className?: string;
};

export function CatalogInitialMark({ name, className }: CatalogInitialMarkProps) {
  return (
    <span
      aria-hidden
      className={[
        "inline-flex items-center justify-center rounded-full bg-white font-bold text-[var(--navy)]",
        className ?? "h-12 w-12 text-lg sm:h-16 sm:w-16 sm:text-xl",
      ].join(" ")}
    >
      {catalogInitial(name)}
    </span>
  );
}
