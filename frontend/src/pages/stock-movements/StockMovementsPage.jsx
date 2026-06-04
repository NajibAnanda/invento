import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge, Button, Card, EmptyState, FilterToolbar, PageHeader, SelectFilter, Table, TextFilter } from '../../components/ui'
import { formatNumber } from '../../lib/formatters'
import stockService from '../../services/stockService'

const typeOptions = [
  { label: 'Semua tipe', value: '' },
  { label: 'in', value: 'in' },
  { label: 'out', value: 'out' },
  { label: 'adjustment', value: 'adjustment' },
]

const tone = (type) => type === 'in' ? 'green' : type === 'out' ? 'red' : 'amber'
const formatMovementQty = (movement) => `${Number(movement.qty) > 0 ? '+' : ''}${formatNumber(movement.qty)}`

function formatDate(value) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export default function StockMovementsPage() {
  const [filters, setFilters] = useState({ search: '', type: '', page: 1 })
  const params = useMemo(() => ({
    search: filters.search || undefined,
    type: filters.type || undefined,
    page: filters.page,
    per_page: 12,
  }), [filters])

  const movementsQuery = useQuery({
    queryKey: ['stock-movements', params],
    queryFn: () => stockService.getMovements(params),
  })

  const movementPage = movementsQuery.data?.data
  const movements = movementPage?.data || []

  const handleFilterChange = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value, page: 1 }))
  }

  return <>
    <PageHeader title="Riwayat Stok" description="Lacak seluruh perubahan jumlah stok produk." action={<Button disabled title="Coming soon" variant="secondary"><Download className="h-4 w-4" /> Export - Coming soon</Button>} />

    {movementsQuery.isError && <Card className="p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-red-600">Gagal memuat riwayat stok</p><p className="mt-1 text-xs text-slate-500">{movementsQuery.error.message}</p></div><Button variant="secondary" onClick={() => movementsQuery.refetch()}>Coba Lagi</Button></div></Card>}

    <Card>
      <div className="border-b border-slate-200 bg-slate-50/70 p-3">
        <FilterToolbar>
          <TextFilter label="Cari Produk / SKU" placeholder="Cari produk..." type="search" value={filters.search} onChange={(event) => handleFilterChange('search', event.target.value)} />
          <SelectFilter label="Tipe Pergerakan" value={filters.type} onChange={(event) => handleFilterChange('type', event.target.value)}>{typeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</SelectFilter>
        </FilterToolbar>
      </div>

      {movementsQuery.isLoading ? <div className="space-y-2 p-4">{Array.from({ length: 8 }).map((_, index) => <div className="h-10 rounded bg-slate-100" key={index} />)}</div> : movements.length ? <>
        <Table columns={[{ label: 'Tanggal' }, { label: 'Produk' }, { label: 'Tipe' }, { label: 'Qty', align: 'center' }, { label: 'Sebelum', align: 'center' }, { label: 'Sesudah', align: 'center' }, { label: 'User' }, { label: 'Catatan' }]} rows={movements} renderRow={(movement) => <tr className="h-11 hover:bg-slate-50" key={movement.id}><td className="px-4 text-slate-500">{formatDate(movement.created_at)}</td><td className="px-4"><p className="font-medium text-slate-700">{movement.product?.name || '-'}</p><p className="text-[11px] text-slate-400">{movement.product?.sku || '-'}</p></td><td className="px-4"><Badge tone={tone(movement.type)}>{movement.type}</Badge></td><td className={`px-4 text-center font-medium ${movement.type === 'in' ? 'text-emerald-600' : movement.type === 'out' ? 'text-red-600' : 'text-amber-600'}`}>{formatMovementQty(movement)}</td><td className="px-4 text-center text-slate-500">{formatNumber(movement.stock_before)}</td><td className="px-4 text-center text-slate-700">{formatNumber(movement.stock_after)}</td><td className="px-4 text-slate-500">{movement.user?.name || '-'}</td><td className="max-w-xs truncate px-4 text-slate-500">{movement.note || '-'}</td></tr>} />
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-3 text-xs text-slate-500"><span>Menampilkan {formatNumber(movementPage.from || 0)}-{formatNumber(movementPage.to || 0)} dari {formatNumber(movementPage.total || 0)} data</span><div className="flex gap-1"><Button variant="secondary" className="h-8 px-2" disabled={movementPage.current_page <= 1} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}>Sebelumnya</Button><span className="grid h-8 place-items-center rounded border border-blue-600 bg-blue-50 px-3 text-blue-600">{movementPage.current_page}</span><Button variant="secondary" className="h-8 px-2" disabled={movementPage.current_page >= movementPage.last_page} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}>Berikutnya</Button></div></div>
      </> : <EmptyState title="Riwayat stok kosong" description="Pergerakan stok akan muncul setelah stock-in atau transaksi POS." />}
    </Card>
  </>
}

