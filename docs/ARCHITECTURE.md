# Architecture

## Baseline

Modular monolith: satu aplikasi TanStack Start, satu repo, PostgreSQL, Bun 1.4.2 + Nitro preset `bun`. Bun (dipin di `.bun-version` dan `packageManager`) mengelola dependency dan menjadi application runtime untuk development/build/production. Commit `bun.lock` dan gunakan frozen install di CI. Node 24 bukan application runtime; saat ini hanya dipertahankan untuk kompatibilitas tooling Vitest/Playwright.

Alur backend utama:

```text
client/loader
  -> TanStack server function
  -> request/validation middleware
  -> domain repository
  -> DatabaseClient abstraction
  -> pg adapter
  -> PostgreSQL
```

Server functions merupakan endpoint yang harus divalidasi dan diotorisasi. Jangan mempercayai input, ID tenant, atau role dari client. Versi Start yang dikunci memiliki default CSRF middleware untuk server functions; jangan menonaktifkannya. Auth belum tersedia; demo hanya development dan harus opt-in. Server functions juga memeriksa flag build `import.meta.env.DEV`, sehingga mengganti NODE_ENV saat menjalankan output production tidak mengaktifkan demo.

## Backend core

`src/server/` berisi infrastructure boundary lintas domain yang kecil dan bernama jelas:

- `env.server.ts`: satu-satunya application boundary yang membaca `process.env`; raw string diparse menjadi config typed/camelCase dan dicache.
- `errors.ts`: client-safe error contract berisi taxonomy umum (`invalid_argument`, `not_found`, `conflict`, `unauthorized`, `forbidden`, `rate_limited`, `internal`) plus stable domain/application codes.
- `logger.server.ts`: structured JSON logging tanpa payload/secret mentah.
- `request.ts`: import-safe TanStack server-function middleware untuk request id, timing, validation, dan centralized error logging; implementasi `.server()` boleh memakai server-only logger sementara kontrak middleware/result tetap aman diimpor oleh `*.functions.ts`.
- `database.server.ts`: satu-satunya application wrapper untuk `pg`; menangani query result shape, row validation, transaction plumbing, dan mapping error PostgreSQL yang diketahui.
- `db.server.ts`: lazy composition untuk database runtime berdasarkan typed config.

Core ini bukan generic service framework. Jangan menambah BaseRepository, Manager, Processor, atau abstraction layer lain tanpa kebutuhan konkret.

## Boundaries

- Domain: `src/modules/<domain>/domain` berisi aturan murni, input schema, row/result schema, dan domain type. Tidak mengimpor React, TanStack, database, process/environment, filesystem, atau network.
- Repository `.server.ts`: SQL parameterized dan query domain-specific. Repository menerima/menyusun `DatabaseClient`, bukan `pg.Pool`, dan tidak mengekspos `QueryResult`/kode error PostgreSQL.
- `*.functions.ts`: transport boundary. Pasang request/validation middleware, enforce policy/authorization, lalu delegate ke repository/domain. Tidak membaca `process.env` atau detail `pg` langsung.
- Routes: presentasi dan interaksi; tidak berisi SQL atau server-only infrastructure.
- Migrasi: eksplisit, berversi, immutable setelah diterapkan.

Dependencies point inward. UI/transport boleh menggunakan domain contract dan server functions; repository boleh menggunakan domain type + shared database abstraction; domain tidak bergantung pada infrastructure.

## Errors and request handling

Expected failures memakai stable `AppError` kind + code. Kind bersifat generik untuk transport/observability, sedangkan code boleh domain-specific seperti `DUPLICATE_SKU`. Known database constraints dipetakan dekat query yang mengetahui maknanya; raw PostgreSQL codes diterjemahkan satu kali oleh adapter. Unexpected failures tetap dilempar, dinormalisasi menjadi `internal`, dicatat oleh request middleware, dan detail internal tidak dikirim ke user.

Jangan menambahkan `try/catch` pada setiap repository/server function hanya untuk mengulang logging atau mapping error yang sama. Catch lokal hanya ketika scope tersebut benar-benar dapat memulihkan, menerjemahkan semantic tertentu, atau melakukan cleanup yang tidak ditangani core.

## Environment

Application server code menggunakan `getEnv()` dan tidak membaca `process.env` berulang kali. Test harness, build config, scripts, dan process launcher boleh membaca/mengatur environment secara langsung karena mereka berada di luar application runtime boundary.

## Production decisions required

Pilih auth provider/session model, tenant boundary, RBAC, runtime DB roles, logging/audit sink, rate limit, backup/restore, dan deployment. DB role demo memiliki kemampuan DDL; production wajib memisahkan role aplikasi dan migrasi. Demo tidak mengimplementasikan row-level security.

Structured console logging pada template adalah baseline, bukan observability stack production. Production dapat mengganti sink/logger di boundary yang sama tanpa mengubah feature repositories.

## ADR

Gunakan `docs/adr/0000-template.md` untuk keputusan lintas modul atau yang mahal dibalik. Catat alternatif dan konsekuensi, bukan hanya pilihan.
