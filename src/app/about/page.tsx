import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/ui/page-heading";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <>
      <PageHeading
        eyebrow="Project overview"
        title="A frontend foundation for phoneme-based teaching tools"
        description="Assessment 1 concentrates on responsive interface design, usability and reusable React structure. Data persistence and dynamic word-list management are intentionally deferred to later assessments."
        actions={
          <Link className="button button--primary" href="/wordle">
            Explore a builder
          </Link>
        }
      />

      <section className="about-grid">
        <article className="content-card content-card--feature">
          <p className="eyebrow">Purpose</p>
          <h2>Support teachers, not clients</h2>
          <p>
            The application is an authoring tool for Speech Pathology students
            and teachers. It translates a classroom idea into a playable web
            activity while keeping phoneme symbols central to the workflow.
          </p>
          <p>
            Teachers can configure settings, inspect a realistic preview and
            export a standalone file for use on classroom computers without
            deploying the Next.js application itself.
          </p>
        </article>

        <article className="content-card">
          <p className="eyebrow">Assessment scope</p>
          <h2>What is included now</h2>
          <ul className="check-list check-list--large">
            <li>Responsive multi-page navigation and consistent page structure</li>
            <li>Phoneme Wordle and Word Search builders</li>
            <li>All 90 supplied broad HCE word examples and 43 symbols</li>
            <li>Interactive previews that mirror exported activities</li>
            <li>Light and dark themes stored in cookies</li>
            <li>Single-file HTML generation in the browser</li>
          </ul>
        </article>

        <article className="content-card">
          <p className="eyebrow">Deferred scope</p>
          <h2>What later assessments can add</h2>
          <ul className="plain-list">
            <li>Persistent teacher accounts and saved activity libraries</li>
            <li>Database-backed word and phoneme lists</li>
            <li>Automatic generation from a larger clinical vocabulary</li>
            <li>Sharing, version history and classroom analytics</li>
          </ul>
        </article>
      </section>

      <section className="tool-explainer" aria-labelledby="tools-heading">
        <div className="tool-explainer__heading">
          <p className="eyebrow">Current tools</p>
          <h2 id="tools-heading">How each activity works</h2>
        </div>
        <div className="tool-columns">
          <article>
            <span className="tool-number">01</span>
            <h3>Phoneme Wordle</h3>
            <p>
              The teacher constructs one short target sequence using IPA
              symbols, enters the English equivalent and chooses the number of
              attempts, difficulty and hint level. Students build guesses from
              a phoneme keyboard and receive position feedback.
            </p>
            <Link href="/wordle">Open Wordle builder →</Link>
          </article>
          <article>
            <span className="tool-number">02</span>
            <h3>Phoneme Word Search</h3>
            <p>
              The teacher edits a small list of phoneme sequences. The client
              generates a grid and places targets horizontally, vertically or
              diagonally according to difficulty. Students select the first and
              last tile of a sequence.
            </p>
            <Link href="/word-search">Open Word Search builder →</Link>
          </article>
        </div>
      </section>

      <section className="architecture-section" aria-labelledby="architecture-title">
        <div>
          <p className="eyebrow">Component architecture</p>
          <h2 id="architecture-title">Reusable by design</h2>
          <p>
            Site layout, navigation, settings, phoneme palettes, game previews,
            generation utilities and builder controls are separated into
            focused components. This reduces duplication and gives later
            assessments clear extension points.
          </p>
        </div>
        <div className="architecture-diagram" aria-label="Application component structure">
          <div className="architecture-root">App shell</div>
          <div className="architecture-branches">
            <span>Shared layout</span>
            <span>Builder components</span>
            <span>Game previews</span>
            <span>Export utilities</span>
          </div>
        </div>
      </section>

      <section className="accessibility-section" aria-labelledby="accessibility-title">
        <div className="accessibility-copy">
          <p className="eyebrow">Accessibility approach</p>
          <h2 id="accessibility-title">Multiple cues, clear focus and usable controls</h2>
          <p>
            Semantic headings, labels, fieldsets, status regions, visible focus
            indicators and keyboard-operable controls support a broad range of
            users. Wordle feedback combines colour with symbols, while grid
            cells and phoneme buttons provide descriptive accessible names.
          </p>
        </div>
        <ul className="accessibility-metrics">
          <li><strong>44 px</strong><span>minimum touch targets</span></li>
          <li><strong>3 px</strong><span>visible focus outline</span></li>
          <li><strong>2 modes</strong><span>light and dark themes</span></li>
        </ul>
      </section>
    </>
  );
}
