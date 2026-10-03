import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, useSyncExternalStore, type FormEvent } from 'react'
import { cn } from '../lib/cn'
import { createItem, getCatalog } from '../modules/catalog/catalog.functions'

export const Route = createFileRoute('/')({ loader: () => getCatalog(), component: Home })
const subscribeHydration = () => () => undefined
const focusRing =
  'focus-visible:outline-[3px] focus-visible:outline-[#6ca085] focus-visible:outline-offset-3'
const inputClass = cn('mb-2.5 w-full rounded-md border border-[#bccbbe] bg-white p-3', focusRing)

function Home() {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false,
  )
  const { enabled, items } = Route.useLoaderData()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    setBusy(true)
    setMessage('')
    try {
      const result = await createItem({
        data: { sku: String(values.get('sku')), name: String(values.get('name')) },
      })
      if (!result.ok) {
        setMessage('SKU sudah digunakan. Pilih SKU lain.')
        return
      }
      form.reset()
      await router.invalidate()
      setMessage('Barang berhasil ditambahkan.')
    } catch {
      setMessage('Gagal menyimpan. Periksa input dan koneksi database.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto max-w-[1120px] px-7 py-7">
      <section className="max-w-[750px] pt-7 pb-8 min-[651px]:pt-12">
        <p className="text-[11px] font-bold tracking-[0.15em] text-[#38735e]">
          YOUR NEXT PROJECT STARTS HERE
        </p>
        <h1 className="my-5 text-[clamp(38px,6vw,64px)] leading-[1.08] font-bold tracking-[-0.045em]">
          Dari rencana
          <br />
          ke perubahan nyata.
        </h1>
        <p className="max-w-[570px] text-lg leading-[1.7] text-[#5c6e66]">
          Fondasi fullstack untuk bekerja bersama AI. Mulai dari kebutuhan, uji perilakunya, lalu
          tinjau hasilnya.
        </p>
      </section>
      <section
        className="grid grid-cols-1 rounded-xl border border-[#d9e2db] bg-white min-[651px]:grid-cols-3"
        aria-label="Alur kerja"
      >
        <div className="px-6 py-4 min-[651px]:p-6">
          <b>01 / Rencanakan</b>
          <p className="mt-3 text-sm leading-[1.6] text-[#5c6e66]">
            Tulis tujuan dan kriteria penerimaan.
          </p>
        </div>
        <div className="px-6 py-4 min-[651px]:p-6">
          <b>02 / Kerjakan</b>
          <p className="mt-3 text-sm leading-[1.6] text-[#5c6e66]">
            Satu task, satu branch, perubahan terarah.
          </p>
        </div>
        <div className="px-6 py-4 min-[651px]:p-6">
          <b>03 / Verifikasi</b>
          <p className="mt-3 text-sm leading-[1.6] text-[#5c6e66]">
            Tes, bukti, dan review sebelum merge.
          </p>
        </div>
      </section>
      <section className="my-12 grid grid-cols-1 gap-3 rounded-xl bg-[#e9efe7] p-6 min-[651px]:grid-cols-2 min-[651px]:gap-[60px] min-[651px]:p-8">
        <div>
          <p className="text-[11px] font-bold tracking-[0.15em] text-[#38735e]">
            CONTOH VERTICAL SLICE
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em]">Katalog barang</h2>
          <p className="mt-4 leading-[1.6]">
            Validasi server, SKU unik, dan penyimpanan PostgreSQL.
          </p>
          <p className="mt-4 text-[13px] leading-[1.6] text-[#59695e]">
            Demo development tanpa login. Tidak aktif pada production build.
          </p>
        </div>
        {enabled ? (
          <div>
            <form className="grid gap-2" onSubmit={submit}>
              <fieldset
                className="m-0 grid min-w-0 gap-2 border-0 p-0"
                disabled={!hydrated || busy}
              >
                <label className="text-[13px] font-semibold" htmlFor="sku">
                  SKU
                </label>
                <input
                  className={inputClass}
                  id="sku"
                  name="sku"
                  maxLength={32}
                  pattern={String.raw`[A-Za-z0-9][A-Za-z0-9_\-]*`}
                  placeholder="BRG-001"
                  required
                />
                <label className="text-[13px] font-semibold" htmlFor="name">
                  Nama barang
                </label>
                <input
                  className={inputClass}
                  id="name"
                  name="name"
                  maxLength={120}
                  placeholder="Komponen contoh"
                  required
                />
                <button
                  className={cn(
                    'cursor-pointer rounded-md border-0 bg-[#235743] p-3 text-white disabled:cursor-not-allowed disabled:opacity-60',
                    focusRing,
                  )}
                  disabled={busy}
                >
                  {busy ? 'Menyimpan…' : 'Tambah barang'}
                </button>
                <p className="mt-1 min-h-6 text-sm leading-[1.6]" role="status" aria-live="polite">
                  {message}
                </p>
              </fieldset>
            </form>
            <div className="mt-6">
              <h3 className="font-semibold">Barang terbaru</h3>
              {items.length ? (
                <ul className="mt-2 list-none p-0">
                  {items.map((item) => (
                    <li
                      className="flex items-center gap-4 border-b border-[#cad8cc] py-3"
                      key={item.id}
                    >
                      <code className="min-w-[90px] text-xs [overflow-wrap:anywhere]">
                        {item.sku}
                      </code>
                      <span className="[overflow-wrap:anywhere]">{item.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 leading-[1.6]">Belum ada barang. Tambahkan contoh pertama.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="self-center rounded-lg bg-[#f6f7f3] p-6">
            <h3 className="font-semibold">Demo dinonaktifkan</h3>
            <p className="mt-3 leading-[1.6]">
              Untuk mencoba secara lokal, ikuti README dan aktifkan DEMO_ENABLED.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
