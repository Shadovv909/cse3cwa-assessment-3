import type { Metadata } from "next";
import { PageHeading } from "@/components/ui/page-heading";
import { MonitoringPanel } from "@/components/monitoring/monitoring-panel";
export const metadata: Metadata = { title: "Dashboard" };
export default function DashboardPage() {
  return <><PageHeading eyebrow="Assessment 3 monitoring" title="Activity dashboard" description="Monitor stored classroom activities, generation outcomes and page usage from the SQLite database." /><MonitoringPanel /></>;
}
