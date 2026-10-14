# Live Clipboard

A realtime clipboard app for sharing text, images, and files instantly across devices. Create a room, share the code or QR link, and collaborate in real time.

**GitHub:** [Razzakowais28/Live-Clipboard](https://github.com/Razzakowais28/Live-Clipboard)

---

## Overview

Live Clipboard lets you:

- Create temporary rooms with a 6-character code (e.g. `A7K9QZ`)
- Type in a **live shared textarea** — everyone in the room sees updates instantly
- Upload files via button, drag & drop, or paste screenshots
- View shared history with tabs: All, Text, Images, Files, Links
- Join via room code, share link, or QR code
- See how many devices are connected in real time

Built with React + Vite and Supabase (database, storage, realtime).

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 6, JavaScript |
| Routing | React Router |
| Backend | Supabase (Postgres, Storage, Realtime) |
| Icons | Lucide React |
| QR Codes | qrcode.react |
| Styling | Modern CSS (no framework) |

---

## Features

### Home
- Create room
- Join room by code
- Clean SaaS-style UI

### Room
- Live text sync (no button — type and it appears for everyone)
- Copy room code / share link / show QR
- Device presence count
- Room expiry: 1 hour, 24 hours, 7 days, or never
- Toolbar: Upload, Paste, Clear, Copy
- Drag & drop file upload
- Paste image from clipboard (Ctrl+V / Cmd+V)
- Clipboard history with filters
- Pin items (localStorage)
- Link detection and preview
- Image lightbox modal
- Toast notifications

---

## Project Structure

```
src/
├── main.jsx                 # App entry
├── App.jsx                  # Routes
├── lib/
│   ├── supabase.js          # Supabase client (publishable key only)
│   └── clipboard.js         # Rooms, items, upload, realtime
├── pages/
│   ├── Home.jsx             # Create / join room
│   └── Room.jsx             # Live clipboard room
├── components/
│   ├── ClipboardItem.jsx
│   ├── DropZone.jsx
│   ├── HistoryTabs.jsx
│   ├── QRModal.jsx
│   ├── ImageModal.jsx
│   ├── LoadingState.jsx
│   └── EmptyState.jsx
├── context/
│   └── ToastContext.jsx
├── utils/
│   ├── roomCode.js
│   ├── fileHelpers.js
│   ├── itemHelpers.js
│   └── expiryHelpers.js
└── styles/
    └── global.css

supabase/
└── schema.sql               # Tables, RLS, realtime, storage
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
git clone https://github.com/Razzakowais28/Live-Clipboard.git
cd Live-Clipboard
npm install
```

### 2. Supabase

The app is already connected to its Supabase project (see `src/lib/supabase.js`) —
no environment variables needed. To point it at your own project, run
[`supabase/schema.sql`](supabase/schema.sql) in that project's SQL Editor and replace
the URL and publishable key in `src/lib/supabase.js`.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |

---

## Deployment

### Vercel (recommended)

1. Push repo to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Build command: `npm run build`
4. Output directory: `dist`

`vercel.json` is included for SPA routing.

### Manual deploy

```bash
npm run build
# Upload dist/ to any static host
```

---

## Realtime Architecture

| Feature | Method |
|---------|--------|
| Live typing | Supabase Broadcast (`live-{roomCode}` channel) |
| File/history sync | Postgres changes on `clipboard_items` |
| Device presence | Supabase Presence (`presence-{roomCode}` channel) |

---


## Troubleshooting

| Issue | Fix |
|-------|-----|
| Room expiry not saving | Run `supabase/schema.sql` (UPDATE policy) |
| Files not syncing | Enable Realtime on `clipboard_items` + RLS SELECT/INSERT |
| Upload fails | Check `clipboard-files` bucket permissions |

---

## License

Private project — all rights reserved.
