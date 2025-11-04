# AKAY AI GENERATOR

Next.js + TypeScript dashboard untuk mengakses berbagai model AI dari Freepik API:

- Gemini 2.5 Flash
- Google Imagen 3
- Seedream 4 (text-to-image)
- Seedream 4 Edit (image-to-image)
- Upscaler Creative
- Upscale Precision V1 & V2
- Remove Background
- Kling Std 2.1 (image-to-video)
- Kling v2.5 Pro
- Seedance Pro 480p / 720p / 1080p
- Wan v2.2 480p
- Latent-Sync (lip sync)

## Setup lokal

```bash
npm install
cp .env.example .env.local
# isi FREEPIK_API_KEY, ADMIN_EMAIL, ADMIN_PASSWORD di .env.local
npm run dev
```

Buka `http://localhost:3000/login`, login pakai kredensial admin, lalu akses dashboard di `/`.

## Deploy ke Vercel

1. Push project ke GitHub / GitLab / Bitbucket.
2. Import ke Vercel sebagai project Next.js.
3. Di **Project → Settings → Environment Variables**, isi:
   - `FREEPIK_API_KEY`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
4. Deploy.

Dashboard dan API `/api/freepik` terproteksi oleh middleware dan hanya bisa dipakai setelah login admin.
