"use client";

import { useEffect, useId, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { btn } from "@/components/ui/styles";

const subscribeToClientRender = () => () => {};

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  pending?: boolean;
  tone?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  pending = false,
  tone = "default",
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const mounted = useSyncExternalStore(subscribeToClientRender, () => true, () => false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const onCancelRef = useRef(onCancel);
  const pendingRef = useRef(pending);

  useEffect(() => {
    onCancelRef.current = onCancel;
    pendingRef.current = pending;
  }, [onCancel, pending]);

  useEffect(() => {
    if (!mounted || !open) return;
    const previouslyFocusedElement = document.activeElement as HTMLElement | null;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pendingRef.current) onCancelRef.current();
    }

    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
      previouslyFocusedElement?.focus();
    };
  }, [mounted, open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-end justify-center bg-black/45 p-4 sm:items-center"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="w-full max-w-md rounded-[14px] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]"
      >
        <h2 id={titleId} className="mt-0 mb-2 text-lg font-bold text-[var(--navy)]">
          {title}
        </h2>
        {description ? (
          <p id={descriptionId} className="mt-0 mb-4 text-sm text-[var(--text-muted)]">
            {description}
          </p>
        ) : null}
        {children}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            ref={cancelButtonRef}
            type="button"
            className={`${btn.outline} ${btn.sm}`}
            disabled={pending}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`${tone === "danger" ? btn.accent : btn.primary} ${btn.sm}`}
            disabled={pending}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
