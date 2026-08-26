import type { ResourceLink } from "@/lib/types";
import styles from "./ResourceButton.module.css";

/**
 * A single dark pill in a resource group.
 *
 * A link with an uploaded file points at that file and downloads it; a link
 * with a plain URL opens in a new tab. An entry with neither still renders —
 * the design is a wall of buttons, and dropping the ones whose destination
 * hasn't been filled in yet would leave holes in the grid. Those render as an
 * inert span, the same way "Submit a Ticket" does in the header.
 */
export default function ResourceButton({ link }: { link: ResourceLink }) {
  const href = link.fileUrl ?? link.url;

  if (!href) {
    return (
      <span className={styles.button} role="link" aria-disabled="true">
        {link.label}
      </span>
    );
  }

  const isFile = Boolean(link.fileUrl);

  return (
    <a
      className={styles.button}
      href={href}
      {...(isFile ? { download: "" } : { target: "_blank", rel: "noreferrer" })}
    >
      {link.label}
    </a>
  );
}
