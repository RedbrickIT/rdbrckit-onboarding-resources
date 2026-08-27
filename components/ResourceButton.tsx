import type { ResourceLink } from "@/lib/types";
import styles from "./ResourceButton.module.css";

/**
 * A single dark pill in a resource group.
 *
 * A link with a URL opens in a new tab. One without still renders — the design
 * is a wall of buttons, and dropping the ones whose destination hasn't been
 * filled in yet would leave holes in the grid. Those render as an inert span,
 * the same way "Submit a Ticket" does in the header.
 */
export default function ResourceButton({ link }: { link: ResourceLink }) {
  if (!link.url) {
    return (
      <span className={styles.button} role="link" aria-disabled="true">
        {link.label}
      </span>
    );
  }

  return (
    <a
      className={styles.button}
      href={link.url}
      target="_blank"
      rel="noreferrer"
    >
      {link.label}
    </a>
  );
}
