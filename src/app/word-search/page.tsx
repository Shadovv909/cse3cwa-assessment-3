import type { Metadata } from "next";
import Link from "next/link";
import { WordSearchBuilder } from "@/components/builders/word-search-builder";
import { PageHeading } from "@/components/ui/page-heading";
import { getActivity } from "@/server/database";

export const metadata: Metadata = {
  title: "Phoneme Word Search",
};

export const dynamic = "force-dynamic";

type WordSearchPageProps = {
  searchParams: Promise<{ activity?: string }>;
};

export default async function WordSearchPage({ searchParams }: WordSearchPageProps) {
  const { activity: activityId } = await searchParams;
  const activity = activityId ? getActivity(activityId) : null;
  const wordSearchActivity =
    activity?.activityType === "WORD_SEARCH" ? activity : null;

  return (
    <>
      <PageHeading
        eyebrow="Database-aware builder"
        title="Phoneme Word Search"
        description="Load a stored word list and activity configuration, generate a responsive grid and download a playable HTML file from persisted backend data."
        actions={
          <Link className="button button--secondary" href="/library">
            Manage stored data
          </Link>
        }
      />
      {activityId && !wordSearchActivity ? (
        <p className="validation-box" role="alert">
          The requested stored activity was not found or is not a Word Search activity.
        </p>
      ) : null}
      <WordSearchBuilder key={wordSearchActivity?.id || "draft"} initialActivity={wordSearchActivity} />
    </>
  );
}
