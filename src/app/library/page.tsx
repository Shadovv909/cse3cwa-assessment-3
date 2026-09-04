import type { Metadata } from "next";
import { ActivityLibrary } from "@/components/database/activity-library";
import { PageHeading } from "@/components/ui/page-heading";

export const metadata: Metadata = {
  title: "Data Library",
};

export default function LibraryPage() {
  return (
    <>
      <PageHeading
        eyebrow="Assessment 2 backend"
        title="Data Library"
        description="Create, read, update and delete phoneme word lists, individual words and reusable activity configurations through the Next.js API and SQLite database."
      />
      <ActivityLibrary />
    </>
  );
}
