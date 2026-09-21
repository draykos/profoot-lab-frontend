import { useEffect, useRef } from "react";
import Hls from "hls.js";
import { X } from "lucide-react";
import type { VideoModalData } from "@/lib/video-coach";

interface VideoPlayerModalProps {
  video: VideoModalData | null;
  onClose: () => void;
  closeLabel: string;
}

/**
 * Full-screen player overlay, reused by the home "video del giorno" card and the Video Coach
 * list. Renders nothing (and unmounts the video) when `video` is null, so playback actually stops
 * on close instead of continuing muted in the background.
 *
 * Plays the Bunny Stream HLS URL through a native <video> element (hls.js on browsers without
 * native HLS support — everything but Safari) instead of Bunny's iframe embed. This hands sizing
 * to the browser's normal replaced-element layout (`max-h-[75vh] max-w-full` on the <video> itself,
 * a real element with a real intrinsic aspect ratio) instead of guessing a fixed aspect ratio or
 * depending on a third-party page's own — unpredictable — resize behavior.
 */
export function VideoPlayerModal({ video, onClose, closeLabel }: VideoPlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!video) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [video, onClose]);

  useEffect(() => {
    const el = videoRef.current;
    if (!video || !el) return;

    if (el.canPlayType("application/vnd.apple.mpegurl")) {
      el.src = video.video;
      return;
    }

    if (!Hls.isSupported()) return;
    const hls = new Hls();
    hls.loadSource(video.video);
    hls.attachMedia(el);
    return () => hls.destroy();
  }, [video]);

  if (!video) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between gap-4 text-white">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{video.titolo}</p>
            <p className="text-xs text-white/60">
              {[video.categoriaLabel, video.dateLabel].filter(Boolean).join(" • ")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="size-5" />
          </button>
        </div>
        <video
          ref={videoRef}
          key={video.video}
          className="mx-auto block max-h-[75vh] w-auto max-w-full rounded-xl bg-black"
          poster={video.poster}
          controls
          autoPlay
          playsInline
          title={video.titolo}
        />
      </div>
    </div>
  );
}
