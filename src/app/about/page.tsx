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
        eyebrow="Project architecture"
        title="From frontend prototype to database-backed application"
        description="Assessment 2 preserves the accessible activity builders and adds server-side routes, relational persistence, validation, error handling and Docker execution."
        actions={
          <Link className="button button--primary" href="/library">
            Explore database CRUD
          </Link>
        }
      />

      <section className="about-grid">
        <article className="content-card content-card--feature">
          <p className="eyebrow">Purpose</p>
          <h2>Reusable content for Speech Pathology teaching</h2>
          <p>
            Teachers can create multiple phoneme word lists, return to them
            later and connect each list to one or more Wordle or Word Search
            configurations. The saved records replace the fixed-only workflow
            of the first assessment while retaining the supplied broad HCE
            examples as useful starting data.
          </p>
        </article>

        <article className="content-card">
          <p className="eyebrow">Backend</p>
          <h2>Next.js Route Handlers</h2>
          <ul className="check-list check-list--large">
            <li>GET, POST, PUT and DELETE endpoints for word lists</li>
            <li>Individual word CRUD with ordered phoneme storage</li>
            <li>Activity configuration CRUD for both builder types</li>
            <li>Server-generated standalone HTML downloads</li>
            <li>A JSON health endpoint at /health</li>
          </ul>
        </article>

        <article className="content-card">
          <p className="eyebrow">Persistence</p>
          <h2>Relational SQLite schema</h2>
          <ul className="plain-list">
            <li>word_lists stores reusable named collections</li>
            <li>words stores English equivalents, hints and ordering</li>
            <li>phonemes stores one complete symbol per position</li>
            <li>activity_configurations stores generation settings</li>
            <li>foreign keys and cascades maintain relationships</li>
          </ul>
        </article>
      </section>

      <section className="architecture-section" aria-labelledby="architecture-title">
        <div>
          <p className="eyebrow">Request flow</p>
          <h2 id="architecture-title">Clear separation of concerns</h2>
          <p>
            Client components call JSON endpoints. Route Handlers validate the
            request and invoke focused database functions. Prepared SQL
            statements read or mutate SQLite records, then typed responses
            return to the interface. Export routes transform stored records
            into the existing standalone activity generators.
          </p>
        </div>
        <div className="architecture-diagram architecture-diagram--backend" aria-label="Backend request architecture">
          <div className="architecture-root">Teacher interface</div>
          <div className="architecture-branches">
            <span>API Route Handlers</span>
            <span>Validation layer</span>
            <span>SQLite data access</span>
            <span>HTML export service</span>
          </div>
        </div>
      </section>

      <section className="tool-explainer" aria-labelledby="reliability-heading">
        <div className="tool-explainer__heading">
          <p className="eyebrow">Reliability</p>
          <h2 id="reliability-heading">Validation and graceful failure</h2>
        </div>
        <div className="tool-columns">
          <article>
            <span className="tool-number">01</span>
            <h3>Phoneme validation</h3>
            <p>
              Every symbol is checked against the supplied inventory. Complete
              symbols such as /tʃ/, /dʒ/ and /æɪ/ remain one ordered database
              item rather than being split into characters.
            </p>
          </article>
          <article>
            <span className="tool-number">02</span>
            <h3>Relationship validation</h3>
            <p>
              Wordle targets must belong to their selected list, while Word
              Search configurations require enough stored words to generate a
              meaningful puzzle.
            </p>
          </article>
          <article>
            <span className="tool-number">03</span>
            <h3>HTTP error responses</h3>
            <p>
              Invalid JSON, malformed fields, missing records, duplicate words
              and relationship conflicts return clear status codes and messages
              instead of failing silently.
            </p>
          </article>
        </div>
      </section>

      <section className="accessibility-section" aria-labelledby="deployment-title">
        <div className="accessibility-copy">
          <p className="eyebrow">Deployment</p>
          <h2 id="deployment-title">Docker and persistent storage</h2>
          <p>
            A multi-stage Dockerfile builds a minimal standalone Next.js image.
            The application runs as a non-root user, exposes port 3000, stores
            SQLite data in a mounted volume and reports container health through
            the same /health endpoint demonstrated in the video.
          </p>
        </div>
        <ul className="accessibility-metrics">
          <li><strong>200</strong><span>healthy API status</span></li>
          <li><strong>4</strong><span>CRUD operations</span></li>
          <li><strong>1</strong><span>persistent Docker volume</span></li>
        </ul>
      </section>
    </>
  );
}
