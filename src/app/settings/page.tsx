import type { Metadata } from "next";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { PageHeading } from "@/components/ui/page-heading";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <>
      <PageHeading
        eyebrow="Preferences"
        title="Settings"
        description="Choose a light or dark theme and an optional layout density. Preferences are stored locally in browser cookies."
      />
      <SettingsPanel />
    </>
  );
}
