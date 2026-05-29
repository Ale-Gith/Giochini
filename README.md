# I Campioni — Vacation Game

Sito demenziale per la vacanza con gli amici. Punteggi, premi e penalità tracciati live.

## Avvio locale

```bash
npm install
npm run dev
```

Apri http://localhost:5173

## Setup Firebase (necessario prima di andare live)

1. Vai su https://console.firebase.google.com e crea un nuovo progetto.
2. Aggiungi una **Web App** al progetto e copia la config.
3. Abilita **Authentication** → **Sign-in method** → **Anonymous**.
4. Abilita **Cloud Firestore** in modalità test (per ora).
5. Crea il file `src/lib/firebaseConfig.ts` (vedi `firebaseConfig.example.ts`) e incolla la config.

```ts
// src/lib/firebaseConfig.ts
export const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
}
```

Il file `firebaseConfig.ts` è ignorato da git? No — la config Firebase web è pubblica per design. La sicurezza viene dalle Firestore Security Rules.

## Setup allowlist

Modifica `src/data/allowlist.json` con le email autorizzate.

## Deploy su GitHub Pages

1. Crea un repo GitHub (es. `vacation-game`).
2. In `vite.config.ts` imposta `base: '/<nome-repo>/'`.
3. `npm run deploy` → builda e pubblica su branch `gh-pages`.
4. Su GitHub: Settings → Pages → Source = branch `gh-pages`.

## Owner

Solo l'email in `OWNER_EMAIL` (definita in `src/lib/auth.ts`) vede il pannello admin per caricare gli excel.

## Struttura

Vedi `CLAUDE.md` per la specifica completa.
