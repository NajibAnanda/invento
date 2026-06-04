import { Boxes } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui'
import { getDefaultPathForRole } from '../../lib/roles'
import useAuthStore from '../../store/useAuthStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const role = useAuthStore((state) => state.role)
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate replace to={getDefaultPathForRole(role)} />
  }

  const handleChange = (event) => {
    setCredentials((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await login(credentials)
      navigate(
        location.state?.from?.pathname || getDefaultPathForRole(response.role),
        { replace: true },
      )
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-8">
    <section className="w-full max-w-[360px] rounded-xl border border-slate-200 bg-white p-6 shadow-[0_6px_20px_rgba(15,23,42,.05)]">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600 text-white"><Boxes className="h-4 w-4" /></span>
        <div>
          <h1 className="text-lg font-semibold tracking-[-0.2px] text-slate-950">Invento</h1>
          <p className="text-xs text-slate-500">Inventory & POS</p>
        </div>
      </div>
      <h2 className="text-lg font-semibold tracking-[-0.2px] text-slate-950">Masuk ke dashboard</h2>
      <p className="mt-1 text-[13px] leading-5 text-slate-500">Gunakan email dan password akun Invento.</p>
      {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>}
      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-[13px] font-medium text-slate-700">Email<input className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10" name="email" onChange={handleChange} placeholder="nama@email.com" required type="email" value={credentials.email} /></label>
        <label className="block text-[13px] font-medium text-slate-700">Password<input className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10" name="password" onChange={handleChange} placeholder="Masukkan password" required type="password" value={credentials.password} /></label>
        <Button className="h-10 w-full" disabled={isSubmitting} type="submit">{isSubmitting ? 'Memproses...' : 'Masuk'}</Button>
      </form>
    </section>
  </main>
}
