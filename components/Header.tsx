"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Header.module.css";

/**
 * Sticky top navigation, ported from the equipment marketplace site so the two
 * Redbrick properties behave identically.
 *
 * The bar auto-hides when the user scrolls down and reappears when they scroll
 * back up. On mobile the links collapse into a hamburger that morphs into an X
 * and opens a full-screen menu (fade + scale).
 *
 * "Submit a Ticket" is intentionally unlinked, matching the marketplace site —
 * swap the <span> for an <a> once the helpdesk URL is confirmed.
 */
const CONNECT_URL = "https://connect.rdbrck.com";

export default function Header() {
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;
        // Ignore tiny jitters; hide on downward scroll past the bar height,
        // reveal on any upward scroll.
        if (Math.abs(delta) > 4) {
          if (delta > 0 && y > 80) setHidden(true);
          else if (delta < 0) setHidden(false);
          lastY = y;
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll and allow Escape to close while the menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`${styles.header} ${hidden && !menuOpen ? styles.hidden : ""}`}
      >
        <div className={`container ${styles.inner}`}>
          <Link href="/" className={styles.logo} aria-label="Redbrick — home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/redbrick-wordmark.svg"
              alt="Redbrick"
              width={149}
              height={16}
            />
          </Link>

          {/* Desktop links */}
          <nav className={styles.links}>
            <a
              href={CONNECT_URL}
              className={styles.link}
              target="_blank"
              rel="noreferrer"
            >
              Redbrick Connect
            </a>
            <span className={styles.button} role="link" aria-disabled="true">
              Submit a Ticket
            </span>
          </nav>

          {/* Mobile hamburger / X toggle */}
          <button
            type="button"
            className={`${styles.toggle} ${menuOpen ? styles.toggleOpen : ""}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className={styles.bar} />
            <span className={styles.bar} />
            <span className={styles.bar} />
          </button>
        </div>
      </header>

      {/* Full-screen mobile menu */}
      <div
        id="mobile-menu"
        className={`${styles.menu} ${menuOpen ? styles.menuOpen : ""}`}
        aria-hidden={!menuOpen}
      >
        <nav className={styles.menuLinks}>
          <a
            href={CONNECT_URL}
            className={styles.menuLink}
            target="_blank"
            rel="noreferrer"
            onClick={() => setMenuOpen(false)}
          >
            Redbrick Connect
          </a>
          <span className={styles.menuButton} role="link" aria-disabled="true">
            Submit a Ticket
          </span>
        </nav>
      </div>
    </>
  );
}
