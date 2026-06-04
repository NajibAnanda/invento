import { BarChart3, Boxes, ChevronRight, ClipboardList, FolderTree, LayoutDashboard, Package, ReceiptText, ShoppingCart, Store, Truck, Users, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { ADMIN_ROLES, ALL_ROLES, POS_ROLES, ROLE_LABELS, ROLES, STOCK_ROLES } from '../../lib/roles'
import useAuthStore from '../../store/useAuthStore'
import useUiStore from '../../store/useUiStore'

const navigation = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ADMIN_ROLES },
  { label: 'POS', path: '/pos', icon: ShoppingCart, roles: POS_ROLES },
  { label: 'Produk', path: '/products', icon: Package, roles: ALL_ROLES },
  { label: 'Kategori', path: '/categories', icon: FolderTree, roles: ADMIN_ROLES },
  { label: 'Supplier', path: '/suppliers', icon: Truck, roles: ADMIN_ROLES },
  { label: 'Stok', path: '/stock', icon: Boxes, roles: STOCK_ROLES },
  { label: 'Riwayat Stok', path: '/stock-movements', icon: ClipboardList, roles: STOCK_ROLES },
  { label: 'Transaksi', path: '/transactions', icon: ReceiptText, roles: POS_ROLES },
  { label: 'Laporan', path: '/reports', icon: BarChart3, roles: ADMIN_ROLES },
  { label: 'Pengguna', path: '/users', icon: Users, roles: [ROLES.SUPER_ADMIN] },
]

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUiStore()
  const role = useAuthStore((state) => state.role)
  const user = useAuthStore((state) => state.user)
  const visibleNavigation = navigation.filter((item) => item.roles.includes(role))

  return <>
    {sidebarOpen && <button aria-label="Tutup menu" className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white/95 shadow-[1px_0_0_rgba(226,232,240,.45),8px_0_28px_rgba(15,23,42,.03)] backdrop-blur transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-[0_6px_16px_rgba(37,99,235,.22)]"><Boxes className="h-4 w-4" /></span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold tracking-[-0.2px] text-slate-950">Invento</p>
            <p className="truncate text-[10.5px] font-medium uppercase tracking-[0.14em] text-slate-400">Inventory POS</p>
          </div>
        </div>
        <button className="rounded-lg p-1 hover:bg-slate-100 lg:hidden" onClick={() => setSidebarOpen(false)}><X className="h-5 w-5 text-slate-500" /></button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p className="px-3 pb-2 pt-1 text-[10.5px] font-semibold uppercase tracking-[0.15em] text-slate-400">Menu Utama</p>
        {visibleNavigation.map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition ${isActive ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100 shadow-[inset_3px_0_0_#2563eb]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}>
          {({ isActive }) => <>
            <span className={`grid h-7 w-7 place-items-center rounded-lg ${isActive ? 'bg-white text-blue-600 shadow-[0_1px_2px_rgba(37,99,235,.08)]' : 'text-slate-400 group-hover:bg-white group-hover:text-slate-700'}`}><Icon className="h-4 w-4" /></span>
            <span className="flex-1">{label}</span>
            {isActive && <ChevronRight className="h-4 w-4 text-blue-500" />}
          </>}
        </NavLink>)}
      </nav>
      <div className="border-t border-slate-200 p-3">
        <div className="rounded-[14px] border border-slate-200 bg-slate-50/80 p-3 shadow-[0_1px_2px_rgba(15,23,42,.03)]">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-blue-600 ring-1 ring-slate-200"><Store className="h-4 w-4" /></span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-800">Toko Invento</p>
              <p className="truncate text-[11px] text-slate-500">Cabang Utama</p>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-white px-2.5 py-2 ring-1 ring-slate-200">
            <p className="truncate text-[11px] font-medium text-slate-700">{user?.name || 'Pengguna'}</p>
            <p className="mt-0.5 text-[10.5px] text-slate-500">{ROLE_LABELS[role] || 'Role'}</p>
          </div>
        </div>
      </div>
    </aside>
  </>
}
