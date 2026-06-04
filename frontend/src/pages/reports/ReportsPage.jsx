import { useQuery } from '@tanstack/react-query'
import { Banknote, Download, ReceiptText, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button, Card, EmptyState, FilterToolbar, PageHeader, StatCard, Table, TextFilter } from '../../components/ui'
import { formatNumber, formatRupiah } from '../../lib/formatters'
import reportService from '../../services/reportService'

function formatDate(value) {
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(new Date(value))
}

export default function ReportsPage() {
  const [draftFilters, setDraftFilters] = useState({ date_from: '', date_to: '' })
  const [filters, setFilters] = useState({})
  const { data: response, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['reports', 'sales', filters],
    queryFn: () => reportService.getSales(filters),
  })

  const report = response?.data
  const summary = report?.summary
  const chartData = report?.chart_data?.map((item) => ({ ...item, label: formatDate(item.date) })) || []
  const topProducts = report?.top_products || []
  const hasSales = Number(summary?.total_transactions || 0) > 0

  const applyFilters = (event) => {
    event.preventDefault()
    setFilters({
      date_from: draftFilters.date_from || undefined,
      date_to: draftFilters.date_to || undefined,
    })
  }

  return <>
    <PageHeader title="Laporan" description="Analisis performa penjualan berdasarkan periode." action={<div className="flex flex-wrap gap-2"><Button disabled title="Coming soon" variant="secondary"><Download className="h-4 w-4" /> Export PDF - Coming soon</Button><Button disabled title="Coming soon" variant="secondary"><Download className="h-4 w-4" /> Export Excel - Coming soon</Button></div>} />

    {isError && <Card className="p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-red-600">Gagal memuat laporan</p><p className="mt-1 text-xs text-slate-500">{error.message}</p></div><Button variant="secondary" onClick={() => refetch()}>Coba Lagi</Button></div></Card>}

    <Card>
      <form className="bg-slate-50/70 p-3" onSubmit={applyFilters}>
        <FilterToolbar>
          <TextFilter label="Tanggal Mulai" type="date" value={draftFilters.date_from} onChange={(event) => setDraftFilters((current) => ({ ...current, date_from: event.target.value }))} />
          <TextFilter label="Tanggal Selesai" min={draftFilters.date_from} type="date" value={draftFilters.date_to} onChange={(event) => setDraftFilters((current) => ({ ...current, date_to: event.target.value }))} />
          <div className="flex min-w-[160px] flex-col gap-1.5"><span className="text-xs font-medium text-transparent">Aksi</span><Button className="h-10" type="submit">Terapkan Filter</Button></div>
          {report?.period && <p className="self-end pb-2 text-xs text-slate-400">Periode aktif: {report.period.date_from} s/d {report.period.date_to}</p>}
        </FilterToolbar>
      </form>
    </Card>

    <section className="grid gap-3 sm:grid-cols-3">
      <StatCard icon={Banknote} label="Total Pendapatan" tone="green" value={isLoading ? '...' : formatRupiah(summary?.total_revenue || 0)} />
      <StatCard icon={ReceiptText} label="Total Transaksi" tone="blue" value={isLoading ? '...' : formatNumber(summary?.total_transactions || 0)} />
      <StatCard icon={ShoppingBag} label="Rata-rata Transaksi" tone="sky" value={isLoading ? '...' : formatRupiah(summary?.average_transaction || 0)} />
    </section>

    <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
      <Card>
        <div className="border-b border-slate-200 bg-slate-50/70 p-4"><h2 className="text-sm font-semibold text-slate-950">Pendapatan Harian</h2><p className="mt-1 text-xs text-slate-500">Nilai transaksi selesai pada periode terpilih.</p></div>
        <div className="h-72 p-4">{isLoading ? <div className="skeleton h-full rounded-lg" /> : hasSales ? <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis axisLine={false} dataKey="label" fontSize={11} tickLine={false} /><YAxis axisLine={false} fontSize={11} tickFormatter={(value) => `${value / 1000000} jt`} tickLine={false} width={42} /><Tooltip contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 8px 24px rgba(15,23,42,.10)', fontSize: 12 }} formatter={(value) => formatRupiah(value)} labelFormatter={(_, payload) => payload?.[0]?.payload?.date || ''} /><Bar dataKey="total_revenue" fill="#2563eb" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer> : <EmptyState title="Belum ada penjualan" description="Grafik akan muncul setelah transaksi selesai pada periode ini." />}</div>
      </Card>

      <Card>
        <div className="border-b border-slate-200 bg-slate-50/70 p-4"><h2 className="text-sm font-semibold text-slate-950">Produk Terlaris</h2><p className="mt-1 text-xs text-slate-500">Berdasarkan jumlah produk terjual.</p></div>
        {isLoading ? <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, index) => <div className="h-10 rounded bg-slate-100" key={index} />)}</div> : topProducts.length ? <Table columns={[{ label: 'Produk' }, { label: 'Terjual', align: 'center' }, { label: 'Pendapatan', align: 'center' }]} rows={topProducts} renderRow={(product) => <tr className="h-11 hover:bg-slate-50" key={`${product.product_id}-${product.product_name}`}><td className="px-4 text-slate-700">{product.product_name}</td><td className="px-4 text-center font-medium text-slate-700">{formatNumber(product.total_qty)}</td><td className="px-4 text-center text-slate-600">{formatRupiah(product.total_revenue)}</td></tr>} /> : <EmptyState title="Belum ada penjualan" description="Produk terlaris akan muncul setelah ada transaksi selesai." />}
      </Card>
    </section>
  </>
}

