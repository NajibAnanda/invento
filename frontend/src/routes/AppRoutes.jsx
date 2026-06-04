import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import ProtectedRoute from '../components/routes/ProtectedRoute'
import RoleRoute from '../components/routes/RoleRoute'
import { ADMIN_ROLES, ALL_ROLES, POS_ROLES, ROLES, STOCK_ROLES } from '../lib/roles'
import LoginPage from '../pages/auth/LoginPage'
import CategoriesPage from '../pages/categories/CategoriesPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import POSPage from '../pages/pos/POSPage'
import ProductsPage from '../pages/products/ProductsPage'
import ReportsPage from '../pages/reports/ReportsPage'
import StockMovementsPage from '../pages/stock-movements/StockMovementsPage'
import StockPage from '../pages/stock/StockPage'
import SuppliersPage from '../pages/suppliers/SuppliersPage'
import TransactionsPage from '../pages/transactions/TransactionsPage'
import UsersPage from '../pages/users/UsersPage'

export default function AppRoutes() {
  return <BrowserRouter><Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route element={<RoleRoute allowedRoles={ADMIN_ROLES} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>
        <Route element={<RoleRoute allowedRoles={POS_ROLES} />}>
          <Route path="/pos" element={<POSPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
        </Route>
        <Route element={<RoleRoute allowedRoles={ALL_ROLES} />}>
          <Route path="/products" element={<ProductsPage />} />
        </Route>
        <Route element={<RoleRoute allowedRoles={STOCK_ROLES} />}>
          <Route path="/stock" element={<StockPage />} />
          <Route path="/stock-movements" element={<StockMovementsPage />} />
        </Route>
        <Route element={<RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]} />}>
          <Route path="/users" element={<UsersPage />} />
        </Route>
      </Route>
    </Route>
    <Route path="*" element={<Navigate replace to="/dashboard" />} />
  </Routes></BrowserRouter>
}
