"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

/** Full page reload drops shop query filters once; later searches must keep them. */
export function ClearShopFiltersOnReload() {
  const router = useRouter();
  const didClear = useRef(false);

  useLayoutEffect(() => {
    if (didClear.current) return;

    const entry = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming | undefined;
    if (entry?.type !== "reload") return;
    if (!window.location.search) return;

    didClear.current = true;
    router.replace("/shop");
  }, [router]);

  return null;
}
