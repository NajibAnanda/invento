import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2, UserCheck, UserX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge, Button, Card, EmptyState, FilterToolbar, Modal, PageHeader, SelectFilter, Table, TextFilter } from '../../components/ui'
import { ROLE_LABELS, ROLES } from '../../lib/roles'
import useAuthStore from '../../store/useAuthStore'
import userService from '../../services/userService'

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: ROLES.KASIR,
  is_active: true,
}

const roleOptions = [
  { label: 'Super Admin', value: ROLES.SUPER_ADMIN },
  { label: 'Admin', value: ROLES.ADMIN },
  { label: 'Kasir', value: ROLES.KASIR },
  { label: 'Gudang', value: ROLES.GUDANG },
]

const roleTones = {
  [ROLES.SUPER_ADMIN]: 'blue',
  [ROLES.ADMIN]: 'slate',
  [ROLES.KASIR]: 'green',
  [ROLES.GUDANG]: 'amber',
}

function fieldError(errors, field) {
  const error = errors?.[field]
  return Array.isArray(error) ? error[0] : error
}

function FormInput({ error, label, ...props }) {
  return <label className="block text-[13px] font-medium text-slate-700">{label}<input className={`mt-1.5 h-9 w-full rounded-md border px-3 text-[13px] outline-none focus:border-blue-600 ${error ? 'border-red-300' : 'border-slate-200'}`} {...props} />{error && <span className="mt-1 block text-[11px] text-red-600">{error}</span>}</label>
}

function FormSelect({ children, error, label, ...props }) {
  return <label className="block text-[13px] font-medium text-slate-700">{label}<select className={`mt-1.5 h-9 w-full rounded-md border bg-white px-3 text-[13px] outline-none focus:border-blue-600 ${error ? 'border-red-300' : 'border-slate-200'}`} {...props}>{children}</select>{error && <span className="mt-1 block text-[11px] text-red-600">{error}</span>}</label>
}

export default function UsersPage() {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((state) => state.user)
  const [filters, setFilters] = useState({ search: '', role: '', status: '' })
  const [modalMode, setModalMode] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState('green')

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  })

  const users = useMemo(() => usersQuery.data?.data || [], [usersQuery.data])
  const filteredUsers = useMemo(() => {
    const keyword = filters.search.toLowerCase()
    return users.filter((user) => {
      const matchesSearch = `${user.name} ${user.email}`.toLowerCase().includes(keyword)
      const matchesRole = !filters.role || user.role === filters.role
      const matchesStatus = !filters.status || String(user.is_active) === filters.status
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [filters, users])

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }) => id ? userService.update(id, payload) : userService.create(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setModalMode(null)
      setSelectedUser(null)
      setForm(emptyForm)
      setFormErrors({})
      setMessage(response.message)
      setMessageTone('green')
    },
    onError: (error) => {
      setFormErrors(error.errors || {})
      if (!Object.keys(error.errors || {}).length) {
        setMessage(error.message)
        setMessageTone('red')
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: userService.remove,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setMessage(response.message)
      setMessageTone('green')
    },
    onError: (error) => {
      setMessage(error.message)
      setMessageTone('red')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (user) => userService.update(user.id, {
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: !user.is_active,
    }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setMessage(response.message)
      setMessageTone('green')
    },
    onError: (error) => {
      setMessage(error.message)
      setMessageTone('red')
    },
  })

  const openCreate = () => {
    setSelectedUser(null)
    setForm(emptyForm)
    setFormErrors({})
    setModalMode('create')
  }

  const openEdit = (user) => {
    setSelectedUser(user)
    setForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || ROLES.KASIR,
      is_active: Boolean(user.is_active),
    })
    setFormErrors({})
    setModalMode('edit')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setFormErrors({})
    setMessage('')

    const payload = {
      name: form.name,
      email: form.email,
      role: form.role,
      is_active: form.is_active,
    }

    if (form.password) payload.password = form.password

    saveMutation.mutate({ id: selectedUser?.id, payload })
  }

  const handleDelete = (user) => {
    if (!window.confirm(`Hapus pengguna "${user.name}"? Pengguna dengan riwayat transaksi akan dinonaktifkan.`)) return
    deleteMutation.mutate(user.id)
  }

  const isBusy = saveMutation.isPending || deleteMutation.isPending || toggleMutation.isPending

  return <>
    <PageHeader title="Pengguna" description="Kelola akun karyawan dan hak akses sistem." action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Tambah Pengguna</Button>} />

    {message && <Card className={`p-3 text-[13px] font-medium ${messageTone === 'red' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{message}</Card>}
    {usersQuery.isError && <Card className="p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-red-600">Gagal memuat pengguna</p><p className="mt-1 text-xs text-slate-500">{usersQuery.error.message}</p></div><Button variant="secondary" onClick={() => usersQuery.refetch()}>Coba Lagi</Button></div></Card>}

    <Card>
      <div className="border-b border-slate-200 bg-slate-50/70 p-3">
        <FilterToolbar>
          <TextFilter label="Cari Pengguna" placeholder="Cari nama atau email..." type="search" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} />
          <SelectFilter label="Role" value={filters.role} onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value }))}><option value="">Semua role</option>{roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</SelectFilter>
          <SelectFilter label="Status" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}><option value="">Semua status</option><option value="true">Aktif</option><option value="false">Nonaktif</option></SelectFilter>
        </FilterToolbar>
      </div>

      {usersQuery.isLoading ? <div className="space-y-2 p-4">{Array.from({ length: 6 }).map((_, index) => <div className="h-10 rounded bg-slate-100" key={index} />)}</div> : filteredUsers.length ? <>
        <Table columns={[{ label: 'Pengguna' }, { label: 'Role' }, { label: 'Status' }, { label: 'Terdaftar' }, { label: 'Aksi', align: 'center' }]} rows={filteredUsers} renderRow={(user) => <tr className="h-11 hover:bg-slate-50" key={user.id}><td className="px-4"><p className="font-medium text-slate-700">{user.name}{currentUser?.id === user.id && <span className="ml-1 text-[11px] text-slate-400">(Anda)</span>}</p><p className="text-[11px] text-slate-400">{user.email}</p></td><td className="px-4"><Badge tone={roleTones[user.role] || 'slate'}>{ROLE_LABELS[user.role] || user.role}</Badge></td><td className="px-4"><Badge tone={user.is_active ? 'green' : 'slate'}>{user.is_active ? 'Aktif' : 'Nonaktif'}</Badge></td><td className="px-4 text-slate-500">{new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(user.created_at))}</td><td className="px-4"><div className="flex justify-center gap-2"><button aria-label={`Edit ${user.name}`} className="text-blue-600 disabled:opacity-50" disabled={isBusy} onClick={() => openEdit(user)}><Pencil className="h-4 w-4" /></button><button aria-label={`${user.is_active ? 'Nonaktifkan' : 'Aktifkan'} ${user.name}`} className={`${user.is_active ? 'text-amber-600' : 'text-emerald-600'} disabled:opacity-50`} disabled={isBusy || currentUser?.id === user.id} onClick={() => toggleMutation.mutate(user)}>{user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}</button><button aria-label={`Hapus ${user.name}`} className="text-red-500 disabled:opacity-50" disabled={isBusy || currentUser?.id === user.id} onClick={() => handleDelete(user)}><Trash2 className="h-4 w-4" /></button></div></td></tr>} />
        <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500">Menampilkan {filteredUsers.length} pengguna</div>
      </> : <EmptyState title="Pengguna tidak ditemukan" description="Ubah filter atau tambahkan pengguna baru." action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Tambah Pengguna</Button>} />}
    </Card>

    <Modal open={Boolean(modalMode)} title={modalMode === 'edit' ? 'Edit Pengguna' : 'Tambah Pengguna'} description="Atur akun, role, dan status akses pengguna." onClose={() => setModalMode(null)}>
      <form className="space-y-4 p-4" onSubmit={handleSubmit}>
        <FormInput label="Nama" required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} error={fieldError(formErrors, 'name')} />
        <FormInput label="Email" required type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} error={fieldError(formErrors, 'email')} />
        <FormInput label={modalMode === 'edit' ? 'Password Baru (opsional)' : 'Password'} minLength="3" required={modalMode === 'create'} type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} error={fieldError(formErrors, 'password')} />
        <FormSelect label="Role" required value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} error={fieldError(formErrors, 'role')}>{roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</FormSelect>
        <label className="flex items-center gap-2 text-[13px] text-slate-700"><input checked={form.is_active} disabled={selectedUser?.id === currentUser?.id} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} type="checkbox" /> Pengguna aktif</label>
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4"><Button type="button" variant="secondary" onClick={() => setModalMode(null)}>Batal</Button><Button disabled={saveMutation.isPending} type="submit">{saveMutation.isPending ? 'Menyimpan...' : 'Simpan'}</Button></div>
      </form>
    </Modal>
  </>
}

