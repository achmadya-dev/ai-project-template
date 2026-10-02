# Architecture

## Baseline
Modular monolith: satu aplikasi TanStack Start, satu repo, PostgreSQL, Bun 1.4.2 + Nitro preset `bun`. Bun (dipin di `.bun-version` dan `packageManager`) mengelola dependency dan menjadi application runtime untuk development/build/production. Commit `bun.lock` dan gunakan frozen install di CI. Node 24 bukan application runtime; saat ini hanya dipertahankan untuk kompatibilitas tooling Vitest/Playwright. Transport server functions → repository → PostgreSQL. Domain input memakai Zod dan tidak mengimpor UI/DB.

Server functions merupakan endpoint yang harus divalidasi dan diotorisasi. Jangan mempercayai input, ID tenant, atau role dari client. Versi Start yang dikunci memiliki default CSRF middleware untuk server functions; jangan menonaktifkannya. Auth belum tersedia; demo hanya development dan harus opt-in. Server functions juga memeriksa flag build `import.meta.env.DEV`, sehingga mengganti NODE_ENV saat menjalankan output production tidak mengaktifkan demo.

## Boundaries
- Domain: `src/modules/<domain>/domain` berisi aturan murni.
- Repository `.server.ts`: SQL parameterized dan pemetaan hasil DB.
- `*.functions.ts`: transport, validasi, policy/authorization, delegasi.
- Routes: presentasi dan interaksi; tidak berisi SQL.
- Migrasi: eksplisit, berversi, immutable setelah diterapkan.

Jangan menambah generic service layer, microservices, Redis, event bus, atau package workspace tanpa kebutuhan nyata. Background worker bisa ditambahkan dalam repo ini ketika ada job yang membutuhkan lifecycle terpisah.

## Production decisions required
Pilih auth provider/session model, tenant boundary, RBAC, runtime DB roles, logging/audit, rate limit, backup/restore, dan deployment. DB role demo memiliki kemampuan DDL; production wajib memisahkan role aplikasi dan migrasi. Demo tidak mengimplementasikan row-level security.

## ADR
Gunakan `docs/adr/0000-template.md` untuk keputusan lintas modul atau yang mahal dibalik. Catat alternatif dan konsekuensi, bukan hanya pilihan.
