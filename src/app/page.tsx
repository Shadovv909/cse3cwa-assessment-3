import Link from "next/link";
import { PageHeading } from "@/components/ui/page-heading";

const activities = [
  {
    href: "/wordle",
    label: "Phoneme Wordle",
    icon: "/ʃ/",
    description:
      "Build a short target sound sequence, choose attempts and hints, then test the playable output.",
    details: ["2–6 phoneme targets", "Guided to challenge modes", "Inline spelling hints"],
  },
  {
    href: "/word-search",
    label: "Phoneme Word Search",
    icon: "/ŋ/",
    description:
      "Create a compact list of phoneme-based words and generate a selectable classroom search grid.",
    details: ["Approximately five words", "Horizontal, vertical and diagonal", "Shuffleable layouts"],
  },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <span className="hero-kicker">
            <span aria-hidden="true">●</span> Frontend-only assessment prototype
          </span>
          <h1>Turn phoneme practice into a classroom-ready web activity.</h1>
          <p>
            Phoneme Studio helps Speech Pathology teachers configure, preview
            and download accessible Wordle and Word Search activities without a
            database or server.
          </p>
          <div className="hero-actions">
            <Link className="button button--primary" href="/wordle">
              Build a Wordle
            </Link>
            <Link className="button button--secondary" href="/word-search">
              Build a Word Search
            </Link>
          </div>
          <dl className="hero-stats">
            <div>
              <dt>2</dt>
              <dd>activity builders</dd>
            </div>
            <div>
              <dt>90</dt>
              <dd>supplied HCE word presets</dd>
            </div>
            <div>
              <dt>1</dt>
              <dd>standalone HTML per export</dd>
            </div>
          </dl>
        </div>
        <div className="hero-visual" aria-label="Stylised preview of phoneme activity tiles">
          <div className="visual-toolbar">
            <span />
            <span />
            <span />
            <b>Teacher preview</b>
          </div>
          <div className="visual-content">
            <div className="visual-title">
              <small>Target sequence</small>
              <strong>/ʃ/ /ɪ/ /p/</strong>
            </div>
            <div className="visual-tiles" aria-hidden="true">
              <span data-state="correct">/ʃ/<i>✓</i></span>
              <span data-state="present">/p/<i>↔</i></span>
              <span data-state="absent">/t/<i>×</i></span>
            </div>
            <div className="visual-palette" aria-hidden="true">
              <span>/m/</span>
              <span>/n/</span>
              <span>/ŋ/</span>
              <span>/ɪ/</span>
              <span>/ʃ/</span>
              <span>/p/</span>
            </div>
            <div className="visual-download">
              <span>Standalone output</span>
              <b>.html</b>
            </div>
          </div>
        </div>
      </section>

      <PageHeading
        eyebrow="Choose a tool"
        title="Two focused classroom activity builders"
        description="Each builder follows the same configure, preview and export workflow so teachers do not need to learn a different interface for every activity."
      />

      <section className="activity-card-grid" aria-label="Activity builders">
        {activities.map((activity) => (
          <article className="activity-card" key={activity.href}>
            <div className="activity-card__icon" aria-hidden="true">
              {activity.icon}
            </div>
            <div className="activity-card__content">
              <p className="eyebrow">Builder</p>
              <h2>{activity.label}</h2>
              <p>{activity.description}</p>
              <ul className="check-list">
                {activity.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
              <Link className="card-link" href={activity.href}>
                Open {activity.label}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="workflow-section" aria-labelledby="workflow-title">
        <div className="workflow-heading">
          <p className="eyebrow">Simple workflow</p>
          <h2 id="workflow-title">From teaching idea to playable file</h2>
          <p>
            The interface keeps authoring controls separate from the student
            activity preview, reducing accidental edits and making the next
            action clear.
          </p>
        </div>
        <ol className="workflow-list">
          <li>
            <span>01</span>
            <div>
              <h3>Configure</h3>
              <p>Enter a title, difficulty and phoneme-based content.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Preview</h3>
              <p>Test the exact interaction students will receive.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Download</h3>
              <p>Generate a single HTML file that opens in a normal browser.</p>
            </div>
          </li>
        </ol>
      </section>

      <section className="home-callout">
        <div>
          <p className="eyebrow">Designed for the brief</p>
          <h2>Responsive, accessible and ready for later expansion.</h2>
          <p>
            Shared React components, cookie-based preferences and standalone
            client-side exports create a practical foundation for future word
            lists, databases and more advanced generation options.
          </p>
        </div>
        <Link className="button button--secondary" href="/about">
          Read the design rationale
        </Link>
      </section>
    </>
  );
}
