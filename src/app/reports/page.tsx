import type { Metadata } from "next";
import { PageHeading } from "@/components/ui/page-heading";
import { MonitoringPanel } from "@/components/monitoring/monitoring-panel";
export const metadata: Metadata = { title: "Reports" };
export default function ReportsPage() {
  return <><PageHeading eyebrow="Assessment 3 reporting" title="Usage reports" description="Review daily generation results and page usage, then download a CSV for further analysis." /><MonitoringPanel report /></>;
}
