"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { getMetrics, MetricSource } from "@/server/observability";
import { apiRequest } from "@/lib/api-client";

type Metrics = ReturnType<typeof getMetrics>;
const activityName = (value: unknown) => String(value ?? "Unknown").replaceAll("WORD_SEARCH", "Word Search").replaceAll("WORDLE", "Wordle");

export function MonitoringPanel({ report = false }: { report?: boolean }) {
  const [source, setSource] = useState<MetricSource>("observed");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [healthy, setHealthy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => {
    try {
      const [next, health] = await Promise.all([
        apiRequest<Metrics>(`/api/metrics?source=${source}`),
        fetch("/health", { cache: "no-store" }),
      ]);
      setMetrics(next); setHealthy(health.ok); setError("");
    } catch (cause) {
      setHealthy(false);
      setError(cause instanceof Error ? cause.message : "Monitoring unavailable.");
    }
  }, [source]);
  useEffect(() => {
    const initial = window.setTimeout(() => void refresh(), 0);
    const timer = window.setInterval(() => void refresh(), 15000);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); };
  }, [refresh]);
  const simulate = async () => {
    setBusy(true);
    try {
      const result = await apiRequest<{ inserted: boolean }>("/api/simulation", { method: "POST" });
      setNotice(result.inserted ? "Added 12 simulated generation records and 12 simulated page visits." : "Sample records already exist. No duplicates added.");
      setSource("simulated");
      if (source === "simulated") await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Simulation failed."); }
    finally { setBusy(false); }
  };
  const shown = metrics?.source === source ? metrics : null;
  return <div className="library-stack">
    <section className="library-panel monitor-toolbar" aria-label="Report controls">
      <label className="form-field"><span>Usage source</span><select className="select-input" value={source} onChange={event => setSource(event.target.value as MetricSource)}>
        <option value="observed">Observed application usage</option><option value="simulated">Simulated sample records</option>
      </select></label>
      <button type="button" className="button button--secondary" onClick={() => void refresh()}>Refresh metrics</button>
      <button type="button" className="button button--secondary" disabled={busy} onClick={() => void simulate()}>Add simulated records</button>
      <Link className="button button--ghost" href={report ? "/dashboard" : "/reports"}>{report ? "Dashboard" : "View reports"}</Link>
    </section>
    {error ? <p className="monitor-warning" role="alert">{error} Previously loaded values may be stale.</p> : null}
    <p role="status" className="monitor-status">{notice || (shown ? `Updated ${new Date(shown.generatedAt).toLocaleTimeString()}. Auto-refresh every 15 seconds.` : "Loading metrics...")}</p>
    {shown ? <>
      <section className="backend-status" aria-label="Operational health"><div><p className="eyebrow">Operational health</p><h2>{healthy ? "Database connected" : "Health check unavailable"}</h2><p>Usage source: <strong>{source}</strong>. Stored inventory counts include all current records.</p></div><Link className="button button--secondary" href="/health" target="_blank">{healthy ? "200 OK: /health" : "Check /health"}</Link></section>
      <dl className="metric-grid">
        {[
          ["Wordle configurations", shown.counts.wordle], ["Word Search configurations", shown.counts.word_search],
          ["Successful generations", shown.successes], ["Failed generations", shown.failures],
          ["Average time on page", shown.averageTimeSeconds === null ? "No visits yet" : `${shown.averageTimeSeconds.toFixed(1)} s`],
          ["Most-used activity type", shown.mostUsed ? activityName(shown.mostUsed) : "No attempts yet"],
          ["Stored word lists", shown.counts.lists], ["Stored words", shown.counts.words],
          ["Generation success rate", shown.attempts ? `${(100 * shown.successes / shown.attempts).toFixed(1)}%` : "No attempts yet"],
          ["Average generation time", shown.averageGenerationMs === null ? "No attempts yet" : `${shown.averageGenerationMs.toFixed(1)} ms`],
          ["Recorded page visits", shown.visits], ["Stored phoneme cells", shown.counts.phonemes],
        ].map(([label, value]) => <div className="metric-card" key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>
      <section className="library-panel" aria-labelledby="alerts-title"><h2 id="alerts-title">Alerts and warnings</h2>
        {source === "simulated" ? <p className="monitor-warning">Sample data only. These events are invented for demonstration and are excluded from observed usage.</p> : null}
        {shown.failures ? <p className="monitor-warning">{shown.failures} failed generation attempts in the {source} history. Review the event log and stored activity settings.</p> : <p>No failed generations recorded for this source.</p>}
        {shown.counts.empty_lists ? <p className="monitor-warning">{shown.counts.empty_lists} empty word lists. Add phonemes in the <Link href="/library">Data Library</Link> before generating an activity.</p> : <p>No empty word lists.</p>}
        {!shown.visits ? <p>Visit a builder, then navigate away to record visible page time.</p> : null}
      </section>
      {report ? <>
        <section className="library-panel"><div className="panel-heading"><h2>Daily generation report</h2><a className="button button--secondary" href={`/api/metrics?source=${source}&format=csv`}>Download daily CSV</a></div>
          <div className="report-scroll"><table className="report-table"><caption>Latest 14 active dates, UTC, {source} events</caption><thead><tr><th scope="col">Date</th><th scope="col">Attempts</th><th scope="col">Successful</th><th scope="col">Failed</th></tr></thead><tbody>{shown.daily.map(row => <tr key={String(row.day)}><th scope="row">{String(row.day)}</th><td>{Number(row.attempts)}</td><td>{Number(row.successes)}</td><td>{Number(row.failures)}</td></tr>)}</tbody></table></div>
          {!shown.daily.length ? <p>No generation records for this source.</p> : null}
        </section>
        <section className="library-panel"><h2>Page usage report</h2><div className="report-scroll"><table className="report-table"><caption>Completed visible page segments, {source}</caption><thead><tr><th scope="col">Page</th><th scope="col">Visits</th><th scope="col">Average seconds</th></tr></thead><tbody>{shown.pages.map(row => <tr key={String(row.page)}><th scope="row">{String(row.page)}</th><td>{Number(row.visits)}</td><td>{Number(row.average_seconds).toFixed(1)}</td></tr>)}</tbody></table></div></section>
      </> : null}
      <section className="library-panel"><h2>Generation activity</h2><div className="report-scroll"><table className="report-table"><caption>Most recent 20 generation attempts, {source}</caption><thead><tr><th scope="col">Time (UTC)</th><th scope="col">Type</th><th scope="col">Result</th><th scope="col">Duration</th></tr></thead><tbody>{shown.recent.map(row => <tr key={String(row.id)}><td>{String(row.created_at).replace("T", " ").slice(0, 19)}</td><td>{activityName(row.type)}</td><td>{Number(row.success) ? "Successful" : `Failed: ${row.code}`}</td><td>{Number(row.duration_ms).toFixed(1)} ms</td></tr>)}</tbody></table></div>{!shown.recent.length ? <p>Generate stored HTML from the Data Library to create your first observed event.</p> : null}</section>
      <section className="library-panel"><h2>How to read these metrics</h2><p>Configuration counts show currently stored activities, so deleting a configuration reduces its count. Generation counts are retained historical export attempts, including repeated downloads and rejected requests. Offline play and local preview downloads are not tracked.</p><p>Most-used type is based on export attempts; ties show both types. Unknown activity IDs count as failures but have no type. Average time is the mean visible page segment of at least one second, submitted on navigation or when the tab becomes hidden. Closing a browser can lose a final event. No personal information is stored.</p></section>
    </> : null}
  </div>;
}
