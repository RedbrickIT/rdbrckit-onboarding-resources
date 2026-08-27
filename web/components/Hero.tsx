import HeroImage from "./HeroImage";
import styles from "./Hero.module.css";

/**
 * Green hero band: Redbrick badge + "IT Onboarding Resources" headline and
 * wordmark on the left, office photo (rounded top-left) on the right.
 *
 * Ported from rdbrckit-equipment-marketplace with the title and photo swapped,
 * so the two properties scale identically.
 */
export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.description}>
        <div className={styles.badgeRow}>
          <span className={styles.rule} aria-hidden="true" />
          <div className={styles.badgeCol}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/redbrick-badge.svg"
              alt=""
              aria-hidden="true"
              className={styles.badge}
              width={64}
              height={64}
            />
            <h1 className={styles.title}>
              <span>IT Onboarding</span>
              <span className={styles.titleAccent}>Resources</span>
            </h1>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/redbrick-wordmark.svg"
          alt="Redbrick"
          className={styles.wordmark}
          width={149}
          height={16}
        />
      </div>

      <HeroImage />
    </section>
  );
}
