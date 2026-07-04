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
│   ├── supabase.js          # Supabase client (anon key only)
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
└── policies.sql             # RLS policies for Supabase
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

### 2. Environment variables

Copy `.env.example` to `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Use only the **anon public key** in the frontend. Never expose the service role key.

### 3. Supabase setup

Create these tables in your Supabase project:

**`clipboard_rooms`**
| Column | Type |
|--------|------|
| id | uuid (primary key) |
| room_code | text (unique) |
| title | text |
| created_at | timestamptz |
| expires_at | timestamptz |

**`clipboard_items`**
| Column | Type |
|--------|------|
| id | uuid (primary key) |
| room_code | text |
| type | text (`text`, `image`, `file`) |
| content | text |
| file_url | text |
| file_name | text |
| file_type | text |
| created_at | timestamptz |
| updated_at | timestamptz |

**Storage bucket:** `clipboard-files` (public read for file URLs)

**RLS & Realtime:** Run the SQL in [`supabase/policies.sql`](supabase/policies.sql) in the Supabase SQL Editor.

### 4. Run locally

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
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Redeploy after adding env vars

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

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| White screen on deploy | Set `VITE_SUPABASE_*` in Vercel and redeploy |
| Room expiry not saving | Run `supabase/policies.sql` (UPDATE policy) |
| Files not syncing | Enable Realtime on `clipboard_items` + RLS SELECT/INSERT |
| Upload fails | Check `clipboard-files` bucket permissions |

---

## License

Private project — all rights reserved.
