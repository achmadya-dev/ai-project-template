import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, useSyncExternalStore, type FormEvent } from 'react'
import { createItem, getCatalog } from '../modules/catalog/catalog.functions'
export const Route = createFileRoute('/')({ loader: () => getCatalog(), component: Home })
const subscribeHydration = () => () => undefined
function Home() {
  const hydrated = useSyncExternalStore(subscribeHydration, () => true, () => false)
  const { enabled, items } = Route.useLoaderData()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    setBusy(true); setMessage('')
    try {
      const result = await createItem({ data: { sku: String(values.get('sku')), name: String(values.get('name')) } })
      if (!result.ok) { setMessage('SKU sudah digunakan. Pilih SKU lain.'); return }
      form.reset()
      await router.invalidate()
      setMessage('Barang berhasil ditambahkan.')
    } catch { setMessage('Gagal menyimpan. Periksa input dan koneksi database.') }
    finally { setBusy(false) }
  }
  return <main>
    <section className="intro"><p className="eyebrow">YOUR NEXT PROJECT STARTS HERE</p><h1>Dari rencana<br />ke perubahan nyata.</h1><p className="lead">Fondasi fullstack untuk bekerja bersama AI. Mulai dari kebutuhan, uji perilakunya, lalu tinjau hasilnya.</p></section>
    <section className="steps" aria-label="Alur kerja"><div><b>01 / Rencanakan</b><p>Tulis tujuan dan kriteria penerimaan.</p></div><div><b>02 / Kerjakan</b><p>Satu task, satu branch, perubahan terarah.</p></div><div><b>03 / Verifikasi</b><p>Tes, bukti, dan review sebelum merge.</p></div></section>
    <section className="demo"><div><p className="eyebrow">CONTOH VERTICAL SLICE</p><h2>Katalog barang</h2><p>Validasi server, SKU unik, dan penyimpanan PostgreSQL.</p><p className="note">Demo development tanpa login. Tidak aktif pada production build.</p></div>
    {enabled ? <div><form onSubmit={submit}><fieldset disabled={!hydrated || busy}><label htmlFor="sku">SKU</label><input id="sku" name="sku" maxLength={32} pattern={String.raw`[A-Za-z0-9][A-Za-z0-9_\-]*`} placeholder="BRG-001" required /><label htmlFor="name">Nama barang</label><input id="name" name="name" maxLength={120} placeholder="Komponen contoh" required /><button disabled={busy}>{busy ? 'Menyimpan…' : 'Tambah barang'}</button><p role="status" aria-live="polite">{message}</p></fieldset></form>
    <div className="items"><h3>Barang terbaru</h3>{items.length ? <ul>{items.map(item => <li key={item.id}><code>{item.sku}</code><span>{item.name}</span></li>)}</ul> : <p>Belum ada barang. Tambahkan contoh pertama.</p>}</div></div> : <div className="empty"><h3>Demo dinonaktifkan</h3><p>Untuk mencoba secara lokal, ikuti README dan aktifkan DEMO_ENABLED.</p></div>}
    </section>
  </main>
}
