import { ChevronLeft, ChevronRight, Inbox, Search, X } from 'lucide-react'

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'border border-blue-600 bg-blue-600 text-white shadow-[0_5px_14px_rgba(37,99,235,.18)] hover:border-blue-700 hover:bg-blue-700',
    secondary: 'border border-slate-200 bg-white text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,.03)] hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950',
    danger: 'border border-red-500 bg-red-500 text-white shadow-[0_1px_2px_rgba(239,68,68,.16)] hover:border-red-600 hover:bg-red-600',
  }
  return <button className={`inline-flex h-10 items-center justify-center gap-2 rounded-[10px] px-3.5 text-[13px] font-semibold outline-none ring-blue-600/20 transition active:translate-y-px disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55 focus-visible:ring-4 ${variants[variant]} ${className}`} {...props}>{children}</button>
}

export function Card({ children, className = '' }) {
  return <div className={`rounded-[14px] border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,.04),0_8px_24px_rgba(15,23,42,.03)] ${className}`}>{children}</div>
}

export function PageHeader({ title, description, action }) {
  return <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/80 pb-4"><div className="min-w-0"><p className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-blue-600">Invento Workspace</p><h1 className="text-[22px] font-semibold leading-7 tracking-[-0.25px] text-slate-950 sm:text-2xl">{title}</h1><p className="mt-1 max-w-2xl text-[13px] leading-5 text-slate-500">{description}</p></div>{action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}</div>
}

export function StatCard({ label, value, note, icon: Icon, tone = 'blue' }) {
  const tones = { blue: 'bg-blue-50 text-blue-600 ring-blue-100', green: 'bg-emerald-50 text-emerald-600 ring-emerald-100', sky: 'bg-cyan-50 text-cyan-600 ring-cyan-100', amber: 'bg-amber-50 text-amber-600 ring-amber-100', red: 'bg-red-50 text-red-600 ring-red-100', violet: 'bg-violet-50 text-violet-600 ring-violet-100' }
  return <Card className="relative overflow-hidden p-4"><div className="absolute inset-x-0 top-0 h-1 bg-slate-100" /><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[12px] font-semibold text-slate-500">{label}</p><p className="mt-2 truncate text-2xl font-semibold tracking-[-0.35px] text-slate-950">{value}</p></div>{Icon && <span className={`grid h-10 w-10 place-items-center rounded-xl ring-1 ${tones[tone] || tones.blue}`}><Icon className="h-4.5 w-4.5" /></span>}</div>{note && <p className="mt-3 border-t border-slate-100 pt-2 text-[11px] leading-4 text-slate-500">{note}</p>}</Card>
}

export function Badge({ children, tone = 'slate' }) {
  const tones = { green: 'bg-emerald-50 text-emerald-700 ring-emerald-200/70', amber: 'bg-amber-50 text-amber-700 ring-amber-200/70', red: 'bg-red-50 text-red-700 ring-red-200/70', blue: 'bg-blue-50 text-blue-700 ring-blue-200/70', sky: 'bg-cyan-50 text-cyan-700 ring-cyan-200/70', violet: 'bg-violet-50 text-violet-700 ring-violet-200/70', slate: 'bg-slate-100 text-slate-600 ring-slate-200/80' }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold leading-none ring-1 ${tones[tone] || tones.slate}`}>{children}</span>
}

export function SearchInput({ placeholder = 'Cari data...', value, onChange }) {
  return <label className="relative block w-full max-w-xs"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input className="h-[42px] w-full rounded-[10px] border border-slate-200 bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10" placeholder={placeholder} value={value} onChange={onChange} /></label>
}

export function FilterToolbar({ children, actions, className = '' }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,.04)] ${className}`}><div className="flex flex-wrap items-end gap-3">{children}{actions && <div className="flex flex-wrap items-center gap-2 sm:ml-auto">{actions}</div>}</div></div>
}

export function FilterGroup({ children, label, variant = 'filter', className = '' }) {
  const widthClass = variant === 'search' ? 'min-w-[260px] flex-1' : 'min-w-[180px]'
  return <label className={`flex w-full flex-col gap-1.5 sm:w-auto ${widthClass} ${className}`}><span className="text-xs font-medium text-slate-600">{label}</span>{children}</label>
}

export function TextFilter({ label, className = '', type = 'text', ...props }) {
  return <FilterGroup className={className} label={label} variant={type === 'search' ? 'search' : 'filter'}><input className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" type={type === 'search' ? 'text' : type} {...props} /></FilterGroup>
}

export function SelectFilter({ children, label, className = '', ...props }) {
  return <FilterGroup className={className} label={label}><select className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" {...props}>{children}</select></FilterGroup>
}

export function Table({ columns, rows, renderRow }) {
  return <div className="max-w-full overflow-x-auto"><table className="w-full min-w-[640px] border-collapse text-center text-[13px]"><thead className="border-b border-slate-200 bg-slate-50/95 text-[11px] font-semibold uppercase tracking-[0.04em] text-slate-500"><tr>{columns.map((column) => <th className={`h-11 whitespace-nowrap px-4 ${column.align === 'right' ? 'text-right' : column.align === 'left' ? 'text-left' : 'text-center'}`} key={column.label}>{column.label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 text-slate-700 [&_td]:align-middle [&_tr]:h-12 [&_tr]:transition [&_tr:hover]:bg-slate-50/80">{rows.map(renderRow)}</tbody></table></div>
}

export function TableFooter({ count }) {
  return <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500"><span>Menampilkan {count} data</span><div className="flex gap-1"><button className="rounded border border-slate-200 p-1 text-slate-400"><ChevronLeft className="h-4 w-4" /></button><button className="rounded border border-blue-600 bg-blue-50 px-2 text-blue-600">1</button><button className="rounded border border-slate-200 p-1 text-slate-500"><ChevronRight className="h-4 w-4" /></button></div></div>
}

export function TableToolbar({ children, placeholder }) {
  return <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 p-3"><SearchInput placeholder={placeholder} />{children}</div>
}

export function Select({ children }) {
  return <select className="h-[42px] rounded-[10px] border border-slate-200 bg-white px-3 text-[13px] text-slate-600 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10">{children}</select>
}

export function Modal({ children, title, description, open, onClose, className = '' }) {
  if (!open) return null
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 px-4 py-6 backdrop-blur-[2px]"><Card className={`max-h-full w-full max-w-lg overflow-y-auto shadow-[0_18px_42px_rgba(15,23,42,.16)] ${className}`}><div className="flex items-start justify-between border-b border-slate-200 bg-slate-50/70 p-4"><div><h2 className="text-sm font-semibold text-slate-950">{title}</h2>{description && <p className="mt-1 text-xs leading-4 text-slate-500">{description}</p>}</div><button className="rounded-lg p-1 hover:bg-slate-100" aria-label="Tutup modal" onClick={onClose}><X className="h-4 w-4 text-slate-400 hover:text-slate-600" /></button></div>{children}</Card></div>
}

export function EmptyState({ title = 'Belum ada data', description = 'Data akan muncul di sini.', icon: Icon = Inbox, action }) {
  return <div className="grid place-items-center px-4 py-12 text-center"><span className="grid h-11 w-11 place-items-center rounded-xl border border-blue-100 bg-blue-50"><Icon className="h-5 w-5 text-blue-500" /></span><p className="mt-3 text-[13px] font-semibold text-slate-700">{title}</p><p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{description}</p>{action && <div className="mt-4">{action}</div>}</div>
}

export function LoadingRows({ count = 6 }) {
  return <div className="space-y-2 p-4">{Array.from({ length: count }).map((_, index) => <div className="skeleton h-10 rounded-lg" key={index} />)}</div>
}

export function ErrorState({ message, onRetry, title = 'Gagal memuat data' }) {
  return <Card className="p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-red-600">{title}</p><p className="mt-1 text-xs text-slate-500">{message || 'Terjadi kesalahan saat menghubungi server.'}</p></div>{onRetry && <Button variant="secondary" onClick={onRetry}>Coba Lagi</Button>}</div></Card>
}
