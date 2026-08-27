import styles from "./SocialIcons.module.css";

/**
 * Footer social links. The glyphs are the exact vector assets exported from
 * the Figma design (white on a Neutral/900 circle), carried over from the
 * equipment marketplace site along with the URLs.
 *
 * Each entry keeps its own intrinsic dimensions — the LinkedIn glyph is
 * 16 x 15.635 in the source vector, not square, and squashing it into a
 * uniform 16x16 box would distort it.
 */
const SOCIALS: {
  name: string;
  href: string;
  src: string;
  width: number;
  height: number;
}[] = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/rdbrck",
    src: "/brand/social-facebook.svg",
    width: 16,
    height: 16,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/rdbrck",
    src: "/brand/social-instagram.svg",
    width: 16,
    height: 16,
  },
  {
    name: "X (Twitter)",
    href: "https://x.com/rdbrck",
    src: "/brand/social-twitter.svg",
    width: 16,
    height: 16,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/rdbrck",
    src: "/brand/social-linkedin.svg",
    width: 16,
    height: 15.635,
  },
  {
    name: "GitHub",
    href: "https://github.com/rdbrck",
    src: "/brand/social-github.svg",
    width: 16,
    height: 16,
  },
];

export default function SocialIcons() {
  return (
    <div className={styles.group}>
      {SOCIALS.map((social) => (
        <a
          key={social.name}
          href={social.href}
          className={styles.icon}
          aria-label={social.name}
          target="_blank"
          rel="noreferrer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={social.src}
            alt=""
            width={social.width}
            height={social.height}
            aria-hidden="true"
          />
        </a>
      ))}
    </div>
  );
}
