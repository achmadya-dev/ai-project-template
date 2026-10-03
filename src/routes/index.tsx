import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
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
    </main>
  )
}
