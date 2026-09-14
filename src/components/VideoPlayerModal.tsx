import { useEffect } from "react";
import { X } from "lucide-react";
import type { VideoModalData } from "@/lib/video-coach";

interface VideoPlayerModalProps {
  video: VideoModalData | null;
  onClose: () => void;
  closeLabel: string;
}

/**
 * Full-screen player overlay, reused by the home "video del giorno" card and the Video Coach
 * list. Renders nothing (and unmounts the iframe) when `video` is null, so playback actually
 * stops on close instead of continuing muted in the background.
 */
export function VideoPlayerModal({ video, onClose, closeLabel }: VideoPlayerModalProps) {
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

  if (!video) return null;

  const src = `${video.video}${video.video.includes("?") ? "&" : "?"}autoplay=true`;

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
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          <iframe
            key={video.video}
            src={src}
            title={video.titolo}
            className="size-full"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
