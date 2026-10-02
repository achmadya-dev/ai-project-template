# AI Project Template

Satu repo TanStack Start fullstack untuk planning lewat prompt, implementasi oleh agent pilihanmu, dan verifikasi lewat tes + GitHub PR. Tidak terikat worker tertentu.

**Mulai di [START_HERE.md](START_HERE.md).** Contoh prompt siap dipakai ada di [docs/PROMPTS.md](docs/PROMPTS.md).

## Yang tersedia
- TanStack Start + React + TypeScript, Node runtime (Nitro), PostgreSQL.
- Demo katalog development: validasi server, normalisasi SKU, constraint unik PostgreSQL, penanganan duplikat.
- Migrasi SQL berversi dengan transaksi, lock, dan checksum; tidak otomatis dijalankan saat startup.
- Unit test, integrasi PostgreSQL (termasuk race condition), E2E Chromium, smoke test production.
- `AGENTS.md`, adapter Cursor/Claude/Copilot; prosedur portable untuk plan, implement, review.
- Template issue/PR, pemeriksaan metadata PR, CI, dan panduan rulesets GitHub.
- Task lokal dan handoff untuk sesi baru tanpa mengandalkan memori chat.

## Jalankan lokal
Bun mengelola dependency dan menjalankan script; aplikasi tetap memakai runtime Node 24. Instal Bun mengikuti [panduan resmi](https://bun.com/docs/installation), sesuai versi `.bun-version`. Gunakan `bun run test` untuk Vitest; `bun test` adalah runner berbeda.

Prasyarat: Node 24, Bun sesuai `.bun-version`, Docker Compose (atau PostgreSQL milik development). Jika Bun belum terpasang, jalankan `node scripts/doctor.mjs` untuk memeriksa setup awal dan versi Bun yang dibutuhkan.

```sh
bun install --frozen-lockfile
cp .env.example .env
# Jangan timpa .env bila sudah ada.
docker compose up -d --wait db
bun run db:migrate
bun run dev
```

Buka http://127.0.0.1:3000. Demo tidak memiliki login; gunakan data sintetis saja. Binding dev server adalah loopback, jangan expose tanpa menambahkan autentikasi. Pada production build, demo ditolak walaupun `DEMO_ENABLED=true` dan runtime salah diberi `NODE_ENV=development`.

## Verifikasi
```sh
docker compose --profile test up -d --wait db-test
bun run playwright install chromium
bun run verify
```

`TEST_DATABASE_URL` pada `.env.example` menunjuk database terpisah di port 5433. Integrasi menerapkan migrasi pada DB test; E2E dijalankan setelahnya. Jika menjalankan E2E saja, migrasikan DB test dahulu secara eksplisit. Tes menolak nama database yang tidak berakhir `_test`, tetapi nama bukan bukti isolasi: berikan hanya kredensial database disposable.

| Perintah | Kegunaan |
| --- | --- |
| `node scripts/doctor.mjs` / `bun run doctor` | Petunjuk setup; bentuk `node` juga bekerja sebelum Bun terpasang |
| `bun run check` | Lint, policy tests, unit, build, typecheck; tanpa DB |
| `bun run verify` | Check + PostgreSQL integration + E2E + production smoke |
| `bun run task:new nama-task` | Membuat dokumen task tanpa menimpa file lama |
| `bun run db:migrate` | Migrasi target DATABASE_URL; pastikan target dahulu |
| `bun run build && bun run start` | Build dan jalankan server production; demo nonaktif |

## Cara bekerja
1. Buka repo pada tool coding pilihanmu dan minta agent membaca `AGENTS.md`.
2. Jelaskan produk atau fitur; agent menyusun issue/rencana dengan acceptance criteria.
3. Setujui rencana, atau beri izin implementasi langsung jika kebutuhan sudah jelas.
4. Agent membuat branch, kode, tes, dokumentasi, dan PR beserta bukti.
5. Tinjau perilaku dan CI sebelum merge. Tidak ada auto-merge atau auto-deploy bawaan.

Jika GitHub belum terhubung, gunakan `docs/tasks/`. GitHub issue/PR baru dianggap ada setelah benar-benar dibuat; agent harus melaporkan keterbatasan akses.

## Struktur
- `src/routes`: halaman dan transport TanStack.
- `src/modules/catalog`: contoh domain + repository + server functions.
- `src/server`: infrastruktur server dan batas demo.
- `db/migrations`: migrasi forward-only.
- `tests`: unit, integrasi, E2E.
- `docs`: konteks produk/domain, prosedur, keputusan, task, recovery.
- `scripts`: migrasi, task generator, verifikasi metadata dan smoke.
- `.github`: workflow, template, CODEOWNERS.

## Batas versi ini
Template ini **belum merupakan SaaS atau sistem payment siap produksi**. Auth, tenant isolation, role/permission, audit bisnis, backup hosting, observability, dan integrasi pembayaran harus dirancang per proyek. Jangan menganggap demo katalog sebagai desain ERP.

File rules/CI tidak membuat agent kebal salah. Proteksi merge perlu diaktifkan di GitHub; lihat [docs/GITHUB_SETUP.md](docs/GITHUB_SETUP.md). Konfigurasi permission worker tetap milik tool yang kamu gunakan. Tidak ada MCP, token, global hook, atau deployment tersembunyi.

Dependency dikunci di `bun.lock`. Nitro yang dipakai masih versi beta; review update dependency melalui PR dan ulangi build + smoke. Detail versi dan bukti pengujian ada di [docs/VALIDATION.md](docs/VALIDATION.md).
