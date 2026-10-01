import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PageTimer } from "@/components/monitoring/page-timer";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-frame">
      <PageTimer />
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content" className="page-shell">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
