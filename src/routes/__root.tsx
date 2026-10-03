import { createRootRoute, HeadContent, Outlet, Scripts, Link } from '@tanstack/react-router'
import { cn } from '../lib/cn'
import styleUrl from '../styles.css?url'

const focusRing =
  'focus-visible:outline-[3px] focus-visible:outline-[#6ca085] focus-visible:outline-offset-3'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Project Base · TanStack' },
    ],
    links: [{ rel: 'stylesheet', href: styleUrl }],
  }),
  component: Root,
  notFoundComponent: () => (
    <main className="mx-auto max-w-[1120px] px-7 py-12">
      <h1 className="text-[clamp(38px,6vw,64px)] leading-[1.08] font-bold tracking-[-0.045em]">
        Halaman tidak ditemukan
      </h1>
      <Link to="/" className={cn('mt-6 inline-block underline underline-offset-4', focusRing)}>
        Kembali
      </Link>
    </main>
  ),
  errorComponent: () => (
    <main className="mx-auto max-w-[1120px] px-7 py-12">
      <h1 className="text-[clamp(38px,6vw,64px)] leading-[1.08] font-bold tracking-[-0.045em]">
        Aplikasi belum dapat memproses permintaan
      </h1>
      <p className="mt-5 max-w-[570px] text-lg leading-[1.7] text-[#5c6e66]">
        Periksa konfigurasi development dan koneksi database.
      </p>
      <a href="/" className={cn('mt-6 inline-block underline underline-offset-4', focusRing)}>
        Muat ulang
      </a>
    </main>
  ),
})

function Root() {
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-[#f6f7f3] font-sans text-[#18332d] [font-synthesis:none]">
        <header className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-5 border-b border-[#d9e2db] px-7 py-7 min-[651px]:flex-nowrap">
          <Link
            to="/"
            className={cn(
              'text-sm font-bold tracking-[0.15em] text-inherit no-underline',
              focusRing,
            )}
          >
            PROJECT / BASE
          </Link>
          <span className="rounded-[30px] border border-[#cad8d0] px-3 py-2 text-xs">
            v0.1 · Development starter
          </span>
        </header>
        <Outlet />
        <footer className="mx-auto max-w-[1120px] border-t border-[#d9e2db] px-7 pt-7 pb-10 text-xs text-[#5c6e66]">
          Satu repo. Rencana jelas. Perubahan teruji.
        </footer>
        <Scripts />
      </body>
    </html>
  )
}
