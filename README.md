# AI Project Template

Satu repo TanStack Start fullstack untuk planning lewat prompt, implementasi oleh agent pilihanmu, dan verifikasi lewat tes + GitHub PR. Tidak terikat worker tertentu.

**Mulai di [START_HERE.md](START_HERE.md).** Contoh prompt siap dipakai ada di [docs/PROMPTS.md](docs/PROMPTS.md).

## Yang tersedia
- TanStack Start + React + TypeScript, Bun runtime (Nitro), PostgreSQL.
- Tailwind CSS untuk styling, ESLint untuk linting, Prettier untuk formatting + sorting utility Tailwind, dan Husky/lint-staged untuk pemeriksaan staged files.
- Halaman awal template tanpa fitur bisnis bawaan.
- Migrasi SQL berversi dengan transaksi, lock, dan checksum; tidak otomatis dijalankan saat startup.
- Unit test, integrasi PostgreSQL untuk adapter/migrasi, E2E Chromium untuk halaman awal, smoke test production.
- `AGENTS.md`, adapter Cursor/Claude/Copilot; prosedur portable untuk plan, implement, review.
- Template issue/PR, pemeriksaan metadata PR, CI, dan panduan rulesets GitHub.
- Task lokal dan handoff untuk sesi baru tanpa mengandalkan memori chat.

## Jalankan lokal
Bun mengelola dependency, menjalankan development/build, dan menjadi runtime aplikasi production. Versi Bun dikunci di `.bun-version` dan `packageManager`; instal Bun mengikuti [panduan resmi](https://bun.com/docs/installation). Nitro dibangun dengan preset `bun`.

Prasyarat aplikasi: Bun sesuai `.bun-version`. Docker Compose atau PostgreSQL diperlukan hanya untuk integrasi. Node 24 masih dipakai **hanya sebagai tooling test** karena Vitest 5 dan Playwright saat ini mendokumentasikan Node sebagai prerequisite; Node bukan runtime aplikasi.

```sh
bun install --frozen-lockfile
cp .env.example .env
# Jangan timpa .env bila sudah ada.
bun run dev
```

Buka http://127.0.0.1:3000. Halaman awal tidak memerlukan database. PostgreSQL dan migrasi hanya diperlukan setelah menambahkan slice yang menggunakannya; `bun run db:migrate` akan tetap menerapkan migrasi katalog historis yang tidak lagi dipakai aplikasi. Binding dev server adalah loopback; jangan expose ke jaringan tanpa autentikasi.

## Verifikasi
```sh
docker compose --profile test up -d --wait db-test
bun run playwright install chromium
bun run verify
```

`TEST_DATABASE_URL` pada `.env.example` menunjuk database terpisah di port 5433. Integrasi menerapkan migrasi historis pada DB test dan menjalankan tes adapter; E2E halaman awal tidak memerlukan database. Tes menolak nama database yang tidak berakhir `_test`, tetapi nama bukan bukti isolasi: berikan hanya kredensial database disposable.

| Perintah | Kegunaan |
| --- | --- |
| `bun run doctor` | Petunjuk setup, versi Bun runtime, dan tooling yang masih diperlukan |
| `bun run format` | Memformat source, test, script, dan config yang dikelola Prettier; utility Tailwind ikut diurutkan |
| `bun run format:check` | Memeriksa formatting tanpa mengubah file |
| `bun run check` | Format check, lint, policy tests, unit, build, typecheck; tanpa DB |
| `bun run verify` | Check + PostgreSQL integration + E2E + Bun production smoke |
| `bun run task:new nama-task` | Membuat dokumen task tanpa menimpa file lama |
| `bun run db:migrate` | Migrasi target DATABASE_URL; pastikan target dahulu. Termasuk migrasi katalog historis |
| `bun run build && bun run start` | Build dengan Bun + Nitro preset Bun dan jalankan production dengan Bun |

## Cara bekerja
1. Buka repo pada tool coding pilihanmu dan minta agent membaca `AGENTS.md`.
2. Jelaskan produk atau fitur; agent menyusun issue/rencana dengan acceptance criteria.
3. Setujui rencana, atau beri izin implementasi langsung jika kebutuhan sudah jelas.
4. Agent membuat branch, kode, tes, dokumentasi, dan PR beserta bukti.
5. Tinjau perilaku dan CI sebelum merge. Tidak ada auto-merge atau auto-deploy bawaan.

Jika GitHub belum terhubung, gunakan `docs/tasks/`. GitHub issue/PR baru dianggap ada setelah benar-benar dibuat; agent harus melaporkan keterbatasan akses.

## Struktur
- `src/routes`: halaman dan transport TanStack.
- `src/modules/<domain>`: lokasi untuk vertical slice domain yang disetujui.
- `src/server`: infrastruktur server bersama.
- `db/migrations`: migrasi forward-only.
- `tests`: unit, integrasi, E2E.
- `docs`: konteks produk/domain, prosedur, keputusan, task, recovery.
- `scripts`: migrasi, task generator, verifikasi metadata dan smoke.
- `.github`: workflow, template, CODEOWNERS.

## Batas versi ini
Template ini **belum merupakan SaaS atau sistem payment siap produksi** dan tidak menyediakan domain bisnis bawaan. Auth, tenant isolation, role/permission, audit bisnis, backup hosting, observability, dan integrasi pembayaran harus dirancang per proyek. Migrasi katalog lama dipertahankan sebagai sejarah; bukan kontrak domain produk.

File rules/CI tidak membuat agent kebal salah. Proteksi merge perlu diaktifkan di GitHub; lihat [docs/GITHUB_SETUP.md](docs/GITHUB_SETUP.md). Konfigurasi permission worker tetap milik tool yang kamu gunakan. Tidak ada MCP, token, global hook, atau deployment tersembunyi.

Dependency dikunci di `bun.lock`. Nitro yang dipakai masih versi beta; review update dependency melalui PR dan ulangi build + smoke. Detail versi dan bukti pengujian ada di [docs/VALIDATION.md](docs/VALIDATION.md).
