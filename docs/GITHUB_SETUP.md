# GitHub setup

Repository template sudah dibuat di https://github.com/achmadya-dev/ai-project-template (private). Instruksi pembuatan remote di bawah ditujukan untuk proyek baru dari template ini. Proteksi branch belum dikonfigurasi.

## Buat remote private
Gunakan GitHub UI untuk membuat repo kosong private, lalu push; atau GitHub CLI yang sudah kamu autentikasi:

```sh
git init -b main
git add .
git commit -m "chore: bootstrap AI project template"
gh repo create NAMA_REPO --private --source=. --remote=origin --push
```

Ganti NAMA_REPO dahulu. Perintah tersebut melakukan publikasi ke GitHub private ketika kamu menjalankannya. Jika repo sudah punya `.git`/remote/commit, jangan menginisialisasi atau menambahkan remote ulang; periksa `git status` dan `git remote -v`.

Jangan commit `.env`, node_modules, output build, atau kredensial. Bootstrap awal adalah pengecualian sebelum alur PR tersedia; task bootstrap disertakan di docs/tasks/000-bootstrap.md. Setelah remote dibuat, jadikan task itu issue awal untuk mencatat asal template, bukan mengarang PR historis.

## Setelah push
1. Aktifkan Issues dan Actions.
2. Jalankan CI pada main; check yang digunakan: `quality`, `database-and-browser`.
3. Buat PR uji untuk memunculkan check `pr-contract`; isi PR sesuai template dan tautkan issue nyata.
4. Tambahkan ruleset untuk main: require pull request, require checks di atas, block force push dan deletion. Konfigurasikan up-to-date branch atau merge queue sesuai paket.
5. Jangan beri agent atau GitHub App agent akses bypass ruleset.
6. Isi `.github/CODEOWNERS` dengan akun/team nyata yang memiliki write access.
7. Jika ada reviewer independen, wajibkan review dan CODEOWNERS; dismiss stale approvals saat kode berubah.
8. Tetap nonaktifkan auto-merge sampai workflow dipakai dan dievaluasi.

Ketersediaan rulesets, checks, dan review protection untuk private repo bergantung paket GitHub. Jika tidak tersedia, jangan mengklaim merge sudah diproteksi; upgrade/ubah konfigurasi atau gunakan manual gate dengan keterbatasan yang diakui.

## Mode solo
GitHub tidak mengizinkan author menyetujui PR sendiri. Bila PR dibuat melalui identitasmu, jangan mewajibkan satu approval tanpa reviewer lain karena PR akan macet. Gunakan required checks dan merge manual olehmu setelah review; ini lebih lemah daripada review independen. Jika worker memakai identitas berbeda, kamu dapat menjadi reviewer jika GitHub mengizinkannya. Jangan menjadikan agent author sekaligus approver.

## Issue dan PR
```sh
gh issue create --title "Plan: fitur pertama" --body-file docs/tasks/nama-task.md
# Sesudah implementasi dan push branch:
gh pr create --draft --title "feat: fitur pertama" --body-file PATH_KE_BODY_PR.md
```

Dokumen task harus sudah lengkap; contoh di atas memerlukan path nyata. Isi template PR dengan issue ID sebenarnya. Check `pr-contract` memeriksa format referensi, bukan keberadaan/kebenaran issue; reviewer wajib memeriksa tautannya. Edit body PR memicu ulang check.

## Local hooks dan formatting
`bun install` menjalankan script `prepare` dan memasang Husky untuk repository lokal.

- `.husky/pre-commit` menjalankan `bun run lint:staged`. File JS/TS yang staged diperbaiki dengan ESLint lalu diformat dengan Prettier; CSS/JSON yang staged diformat dengan Prettier.
- `.husky/pre-push` menjalankan `bun run check`, termasuk `format:check`, sehingga push lokal mendapat verifikasi penuh tanpa menggantikan CI.
- `prettier-plugin-tailwindcss` menggunakan `src/styles.css` sebagai stylesheet Tailwind v4 untuk mengurutkan utility classes.
- `bun.lock` dan `src/routeTree.gen.ts` dikecualikan dari formatter karena merupakan dependency/generated output.

Untuk memformat atau hanya memeriksa baseline kode secara manual:

```sh
bun run format
bun run format:check
```

Jika hooks perlu dipasang ulang setelah clone atau perubahan konfigurasi Git, jalankan:

```sh
bun run prepare
```

Git hook tetap bisa dilewati secara lokal, jadi required CI di GitHub tetap diperlukan sebagai gate yang dapat diverifikasi.

## Agent tools
- Codex / OpenCode: minta membaca AGENTS.md; dukungan auto-load bergantung versi/tool.
- Cursor: adapter `.cursor/rules/project.mdc` menunjuk AGENTS.md.
- Claude Code: CLAUDE.md menunjuk AGENTS.md.
- ChatGPT tanpa workspace/akses write: gunakan untuk planning, kemudian kirim task/issue ke coding agent. Jangan menganggap koneksi read-only bisa push.
- MCP GitHub opsional; tidak ada konfigurasi token dalam repo. Pakai izin minimum dan tool yang benar-benar tersedia.

Dependabot juga harus mengikuti issue/PR contract: buat issue update dependency, lengkapi body PR, dan tandai high karena dependency adalah kode yang dieksekusi. Tidak ada bypass bot bawaan.
