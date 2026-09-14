# Sezione Video Coach — design

**Data:** 2026-09-14
**Repo coinvolti:** `profoot-lab-frontend` (route, componenti, i18n) e `profoot-lab-backend`
(controller `video-coach.me`).

## Contesto

Il content-type `api::video-coach.video-coach` esiste già nel backend: un video al giorno,
privato per atleta, servito da `GET /api/video-coach/me` (ordina per `data` desc, popola
`copertina`, nessun filtro/populate accettato dal client — vedi
`profoot-lab-backend/docs/content-types/video-coach.md`). Il frontend ha solo il placeholder
"in arrivo" in `src/routes/mental.tsx`; questo spec lo sostituisce con l'implementazione reale.

I video sono embed Bunny Stream (`https://player.mediadelivery.net/play/<library>/<id>`, HLS
gestito internamente dalla piattaforma) — si integrano con un semplice `<iframe>`, non serve un
player HTML5 nativo né rilevare il tipo di URL.

## Decisioni

1. **Backend — limite ultimi 15.** `GET /api/video-coach/me` oggi non ha alcun limite. Il
   controller viene modificato per aggiungere `pagination: { limit: 15 }` fisso lato server
   (oltre al `sort: { data: 'desc' }` già presente). Il client non può richiedere un limite
   diverso — stesso principio di "nessun filtro accettato dal client" già in vigore.
2. **Video futuri esclusi ovunque.** Il filtro `data <= oggi` si applica sia in home sia nella
   sezione Video Coach. Se tra gli ultimi 15 ci sono video con data futura (caso raro ma
   possibile), vengono scartati lato frontend — non riducono comunque la finestra dei 15 già
   fissata lato server.
3. **"Video del giorno" = oggi, o il passato più recente.** Mai un video futuro, né in home né
   nella sezione — la ricerca guarda solo indietro, mai in avanti.
4. **Sezione Video Coach: max 7, ordine decrescente.** Video di oggi/più recente in cima, i più
   vecchi in fondo, mai più di 7 elementi mostrati (anche se il backend ne restituisce fino a 15).
5. **Fallback thumbnail come asset statico.** Se `copertina` non è caricata su un video, si usa
   `public/video-coach-fallback.jpg` (l'immagine fornita, copiata nel repo). Cambia solo con un
   nuovo deploy dell'app, mai a runtime.
6. **UX di riproduzione: modale a schermo intero.** Click sulla thumbnail (in home o nella
   sezione) → overlay scuro con player 16:9 al centro, chiusura con X / backdrop / `Esc`. Stessa
   modale riusata nei due punti d'ingresso.
7. **Layout lista "come `/training`".** Card hero per il video in evidenza (badge Oggi/Ieri/data,
   thumbnail grande) + righe per gli altri video (badge giorno-settimana, thumbnail piccola,
   categoria come tag, durata) — stile ripreso da `training.tsx`.
8. **Route rinominata `/mental` → `/video-coach`**, coerente con il rename già fatto sul
   content-type backend (`modulo-mental-coach` → `video-coach`). Aggiornare tutti i riferimenti
   (quick-access in home, sitemap).
9. **Empty state dedicato.** Se l'atleta non ha nessun video idoneo: in home la card "video del
   giorno" scompare del tutto; nella sezione Video Coach un messaggio "Nessun video assegnato al
   momento" sostituisce l'attuale placeholder "in arrivo".

## Architettura dati (frontend)

Nuovo modulo `src/lib/video-coach.ts` (stesso pattern di `src/lib/infortuni.ts`):

```ts
todayISO(): string                                   // data locale YYYY-MM-DD
visibleVideos(list: StrapiVideoCoach[]): StrapiVideoCoach[]
  // list è già ordinata data desc (viene dall'API) → filtra data <= oggi, slice(0, 7)
featuredVideo(list: StrapiVideoCoach[]): StrapiVideoCoach | null
  // = visibleVideos(list)[0] ?? null (stesso identico video sia in home sia come hero di sezione)
videoThumbnail(v: StrapiVideoCoach): string
  // strapiMediaUrl(v.copertina) ?? "/video-coach-fallback.jpg"
categoriaLabel(t: Record<string,string>, categoria: VideoCoachCategoria | null): string | null
```

`src/lib/strapi.ts` si arricchisce di:

```ts
export type VideoCoachCategoria = "pre_partita" | "focus" | "sonno" | "stress" | "recupero";

export interface StrapiVideoCoach {
  id: number;
  documentId: string;
  titolo: string;
  categoria: VideoCoachCategoria | null;
  durataMinuti: number | null;
  data: string;           // YYYY-MM-DD
  video: string;           // URL embed Bunny
  copertina: StrapiMedia | null;
}

export function strapiVideoCoach(token: string) {
  return request<{ data: StrapiVideoCoach[] }>("/api/video-coach/me", { method: "GET", token });
}
```

Sia `index.tsx` (home) sia `video-coach.tsx` (sezione) usano `useQuery({ queryKey:
["video-coach", jwt], queryFn: () => strapiVideoCoach(jwt) })` — stessa chiave, TanStack Query la
cachea tra le due pagine durante la stessa sessione di navigazione.

## Componenti

### `src/components/VideoPlayerModal.tsx` (nuovo)

Props: `video: { titolo: string; video: string; categoria: string | null; data: string } | null`,
`onClose: () => void`. Renderizzato solo quando `video !== null` (così l'`<iframe>` si smonta alla
chiusura e l'audio non continua in sottofondo). Overlay a schermo intero, player 16:9 con
`<iframe src={\`${video.video}?autoplay=true\`} allow="accelerometer; gyroscope; autoplay;
encrypted-media; picture-in-picture" allowFullScreen />`, titolo/categoria/data sopra il player, X
per chiudere, click sul backdrop chiude, `Esc` chiude (listener su `keydown`), blocco dello scroll
del `body` mentre è aperta.

### `src/routes/video-coach.tsx` (rinominato da `mental.tsx`)

- `useQuery` come sopra; stato loading → spinner centrato (stesso pattern del loader in
  `AppShell`); stato vuoto (`visibleVideos` vuoto) → card con messaggio dedicato.
- Hero: `featuredVideo`, badge "Oggi" se `data === todayISO()`, "Ieri" se un giorno prima,
  altrimenti data formattata; click apre la modale.
- Righe (`visibleVideos.slice(1)`, max 6): badge giorno-settimana + numero (derivati da `data`),
  thumbnail piccola con fallback, categoria come tag, durata se presente; click apre la modale.
- Stato locale `openVideo` per il video aperto nella modale.

### `src/routes/index.tsx`

- Card "Video del giorno" sostituisce l'immagine/testo hardcoded con `featuredVideo` (stessa
  query, stessa funzione `featuredVideo`); non più un `<Link to="/training">` ma un bottone che
  apre `VideoPlayerModal`; **non renderizzata affatto** se `featuredVideo` è `null`.
- Quick-access: `qa_mental` → label "Video Coach", `to: "/video-coach"`.

### `src/routes/sitemap[.]xml.ts`

Entry `{ path: "/mental", ... }` → `{ path: "/video-coach", ... }`.

## Backend (`profoot-lab-backend`)

`src/api/video-coach/controllers/video-coach.ts`, dentro `me`:

```ts
const videoCoach = await strapi.documents('api::video-coach.video-coach').findMany({
  filters: { atleta: { id: atleta.id } },
  sort: { data: 'desc' },
  populate: { copertina: true },
  pagination: { limit: 15 },   // nuovo — fisso lato server, non richiedibile dal client
});
```

Aggiornare `docs/content-types/video-coach.md`: sezione "Endpoint creato" (menzionare il limite),
sezione "Decisioni aperte" (rispondere al punto sulla sezione frontend "coming soon" — ora reale),
e il Changelog in fondo al file.

## i18n (`src/lib/i18n.tsx`)

- Namespace `mental` → rinominato **`videoCoach`**: nuovo copy per eyebrow/titolo, "Oggi"/"Ieri",
  le 5 etichette categoria (`pre_partita`→Pre-partita, `focus`→Focus, `sonno`→Sonno,
  `stress`→Stress, `recupero`→Recupero), messaggio di stato vuoto, aria-label del pulsante di
  chiusura modale. Riusa le abbreviazioni giorni già presenti in `train` (`d_lun`…`d_dom`).
- Namespace `home`: `qa_mental`/`qa_mental_sub` → copy "Video Coach"; rimosse le chiavi mock ormai
  morte (`today_tuesday`, `squat_title`, `squat_sub`), sostituite da dati reali.
- IT ed EN aggiornati in coppia, come il resto del dizionario.

## Asset

`public/video-coach-fallback.jpg` — copia dell'immagine allegata (2752×1536, JPEG). Nessuna
ottimizzazione richiesta in questo spec; eventuale compressione è un miglioramento successivo.

## Fuori scope

- Tracciamento completamento/preferiti/streak (già segnato come decisione aperta nel doc backend,
  non richiesto qui).
- Vincolo di unicità `(atleta, data)` lato backend (validazione staff, non tocca questa feature).
- Localizzazione del contenuto redazionale (titoli/categorie restano in italiano, come da
  convenzione trasversale del backend).

## Verifica

- `bun run lint` e `bun run build` sul frontend.
- Avvio manuale di Strapi (`npm run develop`) e verifica che `/api/video-coach/me` risponda con al
  massimo 15 record dopo la modifica al controller.
- Verifica manuale in browser: home con/senza video idoneo; sezione con 0, pochi e 7+ video
  idonei; un video con data futura che non deve mai comparire; apertura/chiusura modale (X,
  backdrop, `Esc`); fallback thumbnail quando `copertina` è assente.
