# Commit message convention

Gunakan format **Conventional Commits** dengan scope opsional:

```text
<type>(<scope>): <description>

[optional body]

[optional footer]
```

## Aturan utama

- Gunakan huruf kecil untuk `type` dan `scope`.
- Tulis `description` dalam imperative mood, singkat, spesifik, dan tanpa titik di akhir.
- Satu commit harus mewakili satu perubahan logis. Hindari mencampur refactor, feature, dan cleanup yang tidak terkait.
- Gunakan body hanya jika konteks, alasan, trade-off, atau dampak perubahan tidak jelas dari subject.
- Jangan menulis informasi sensitif, credential, secret, customer data, atau output debugging yang mengandung data privat.
- Referensikan issue bila relevan, misalnya `Refs #123` atau `Closes #123` pada footer.
- Breaking change wajib memakai `!` setelah type/scope atau footer `BREAKING CHANGE:`.

## Type yang diizinkan

| Type | Gunakan untuk |
| --- | --- |
| `feat` | Fitur atau perilaku baru yang terlihat oleh pengguna/caller |
| `fix` | Perbaikan bug atau perilaku yang salah |
| `refactor` | Perubahan struktur internal tanpa mengubah perilaku yang dimaksud |
| `perf` | Peningkatan performa |
| `test` | Menambah atau memperbaiki test tanpa mengubah production behavior |
| `docs` | Dokumentasi saja |
| `build` | Build system, dependency, package manager, bundling |
| `ci` | Workflow CI/CD atau automation repository |
| `chore` | Maintenance yang tidak cocok dengan type lain |
| `revert` | Membatalkan commit sebelumnya |

Jangan memakai `feat` untuk semua perubahan. Jika perubahan hanya mengubah docs, test, tooling, atau struktur internal, gunakan type yang lebih spesifik.

## Scope

Scope bersifat opsional dan harus menggambarkan area yang berubah, bukan nama orang atau nomor task.

Contoh scope yang baik:

```text
feat(auth): add password reset flow
fix(api): reject malformed pagination cursor
refactor(domain): extract order pricing policy
test(checkout): cover declined payment path
docs(workflow): clarify release evidence
ci(github): verify pull request metadata
```

Jika perubahan menyentuh banyak area dan tidak ada satu scope yang dominan, hilangkan scope daripada memakai scope generik seperti `app` atau `misc`.

## Subject

Subject harus:

- menjelaskan hasil perubahan, bukan aktivitas pengerjaan;
- idealnya <= 72 karakter;
- tidak memakai kata seperti `update`, `changes`, atau `misc` tanpa objek yang jelas;
- tidak memasukkan nomor issue jika nomor tersebut bisa ditempatkan di footer.

Hindari:

```text
fix: update code
chore: changes
feat: work on auth
```

Lebih baik:

```text
fix(auth): reject expired reset tokens
refactor(api): isolate request validation
docs: document local database recovery
```

## Body

Gunakan body ketika commit membutuhkan penjelasan tambahan. Fokus pada **why** dan dampak, bukan mengulang diff.

```text
fix(checkout): prevent duplicate payment submission

Disable the submit path after the first accepted request so retries from
rapid clicks cannot create multiple payment intents.

Refs #214
```

## Breaking changes

Gunakan salah satu bentuk berikut:

```text
feat(api)!: replace cursor pagination contract
```

atau:

```text
feat(api): replace cursor pagination contract

BREAKING CHANGE: `nextPage` is removed and replaced by `nextCursor`.
```

Breaking change harus dijelaskan di PR beserta migration/compatibility impact jika relevan.

## Revert

Gunakan format:

```text
revert: feat(auth): add password reset flow
```

Body sebaiknya menyebut commit yang dibatalkan dan alasan revert.

## Commit yang dibuat AI agent

AI agent mengikuti aturan yang sama dengan manusia. Selain itu:

- jangan membuat commit untuk perubahan yang belum diverifikasi sesuai scope;
- jangan mengklaim test lulus jika test tersebut tidak dijalankan;
- jangan menyertakan prompt, chain-of-thought, secret, atau percakapan pengguna dalam commit message;
- pecah perubahan menjadi commit logis bila perubahan independen dapat ditinjau terpisah;
- jangan rewrite history, squash, force-push, atau amend commit milik pengguna kecuali diminta secara eksplisit.

## Contoh

```text
feat(profile): add avatar upload validation
fix(db): close transaction after failed migration
refactor(domain): move pricing rules out of route handler
perf(search): avoid duplicate vector queries
test(api): cover unauthorized project deletion
docs: add commit message convention
build: pin bun version
ci(github): run verification on pull requests
chore: remove obsolete local fixture
```

Commit message adalah bagian dari history yang akan dibaca saat review, debugging, release notes, dan rollback. Prioritaskan kejelasan perubahan di atas formalitas.