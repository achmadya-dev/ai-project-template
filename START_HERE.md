# Mulai dari sini

## 1. Jadikan proyekmu
Ekstrak template, buka foldernya, lalu jalankan setup di README. Ubah nama di `package.json` dan `.ai/project.json`; jalankan `npm install --package-lock-only` setelah perubahan package metadata.

File yang wajib diisi bersama agent sebelum fitur bisnis:
- `docs/PRODUCT.md`: siapa pengguna dan hasil yang ingin dicapai.
- `docs/DOMAIN.md`: aturan bisnis beserta contoh dan pengecualian.
- `docs/ARCHITECTURE.md`: keputusan awal, terutama auth, tenancy, dan hosting.

Jangan isi semua kemungkinan fitur sekaligus. Mulai dari satu alur bisnis yang bisa didemokan.

## 2. Prompt pertama
Baca AGENTS.md dan dokumen yang dirujuk. Saya ingin memakai repo ini untuk [produk], bagi [pengguna], agar [hasil]. Susun rencana MVP dengan scope terbatas dan acceptance criteria. Identifikasi keputusan bisnis yang belum jelas. Perbarui docs/PRODUCT.md dan docs/DOMAIN.md. Simpan rencana sebagai issue GitHub jika akses tersedia; jika tidak, simpan di docs/tasks/project-kickoff.md. Belum implementasikan fitur bisnis.

## 3. Prompt implementasi
Kerjakan task [nomor issue/path task] sesuai rencana yang disepakati. Baca AGENTS.md, periksa git status, buat branch terpisah, implementasikan, jalankan verifikasi relevan, dan rekam bukti. Buat PR jika akses tersedia. Berhenti untuk pertanyaan hanya bila ada keputusan material yang belum terjawab atau tindakan di luar izin. Jangan merge atau deploy.

## 4. Membuka window/sesi baru
Sebutkan repo, branch, dan task. Minta agent membaca task beserta `docs/HANDOFF.md`; jangan mengandalkan percakapan sebelumnya. Untuk proyek berbeda, gunakan folder/repo berbeda. Untuk dua task dalam repo sama, gunakan branch dan worktree terpisah; jangan biarkan dua agent mengedit checkout sama.

## 5. Pakai GitHub
Lihat docs/GITHUB_SETUP.md untuk membuat repo private, issue awal, dan proteksi branch. Setelah repo template tersedia di GitHub, aktifkan opsi **Template repository** dan gunakan **Use this template** untuk proyek berikutnya.

## 6. Review hasil
Minta demo perilaku, bukti acceptance criteria, hasil tes, serta batas pemulihan. Jangan menilai dari jumlah file atau panjang penjelasan agent. Untuk perubahan auth/data/uang, review keputusan domain dan tes negatif secara eksplisit.
