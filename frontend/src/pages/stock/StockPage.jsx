import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Boxes, PackageCheck, PackageX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge, Button, Card, EmptyState, PageHeader, StatCard } from '../../components/ui'
import { formatNumber, formatRupiah } from '../../lib/formatters'
import productService from '../../services/productService'
import stockService from '../../services/stockService'
import supplierService from '../../services/supplierService'

const emptyForm = {
  product_id: '',
  qty: '',
  supplier_id: '',
  buy_price: '',
  note: '',
}

function getStockStatus(product) {
  if (Number(product.stock) <= 0) return { label: 'Out of Stock', tone: 'red' }
  if (Number(product.stock) <= Number(product.min_stock)) return { label: 'Low Stock', tone: 'amber' }
  return { label: 'In Stock', tone: 'green' }
}

function fieldError(errors, field) {
  const error = errors?.[field]
  return Array.isArray(error) ? error[0] : error
}

function FormSelect({ children, error, label, ...props }) {
  return <label className="block text-xs font-medium text-slate-600">{label}<select className={`mt-1.5 h-9 w-full rounded-md border bg-white px-3 text-[13px] outline-none focus:border-blue-600 ${error ? 'border-red-300' : 'border-slate-200'}`} {...props}>{children}</select>{error && <span className="mt-1 block text-[11px] text-red-600">{error}</span>}</label>
}

function FormInput({ error, label, ...props }) {
  return <label className="block text-xs font-medium text-slate-600">{label}<input className={`mt-1.5 h-9 w-full rounded-md border px-3 text-[13px] outline-none focus:border-blue-600 ${error ? 'border-red-300' : 'border-slate-200'}`} {...props} />{error && <span className="mt-1 block text-[11px] text-red-600">{error}</span>}</label>
}

export default function StockPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [message, setMessage] = useState('')

  const productsQuery = useQuery({
    queryKey: ['products', 'stock-options'],
    queryFn: () => productService.getAll({ per_page: 100 }),
  })
  const suppliersQuery = useQuery({
    queryKey: ['suppliers', 'stock-options'],
    queryFn: supplierService.getAll,
  })

  const products = useMemo(() => productsQuery.data?.data?.data || [], [productsQuery.data])
  const suppliers = useMemo(() => suppliersQuery.data?.data || [], [suppliersQuery.data])
  const selectedProduct = products.find((product) => String(product.id) === form.product_id)

  const summary = useMemo(() => {
    const totalStock = products.reduce((total, product) => total + Number(product.stock || 0), 0)
    const outOfStock = products.filter((product) => Number(product.stock) <= 0).length
    const lowStock = products.filter((product) => Number(product.stock) > 0 && Number(product.stock) <= Number(product.min_stock)).length

    return {
      totalStock,
      outOfStock,
      lowStock,
      available: Math.max(products.length - lowStock - outOfStock, 0),
    }
  }, [products])

  const stockInMutation = useMutation({
    mutationFn: (payload) => stockService.stockIn(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setMessage(response.message || 'Barang masuk berhasil dicatat.')
      setForm(emptyForm)
      setFormErrors({})
    },
    onError: (error) => {
      setMessage('')
      setFormErrors(error.errors || { general: error.message })
    },
  })

  const validate = () => {
    const nextErrors = {}

    if (!form.product_id) nextErrors.product_id = 'Produk wajib dipilih.'
    if (!form.qty || Number(form.qty) <= 0) nextErrors.qty = 'Jumlah harus lebih dari 0.'
    if (!Number.isInteger(Number(form.qty))) nextErrors.qty = 'Jumlah harus berupa angka bulat.'
    if (form.buy_price && Number(form.buy_price) < 0) nextErrors.buy_price = 'Harga beli tidak boleh negatif.'

    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setMessage('')

    if (!validate()) return

    stockInMutation.mutate({
      product_id: Number(form.product_id),
      qty: Number(form.qty),
      supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
      buy_price: form.buy_price ? Number(form.buy_price) : null,
      note: form.note || null,
    })
  }

  const isLoading = productsQuery.isLoading || suppliersQuery.isLoading
  const isError = productsQuery.isError || suppliersQuery.isError

  return <>
    <PageHeader title="Stok" description="Pantau jumlah stok dan catat penerimaan barang dari supplier." />

    {isError && <Card className="p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-red-600">Gagal memuat data stok</p><p className="mt-1 text-xs text-slate-500">{productsQuery.error?.message || suppliersQuery.error?.message}</p></div><Button variant="secondary" onClick={() => { productsQuery.refetch(); suppliersQuery.refetch() }}>Coba Lagi</Button></div></Card>}
    {message && <Card className="border-emerald-200 bg-emerald-50 p-3 text-[13px] font-medium text-emerald-700">{message}</Card>}
    {formErrors.general && <Card className="border-red-200 bg-red-50 p-3 text-[13px] font-medium text-red-700">{formErrors.general}</Card>}

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard icon={Boxes} label="Total Unit Stok" note="Seluruh produk tersimpan" tone="blue" value={formatNumber(summary.totalStock)} />
      <StatCard icon={PackageCheck} label="Produk Tersedia" note="Stok dalam kondisi aman" tone="green" value={formatNumber(summary.available)} />
      <StatCard icon={AlertTriangle} label="Stok Rendah" note="Perlu segera restock" tone="amber" value={formatNumber(summary.lowStock)} />
      <StatCard icon={PackageX} label="Stok Habis" note="Tidak dapat dijual" tone="amber" value={formatNumber(summary.outOfStock)} />
    </section>

    <section className="grid min-w-0 items-start gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
      <Card className="min-w-0">
        <div className="border-b border-slate-200 bg-slate-50/70 p-4"><h2 className="text-sm font-semibold text-slate-950">Input Barang Masuk</h2><p className="mt-1 text-xs text-slate-500">Catat penerimaan stok dari supplier.</p></div>
        <form className="space-y-3 p-4" onSubmit={handleSubmit}>
          <FormSelect label="Produk" value={form.product_id} onChange={(event) => {
            const product = products.find((item) => String(item.id) === event.target.value)
            setForm((current) => ({ ...current, product_id: event.target.value, supplier_id: product?.supplier_id ? String(product.supplier_id) : current.supplier_id, buy_price: product?.buy_price ? String(product.buy_price) : current.buy_price }))
          }} error={fieldError(formErrors, 'product_id')} required><option value="">Pilih produk</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} - {product.sku}</option>)}</FormSelect>
          {selectedProduct && <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">Stok saat ini: <strong>{formatNumber(selectedProduct.stock)}</strong> unit | Harga beli: <strong>{formatRupiah(selectedProduct.buy_price)}</strong></div>}
          <FormInput label="Jumlah" min="1" placeholder="0" required step="1" type="number" value={form.qty} onChange={(event) => setForm((current) => ({ ...current, qty: event.target.value }))} error={fieldError(formErrors, 'qty')} />
          <FormSelect label="Supplier" value={form.supplier_id} onChange={(event) => setForm((current) => ({ ...current, supplier_id: event.target.value }))} error={fieldError(formErrors, 'supplier_id')}><option value="">Pilih supplier</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</FormSelect>
          <FormInput label="Harga Beli" min="0" placeholder="0" step="0.01" type="number" value={form.buy_price} onChange={(event) => setForm((current) => ({ ...current, buy_price: event.target.value }))} error={fieldError(formErrors, 'buy_price')} />
          <label className="block text-xs font-medium text-slate-600">Catatan<textarea className="mt-1.5 min-h-20 w-full rounded-md border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-blue-600" placeholder="Catatan penerimaan barang" value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} /></label>
          <Button className="w-full" disabled={stockInMutation.isPending || isLoading} type="submit">{stockInMutation.isPending ? 'Menyimpan...' : 'Simpan Barang Masuk'}</Button>
        </form>
      </Card>

      <Card className="min-w-0">
        <div className="border-b border-slate-200 bg-slate-50/70 p-4"><h2 className="text-sm font-semibold text-slate-950">Ringkasan Stok Produk</h2><p className="mt-1 text-xs text-slate-500">Status stok terkini berdasarkan database.</p></div>
        {isLoading ? <div className="space-y-2 p-4">{Array.from({ length: 8 }).map((_, index) => <div className="h-10 rounded bg-slate-100" key={index} />)}</div> : products.length ? <div className="max-w-full overflow-x-auto"><table className="w-full table-fixed border-collapse text-center text-[13px]"><thead className="border-b border-slate-200 bg-slate-50/95 text-[10.5px] font-semibold uppercase tracking-[0.11em] text-slate-500"><tr><th className="h-10 w-[34%] px-3 text-center">Produk</th><th className="h-10 w-[24%] px-3">Supplier</th><th className="h-10 w-[12%] px-3">Stok</th><th className="h-10 w-[12%] px-3">Minimum</th><th className="h-10 w-[18%] px-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100 text-slate-700 [&_td]:align-middle [&_tr]:transition [&_tr:hover]:bg-slate-50/80">{products.map((product) => {
          const status = getStockStatus(product)

          return <tr className="h-11" key={product.id}><td className="px-3 text-center"><p className="truncate font-medium text-slate-700">{product.name}</p><p className="truncate text-[11px] text-slate-400">{product.sku}</p></td><td className="truncate px-3 text-slate-500">{product.supplier?.name || '-'}</td><td className="px-3 font-medium text-slate-700">{formatNumber(product.stock)}</td><td className="px-3 text-slate-500">{formatNumber(product.min_stock)}</td><td className="px-3"><Badge tone={status.tone}>{status.label}</Badge></td></tr>
        })}</tbody></table></div> : <EmptyState title="Belum ada produk" description="Produk akan muncul setelah data katalog dibuat." />}
      </Card>
    </section>
  </>
}

