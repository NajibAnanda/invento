import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Boxes, Package, ShoppingBag } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge, Button, Card, EmptyState, PageHeader, StatCard, Table } from '../../components/ui'
import { formatNumber, formatRupiah } from '../../lib/formatters'
import dashboardService from '../../services/dashboardService'

const stockTone = (product) => Number(product.stock) <= 0 ? 'red' : 'amber'
const stockLabel = (product) => Number(product.stock) <= 0 ? 'Out of Stock' : 'Low Stock'

function LoadingCard() {
  return <Card className="p-4"><div className="h-4 w-28 rounded bg-slate-100" /><div className="mt-4 h-8 w-20 rounded bg-slate-100" /><div className="mt-2 h-3 w-32 rounded bg-slate-100" /></Card>
}

function formatDateLabel(value) {
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(new Date(value))
}

function formatTime(value) {
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

export default function DashboardPage() {
  const { data: response, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getSummary,
  })

  const dashboard = response?.data
  const chartData = dashboard?.sales_chart_data?.map((item) => ({
    ...item,
    label: formatDateLabel(item.date),
  })) || []

  return <>
    <PageHeader title="Dashboard" description="Ringkasan operasional Toko Invento hari ini." />

    {isError && <Card className="p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-red-600">Gagal memuat dashboard</p><p className="mt-1 text-xs text-slate-500">{error.message}</p></div><Button variant="secondary" onClick={() => refetch()}>Coba Lagi</Button></div></Card>}

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {isLoading ? Array.from({ length: 4 }).map((_, index) => <LoadingCard key={index} />) : <>
        <StatCard label="Penjualan Hari Ini" value={formatNumber(dashboard?.total_sales_today || 0)} note="Transaksi selesai hari ini" icon={ShoppingBag} tone="blue" />
        <StatCard label="Pendapatan Hari Ini" value={formatRupiah(dashboard?.total_revenue_today || 0)} note="Total pendapatan harian" icon={Boxes} tone="green" />
        <StatCard label="Total Produk" value={formatNumber(dashboard?.total_products || 0)} note="Produk terdaftar di sistem" icon={Package} tone="sky" />
        <StatCard label="Stok Rendah" value={formatNumber(dashboard?.low_stock_count || 0)} note="Perlu perhatian gudang" icon={AlertTriangle} tone="amber" />
      </>}
    </section>

    <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
      <Card>
        <div className="border-b border-slate-200 bg-slate-50/70 p-4"><h2 className="text-sm font-semibold text-slate-950">Tren Penjualan 7 Hari</h2><p className="mt-1 text-xs text-slate-500">Pendapatan penjualan per hari</p></div>
        <div className="h-64 p-4">
          {isLoading ? <div className="skeleton h-full rounded-lg" /> : <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis axisLine={false} dataKey="label" fontSize={11} tickLine={false} /><YAxis axisLine={false} fontSize={11} tickFormatter={(value) => `${value / 1000000} jt`} tickLine={false} width={42} /><Tooltip contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 8px 24px rgba(15,23,42,.10)', fontSize: 12 }} formatter={(value) => formatRupiah(value)} labelFormatter={(_, payload) => payload?.[0]?.payload?.date || ''} /><Area dataKey="total" fill="#dbeafe" fillOpacity={0.7} stroke="#2563eb" strokeWidth={2} type="monotone" /></AreaChart></ResponsiveContainer>}
        </div>
      </Card>

      <Card>
        <div className="border-b border-slate-200 bg-slate-50/70 p-4"><h2 className="text-sm font-semibold text-slate-950">Produk Terlaris</h2><p className="mt-1 text-xs text-slate-500">Berdasarkan transaksi selesai</p></div>
        {isLoading ? <div className="space-y-3 p-4">{Array.from({ length: 4 }).map((_, index) => <div className="h-10 rounded bg-slate-100" key={index} />)}</div> : dashboard?.top_products?.length ? <div className="divide-y divide-slate-100">{dashboard.top_products.map((product, index) => <div className="flex items-center gap-3 p-4" key={`${product.product_id}-${product.product_name}`}><span className="grid h-7 w-7 place-items-center rounded bg-slate-100 text-xs font-semibold text-slate-500">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-[13px] font-medium text-slate-700">{product.product_name}</p><p className="mt-1 text-[11px] text-slate-500">{formatNumber(product.total_qty)} terjual</p></div><p className="text-xs font-medium text-slate-700">{formatRupiah(product.total_revenue)}</p></div>)}</div> : <EmptyState title="Belum ada produk terlaris" description="Data akan muncul setelah transaksi selesai." />}
      </Card>
    </section>

    <section className="grid gap-4 xl:grid-cols-2">
      <Card>
        <div className="border-b border-slate-200 bg-slate-50/70 p-4"><h2 className="text-sm font-semibold text-slate-950">Stok Kritis</h2></div>
        {isLoading ? <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, index) => <div className="h-9 rounded bg-slate-100" key={index} />)}</div> : dashboard?.low_stock_products?.length ? <Table columns={[{ label: 'Produk' }, { label: 'Stok' }, { label: 'Status' }]} rows={dashboard.low_stock_products} renderRow={(product) => <tr className="h-11 hover:bg-slate-50" key={product.id}><td className="px-4 font-medium text-slate-700">{product.name}</td><td className="px-4 text-slate-600">{formatNumber(product.stock)} / min. {formatNumber(product.min_stock)}</td><td className="px-4"><Badge tone={stockTone(product)}>{stockLabel(product)}</Badge></td></tr>} /> : <EmptyState title="Tidak ada stok kritis" description="Semua stok masih berada di atas minimum." />}
      </Card>

      <Card>
        <div className="border-b border-slate-200 bg-slate-50/70 p-4"><h2 className="text-sm font-semibold text-slate-950">Transaksi Terbaru</h2></div>
        {isLoading ? <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, index) => <div className="h-9 rounded bg-slate-100" key={index} />)}</div> : dashboard?.recent_transactions?.length ? <Table columns={[{ label: 'Invoice' }, { label: 'Waktu' }, { label: 'Total', align: 'right' }]} rows={dashboard.recent_transactions} renderRow={(transaction) => <tr className="h-11 hover:bg-slate-50" key={transaction.id}><td className="px-4 font-medium text-blue-600">{transaction.invoice_no}</td><td className="px-4 text-slate-500">{formatTime(transaction.created_at)}</td><td className="px-4 text-right font-medium text-slate-700">{formatRupiah(transaction.total_amount)}</td></tr>} /> : <EmptyState title="Belum ada transaksi" description="Transaksi terbaru akan muncul di sini." />}
      </Card>
    </section>
  </>
}
