"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (open && !menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [open]);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand-link" href="/">
          <span className="brand-mark" aria-hidden="true">
            /æ/
          </span>
          <span>
            <strong>{siteConfig.shortTitle}</strong>
            <small>{siteConfig.title}</small>
          </span>
        </Link>

        <nav className="primary-nav" aria-label="Primary navigation">
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              className="nav-link"
              data-active={isActive(pathname, item.href)}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="compact-nav" ref={menuRef}>
          <button
            className="icon-button"
            type="button"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls="compact-menu"
            onClick={() => setOpen((current) => !current)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="5" r="1.8" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="12" cy="19" r="1.8" />
            </svg>
          </button>
          {open ? (
            <nav
              id="compact-menu"
              className="compact-menu"
              aria-label="Compact navigation"
            >
              {siteConfig.navigation.map((item) => (
                <Link
                  key={item.href}
                  className="compact-menu__link"
                  data-active={isActive(pathname, item.href)}
                  aria-current={
                    isActive(pathname, item.href) ? "page" : undefined
                  }
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </header>
  );
}
