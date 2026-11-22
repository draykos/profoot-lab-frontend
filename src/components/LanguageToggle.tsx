import { useLanguage } from "@/lib/i18n";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage();
  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full border border-border bg-card p-0.5 text-[10px] font-bold uppercase tracking-widest ${className}`}
      role="group"
      aria-label="Language"
    >
      {(["it", "en"] as const).map((l) => {
        const active = l === lang;
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={active}
            className={`rounded-full px-2.5 py-1 transition ${
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
