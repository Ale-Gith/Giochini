# Ma allora lo sborriamo il cuscino al Genes?

Sito web interattivo per una vacanza con 7 amici. Gioco demenziale con punteggi, premi e penalità tracciati nel tempo. Deploy su GitHub Pages.

- **Nome ufficiale del sito**: "Ma allora lo sborriamo il cuscino al Genes?" — "Genes" è inside joke, non corrisponde al luogo reale della vacanza.
- **Tappe** (in ordine): Barcelona → Valencia → Montpellier → Gorges du Verdon
- **Periodo**: 31 luglio — 14 agosto 2026
- **Edizione**: MMXXVI

L'utente vuole una UI/UX curata e sorprendente — non scegliere pattern banali, stupire sempre. Niente di scontato.

**Direzione estetica attuale**: brutalist / poster da partita. Nero + bianco caldo + rosso "calcio italiano" (#DC1E37). Tipografia condensata massiccia (Anton) per i titoli, JetBrains Mono per dati e label. Niente carta vintage, niente carnevale, niente alloretti emoji. Il titolo volgare è arte, il design lo rispetta con confidenza.

## Owner

- **franceschi.ale4@gmail.com** — unico autorizzato a caricare excel e accedere al pannello di amministrazione. La sua maschera owner non deve essere visibile agli altri utenti. Definito come `OWNER_EMAIL` in `src/lib/auth.ts`.

## Personaggi (7 preimpostati, 1 per amico)

1. **El Pertega** (El Aquila)
2. **El Bronto**
3. **El Maje**
4. **El mas forcio** (Teo)
5. **El mas grosso** (Giobbo)
6. **El Denisio**
7. **El(r) meglio del colosseo** (Romeone)

Foto profilo: saranno fornite dall'utente in seguito, una per personaggio. Per ora si usano placeholder generati (iniziali su sfondo colorato).

Ogni personaggio ha una maschera **settings** in cui può modificare nome visualizzato e altre proprietà (motto, colore preferito sul grafico, emoji rappresentativa, ecc.).

## Pagine

1. **Login email**: l'utente inserisce la propria email → check contro allowlist → **il personaggio si associa automaticamente** dal mapping email→characterId in `src/data/allowlist.json`. Se l'email non è in mappa, accesso negato (timbro "RESPINTO").
2. **Selezione personaggio**: ~~griglia di scelta~~ → ora il personaggio è auto-assegnato. La pagina rimane come fallback per email mappate senza characterId (caso che non dovrebbe verificarsi normalmente).
3. **Score (main)**:
   - Tabella riepilogativa ordinata per punteggio decrescente.
   - Grafico trend line: asse X = tempo, asse Y = score; ogni linea termina con un cerchio contenente la foto profilo del giocatore.
   - Tutto interattivo: click su un personaggio (in tabella o nel grafico) → apre la **scheda personaggio**.
4. **Scheda personaggio**: dettagli, storico premi/penalità ricevuti, statistiche, settings.
5. **Premi e Penalità**: pagina dove aggiungere eventi (premi o penalità) pescando dalla lista caricata via excel dall'owner. UI/UX da pensare con cura. **Solo l'owner può aggiungere eventi** (decisione confermata).
6. **Pannello owner** (visibile solo all'owner): upload dell'excel premi/penalità + eventuale gestione allowlist email.

## Excel premi/penalità

Struttura:

| descrizione cazzata | punteggio |
|---------------------|-----------|

- I punteggi possono essere positivi (premi) o negativi (penalità).
- Solo l'owner può caricarlo, da una maschera dedicata.
- Parsing client-side con [SheetJS](https://sheetjs.com/) (`xlsx`).
- Una volta caricato, l'elenco premi/penalità viene salvato in Firestore (collezione `catalog`) per essere disponibile a tutti.

## Decisioni architetturali confermate

- **Frontend**: React + Vite + TypeScript
- **Hosting**: GitHub Pages (static)
- **Backend / data**: **Firebase** — Firestore per persistenza, sync real-time tra dispositivi
- **Auth (v1)**: Firebase Anonymous Auth + check client-side dell'email contro allowlist. Owner identificato dal match dell'email contro la costante `OWNER_EMAIL`. Soft security accettabile per uso tra amici. Upgrade futuro: Firebase Auth Email Link (magic link) per protezione hard delle write owner-only.
- **Routing**: `react-router-dom` con `HashRouter` (compatibile con GitHub Pages).
- **Stato**: React Context + hooks per ora, eventuale Zustand più avanti.
- **Styling**: CSS Modules, zero dipendenze extra.
- **Charting**: TBD (Recharts vs visx vs custom SVG con D3 minimal). Da decidere quando arriviamo alla pagina Score.
- **Excel parsing**: `xlsx` (SheetJS) lato client.

## Modello dati Firestore

```
/players/{playerId}              # un doc per personaggio (i 7 sono pre-seedati)
  {
    id, name, nickname, motto, color, emoji,
    photoURL, email (assegnata al login),
    createdAt
  }

/events/{eventId}                # ogni premio/penalità assegnato
  {
    playerId, catalogItemId, description, points,
    assignedBy, timestamp
  }

/catalog/{itemId}                # i premi/penalità caricati dall'excel
  {
    description, points, createdAt
  }

/meta/allowlist                  # documento unico con array di email autorizzate
  { emails: string[] }
```

## Struttura file pianificata

```
top secret/
├── CLAUDE.md
├── README.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── index.html
├── .gitignore
├── public/
│   └── characters/     # foto profilo (placeholder per ora)
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── types.ts
    ├── routes/
    │   ├── Login.tsx
    │   ├── CharacterSelect.tsx
    │   ├── Score.tsx
    │   ├── Character.tsx
    │   ├── Awards.tsx
    │   ├── Settings.tsx
    │   └── Owner.tsx
    ├── components/
    ├── lib/
    │   ├── firebase.ts
    │   ├── auth.ts
    │   └── store.ts
    ├── data/
    │   ├── characters.ts
    │   └── allowlist.json
    └── styles/
        └── global.css
```

## Da fornire dall'utente

- Configurazione Firebase (apiKey, projectId, ecc.) — istruzioni in `README.md`.
- Lista email autorizzate + mapping email → personaggio (opzionale, si può scegliere a login).
- Foto profilo dei 7 personaggi (PNG/JPG, idealmente quadrate).
- Excel di prova premi/penalità.
- Nome repo GitHub finale (per impostare `base` in vite.config).

## Estetica scelta per v1

**"Biglietto vintage italiano / luna park"**: cream + bordeaux + ottanio + senape, serif condensato per i titoli, mono/typewriter per il body, micro-animazioni che evocano timbri e biglietti strappati. I nomi dei personaggi (El Pertega, El Aquila, ecc.) suggeriscono un'ironia western-spaghetti che il design abbraccia.

Se non funziona si itera.

## Stato attuale

In scaffolding del progetto. Tasklist tracciata via TaskCreate.
