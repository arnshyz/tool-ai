
# UGC Tool — Next.js 14 + Prisma + S3 + Upstash Redis + Worker

## Setup
1. `cp .env.example .env` lalu isi DB, S3/R2, Upstash, dan OpenAI jika pakai adapter OpenAI.
2. `npm i`
3. `npx prisma migrate dev --name init`
4. `npm run dev` dan buka `http://localhost:3000/ugc`

## Generate Flow
- Upload file produk → `/api/upload-url` → dapat `key`
- Start job → `/api/generate/start`
- Worker cron `/api/worker` memproses dan mengisi hasil ke Redis
- UI poll `/api/generate/status?id=...`

## Deploy Vercel
- Tambah `vercel.json` cron.
- Set semua env di Project Settings.

## Catatan
- Adapter OpenAI mengembalikan data URL untuk demo. Untuk CDN, simpan ke S3 menggunakan `saveBase64PNG`.
