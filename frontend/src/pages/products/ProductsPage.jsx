import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Power, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge, Button, Card, EmptyState, FilterToolbar, Modal, PageHeader, SelectFilter, Table, TextFilter } from '../../components/ui'
import { ADMIN_ROLES } from '../../lib/roles'
import { formatNumber, formatRupiah } from '../../lib/formatters'
import useAuthStore from '../../store/useAuthStore'
import categoryService from '../../services/categoryService'
import productService from '../../services/productService'
import supplierService from '../../services/supplierService'

const emptyForm = {
  name: '',
  sku: '',
  category_id: '',
  supplier_id: '',
  buy_price: '',
  sell_price: '',
  stock: '0',
  min_stock: '0',
  image: '',
  is_active: true,
}

const stockOptions = [
  { label: 'Semua status stok', value: '' },
  { label: 'In Stock', value: 'in_stock' },
  { label: 'Low Stock', value: 'low_stock' },
  { label: 'Out of Stock', value: 'out_of_stock' },
]

function getStockStatus(product) {
  if (Number(product.stock) <= 0) return { label: 'Out of Stock', tone: 'red' }
  if (Number(product.stock) <= Number(product.min_stock)) return { label: 'Low Stock', tone: 'amber' }
  return { label: 'In Stock', tone: 'green' }
}

function fieldError(errors, field) {
  const error = errors?.[field]
  return Array.isArray(error) ? error[0] : error
}

function productToForm(product) {
  return {
    name: product.name || '',
    sku: product.sku || '',
    category_id: product.category_id ? String(product.category_id) : '',
    supplier_id: product.supplier_id ? String(product.supplier_id) : '',
    buy_price: product.buy_price ? String(product.buy_price) : '',
    sell_price: product.sell_price ? String(product.sell_price) : '',
    stock: product.stock ? String(product.stock) : '0',
    min_stock: product.min_stock ? String(product.min_stock) : '0',
    image: product.image || '',
    is_active: Boolean(product.is_active),
  }
}

function formToPayload(form) {
  return {
    name: form.name,
    sku: form.sku,
    category_id: form.category_id ? Number(form.category_id) : null,
    supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
    buy_price: Number(form.buy_price || 0),
    sell_price: Number(form.sell_price || 0),
    stock: Number(form.stock || 0),
    min_stock: Number(form.min_stock || 0),
    image: form.image || null,
    is_active: form.is_active,
  }
}

function FormInput({ error, label, ...props }) {
  return <label className="block text-[13px] font-medium text-slate-700">{label}<input className={`mt-1.5 h-9 w-full rounded-md border px-3 text-[13px] outline-none focus:border-blue-600 ${error ? 'border-red-300' : 'border-slate-200'}`} {...props} />{error && <span className="mt-1 block text-[11px] text-red-600">{error}</span>}</label>
}

function FormSelect({ children, error, label, ...props }) {
  return <label className="block text-[13px] font-medium text-slate-700">{label}<select className={`mt-1.5 h-9 w-full rounded-md border bg-white px-3 text-[13px] outline-none focus:border-blue-600 ${error ? 'border-red-300' : 'border-slate-200'}`} {...props}>{children}</select>{error && <span className="mt-1 block text-[11px] text-red-600">{error}</span>}</label>
}

export default function ProductsPage() {
  const queryClient = useQueryClient()
  const role = useAuthStore((state) => state.role)
  const canManageProducts = ADMIN_ROLES.includes(role)
  const [filters, setFilters] = useState({ search: '', category_id: '', stock_status: '', page: 1 })
  const [modalMode, setModalMode] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [pageError, setPageError] = useState('')

  const productParams = useMemo(() => ({
    search: filters.search || undefined,
    category_id: filters.category_id || undefined,
    stock_status: filters.stock_status || undefined,
    page: filters.page,
    per_page: 10,
  }), [filters])

  const productsQuery = useQuery({
    queryKey: ['products', productParams],
    queryFn: () => productService.getAll(productParams),
  })
  const categoriesQuery = useQuery({ queryKey: ['categories', 'options'], queryFn: categoryService.getAll })
  const suppliersQuery = useQuery({ queryKey: ['suppliers', 'options'], queryFn: supplierService.getAll, enabled: canManageProducts })

  const productsPage = productsQuery.data?.data
  const products = productsPage?.data || []
  const categories = categoriesQuery.data?.data || []
  const suppliers = suppliersQuery.data?.data || []

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }) => id ? productService.update(id, payload) : productService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setModalMode(null)
      setSelectedProduct(null)
      setForm(emptyForm)
      setFormErrors({})
    },
    onError: (error) => setFormErrors(error.errors || {}),
  })

  const deactivateMutation = useMutation({
    mutationFn: (product) => productService.update(product.id, { ...formToPayload(productToForm(product)), is_active: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setPageError('')
    },
    onError: (error) => setPageError(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: productService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setPageError('')
    },
  })

  const openCreate = () => {
    setSelectedProduct(null)
    setForm(emptyForm)
    setFormErrors({})
    setModalMode('create')
  }

  const openEdit = (product) => {
    setSelectedProduct(product)
    setForm(productToForm(product))
    setFormErrors({})
    setModalMode('edit')
  }

  const handleFilterChange = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value, page: 1 }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setFormErrors({})
    saveMutation.mutate({ id: selectedProduct?.id, payload: formToPayload(form) })
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Hapus atau nonaktifkan produk "${product.name}"?`)) return

    try {
      await deleteMutation.mutateAsync(product.id)
    } catch (error) {
      if (error.status === 422) {
        await deactivateMutation.mutateAsync(product)
        return
      }

      setPageError(error.message)
    }
  }

  const isLoading = productsQuery.isLoading || categoriesQuery.isLoading || (canManageProducts && suppliersQuery.isLoading)
  const isBusy = saveMutation.isPending || deleteMutation.isPending || deactivateMutation.isPending

  return <>
    <PageHeader title="Produk" description="Kelola katalog produk, harga, dan batas minimum stok." action={canManageProducts && <Button onClick={openCreate}><Plus className="h-4 w-4" /> Tambah Produk</Button>} />

    {(productsQuery.isError || pageError) && <Card className="p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-red-600">Gagal memuat atau menyimpan produk</p><p className="mt-1 text-xs text-slate-500">{pageError || productsQuery.error.message}</p></div><Button variant="secondary" onClick={() => productsQuery.refetch()}>Coba Lagi</Button></div></Card>}

    <Card>
      <div className="border-b border-slate-200 bg-slate-50/70 p-3">
        <FilterToolbar>
          <TextFilter label="Cari Produk / SKU" placeholder="Cari nama produk atau SKU..." type="search" value={filters.search} onChange={(event) => handleFilterChange('search', event.target.value)} />
          <SelectFilter label="Kategori" value={filters.category_id} onChange={(event) => handleFilterChange('category_id', event.target.value)}><option value="">Semua kategori</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</SelectFilter>
          <SelectFilter label="Status Stok" value={filters.stock_status} onChange={(event) => handleFilterChange('stock_status', event.target.value)}>{stockOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</SelectFilter>
        </FilterToolbar>
      </div>

      {isLoading ? <div className="space-y-2 p-4">{Array.from({ length: 8 }).map((_, index) => <div className="h-10 rounded bg-slate-100" key={index} />)}</div> : products.length ? <>
        <Table columns={[{ label: 'Produk' }, { label: 'Kategori' }, { label: 'Supplier' }, { label: 'Harga Jual', align: 'center' }, { label: 'Stok', align: 'center' }, { label: 'Status' }, { label: 'Aksi', align: 'center' }]} rows={products} renderRow={(product) => {
          const status = getStockStatus(product)

          return <tr className="h-11 hover:bg-slate-50" key={product.id}><td className="px-4"><p className="font-medium text-slate-700">{product.name}</p><p className="text-[11px] text-slate-400">{product.sku}</p></td><td className="px-4 text-slate-600">{product.category?.name || '-'}</td><td className="px-4 text-slate-500">{product.supplier?.name || '-'}</td><td className="px-4 text-center text-slate-700">{formatRupiah(product.sell_price)}</td><td className="px-4 text-center text-slate-700">{formatNumber(product.stock)}</td><td className="px-4"><div className="flex flex-wrap justify-center gap-1"><Badge tone={status.tone}>{status.label}</Badge>{!product.is_active && <Badge tone="slate">Nonaktif</Badge>}</div></td><td className="px-4"><div className="flex justify-center gap-2">{canManageProducts ? <><button aria-label={`Edit ${product.name}`} className="text-blue-600 disabled:opacity-50" disabled={isBusy} onClick={() => openEdit(product)}><Pencil className="h-4 w-4" /></button><button aria-label={`Nonaktifkan ${product.name}`} className="text-amber-600 disabled:opacity-50" disabled={isBusy || !product.is_active} onClick={() => deactivateMutation.mutate(product)}><Power className="h-4 w-4" /></button><button aria-label={`Hapus ${product.name}`} className="text-red-500 disabled:opacity-50" disabled={isBusy} onClick={() => handleDelete(product)}><Trash2 className="h-4 w-4" /></button></> : <span className="text-xs text-slate-400">Lihat stok</span>}</div></td></tr>
        }} />
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-3 text-xs text-slate-500"><span>Menampilkan {formatNumber(productsPage.from || 0)}-{formatNumber(productsPage.to || 0)} dari {formatNumber(productsPage.total || 0)} data</span><div className="flex gap-1"><Button variant="secondary" className="h-8 px-2" disabled={productsPage.current_page <= 1} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}>Sebelumnya</Button><span className="grid h-8 place-items-center rounded border border-blue-600 bg-blue-50 px-3 text-blue-600">{productsPage.current_page}</span><Button variant="secondary" className="h-8 px-2" disabled={productsPage.current_page >= productsPage.last_page} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}>Berikutnya</Button></div></div>
      </> : <EmptyState title="Produk tidak ditemukan" description="Ubah filter atau tambahkan produk baru." action={canManageProducts && <Button onClick={openCreate}><Plus className="h-4 w-4" /> Tambah Produk</Button>} />}
    </Card>

    <Modal open={Boolean(modalMode)} title={modalMode === 'edit' ? 'Edit Produk' : 'Tambah Produk'} description="Isi data produk sesuai katalog toko." onClose={() => setModalMode(null)}>
      <form className="space-y-4 p-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormInput label="Nama Produk" required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} error={fieldError(formErrors, 'name')} />
          <FormInput label="SKU" required value={form.sku} onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))} error={fieldError(formErrors, 'sku')} />
          <FormSelect label="Kategori" value={form.category_id} onChange={(event) => setForm((current) => ({ ...current, category_id: event.target.value }))} error={fieldError(formErrors, 'category_id')}><option value="">Tanpa kategori</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</FormSelect>
          <FormSelect label="Supplier" value={form.supplier_id} onChange={(event) => setForm((current) => ({ ...current, supplier_id: event.target.value }))} error={fieldError(formErrors, 'supplier_id')}><option value="">Tanpa supplier</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</FormSelect>
          <FormInput label="Harga Beli" min="0" required step="0.01" type="number" value={form.buy_price} onChange={(event) => setForm((current) => ({ ...current, buy_price: event.target.value }))} error={fieldError(formErrors, 'buy_price')} />
          <FormInput label="Harga Jual" min="0" required step="0.01" type="number" value={form.sell_price} onChange={(event) => setForm((current) => ({ ...current, sell_price: event.target.value }))} error={fieldError(formErrors, 'sell_price')} />
          <FormInput label="Stok" min="0" required step="1" type="number" value={form.stock} onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))} error={fieldError(formErrors, 'stock')} />
          <FormInput label="Minimum Stok" min="0" required step="1" type="number" value={form.min_stock} onChange={(event) => setForm((current) => ({ ...current, min_stock: event.target.value }))} error={fieldError(formErrors, 'min_stock')} />
        </div>
        <FormInput label="URL Gambar (opsional)" value={form.image} onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))} error={fieldError(formErrors, 'image')} />
        <label className="flex items-center gap-2 text-[13px] text-slate-700"><input checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} type="checkbox" /> Produk aktif</label>
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4"><Button type="button" variant="secondary" onClick={() => setModalMode(null)}>Batal</Button><Button disabled={saveMutation.isPending} type="submit">{saveMutation.isPending ? 'Menyimpan...' : 'Simpan'}</Button></div>
      </form>
    </Modal>
  </>
}

