import { useEffect, useRef } from "react";

// Android/Chrome can "freeze" a hidden PWA's rendering pipeline to save memory once it has been
// backgrounded long enough (observed in production after a few minutes, never immediately). On
// resume, the browser sometimes fails to recompute the layout viewport and repaints the page at
// stale (tiny) dimensions until a full reload forces a reflow. This constant is how long the app
// must have been hidden before we force that reload on the way back to the foreground — short
// backgrounding (e.g. briefly switching apps) never triggers the bug and should not reload.
const STALE_BACKGROUND_THRESHOLD_MS = 3 * 60 * 1000;

/** Forces a full reload when the app returns to the foreground after being hidden for at least
 * STALE_BACKGROUND_THRESHOLD_MS, working around the frozen-viewport bug described above. Mount
 * once near the app root. */
export function StaleForegroundReload() {
  const hiddenAtRef = useRef<number | null>(null);

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "hidden") {
        hiddenAtRef.current = Date.now();
        return;
      }

      const hiddenAt = hiddenAtRef.current;
      hiddenAtRef.current = null;
      if (hiddenAt !== null && Date.now() - hiddenAt >= STALE_BACKGROUND_THRESHOLD_MS) {
        window.location.reload();
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  return null;
}
