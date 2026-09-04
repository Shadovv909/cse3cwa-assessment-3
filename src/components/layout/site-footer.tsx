import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <strong>{siteConfig.title}</strong>
          <p>Database-backed phoneme activity builder for Speech Pathology teaching.</p>
        </div>
        <p className="student-details">
          <span>{siteConfig.authorName}</span>
          <span aria-hidden="true">|</span>
          <span>{siteConfig.studentNumber}</span>
          <span aria-hidden="true">|</span>
          <a href={siteConfig.repositoryUrl} target="_blank" rel="noreferrer">
            GitHub repository
          </a>
        </p>
      </div>
    </footer>
  );
}
