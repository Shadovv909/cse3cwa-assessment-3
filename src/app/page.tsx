import Link from "next/link";
import { PageHeading } from "@/components/ui/page-heading";

const capabilities = [
  {
    title: "Persistent word lists",
    detail:
      "Store English words, optional hints and ordered phoneme symbols in SQLite instead of relying on temporary browser state.",
    icon: "/dʒ/",
  },
  {
    title: "Reusable configurations",
    detail:
      "Save Wordle or Word Search type, difficulty, hint, theme and output settings for later retrieval and editing.",
    icon: "/ɜː/",
  },
  {
    title: "Stored-data exports",
    detail:
      "Generate one self-contained HTML activity through a backend route using the current database records.",
    icon: "/ŋ/",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <span className="hero-kicker">
            <span aria-hidden="true">●</span> Backend and database implementation
          </span>
          <h1>Build once, save it, edit it and use it again.</h1>
          <p>
            Phoneme Studio now combines the accessible Assessment 1 interface
            with Next.js API routes, input validation, SQLite persistence and
            Docker execution for a reproducible classroom activity workflow.
          </p>
          <div className="hero-actions">
            <Link className="button button--primary" href="/library">
              Open the Data Library
            </Link>
            <Link className="button button--secondary" href="/health">
              Check backend health
            </Link>
          </div>
          <dl className="hero-stats">
            <div>
              <dt>4</dt>
              <dd>CRUD operations</dd>
            </div>
            <div>
              <dt>2</dt>
              <dd>stored activity types</dd>
            </div>
            <div>
              <dt>1</dt>
              <dd>Docker command to run</dd>
            </div>
          </dl>
        </div>
        <div className="hero-visual" aria-label="Database-backed phoneme activity preview">
          <div className="visual-toolbar">
            <span />
            <span />
            <span />
            <b>SQLite activity record</b>
          </div>
          <div className="visual-content database-visual">
            <div className="database-visual__row">
              <small>Word list</small>
              <strong>Starter three-phoneme words</strong>
            </div>
            <div className="visual-tiles" aria-hidden="true">
              <span data-state="correct">/ʃ/<i>1</i></span>
              <span data-state="correct">/ɪ/<i>2</i></span>
              <span data-state="correct">/p/<i>3</i></span>
            </div>
            <div className="database-visual__flow" aria-hidden="true">
              <span>React form</span><b>→</b><span>API route</span><b>→</b><span>SQLite</span>
            </div>
            <div className="visual-download">
              <span>Stored output</span>
              <b>.html</b>
            </div>
          </div>
        </div>
      </section>

      <PageHeading
        eyebrow="Assessment 2 capabilities"
        title="A data-driven teaching workflow"
        description="The frontend remains familiar, while a structured backend now controls persistence, validation, retrieval and output generation."
      />

      <section className="activity-card-grid activity-card-grid--three" aria-label="Backend capabilities">
        {capabilities.map((capability) => (
          <article className="activity-card" key={capability.title}>
            <div className="activity-card__icon" aria-hidden="true">{capability.icon}</div>
            <div className="activity-card__content">
              <p className="eyebrow">Data layer</p>
              <h2>{capability.title}</h2>
              <p>{capability.detail}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="workflow-section" aria-labelledby="workflow-title">
        <div className="workflow-heading">
          <p className="eyebrow">Persistent workflow</p>
          <h2 id="workflow-title">Create, configure and export from stored data</h2>
          <p>
            Teachers can manage records through the Data Library and then open
            saved configurations in either activity builder.
          </p>
        </div>
        <ol className="workflow-list">
          <li><span>01</span><div><h3>Store</h3><p>Create a list and save ordered phoneme sequences.</p></div></li>
          <li><span>02</span><div><h3>Configure</h3><p>Save an activity type, difficulty, hints and output settings.</p></div></li>
          <li><span>03</span><div><h3>Generate</h3><p>Download a standalone HTML file produced from database records.</p></div></li>
        </ol>
      </section>

      <section className="home-callout">
        <div>
          <p className="eyebrow">Reproducible execution</p>
          <h2>Run locally or inside Docker.</h2>
          <p>
            The same Next.js server, SQLite schema, seed process and health
            endpoint run in both environments, with a Docker volume preserving
            activity data between container restarts.
          </p>
        </div>
        <Link className="button button--secondary" href="/about">
          View the backend architecture
        </Link>
      </section>
    </>
  );
}
