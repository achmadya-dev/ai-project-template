# Workflow satu proyek

## Sumber kebenaran
Kode + docs repo menyimpan kondisi saat ini. Issue menyimpan kebutuhan dan diskusi, PR menyimpan perubahan dan bukti. Dokumen `docs/tasks/<slug>.md` adalah catatan berversi, termasuk fallback saat GitHub tidak tersedia. Tautkan semuanya; jangan menduplikasi informasi yang cepat basi tanpa referensi.

## Status task
`draft` → `ready` → `in-progress` → `in-review` → `done`; `blocked` jika keputusan/akses menghalangi. Status di dokumen adalah catatan, bukan mesin enforcement. `ready` berarti acceptance criteria cukup jelas dan ada otorisasi pengguna untuk scope tersebut.

## Planning
1. Baca konteks, kode terkait, git status, dan tes.
2. Tentukan outcome, scope, invariant, AC bernomor, risiko, langkah, dan verifikasi.
3. Ajukan pertanyaan hanya untuk pilihan material. Tulis asumsi rutin.
4. Buat issue GitHub atau task lokal. Catat revisi rencana dan sumber otorisasi; jangan mengarang persetujuan.
5. Perubahan scope material membutuhkan penyesuaian rencana. Otorisasi lama tidak berlaku otomatis pada scope baru.

## Implementasi
1. Satu task per branch. Simpan perubahan pengguna yang sudah ada.
2. Kerjakan slice kecil yang dapat diuji. Tes harus membuktikan perilaku dan kegagalan penting.
3. Jalankan `bun run check` dan pemeriksaan DB/E2E yang relevan. Untuk perubahan alur fullstack berbasis database, `bun run verify`.
4. Perbarui domain/ADR/runbook bila perilakunya berubah.
5. Catat command, hasil aktual, keterbatasan, dan revisi kode. Jika gagal, jelaskan; jangan melemahkan tes.
6. Buat commit logis dengan format di `docs/COMMITS.md`; jangan campur perubahan yang tidak terkait dalam satu commit.
7. Sebelum membuat PR, baca `.github/PULL_REQUEST_TEMPLATE.md` dan `scripts/check-pr.mjs`, lalu periksa daftar file final terhadap klasifikasi path sensitif verifier.
8. Buat PR dari template repo, bukan body improvisasi. Gunakan issue nyata pada baris `Closes #123`, isi `Risk: low|medium|high` sesuai diff, dan lengkapi semua section yang diverifikasi: Goal, Changes, Verification, Compatibility and recovery, serta Documentation.
9. Jika verifier mengklasifikasikan perubahan sebagai sensitif, gunakan `Risk: high` dan ikuti kebijakan review repo. Jangan menurunkan risk, mengubah verifier, atau melemahkan CI untuk memperoleh status hijau.

## Commit
Gunakan Conventional Commits sesuai `docs/COMMITS.md`:

```text
<type>(<scope>): <description>
```

Contoh:

```text
feat(auth): add password reset flow
fix(api): reject malformed pagination cursor
refactor(domain): extract order pricing policy
docs: clarify local setup
```

Breaking change wajib ditandai dengan `!` atau footer `BREAKING CHANGE:`. AI agent mengikuti aturan yang sama dan tidak boleh memasukkan prompt, secret, atau data pengguna ke commit message.

## Review dan merge
Verifier metadata hanya memeriksa struktur dan beberapa path sensitif. Reviewer memeriksa substansi, AC, tes, dan dampak domain. CI bukan bukti keamanan mutlak. Tidak ada approval otomatis, auto-merge, atau deployment dalam template.

`pr-contract` adalah executable contract untuk metadata PR. Template PR adalah starting point, tetapi sebelum submit tetap cocokkan body dan changed-file list terhadap `scripts/check-pr.mjs` dari trusted base revision. Jika kontrak gagal, perbaiki metadata atau scope yang salah; jangan bypass verifier.

GitHub rulesets harus diaktifkan oleh owner. Jika kamu satu-satunya manusia, lihat mode solo di GITHUB_SETUP.md; jangan menambahkan reviewer palsu untuk memenuhi aturan.

## Handoff
Sebelum pindah sesi, tulis task, branch, commit terakhir, file belum committed, hasil tes, blocker, dan langkah berikutnya di `docs/HANDOFF.md`. Jangan simpan secret atau salinan percakapan penuh.

## Definition of done
AC terpenuhi dan dibuktikan, perubahan berada dalam scope, verifikasi relevan selesai, risiko/limit diungkapkan, docs akurat, serta issue/PR ditautkan jika akses tersedia. Ketiadaan koneksi GitHub harus dilaporkan sebagai pekerjaan tersisa, bukan dianggap issue/PR sudah dibuat.
