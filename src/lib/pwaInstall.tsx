import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { useT } from "@/lib/i18n";
import { Card } from "@/components/AppShell";
import { safeStorage } from "@/lib/safeStorage";

const DISMISSED_KEY = "pwa_install_dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/** Fixed top banner that offers installing the app: a native `beforeinstallprompt` trigger on
 * Chrome/Edge (Android + desktop), or manual "Aggiungi a Home" instructions on iOS Safari, which
 * never fires that event. Hidden once installed/standalone, or once the user dismisses it. */
export function PwaInstallBanner() {
  const t = useT("pwa");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIos, setShowIos] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(safeStorage.getItem(DISMISSED_KEY) === "1");

    if (isStandalone()) return;

    if (isIosDevice()) {
      setShowIos(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => setDeferredPrompt(null);

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const dismiss = () => {
    setDismissed(true);
    safeStorage.setItem(DISMISSED_KEY, "1");
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
  };

  if (dismissed || (!deferredPrompt && !showIos)) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <Card className="mx-auto flex max-w-lg items-start gap-3 !p-3 shadow-glow">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Download className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">
            {showIos ? t.ios_title : t.install_title}
          </p>
          {showIos ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t.ios_desc_before} <Share className="mb-0.5 inline size-3.5 text-foreground" />{" "}
              {t.ios_desc_share} {t.ios_desc_after}
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground">{t.install_desc}</p>
          )}
          {!showIos && (
            <button
              type="button"
              onClick={handleInstall}
              className="mt-2 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition hover:opacity-90"
            >
              {t.install_cta}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t.dismiss}
          className="shrink-0 rounded-full p-1 text-muted-foreground transition hover:bg-secondary"
        >
          <X className="size-4" />
        </button>
      </Card>
    </div>
  );
}
