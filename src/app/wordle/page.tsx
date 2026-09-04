import type { Metadata } from "next";
import Link from "next/link";
import { WordleBuilder } from "@/components/builders/wordle-builder";
import { PageHeading } from "@/components/ui/page-heading";
import { getActivity } from "@/server/database";

export const metadata: Metadata = {
  title: "Phoneme Wordle",
};

export const dynamic = "force-dynamic";

type WordlePageProps = {
  searchParams: Promise<{ activity?: string }>;
};

export default async function WordlePage({ searchParams }: WordlePageProps) {
  const { activity: activityId } = await searchParams;
  const activity = activityId ? getActivity(activityId) : null;
  const wordleActivity = activity?.activityType === "WORDLE" ? activity : null;

  return (
    <>
      <PageHeading
        eyebrow="Database-aware builder"
        title="Phoneme Wordle"
        description="Load a stored Wordle configuration, preview the student interaction and generate a standalone HTML activity from either current or persisted data."
        actions={
          <Link className="button button--secondary" href="/library">
            Manage stored data
          </Link>
        }
      />
      {activityId && !wordleActivity ? (
        <p className="validation-box" role="alert">
          The requested stored activity was not found or is not a Wordle activity.
        </p>
      ) : null}
      <WordleBuilder key={wordleActivity?.id || "draft"} initialActivity={wordleActivity} />
    </>
  );
}
