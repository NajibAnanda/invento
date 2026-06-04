# Invento

Invento is a web-based Inventory and Point of Sale (POS) application for small-medium stores.

This application helps stores manage products, categories, suppliers, stock items, sales transactions, business reports and users based on internal roles.

## Tech Stack

Backend:
- Laravel 13
- Laravel Sanctum
- MySQL
- REST API

Frontend:
- React + Vite
- JavaScript
- Tailwind CSS
- React Router
- Axios
- React Query
- Zustand
- Recharts
- Lucide React

## Project Structure

```txt
invento/
|-- backend/
|-- frontend/
|-- .gitignore
`-- README.md
```

## Requirements

- PHP 8.3+
- Composer
- Node.js and npm
- MySQL
- Laragon is recommended for local development on Windows

## Database Setup

Create a MySQL database:

```sql
CREATE DATABASE invento;
```

Backend `.env` database config:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=invento
DB_USERNAME=root
DB_PASSWORD=
```

## Backend Setup

From the backend folder:

```bash
cd backend
composer install
# Git Bash: cp .env.example .env
# PowerShell: Copy-Item .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve --host=127.0.0.1 --port=8000
```

If PHP is not available in PATH when using Laragon, run Artisan with the Laragon PHP binary, for example:

```powershell
C:\laragon\bin\php\php-8.3.30-nts-Win32-vs16-x64\php.exe artisan serve --host=127.0.0.1 --port=8000
```

Useful backend checks:

```bash
php artisan route:list --path=api
php artisan migrate:fresh --seed
```

## Frontend Setup

From the frontend folder:

```bash
cd frontend
npm install
# Git Bash: cp .env.example .env
# PowerShell: Copy-Item .env.example .env
npm run dev
```

Frontend API env:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Open:

```txt
http://127.0.0.1:5173/login
```

Useful frontend checks:

```bash
npm run lint
npm run build
```

## Test Accounts

All seeded accounts use this password:

```txt
123
```

| Role | Email |
| ---- | ----- |
| Super Admin | superadmin@gmail.com |
| Admin | admin@gmail.com |
| Kasir | kasir@gmail.com |
| Gudang | gudang@gmail.com |

## Role Access Summary

Super Admin:
- Full access
- User management

Admin:
- Dashboard
- POS
- Products, categories, suppliers
- Stock and stock movements
- Transactions and reports

Kasir:
- POS
- Product stock view
- Own transactions

Gudang:
- Stock in
- Stock movements
- Product stock view

## Main Local Test Flow

1. Start MySQL in Laragon.
2. Start backend:

```bash
cd backend
php artisan serve --host=127.0.0.1 --port=8000
```

3. Start frontend:

```bash
cd frontend
npm run dev
```

4. Login with each seeded account.
5. Test these modules:
   - Dashboard
   - Products CRUD
   - Categories CRUD
   - Suppliers CRUD
   - Stock-in
   - POS transaction
   - Transaction history
   - Reports
   - User management as Super Admin

## Important Notes

- Do not deploy from this local setup.
- `prd.md` and `design.md` are local planning/design references and are intentionally ignored from Git.
- Run `php artisan migrate:fresh --seed` to reset local data back to seed state.
- The frontend expects the backend API at `http://127.0.0.1:8000/api`.
- Export PDF and Excel buttons are placeholders until export endpoints are implemented.
- Laravel Sanctum token auth is used for API authentication.
- API errors are returned as JSON for `/api/*` routes.


