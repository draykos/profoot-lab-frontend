import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "it" | "en";

const STORAGE_KEY = "atleta_lang";

// ---------- Dictionaries ----------

const dict = {
  common: {
    it: {
      back_home: "Torna alla home",
      not_found_title: "Pagina non trovata",
      not_found_desc: "La pagina che cerchi non esiste o è stata spostata.",
      error_title: "Qualcosa è andato storto",
      error_desc: "Riprova o torna alla home.",
      retry: "Riprova",
      home: "Home",
    },
    en: {
      back_home: "Back to home",
      not_found_title: "Page not found",
      not_found_desc: "The page you're looking for doesn't exist or has been moved.",
      error_title: "Something went wrong",
      error_desc: "Try again or go back home.",
      retry: "Retry",
      home: "Home",
    },
  },
  nav: {
    it: { home: "Home", train: "Train", test: "Test", body: "Corpo", profile: "Profilo" },
    en: { home: "Home", train: "Train", test: "Test", body: "Body", profile: "Profile" },
  },
  home: {
    it: {
      hello: "Ciao, Luca",
      ready: "Pronto per oggi?",
      video_of_day: "Video del giorno",
      next_match: "Prossima partita",
      match_teams: "Milano FC vs Roma",
      match_when: "Domenica • 15:30 • San Siro",
      sections: "Sezioni",
      qa_train: "Allenamento",
      qa_train_sub: "Sessione di oggi",
      qa_diet: "Dieta",
      qa_diet_sub: "5 pasti • 2.450 kcal",
      qa_tests: "Test Fisici",
      qa_tests_sub: "Storico prestazioni",
      qa_body: "Mappa Corporea",
      qa_body_sub_none: "Nessun alert attivo",
      qa_body_sub_one: "1 alert attivo",
      qa_body_sub_many: "alert attivi",
      qa_matches: "Partite",
      qa_matches_sub: "Prossime & storico",
      qa_mental: "Video Coach",
      qa_mental_sub: "Il tuo ultimo video",
    },
    en: {
      hello: "Hi, Luca",
      ready: "Ready for today?",
      video_of_day: "Video of the day",
      next_match: "Next match",
      match_teams: "Milano FC vs Roma",
      match_when: "Sunday • 3:30pm • San Siro",
      sections: "Sections",
      qa_train: "Training",
      qa_train_sub: "Today's session",
      qa_diet: "Diet",
      qa_diet_sub: "5 meals • 2,450 kcal",
      qa_tests: "Fitness Tests",
      qa_tests_sub: "Performance history",
      qa_body: "Body Map",
      qa_body_sub_none: "No active alerts",
      qa_body_sub_one: "1 active alert",
      qa_body_sub_many: "active alerts",
      qa_matches: "Matches",
      qa_matches_sub: "Upcoming & past",
      qa_mental: "Video Coach",
      qa_mental_sub: "Your latest video",
    },
  },
  train: {
    it: {
      eyebrow: "Ultima settimana",
      title: "Allenamento",
      video_today: "Video di oggi",
      previous_days: "Giorni precedenti",
      seven_days: "7 giorni",
      intensity: "Intensità",
      i_high: "alta",
      i_med: "media",
      i_low: "bassa",
      today: "Oggi",
      yesterday: "Ieri",
      d_mar: "MAR",
      d_lun: "LUN",
      d_dom: "DOM",
      d_sab: "SAB",
      d_ven: "VEN",
      d_gio: "GIO",
      d_mer: "MER",
      v1_title: "Squat esplosivi 4×6",
      v1_tag: "Forza",
      v2_title: "Mobilità dinamica",
      v2_tag: "Attivazione",
      v3_title: "Recupero attivo",
      v3_tag: "Defaticamento",
      v4_title: "Sprint & cambi di direzione",
      v4_tag: "Velocità",
      v5_title: "Stabilità anti-rotazione",
      v5_tag: "Core",
      v6_title: "Circuito metabolico",
      v6_tag: "Condizionamento",
      v7_title: "Foam roller & stretching",
      v7_tag: "Recupero",
    },
    en: {
      eyebrow: "Last week",
      title: "Training",
      video_today: "Today's video",
      previous_days: "Previous days",
      seven_days: "7 days",
      intensity: "Intensity",
      i_high: "high",
      i_med: "medium",
      i_low: "low",
      today: "Today",
      yesterday: "Yesterday",
      d_mar: "TUE",
      d_lun: "MON",
      d_dom: "SUN",
      d_sab: "SAT",
      d_ven: "FRI",
      d_gio: "THU",
      d_mer: "WED",
      v1_title: "Explosive squats 4×6",
      v1_tag: "Strength",
      v2_title: "Dynamic mobility",
      v2_tag: "Activation",
      v3_title: "Active recovery",
      v3_tag: "Cool-down",
      v4_title: "Sprints & change of direction",
      v4_tag: "Speed",
      v5_title: "Anti-rotation stability",
      v5_tag: "Core",
      v6_title: "Metabolic circuit",
      v6_tag: "Conditioning",
      v7_title: "Foam roller & stretching",
      v7_tag: "Recovery",
    },
  },
  diet: {
    it: {
      eyebrow: "Piano nutrizionale",
      title: "Dieta",
      today_need: "Fabbisogno oggi",
      kcal: "kcal",
      goal: "Obiettivo",
      carbs: "Carbo",
      protein: "Proteine",
      fats: "Grassi",
      m_carb: "Carb",
      m_pro: "Pro",
      m_fat: "Grassi",
      breakfast: "Colazione",
      snack: "Spuntino",
      lunch: "Pranzo",
      pre: "Pre-allenamento",
      dinner: "Cena",
      dish1: "Porridge d'avena, mirtilli, mandorle",
      dish2: "Yogurt greco, miele e frutta secca",
      dish3: "Pasta integrale al salmone e spinaci",
      dish4: "Banana, gallette di riso, burro d'arachidi",
      dish5: "Petto di pollo, quinoa, verdure grigliate",
    },
    en: {
      eyebrow: "Nutrition plan",
      title: "Diet",
      today_need: "Today's intake",
      kcal: "kcal",
      goal: "Goal",
      carbs: "Carbs",
      protein: "Protein",
      fats: "Fats",
      m_carb: "Carb",
      m_pro: "Pro",
      m_fat: "Fat",
      breakfast: "Breakfast",
      snack: "Snack",
      lunch: "Lunch",
      pre: "Pre-workout",
      dinner: "Dinner",
      dish1: "Oatmeal porridge, blueberries, almonds",
      dish2: "Greek yogurt, honey and nuts",
      dish3: "Wholegrain pasta with salmon and spinach",
      dish4: "Banana, rice cakes, peanut butter",
      dish5: "Chicken breast, quinoa, grilled vegetables",
    },
  },
  tests: {
    it: {
      eyebrow: "Performance",
      title: "Test fisici",
      vs_prev: "vs prec.",
      last_test: "Ultimo test",
      days_ago: "giorni fa",
      row1: "CMJ Jump",
      row2: "Sprint 20m",
      row3: "Sprint 30m",
      row4: "Yo-Yo IR1",
      row5: "Illinois Test",
    },
    en: {
      eyebrow: "Performance",
      title: "Fitness tests",
      vs_prev: "vs prev.",
      last_test: "Last test",
      days_ago: "days ago",
      row1: "CMJ Jump",
      row2: "20m Sprint",
      row3: "30m Sprint",
      row4: "Yo-Yo IR1",
      row5: "Illinois Test",
    },
  },
  body: {
    it: {
      eyebrow: "Stato muscolare",
      title: "Mappa corporea",
      front: "Fronte",
      back: "Retro",
      f_short: "F",
      b_short: "R",
      alert: "Alert",
      recovering: "In recupero",
      resolved: "Risolto",
      active: "Attivo",
      history: "Storico infortuni",
      no_injuries: "Nessun infortunio registrato per questa vista.",
      load_error: "Impossibile caricare gli infortuni. Riprova più tardi.",
      side_left: "Sinistro",
      side_right: "Destro",
      zona_testa_collo: "Testa/collo",
      zona_spalla: "Spalla",
      zona_gomito: "Gomito",
      zona_polso_mano: "Polso/mano",
      zona_torace: "Torace",
      zona_addome: "Addome",
      zona_lombare: "Lombare",
      zona_anca: "Anca",
      zona_flessore_anca: "Flessore dell'anca",
      zona_adduttori: "Adduttori",
      zona_quadricipite: "Quadricipite",
      zona_ischiocrurale: "Ischiocrurale",
      zona_ginocchio: "Ginocchio",
      zona_polpaccio: "Polpaccio",
      zona_tendine_achilleo: "Tendine d'Achille",
      zona_caviglia: "Caviglia",
      zona_piede: "Piede",
    },
    en: {
      eyebrow: "Muscle status",
      title: "Body map",
      front: "Front",
      back: "Back",
      f_short: "F",
      b_short: "B",
      alert: "Alert",
      recovering: "Recovering",
      resolved: "Resolved",
      active: "Active",
      history: "Injury history",
      no_injuries: "No injuries recorded for this view.",
      load_error: "Couldn't load injuries. Please try again later.",
      side_left: "Left",
      side_right: "Right",
      zona_testa_collo: "Head/neck",
      zona_spalla: "Shoulder",
      zona_gomito: "Elbow",
      zona_polso_mano: "Wrist/hand",
      zona_torace: "Chest",
      zona_addome: "Abdomen",
      zona_lombare: "Lower back",
      zona_anca: "Hip",
      zona_flessore_anca: "Hip flexor",
      zona_adduttori: "Adductors",
      zona_quadricipite: "Quadriceps",
      zona_ischiocrurale: "Hamstring",
      zona_ginocchio: "Knee",
      zona_polpaccio: "Calf",
      zona_tendine_achilleo: "Achilles tendon",
      zona_caviglia: "Ankle",
      zona_piede: "Foot",
    },
  },
  matches: {
    it: {
      eyebrow: "Calendario",
      title: "Partite",
      next: "Prossima partita",
      scheduled: "In programma",
      vs: "vs",
    },
    en: {
      eyebrow: "Calendar",
      title: "Matches",
      next: "Next match",
      scheduled: "Scheduled",
      vs: "vs",
    },
  },
  profile: {
    it: {
      eyebrow: "Account",
      title: "Profilo",
      role_unset: "Ruolo non assegnato",
      pro: "Pro Status",
      details: "Anagrafica",
      name: "Nome",
      surname: "Cognome",
      dob: "Data di nascita",
      height: "Altezza",
      weight: "Peso",
      shirt_number: "Numero di maglia",
      preferred_foot: "Piede preferito",
      logout: "Esci",
      language: "Lingua",
      load_error: "Impossibile caricare il profilo. Riprova più tardi.",
      ruolo_portiere: "Portiere",
      ruolo_difensore: "Difensore",
      ruolo_centrocampista: "Centrocampista",
      ruolo_attaccante: "Attaccante",
      piede_destro: "Destro",
      piede_sinistro: "Sinistro",
      piede_ambidestro: "Ambidestro",
    },
    en: {
      eyebrow: "Account",
      title: "Profile",
      role_unset: "Role not set",
      pro: "Pro Status",
      details: "Personal details",
      name: "First name",
      surname: "Last name",
      dob: "Date of birth",
      height: "Height",
      weight: "Weight",
      shirt_number: "Shirt number",
      preferred_foot: "Preferred foot",
      logout: "Log out",
      language: "Language",
      load_error: "Couldn't load your profile. Please try again later.",
      ruolo_portiere: "Goalkeeper",
      ruolo_difensore: "Defender",
      ruolo_centrocampista: "Midfielder",
      ruolo_attaccante: "Forward",
      piede_destro: "Right",
      piede_sinistro: "Left",
      piede_ambidestro: "Both",
    },
  },
  videoCoach: {
    it: {
      eyebrow: "Testa & Corpo",
      title: "Video Coach",
      previous: "Video precedenti",
      empty: "Nessun video assegnato al momento.",
      load_error: "Impossibile caricare i video. Riprova più tardi.",
      close: "Chiudi",
      cat_pre_partita: "Pre-partita",
      cat_focus: "Focus",
      cat_sonno: "Sonno",
      cat_stress: "Stress",
      cat_recupero: "Recupero",
    },
    en: {
      eyebrow: "Mind & Body",
      title: "Video Coach",
      previous: "Previous videos",
      empty: "No video assigned yet.",
      load_error: "Couldn't load videos. Please try again later.",
      close: "Close",
      cat_pre_partita: "Pre-match",
      cat_focus: "Focus",
      cat_sonno: "Sleep",
      cat_stress: "Stress",
      cat_recupero: "Recovery",
    },
  },
  highlights: {
    it: {
      eyebrow: "La tua stagione",
      title: "Highlights",
      top: "Top clip",
      c1: "Gol di destro vs Roma",
      c2: "Assist tacco vs Lazio",
      c3: "Recupero difensivo",
      c4: "Doppietta vs Inter",
    },
    en: {
      eyebrow: "Your season",
      title: "Highlights",
      top: "Top clip",
      c1: "Right-foot goal vs Roma",
      c2: "Backheel assist vs Lazio",
      c3: "Defensive recovery",
      c4: "Brace vs Inter",
    },
  },
  login: {
    it: {
      area: "Area calciatore",
      title_1: "Entra in campo,",
      title_2: "a modo tuo.",
      sub: "Il tuo piano di allenamento, dieta e recupero — sincronizzato con lo staff tecnico.",
      cta: "Accedi",
      loading: "Accesso in corso…",
      tos: "Accedendo accetti i Termini di Servizio e la Privacy Policy.",
      email: "Email",
      email_ph: "nome@squadra.it",
      password: "Password",
      password_ph: "La tua password",
      forgot: "Password dimenticata?",
      no_signup: "Gli account sono creati dallo staff tecnico.",
      err_credentials: "Email o password non corretti.",
      err_network: "Server non raggiungibile. Riprova più tardi.",
      err_generic: "Accesso non riuscito. Riprova.",
      forgot_title: "Recupera password",
      forgot_sub: "Inserisci la tua email: ti invieremo un link per reimpostare la password.",
      forgot_cta: "Invia link di reset",
      forgot_sent: "Se l'email è registrata, riceverai a breve il link di reset.",
      back_login: "Torna al login",
      reset_title: "Nuova password",
      reset_sub: "Scegli una nuova password per il tuo account.",
      new_password: "Nuova password",
      confirm_password: "Conferma password",
      reset_cta: "Reimposta password",
      reset_ok: "Password aggiornata. Accesso in corso…",
      err_mismatch: "Le password non coincidono.",
      err_code: "Link di reset non valido o scaduto.",
      err_short: "La password deve avere almeno 6 caratteri.",
    },
    en: {
      area: "Player area",
      title_1: "Step on the pitch,",
      title_2: "your way.",
      sub: "Your training, diet and recovery plan — in sync with your coaching staff.",
      cta: "Sign in",
      loading: "Signing in…",
      tos: "By signing in you agree to the Terms of Service and Privacy Policy.",
      email: "Email",
      email_ph: "name@team.com",
      password: "Password",
      password_ph: "Your password",
      forgot: "Forgot password?",
      no_signup: "Accounts are created by the coaching staff.",
      err_credentials: "Wrong email or password.",
      err_network: "Server unreachable. Please try again later.",
      err_generic: "Sign in failed. Please try again.",
      forgot_title: "Reset password",
      forgot_sub: "Enter your email and we'll send you a reset link.",
      forgot_cta: "Send reset link",
      forgot_sent: "If the email is registered, you'll receive a reset link shortly.",
      back_login: "Back to sign in",
      reset_title: "New password",
      reset_sub: "Choose a new password for your account.",
      new_password: "New password",
      confirm_password: "Confirm password",
      reset_cta: "Reset password",
      reset_ok: "Password updated. Signing in…",
      err_mismatch: "Passwords do not match.",
      err_code: "Invalid or expired reset link.",
      err_short: "Password must be at least 6 characters.",
    },
  },
} as const;

// ---------- Context ----------

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
};

const LangContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // SSR-safe: always start "it", then hydrate from storage
  const [lang, setLangState] = useState<Lang>("it");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "it") setLangState(saved);
      else {
        const nav = typeof navigator !== "undefined" ? navigator.language : "";
        if (nav && !nav.toLowerCase().startsWith("it")) setLangState("en");
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      document.documentElement.lang = lang;
    } catch {}
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
  }, []);

  const toggle = useCallback(() => {
    setLangState((prev) => {
      const next: Lang = prev === "it" ? "en" : "it";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {}
      return next;
    });
  }, []);

  const value = useMemo(() => ({ lang, setLang, toggle }), [lang, setLang, toggle]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): Lang {
  const ctx = useContext(LangContext);
  return ctx?.lang ?? "it";
}

export function useLanguage(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) return { lang: "it", setLang: () => {}, toggle: () => {} };
  return ctx;
}

type DictNamespace = keyof typeof dict;

export function useT<N extends DictNamespace>(ns: N): (typeof dict)[N]["it"] {
  const lang = useLang();
  return dict[ns][lang] as (typeof dict)[N]["it"];
}

// ---------- UI ----------

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
