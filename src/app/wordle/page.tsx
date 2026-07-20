import type { Metadata } from "next";
import { WordleBuilder } from "@/components/builders/wordle-builder";
import { PageHeading } from "@/components/ui/page-heading";

export const metadata: Metadata = {
  title: "Phoneme Wordle",
};

export default function WordlePage() {
  return (
    <>
      <PageHeading
        eyebrow="Activity builder"
        title="Phoneme Wordle"
        description="Create one phoneme-based target, preview the student interaction and export a standalone HTML activity for classroom use."
      />
      <WordleBuilder />
    </>
  );
}
