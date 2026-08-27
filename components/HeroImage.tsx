"use client";

import { useEffect, useRef } from "react";
import styles from "./Hero.module.css";

/**
 * The hero photo. Its top-left corner radius is kept at exactly half the
 * rendered image height. On mobile the image grows to fill the column, so the
 * height is dynamic — a ResizeObserver keeps the radius in sync. The CSS
 * provides a close server-rendered fallback before hydration.
 */
export default function HeroImage() {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const apply = () => {
      img.style.borderTopLeftRadius = `${img.getBoundingClientRect().height / 2}px`;
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(img);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.imageBlock}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src="/hero-office.jpg"
        alt="Redbrick employees meeting in a glass-walled office"
        className={styles.image}
      />
    </div>
  );
}
