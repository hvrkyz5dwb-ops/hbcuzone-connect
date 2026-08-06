// Tracks the on-screen keyboard height via the Visual Viewport API.
// iOS Safari shrinks the visual viewport when the keyboard opens but keeps
// fixed elements anchored to the layout viewport, so bottom-pinned UI gets
// covered. This returns the px amount to lift such UI above the keyboard.
import { useEffect, useState } from "react";

export function useKeyboardOffset(): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const keyboard = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      // Ignore tiny fractional jitters from pinch/zoom or scroll bounce.
      setOffset(keyboard > 40 ? Math.round(keyboard) : 0);
    };

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    update();
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return offset;
}