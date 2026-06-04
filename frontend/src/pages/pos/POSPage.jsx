import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Minus, Plus, ReceiptText, ShoppingCart, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge, Button, Card, EmptyState, FilterToolbar, Modal, PageHeader, TextFilter } from '../../components/ui'
import { formatNumber, formatRupiah } from '../../lib/formatters'
import productService from '../../services/productService'
import transactionService from '../../services/transactionService'

export default function POSPage() {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState([])
  const [payment, setPayment] = useState('')
  const [receipt, setReceipt] = useState(null)
  const [message, setMessage] = useState('')

  const productsQuery = useQuery({
    queryKey: ['products', 'pos'],
    queryFn: () => productService.getAll({ active_only: 1, per_page: 100 }),
  })

  const products = useMemo(() => productsQuery.data?.data?.data || [], [productsQuery.data])
  const filteredProducts = useMemo(() => {
    const keyword = query.toLowerCase()
    return products.filter((product) => `${product.name} ${product.sku}`.toLowerCase().includes(keyword))
  }, [products, query])
  const total = useMemo(() => cart.reduce((sum, item) => sum + Number(item.sell_price) * item.qty, 0), [cart])
  const change = Math.max(Number(payment || 0) - total, 0)

  const transactionMutation = useMutation({
    mutationFn: transactionService.create,
    onSuccess: (response) => {
      setReceipt(response.data)
      setCart([])
      setPayment('')
      setMessage('')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => setMessage(error.errors?.items?.[0] || error.errors?.payment_amount?.[0] || error.message),
  })

  const addToCart = (product) => {
    if (Number(product.stock) <= 0) {
      setMessage('Produk habis dan tidak dapat ditambahkan.')
      return
    }

    setMessage('')
    setCart((items) => {
      const existing = items.find((item) => item.id === product.id)
      if (!existing) return [...items, { ...product, qty: 1 }]
      if (existing.qty >= Number(existing.stock)) {
        setMessage(`Jumlah ${existing.name} tidak boleh melebihi stok.`)
        return items
      }
      return items.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
    })
  }

  const updateQty = (id, delta) => {
    setMessage('')
    setCart((items) => items.map((item) => {
      if (item.id !== id) return item
      const qty = Math.max(1, item.qty + delta)
      if (qty > Number(item.stock)) {
        setMessage(`Jumlah ${item.name} tidak boleh melebihi stok.`)
        return item
      }
      return { ...item, qty }
    }))
  }

  const removeItem = (id) => setCart((items) => items.filter((item) => item.id !== id))

  const finishPayment = () => {
    setMessage('')
    if (!cart.length) {
      setMessage('Keranjang masih kosong.')
      return
    }
    if (Number(payment) < total) {
      setMessage('Uang diterima kurang dari total pembayaran.')
      return
    }

    transactionMutation.mutate({
      items: cart.map((item) => ({ product_id: item.id, qty: item.qty })),
      payment_amount: Number(payment),
    })
  }

  return <>
    <PageHeader title="Point of Sale" description="Pilih produk dan proses transaksi penjualan." />
    {message && <Card className="border-red-200 bg-red-50 p-3 text-[13px] font-medium text-red-700">{message}</Card>}
    {productsQuery.isError && <Card className="p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-red-600">Gagal memuat produk POS</p><p className="mt-1 text-xs text-slate-500">{productsQuery.error.message}</p></div><Button variant="secondary" onClick={() => productsQuery.refetch()}>Coba Lagi</Button></div></Card>}

    <Card className="bg-slate-50/70 p-3">
      <FilterToolbar>
        <TextFilter label="Cari Produk / SKU" placeholder="Cari produk berdasarkan nama atau SKU..." type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
      </FilterToolbar>
    </Card>

    <section className="grid items-start gap-4 xl:grid-cols-[1fr_360px]">
      <Card>
        <div className="border-b border-slate-200 bg-slate-50/70 p-4"><h2 className="text-sm font-semibold text-slate-950">Daftar Produk</h2><p className="mt-1 text-xs text-slate-500">{formatNumber(filteredProducts.length)} produk ditemukan untuk transaksi cepat</p></div>
        {productsQuery.isLoading ? <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div className="skeleton h-36 rounded-xl" key={index} />)}</div> : filteredProducts.length ? <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3">{filteredProducts.map((product) => {
          const isOutOfStock = Number(product.stock) <= 0
          return <article className={`rounded-xl border p-3 transition ${isOutOfStock ? 'border-slate-200 bg-slate-50 opacity-70' : 'border-slate-200 bg-white hover:border-blue-200 hover:shadow-[0_6px_18px_rgba(15,23,42,.06)]'}`} key={product.id}><div className="flex items-start justify-between gap-2"><span className={`grid h-9 w-9 place-items-center rounded-lg ${isOutOfStock ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'}`}><ShoppingCart className="h-4 w-4" /></span><Badge tone={isOutOfStock ? 'red' : Number(product.stock) <= Number(product.min_stock) ? 'amber' : 'green'}>{Number(product.stock) > 0 ? `${formatNumber(product.stock)} stok` : 'Habis'}</Badge></div><h3 className="mt-3 line-clamp-2 text-[13px] font-semibold text-slate-800">{product.name}</h3><p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">{product.sku}</p><div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3"><p className="text-[13px] font-semibold text-slate-900">{formatRupiah(product.sell_price)}</p><Button className="h-8 px-2" disabled={isOutOfStock} onClick={() => addToCart(product)}><Plus className="h-3.5 w-3.5" /> Tambah</Button></div></article>
        })}</div> : <EmptyState title="Produk tidak ditemukan" description="Ubah kata kunci pencarian produk." />}
      </Card>

      <Card className="overflow-hidden border-blue-100 xl:sticky xl:top-20">
        <div className="border-b border-blue-100 bg-blue-50/60 p-4"><div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold text-slate-950">Keranjang</h2><p className="mt-1 text-xs text-slate-500">{formatNumber(cart.length)} jenis produk dipilih</p></div><span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-blue-600 ring-1 ring-blue-100"><ReceiptText className="h-4 w-4" /></span></div></div>
        <div className="max-h-72 overflow-y-auto bg-white">{cart.length === 0 ? <EmptyState description="Tambahkan produk untuk memulai." icon={ShoppingCart} title="Keranjang masih kosong" /> : cart.map((item) => <div className="border-b border-slate-100 p-3" key={item.id}><div className="flex justify-between gap-3"><div className="min-w-0"><p className="truncate text-[13px] font-semibold text-slate-800">{item.name}</p><p className="mt-1 text-xs text-slate-500">{formatRupiah(item.sell_price)} / item</p></div><button className="rounded-lg p-1 hover:bg-red-50" aria-label={`Hapus ${item.name}`} onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" /></button></div><div className="mt-3 flex items-center justify-between"><div className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50"><button aria-label={`Kurangi ${item.name}`} className="grid h-7 w-7 place-items-center hover:bg-white" onClick={() => updateQty(item.id, -1)}><Minus className="h-3 w-3" /></button><span className="grid h-7 min-w-8 place-items-center border-x border-slate-200 bg-white text-xs font-semibold">{item.qty}</span><button aria-label={`Tambah ${item.name}`} className="grid h-7 w-7 place-items-center hover:bg-white" onClick={() => updateQty(item.id, 1)}><Plus className="h-3 w-3" /></button></div><p className="text-xs font-semibold text-slate-800">{formatRupiah(item.qty * Number(item.sell_price))}</p></div></div>)}</div>
        <div className="space-y-3 border-t border-slate-200 bg-[linear-gradient(180deg,#f8fafc,#ffffff)] p-4"><div className="rounded-[14px] bg-white p-3 ring-1 ring-slate-200"><p className="text-xs font-semibold text-slate-500">Total Pembayaran</p><p className="mt-1 text-[28px] font-semibold leading-tight tracking-[-0.5px] text-slate-950">{formatRupiah(total)}</p></div><label className="block text-xs font-medium text-slate-600">Uang Diterima<input className="mt-1.5 h-[42px] w-full rounded-[10px] border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10" min="0" placeholder="0" step="0.01" type="number" value={payment} onChange={(event) => setPayment(event.target.value)} /></label><div className="flex justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-700"><span>Kembalian</span><span className="font-semibold">{formatRupiah(change)}</span></div><Button className="h-12 w-full rounded-xl text-sm font-semibold" disabled={!cart.length || Number(payment) < total || transactionMutation.isPending} onClick={finishPayment}>{transactionMutation.isPending ? 'Memproses...' : 'Bayar Sekarang'}</Button></div>
      </Card>
    </section>

    <Modal className="max-w-sm" description="Pembayaran berhasil diproses." onClose={() => setReceipt(null)} open={Boolean(receipt)} title="Transaksi Berhasil">
      {receipt && <div className="p-5"><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3"><div className="flex items-center gap-2 text-xs font-semibold text-emerald-700"><ReceiptText className="h-5 w-5" /> Struk Pembayaran</div><p className="mt-1 text-[12px] font-medium text-emerald-800">{receipt.invoice_no}</p></div><div className="mt-4 space-y-2 border-y border-dashed border-slate-200 py-4 text-xs">{receipt.transaction_items.map((item) => <div className="flex justify-between gap-3" key={item.id}><span className="text-slate-600">{item.qty}x {item.product_name}</span><span className="font-medium text-slate-800">{formatRupiah(item.subtotal)}</span></div>)}</div><div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-[13px] ring-1 ring-slate-200"><div className="flex justify-between font-semibold text-slate-950"><span>Total</span><span>{formatRupiah(receipt.total_amount)}</span></div><div className="flex justify-between text-slate-500"><span>Dibayar</span><span>{formatRupiah(receipt.payment_amount)}</span></div><div className="flex justify-between text-emerald-700"><span>Kembalian</span><span className="font-semibold">{formatRupiah(receipt.change_amount)}</span></div></div><div className="mt-5 flex gap-2"><Button className="flex-1" variant="secondary" onClick={() => window.print()}>Cetak Struk</Button><Button className="flex-1" onClick={() => setReceipt(null)}>Transaksi Baru</Button></div></div>}
    </Modal>
  </>
}
