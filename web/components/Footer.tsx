import SocialIcons from "./SocialIcons";
import styles from "./Footer.module.css";

/** Site footer: Redbrick logo, land acknowledgment, and social links. */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.description}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/redbrick-logo.svg"
            alt="Redbrick"
            className={styles.logo}
            width={182.6}
            height={19.147}
          />
          <p className={styles.acknowledgment}>
            Redbrick is headquartered on the traditional Coast Salish territory
            and we respectfully acknowledge the Lekwungen and W̱SÁNEĆ People of
            this region. With gratitude, we live, work, and play on this
            beautiful land.
          </p>
        </div>

        <div className={styles.contact}>
          <p className={styles.followLabel}>Follow Us</p>
          <SocialIcons />
        </div>
      </div>
    </footer>
  );
}
