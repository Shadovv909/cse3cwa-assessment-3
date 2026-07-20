import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import {
  SettingsProvider,
  settingsInitScript,
} from "@/components/settings/settings-provider";
import { siteConfig } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.shortTitle} | ${siteConfig.title}`,
    template: `%s | ${siteConfig.shortTitle}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: settingsInitScript }} />
      </head>
      <body>
        <SettingsProvider>
          <AppShell>{children}</AppShell>
        </SettingsProvider>
      </body>
    </html>
  );
}
