import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function DashboardLayout() {
  return <div className="min-h-screen"><Sidebar /><div className="lg:pl-64"><Navbar /><main className="space-y-5 p-4 sm:p-6"><div className="mx-auto w-full max-w-[1440px] space-y-5"><Outlet /></div></main></div></div>
}
