import { Bell, ChevronDown, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROLE_LABELS } from '../../lib/roles'
import useAuthStore from '../../store/useAuthStore'
import useUiStore from '../../store/useUiStore'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/pos': 'Point of Sale',
  '/products': 'Produk',
  '/categories': 'Kategori',
  '/suppliers': 'Supplier',
  '/stock': 'Stok',
  '/stock-movements': 'Riwayat Stok',
  '/transactions': 'Transaksi',
  '/reports': 'Laporan',
  '/users': 'Pengguna',
}

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const user = useAuthStore((state) => state.user)
  const role = useAuthStore((state) => state.role)
  const logout = useAuthStore((state) => state.logout)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const pageTitle = pageTitles[location.pathname] || 'Invento'
  const todayLabel = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    year: 'numeric',
  }).format(new Date())
  const initials = user?.name
    ?.split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'IN'

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      await logout()
    } catch {
      // Local auth is cleared by the store even when the server is unavailable.
    } finally {
      setIsLoggingOut(false)
      setIsUserMenuOpen(false)
      navigate('/login', { replace: true })
    }
  }

  return <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
    <div className="flex min-w-0 items-center gap-3">
      <button className="rounded-lg border border-slate-200 bg-white p-2 shadow-[0_1px_2px_rgba(15,23,42,.04)] hover:bg-slate-50 lg:hidden" onClick={toggleSidebar}><Menu className="h-4 w-4 text-slate-600" /></button>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-950">{pageTitle}</p>
        <p className="hidden truncate text-[11px] text-slate-500 sm:block">Invento / {pageTitle}</p>
      </div>
    </div>
    <div className="flex items-center gap-2 sm:gap-3">
      <p className="hidden rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] font-medium text-slate-500 md:block">{todayLabel}</p>
      <button className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,.04)] hover:bg-slate-50" title="Notifikasi stok"><Bell className="h-4 w-4" /><span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-amber-500 ring-2 ring-white" /></button>
      <div className="relative">
        <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 shadow-[0_1px_2px_rgba(15,23,42,.04)] hover:bg-slate-50" onClick={() => setIsUserMenuOpen((current) => !current)}>
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">{initials}</span>
          <span className="hidden text-left sm:block"><span className="block max-w-36 truncate text-[13px] font-medium text-slate-800">{user?.name || 'Pengguna Invento'}</span><span className="block text-[11px] text-slate-500">{ROLE_LABELS[role] || 'Pengguna'}</span></span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>
        {isUserMenuOpen && <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_8px_24px_rgba(15,23,42,.10)]">
          <div className="border-b border-slate-100 px-3 py-2"><p className="truncate text-[13px] font-semibold text-slate-800">{user?.name || 'Pengguna Invento'}</p><p className="truncate text-[11px] text-slate-500">{user?.email || ROLE_LABELS[role] || 'Pengguna'}</p></div>
          <button className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-60" disabled={isLoggingOut} onClick={handleLogout}><LogOut className="h-4 w-4" />{isLoggingOut ? 'Keluar...' : 'Keluar'}</button>
        </div>}
      </div>
    </div>
  </header>
}
