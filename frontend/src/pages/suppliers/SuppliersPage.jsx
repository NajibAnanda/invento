import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button, Card, EmptyState, FilterToolbar, Modal, PageHeader, Table, TextFilter } from '../../components/ui'
import { formatNumber } from '../../lib/formatters'
import supplierService from '../../services/supplierService'

const emptyForm = { name: '', phone: '', address: '' }

function fieldError(errors, field) {
  const error = errors?.[field]
  return Array.isArray(error) ? error[0] : error
}

function FormInput({ error, label, ...props }) {
  return <label className="block text-[13px] font-medium text-slate-700">{label}<input className={`mt-1.5 h-9 w-full rounded-md border px-3 text-[13px] outline-none focus:border-blue-600 ${error ? 'border-red-300' : 'border-slate-200'}`} {...props} />{error && <span className="mt-1 block text-[11px] text-red-600">{error}</span>}</label>
}

function FormTextarea({ error, label, ...props }) {
  return <label className="block text-[13px] font-medium text-slate-700">{label}<textarea className={`mt-1.5 min-h-20 w-full rounded-md border px-3 py-2 text-[13px] outline-none focus:border-blue-600 ${error ? 'border-red-300' : 'border-slate-200'}`} {...props} />{error && <span className="mt-1 block text-[11px] text-red-600">{error}</span>}</label>
}

export default function SuppliersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [modalMode, setModalMode] = useState(null)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [pageError, setPageError] = useState('')

  const suppliersQuery = useQuery({
    queryKey: ['suppliers'],
    queryFn: supplierService.getAll,
  })

  const suppliers = useMemo(() => suppliersQuery.data?.data || [], [suppliersQuery.data])
  const filteredSuppliers = useMemo(() => {
    const keyword = search.toLowerCase()
    return suppliers.filter((supplier) =>
      supplier.name.toLowerCase().includes(keyword) ||
      (supplier.phone || '').toLowerCase().includes(keyword) ||
      (supplier.address || '').toLowerCase().includes(keyword),
    )
  }, [search, suppliers])

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }) => id ? supplierService.update(id, payload) : supplierService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setModalMode(null)
      setSelectedSupplier(null)
      setForm(emptyForm)
      setFormErrors({})
    },
    onError: (error) => setFormErrors(error.errors || {}),
  })

  const deleteMutation = useMutation({
    mutationFn: supplierService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setPageError('')
    },
    onError: (error) => setPageError(error.message),
  })

  const openCreate = () => {
    setSelectedSupplier(null)
    setForm(emptyForm)
    setFormErrors({})
    setModalMode('create')
  }

  const openEdit = (supplier) => {
    setSelectedSupplier(supplier)
    setForm({
      name: supplier.name || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
    })
    setFormErrors({})
    setModalMode('edit')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setFormErrors({})
    saveMutation.mutate({
      id: selectedSupplier?.id,
      payload: {
        name: form.name,
        phone: form.phone || null,
        address: form.address || null,
      },
    })
  }

  const handleDelete = (supplier) => {
    if (!window.confirm(`Hapus supplier "${supplier.name}"?`)) return
    deleteMutation.mutate(supplier.id)
  }

  return <>
    <PageHeader title="Supplier" description="Kelola data pemasok dan produk yang terkait." action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Tambah Supplier</Button>} />

    {(suppliersQuery.isError || pageError) && <Card className="p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-red-600">Gagal memuat atau menyimpan supplier</p><p className="mt-1 text-xs text-slate-500">{pageError || suppliersQuery.error.message}</p></div><Button variant="secondary" onClick={() => suppliersQuery.refetch()}>Coba Lagi</Button></div></Card>}

    <Card>
      <div className="border-b border-slate-200 bg-slate-50/70 p-3"><FilterToolbar><TextFilter label="Cari Supplier" placeholder="Cari nama, kontak, atau alamat..." type="search" value={search} onChange={(event) => setSearch(event.target.value)} /></FilterToolbar></div>
      {suppliersQuery.isLoading ? <div className="space-y-2 p-4">{Array.from({ length: 6 }).map((_, index) => <div className="h-10 rounded bg-slate-100" key={index} />)}</div> : filteredSuppliers.length ? <>
        <Table columns={[{ label: 'Nama Supplier' }, { label: 'Kontak' }, { label: 'Alamat' }, { label: 'Produk', align: 'center' }, { label: 'Aksi', align: 'center' }]} rows={filteredSuppliers} renderRow={(supplier) => <tr className="h-11 hover:bg-slate-50" key={supplier.id}><td className="px-4 font-medium text-slate-700">{supplier.name}</td><td className="px-4 text-slate-500">{supplier.phone || '-'}</td><td className="max-w-sm truncate px-4 text-slate-500">{supplier.address || '-'}</td><td className="px-4 text-center text-slate-700">{formatNumber(supplier.products_count || 0)}</td><td className="px-4"><div className="flex justify-center gap-2"><button aria-label={`Edit ${supplier.name}`} className="text-blue-600" disabled={saveMutation.isPending || deleteMutation.isPending} onClick={() => openEdit(supplier)}><Pencil className="h-4 w-4" /></button><button aria-label={`Hapus ${supplier.name}`} className="text-red-500" disabled={saveMutation.isPending || deleteMutation.isPending} onClick={() => handleDelete(supplier)}><Trash2 className="h-4 w-4" /></button></div></td></tr>} />
        <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500">Menampilkan {formatNumber(filteredSuppliers.length)} supplier</div>
      </> : <EmptyState title="Supplier tidak ditemukan" description="Ubah kata kunci atau tambahkan supplier baru." action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Tambah Supplier</Button>} />}
    </Card>

    <Modal open={Boolean(modalMode)} title={modalMode === 'edit' ? 'Edit Supplier' : 'Tambah Supplier'} description="Data kontak membantu proses restock dan pembelian." onClose={() => setModalMode(null)}>
      <form className="space-y-4 p-4" onSubmit={handleSubmit}>
        <FormInput label="Nama Supplier" required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} error={fieldError(formErrors, 'name')} />
        <FormInput label="Nomor Telepon" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} error={fieldError(formErrors, 'phone')} />
        <FormTextarea label="Alamat" value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} error={fieldError(formErrors, 'address')} />
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4"><Button type="button" variant="secondary" onClick={() => setModalMode(null)}>Batal</Button><Button disabled={saveMutation.isPending} type="submit">{saveMutation.isPending ? 'Menyimpan...' : 'Simpan'}</Button></div>
      </form>
    </Modal>
  </>
}

