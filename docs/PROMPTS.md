# Prompt yang dapat dipakai

Sebutkan task atau issue; tidak perlu mengulang semua aturan repo.

## Kickoff
Baca AGENTS.md. Proyek ini untuk [pengguna], menyelesaikan [masalah]. Susun satu MVP dengan alur [alur]. Perbarui PRODUCT dan DOMAIN. Buat planning issue atau task lokal. Tanyakan hanya keputusan material yang belum jelas. Belum implementasi.

## Plan fitur
Baca AGENTS.md dan kode terkait. Rencanakan [fitur], termasuk acceptance criteria, contoh kegagalan, invariant, dampak database/API, dan rencana tes. Simpan sebagai issue atau docs/tasks/[slug].md. Jangan ubah kode aplikasi dahulu.

## Eksekusi
Implementasikan [issue/path task] revisi [N] yang sudah disepakati. Kerjakan sampai verifikasi dan PR/draft PR siap. Rekam hasil tes aktual dan keterbatasan. Jangan merge/deploy. Jika GitHub tidak bisa ditulis, simpan task dan body PR lokal serta laporkan apa yang tersisa.

## Review
Review diff branch ini terhadap main dan acceptance criteria [task]. Prioritaskan bug, regresi, keamanan, dan aturan domain. Periksa apakah tes bisa lulus padahal perilaku salah. Laporkan temuan dengan bukti dan lokasi; jangan mengubah kode dulu.

## Lanjut di sesi baru
Baca AGENTS.md, docs/HANDOFF.md, task [path], git status dan log branch [branch]. Ringkas kondisi aktual, lalu lanjutkan pekerjaan yang sudah diotorisasi. Jangan menimpa perubahan belum committed atau menganggap semua klaim handoff sudah terverifikasi.

## Perbaiki kegagalan
Selidiki kegagalan [CI/test/log tersanitasi]. Cari akar masalah, perbaiki sesuai kontrak yang disepakati, tambahkan tes regresi bila bermakna. Jangan menghapus atau melemahkan tes untuk memperoleh hasil hijau.
