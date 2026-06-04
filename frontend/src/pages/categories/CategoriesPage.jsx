import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button, Card, EmptyState, FilterToolbar, Modal, PageHeader, Table, TextFilter } from '../../components/ui'
import { formatNumber } from '../../lib/formatters'
import categoryService from '../../services/categoryService'

const emptyForm = { name: '', slug: '' }

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function fieldError(errors, field) {
  const error = errors?.[field]
  return Array.isArray(error) ? error[0] : error
}

function FormInput({ error, label, ...props }) {
  return <label className="block text-[13px] font-medium text-slate-700">{label}<input className={`mt-1.5 h-9 w-full rounded-md border px-3 text-[13px] outline-none focus:border-blue-600 ${error ? 'border-red-300' : 'border-slate-200'}`} {...props} />{error && <span className="mt-1 block text-[11px] text-red-600">{error}</span>}</label>
}

export default function CategoriesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [modalMode, setModalMode] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [pageError, setPageError] = useState('')

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  })

  const categories = useMemo(() => categoriesQuery.data?.data || [], [categoriesQuery.data])
  const filteredCategories = useMemo(() => {
    const keyword = search.toLowerCase()
    return categories.filter((category) => category.name.toLowerCase().includes(keyword) || category.slug.toLowerCase().includes(keyword))
  }, [categories, search])

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }) => id ? categoryService.update(id, payload) : categoryService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setModalMode(null)
      setSelectedCategory(null)
      setForm(emptyForm)
      setFormErrors({})
    },
    onError: (error) => setFormErrors(error.errors || {}),
  })

  const deleteMutation = useMutation({
    mutationFn: categoryService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setPageError('')
    },
    onError: (error) => setPageError(error.message),
  })

  const openCreate = () => {
    setSelectedCategory(null)
    setForm(emptyForm)
    setFormErrors({})
    setModalMode('create')
  }

  const openEdit = (category) => {
    setSelectedCategory(category)
    setForm({ name: category.name || '', slug: category.slug || '' })
    setFormErrors({})
    setModalMode('edit')
  }

  const handleNameChange = (value) => {
    setForm((current) => ({
      ...current,
      name: value,
      slug: modalMode === 'create' ? slugify(value) : current.slug,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setFormErrors({})
    saveMutation.mutate({ id: selectedCategory?.id, payload: form })
  }

  const handleDelete = (category) => {
    if (!window.confirm(`Hapus kategori "${category.name}"?`)) return
    deleteMutation.mutate(category.id)
  }

  return <>
    <PageHeader title="Kategori" description="Atur pengelompokan produk untuk memudahkan pencarian." action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Tambah Kategori</Button>} />

    {(categoriesQuery.isError || pageError) && <Card className="p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-red-600">Gagal memuat atau menyimpan kategori</p><p className="mt-1 text-xs text-slate-500">{pageError || categoriesQuery.error.message}</p></div><Button variant="secondary" onClick={() => categoriesQuery.refetch()}>Coba Lagi</Button></div></Card>}

    <Card>
      <div className="border-b border-slate-200 bg-slate-50/70 p-3"><FilterToolbar><TextFilter label="Cari Kategori" placeholder="Cari nama atau slug..." type="search" value={search} onChange={(event) => setSearch(event.target.value)} /></FilterToolbar></div>
      {categoriesQuery.isLoading ? <div className="space-y-2 p-4">{Array.from({ length: 6 }).map((_, index) => <div className="h-10 rounded bg-slate-100" key={index} />)}</div> : filteredCategories.length ? <>
        <Table columns={[{ label: 'Nama Kategori' }, { label: 'Slug' }, { label: 'Jumlah Produk', align: 'center' }, { label: 'Terakhir Diubah' }, { label: 'Aksi', align: 'center' }]} rows={filteredCategories} renderRow={(category) => <tr className="h-11 hover:bg-slate-50" key={category.id}><td className="px-4 font-medium text-slate-700">{category.name}</td><td className="px-4 text-slate-500">{category.slug}</td><td className="px-4 text-center text-slate-700">{formatNumber(category.products_count || 0)}</td><td className="px-4 text-slate-500">{new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(category.updated_at))}</td><td className="px-4"><div className="flex justify-center gap-2"><button aria-label={`Edit ${category.name}`} className="text-blue-600" disabled={saveMutation.isPending || deleteMutation.isPending} onClick={() => openEdit(category)}><Pencil className="h-4 w-4" /></button><button aria-label={`Hapus ${category.name}`} className="text-red-500" disabled={saveMutation.isPending || deleteMutation.isPending} onClick={() => handleDelete(category)}><Trash2 className="h-4 w-4" /></button></div></td></tr>} />
        <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500">Menampilkan {formatNumber(filteredCategories.length)} kategori</div>
      </> : <EmptyState title="Kategori tidak ditemukan" description="Ubah kata kunci atau tambahkan kategori baru." action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Tambah Kategori</Button>} />}
    </Card>

    <Modal open={Boolean(modalMode)} title={modalMode === 'edit' ? 'Edit Kategori' : 'Tambah Kategori'} description="Slug digunakan sebagai identitas URL yang unik." onClose={() => setModalMode(null)}>
      <form className="space-y-4 p-4" onSubmit={handleSubmit}>
        <FormInput label="Nama Kategori" required value={form.name} onChange={(event) => handleNameChange(event.target.value)} error={fieldError(formErrors, 'name')} />
        <FormInput label="Slug" required value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))} error={fieldError(formErrors, 'slug')} />
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4"><Button type="button" variant="secondary" onClick={() => setModalMode(null)}>Batal</Button><Button disabled={saveMutation.isPending} type="submit">{saveMutation.isPending ? 'Menyimpan...' : 'Simpan'}</Button></div>
      </form>
    </Modal>
  </>
}

