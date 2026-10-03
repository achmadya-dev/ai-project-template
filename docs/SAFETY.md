# Safety boundaries

## Yang benar-benar diperiksa
- TypeScript/lint/test melalui CI.
- PostgreSQL adapter: validasi row, cardinality, transaksi, dan pemetaan constraint.
- Smoke test production: halaman awal tersedia tanpa kredensial database.
- Checksum migrasi yang sudah diterapkan oleh runner migrasi.
- Metadata PR dan indikasi path sensitif oleh verifier dari base commit.

## Yang bukan enforcement
AGENTS.md, runbook, risk label, checkbox PR, dan local git hooks tidak membatasi kredensial atau mencegah semua tindakan buruk. Agent dapat salah; repo tidak mengisolasi komputer pengguna. Rulesets GitHub belum aktif hanya karena file ini ada. Tes dan dependency dalam PR juga bisa diubah; perubahan governance memerlukan review.

## Tingkat risiko
- Low: perubahan terbatas, tidak memengaruhi data/akses/kontrak.
- Medium: logika fitur biasa dengan dampak terlokalisasi.
- High: auth, tenant, uang, stok kritis, migrasi, dependency, CI, governance, external side effects.

Path heuristic di check-pr hanya batas bawah, bukan klasifikasi lengkap. High tidak otomatis diblokir untuk selamanya; butuh review dan izin sesuai tindakan. Jangan terus meminta persetujuan untuk pekerjaan reversible yang sudah diotorisasi.

## Credentials
Coding agent cukup mendapat akses repo/branch dan DB disposable. Jangan berikan production credentials. Jalankan worker tanpa kredensial personal yang tidak diperlukan. Jangan expose dev server ke internet. Ini konfigurasi tool/host, bukan sesuatu yang dapat dipaksakan folder ini.

## CI
Token read-only; tidak memakai secrets deployment. PR metadata diproses sebagai data, bukan diinterpolasi ke shell. Verifier metadata diekstrak dari base SHA, bukan versi yang dapat diganti PR. Hindari checkout untrusted code pada pull_request_target/workflow_run berprivilege. Pemeriksaan lain tetap perlu review karena source workflow/test adalah bagian dari repo.

## Migrasi
Runner hanya untuk SQL transaksional; tidak mendukung CREATE INDEX CONCURRENTLY. Lock/statement timeout mencegah menunggu tanpa batas. Backfill besar dan operasi non-transaksional perlu rencana terpisah. Jangan menjalankan reset/drop otomatis. Kompatibilitas versi aplikasi lama terhadap schema baru harus diuji ketika migrasi nyata ditambahkan.
