"use client";

import { useEffect } from "react";

/**
 * Cancels image drags across the front end.
 *
 * The CSS in globals.css (`-webkit-user-drag: none`) covers Chromium and
 * Safari, but Firefox never implemented that property, so images there stay
 * draggable. Listening for `dragstart` once on the document closes that gap
 * and also catches any image rendered after mount.
 *
 * Only image drags are cancelled — dragging selected text, links, and anything
 * else keeps working. This is a cosmetic measure, not a protection: the files
 * are still one right-click or devtools panel away.
 */
export default function ImageDragGuard() {
  useEffect(() => {
    const onDragStart = (e: DragEvent) => {
      if (e.target instanceof HTMLImageElement) e.preventDefault();
    };

    document.addEventListener("dragstart", onDragStart);
    return () => document.removeEventListener("dragstart", onDragStart);
  }, []);

  return null;
}
