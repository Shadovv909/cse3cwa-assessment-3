"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PageTimer() {
  const pathname = usePathname();
  useEffect(() => {
    let started = performance.now();
    let elapsed = 0;
    let visible = document.visibilityState === "visible";
    let id = crypto.randomUUID();
    const flush = () => {
      if (visible) elapsed += performance.now() - started;
      visible = false;
      const durationMs = Math.min(86400000, Math.round(elapsed));
      if (durationMs >= 1000) {
        const payload = JSON.stringify({ id, page: pathname, durationMs });
        if (!navigator.sendBeacon("/api/visits", new Blob([payload], { type: "application/json" }))) {
          void fetch("/api/visits", { method: "POST", body: payload, keepalive: true }).catch(() => {});
        }
        id = crypto.randomUUID();
        elapsed = 0;
      }
    };
    const changed = () => {
      if (document.visibilityState === "hidden") flush();
      else { started = performance.now(); visible = true; }
    };
    document.addEventListener("visibilitychange", changed);
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      document.removeEventListener("visibilitychange", changed);
      window.removeEventListener("pagehide", flush);
    };
  }, [pathname]);
  return null;
}
