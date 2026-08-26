import styles from "./Hero.module.css";

/**
 * Hero banner: the Redbrick badge, the two-tone serif headline, and the
 * office photo with its oversized top-left radius.
 */
export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.description}>
        <div className={styles.badgeRow}>
          <div className={styles.rule} aria-hidden="true" />
          <div className={styles.badgeStack}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/redbrick-badge.svg"
              alt=""
              className={styles.badge}
              width={64}
              height={64}
              aria-hidden="true"
            />
            <h1 className={styles.heading}>
              <span>IT Onboarding</span>
              <span className={styles.headingAccent}>Resources</span>
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

      <div className={styles.imageBlock}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-office.jpg"
          alt="Redbrick employees meeting in a glass-walled office"
        />
      </div>
    </section>
  );
}
