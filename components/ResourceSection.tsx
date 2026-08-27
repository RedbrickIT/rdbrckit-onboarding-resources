import type { ResourceSection as Section } from "@/lib/types";
import ResourceButton from "./ResourceButton";
import styles from "./ResourceSection.module.css";

/**
 * One titled band of resources — a heading with a rule running to the right
 * edge, then one or more labelled groups of buttons.
 *
 * The optional italic note sits on the *group* rather than the section because
 * that is where the design places it: inside the first group's 16px stack,
 * directly above the group label.
 */
export default function ResourceSection({ section }: { section: Section }) {
  return (
    <section
      className={styles.section}
      aria-labelledby={`section-${section.id}`}
    >
      <div className={`container ${styles.header}`}>
        <h2 className={styles.title} id={`section-${section.id}`}>
          {section.title}
        </h2>
        <div className={styles.rule} aria-hidden="true" />
      </div>

      {section.groups.map((group) => (
        <div key={group.id} className={`container ${styles.group}`}>
          {group.note ? <p className={styles.note}>{group.note}</p> : null}
          <p className={styles.groupLabel}>{group.label}</p>
          <div className={styles.grid}>
            {group.links.map((link) => (
              <ResourceButton key={link.id} link={link} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
