import type { Metadata } from "next";
import { WordSearchBuilder } from "@/components/builders/word-search-builder";
import { PageHeading } from "@/components/ui/page-heading";

export const metadata: Metadata = {
  title: "Phoneme Word Search",
};

export default function WordSearchPage() {
  return (
    <>
      <PageHeading
        eyebrow="Activity builder"
        title="Phoneme Word Search"
        description="Edit a short phoneme word list, generate a responsive search grid and download the playable result as one HTML file."
      />
      <WordSearchBuilder />
    </>
  );
}
