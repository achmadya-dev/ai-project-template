# Domain and invariants

## Contoh katalog
- Item: satu catatan contoh dengan SKU dan nama.
- SKU: 1–32 karakter ASCII; huruf diubah menjadi uppercase, spasi tepi dihapus; karakter yang diterima A–Z, 0–9, `_`, `-`, karakter pertama alfanumerik.
- SKU unik secara global hanya dalam demo ini. Scope uniqueness untuk produk nyata harus diputuskan (misalnya per tenant).
- Nama: 1–120 karakter setelah trim; tidak boleh kosong.
- Dua permintaan serentak dengan SKU sama menghasilkan tepat satu item; lainnya mendapat DUPLICATE_SKU.
- Constraint DB melindungi format dan keunikan walaupun validasi aplikasi dilewati.

## Contoh penerimaan
` ab-001 ` → `AB-001`. Menambahkan `AB-001` lagi ditolak. Nama yang mirip SQL disimpan sebagai data biasa melalui parameter query.

## Belum diputuskan
Auth, tenant, stok, harga, satuan, posting dokumen, pembulatan, ledger, pajak, approval, dan audit bisnis. Agent tidak boleh mengasumsikan aturan tersebut dari demo.

Saat menambah domain baru, catat istilah, invariant, contoh benar/salah, pengecualian, dan AC/test yang membuktikannya.
