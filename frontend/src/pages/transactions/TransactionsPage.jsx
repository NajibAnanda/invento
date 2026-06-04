import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge, Button, Card, EmptyState, FilterToolbar, Modal, PageHeader, SelectFilter, Table, TextFilter } from '../../components/ui'
import { ADMIN_ROLES } from '../../lib/roles'
import { formatNumber, formatRupiah } from '../../lib/formatters'
import transactionService from '../../services/transactionService'
import useAuthStore from '../../store/useAuthStore'

const statusOptions = [
  { label: 'Semua status', value: '' },
  { label: 'Selesai', value: 'completed' },
  { label: 'Dibatalkan', value: 'cancelled' },
]

function formatDate(value) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function statusBadge(status) {
  return status === 'completed'
    ? { label: 'Selesai', tone: 'green' }
    : { label: 'Dibatalkan', tone: 'red' }
}

export default function TransactionsPage() {
  const queryClient = useQueryClient()
  const role = useAuthStore((state) => state.role)
  const canCancel = ADMIN_ROLES.includes(role)
  const [filters, setFilters] = useState({ search: '', status: '', date_from: '', date_to: '', page: 1 })
  const [selectedId, setSelectedId] = useState(null)
  const [message, setMessage] = useState('')
  const params = useMemo(() => ({
    search: filters.search || undefined,
    status: filters.status || undefined,
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
    page: filters.page,
    per_page: 12,
  }), [filters])

  const transactionsQuery = useQuery({
    queryKey: ['transactions', params],
    queryFn: () => transactionService.getAll(params),
  })
  const detailQuery = useQuery({
    queryKey: ['transactions', 'detail', selectedId],
    queryFn: () => transactionService.getById(selectedId),
    enabled: Boolean(selectedId),
  })

  const cancelMutation = useMutation({
    mutationFn: transactionService.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setMessage('Transaksi berhasil dibatalkan dan stok dikembalikan.')
    },
    onError: (error) => setMessage(error.errors?.transaction?.[0] || error.message),
  })

  const transactionPage = transactionsQuery.data?.data
  const transactions = transactionPage?.data || []
  const selectedTransaction = detailQuery.data?.data

  const handleFilterChange = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value, page: 1 }))
  }

  const handleCancel = () => {
    if (!selectedTransaction || !window.confirm(`Batalkan transaksi ${selectedTransaction.invoice_no}? Stok produk akan dikembalikan.`)) return
    cancelMutation.mutate(selectedTransaction.id)
  }

  return <>
    <PageHeader title="Transaksi" description="Lihat riwayat penjualan dan detail pembayaran." action={<Button disabled title="Coming soon" variant="secondary"><Download className="h-4 w-4" /> Export - Coming soon</Button>} />
    {message && <Card className={`p-3 text-[13px] font-medium ${cancelMutation.isError ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{message}</Card>}
    {transactionsQuery.isError && <Card className="p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-red-600">Gagal memuat transaksi</p><p className="mt-1 text-xs text-slate-500">{transactionsQuery.error.message}</p></div><Button variant="secondary" onClick={() => transactionsQuery.refetch()}>Coba Lagi</Button></div></Card>}

    <Card>
      <div className="border-b border-slate-200 bg-slate-50/70 p-3">
        <FilterToolbar>
          <TextFilter label="Cari Invoice" placeholder="Cari nomor invoice..." type="search" value={filters.search} onChange={(event) => handleFilterChange('search', event.target.value)} />
          <TextFilter label="Dari Tanggal" type="date" value={filters.date_from} onChange={(event) => handleFilterChange('date_from', event.target.value)} />
          <TextFilter label="Sampai Tanggal" min={filters.date_from} type="date" value={filters.date_to} onChange={(event) => handleFilterChange('date_to', event.target.value)} />
          <SelectFilter label="Status" value={filters.status} onChange={(event) => handleFilterChange('status', event.target.value)}>{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</SelectFilter>
        </FilterToolbar>
      </div>

      {transactionsQuery.isLoading ? <div className="space-y-2 p-4">{Array.from({ length: 8 }).map((_, index) => <div className="h-10 rounded bg-slate-100" key={index} />)}</div> : transactions.length ? <>
        <Table columns={[{ label: 'Invoice' }, { label: 'Kasir' }, { label: 'Waktu' }, { label: 'Item', align: 'center' }, { label: 'Total', align: 'center' }, { label: 'Status' }, { label: 'Aksi', align: 'center' }]} rows={transactions} renderRow={(transaction) => {
          const badge = statusBadge(transaction.status)
          return <tr className="h-11 hover:bg-slate-50" key={transaction.id}><td className="px-4 font-medium text-blue-600">{transaction.invoice_no}</td><td className="px-4 text-slate-600">{transaction.user?.name || '-'}</td><td className="px-4 text-slate-500">{formatDate(transaction.created_at)}</td><td className="px-4 text-center text-slate-700">{formatNumber(transaction.transaction_items_count || 0)}</td><td className="px-4 text-center font-medium text-slate-700">{formatRupiah(transaction.total_amount)}</td><td className="px-4"><Badge tone={badge.tone}>{badge.label}</Badge></td><td className="px-4 text-center"><button className="text-xs font-medium text-blue-600" onClick={() => setSelectedId(transaction.id)}>Detail</button></td></tr>
        }} />
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-3 text-xs text-slate-500"><span>Menampilkan {formatNumber(transactionPage.from || 0)}-{formatNumber(transactionPage.to || 0)} dari {formatNumber(transactionPage.total || 0)} data</span><div className="flex gap-1"><Button variant="secondary" className="h-8 px-2" disabled={transactionPage.current_page <= 1} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}>Sebelumnya</Button><span className="grid h-8 place-items-center rounded border border-blue-600 bg-blue-50 px-3 text-blue-600">{transactionPage.current_page}</span><Button variant="secondary" className="h-8 px-2" disabled={transactionPage.current_page >= transactionPage.last_page} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}>Berikutnya</Button></div></div>
      </> : <EmptyState title="Transaksi tidak ditemukan" description="Ubah filter atau lakukan transaksi dari halaman POS." />}
    </Card>

    <Modal description="Rincian pembayaran dan item transaksi." onClose={() => setSelectedId(null)} open={Boolean(selectedId)} title={selectedTransaction?.invoice_no || 'Detail Transaksi'}>
      {detailQuery.isLoading && <div className="space-y-3 p-4">{Array.from({ length: 4 }).map((_, index) => <div className="h-9 rounded bg-slate-100" key={index} />)}</div>}
      {detailQuery.isError && <div className="p-4 text-[13px] text-red-600">{detailQuery.error.message}</div>}
      {selectedTransaction && <div className="p-4"><div className="grid grid-cols-2 gap-3 rounded-md bg-slate-50 p-3 text-xs"><div><p className="text-slate-400">Kasir</p><p className="mt-1 font-medium text-slate-700">{selectedTransaction.user?.name || '-'}</p></div><div><p className="text-slate-400">Waktu</p><p className="mt-1 font-medium text-slate-700">{formatDate(selectedTransaction.created_at)}</p></div></div><div className="mt-4 divide-y divide-slate-100 border-y border-slate-200">{selectedTransaction.transaction_items.map((item) => <div className="flex justify-between gap-3 py-3 text-xs" key={item.id}><div><p className="font-medium text-slate-700">{item.product_name}</p><p className="mt-1 text-slate-400">{item.qty} x {formatRupiah(item.sell_price)}</p></div><p className="font-medium text-slate-700">{formatRupiah(item.subtotal)}</p></div>)}</div><div className="mt-4 space-y-2 text-[13px]"><div className="flex justify-between font-semibold"><span>Total</span><span>{formatRupiah(selectedTransaction.total_amount)}</span></div><div className="flex justify-between text-slate-500"><span>Dibayar</span><span>{formatRupiah(selectedTransaction.payment_amount)}</span></div><div className="flex justify-between text-slate-500"><span>Kembalian</span><span>{formatRupiah(selectedTransaction.change_amount)}</span></div></div>{canCancel && selectedTransaction.status === 'completed' && <div className="mt-5 flex justify-end"><Button variant="danger" disabled={cancelMutation.isPending} onClick={handleCancel}>{cancelMutation.isPending ? 'Membatalkan...' : 'Batalkan Transaksi'}</Button></div>}</div>}
    </Modal>
  </>
}

