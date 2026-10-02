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
3. Jalankan `bun run check` dan pemeriksaan DB/E2E yang relevan. Untuk perubahan demo fullstack, `bun run verify`.
4. Perbarui domain/ADR/runbook bila perilakunya berubah.
5. Catat command, hasil aktual, keterbatasan, dan revisi kode. Jika gagal, jelaskan; jangan melemahkan tes.
6. Buat PR dengan `Closes #123`, risiko, scope, verifikasi, kompatibilitas, dokumentasi. Jangan mengirim PR kosong sebagai bukti selesai.

## Review dan merge
Verifier metadata hanya memeriksa struktur dan beberapa path sensitif. Reviewer memeriksa substansi, AC, tes, dan dampak domain. CI bukan bukti keamanan mutlak. Tidak ada approval otomatis, auto-merge, atau deployment dalam template.

GitHub rulesets harus diaktifkan oleh owner. Jika kamu satu-satunya manusia, lihat mode solo di GITHUB_SETUP.md; jangan menambahkan reviewer palsu untuk memenuhi aturan.

## Handoff
Sebelum pindah sesi, tulis task, branch, commit terakhir, file belum committed, hasil tes, blocker, dan langkah berikutnya di `docs/HANDOFF.md`. Jangan simpan secret atau salinan percakapan penuh.

## Definition of done
AC terpenuhi dan dibuktikan, perubahan berada dalam scope, verifikasi relevan selesai, risiko/limit diungkapkan, docs akurat, serta issue/PR ditautkan jika akses tersedia. Ketiadaan koneksi GitHub harus dilaporkan sebagai pekerjaan tersisa, bukan dianggap issue/PR sudah dibuat.
