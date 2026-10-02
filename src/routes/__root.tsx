import { createRootRoute, HeadContent, Outlet, Scripts, Link } from '@tanstack/react-router'
import styleUrl from '../styles.css?url'
export const Route = createRootRoute({
  head: () => ({ meta: [
    { charSet: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { title: 'Project Base · TanStack' },
  ], links: [{ rel: 'stylesheet', href: styleUrl }] }),
  component: Root,
  notFoundComponent: () => <main><h1>Halaman tidak ditemukan</h1><Link to="/">Kembali</Link></main>,
  errorComponent: () => <main><h1>Aplikasi belum dapat memproses permintaan</h1><p>Periksa konfigurasi development dan koneksi database.</p><a href="/">Muat ulang</a></main>,
})
function Root() {
  return <html lang="id"><head><HeadContent /></head><body>
    <header><Link to="/" className="brand">PROJECT / BASE</Link><span className="pill">v0.1 · Development starter</span></header>
    <Outlet /><footer>Satu repo. Rencana jelas. Perubahan teruji.</footer><Scripts />
  </body></html>
}
