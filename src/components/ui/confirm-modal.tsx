"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

import { btn } from "@/components/ui/styles";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCancelRef = useRef(onCancel);
  const pendingRef = useRef(pending);

  useEffect(() => {
    onCancelRef.current = onCancel;
    pendingRef.current = pending;
  }, [onCancel, pending]);

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pendingRef.current) {
        onCancelRef.current();
      }
    }

    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/45 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) onCancel();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-full max-w-md rounded-[14px] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)] outline-none"
      >
        <h2 id={titleId} className="m-0 text-base font-semibold text-[var(--navy)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 mb-0 text-sm text-[var(--text-muted)]">{description}</p>
        ) : null}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" disabled={pending} onClick={onCancel} className={btn.outline}>
            {cancelLabel}
          </button>
          <button type="button" disabled={pending} onClick={onConfirm} className={btn.primary}>
            {pending ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
