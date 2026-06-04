<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\RespondsWithJson;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    use RespondsWithJson;

    public function index(): JsonResponse
    {
        $today = Carbon::today();
        $chartStartDate = $today->copy()->subDays(6);

        $todayTransactions = Transaction::query()
            ->where('status', 'completed')
            ->whereDate('created_at', $today->toDateString());

        $salesByDate = Transaction::query()
            ->selectRaw('DATE(created_at) as sale_date, SUM(total_amount) as total')
            ->where('status', 'completed')
            ->whereDate('created_at', '>=', $chartStartDate->toDateString())
            ->groupBy('sale_date')
            ->pluck('total', 'sale_date');

        $salesChartData = collect();
        for ($date = $chartStartDate->copy(); $date->lte($today); $date->addDay()) {
            $dateString = $date->format('Y-m-d');

            $salesChartData->push([
                'date' => $dateString,
                'total' => (float) ($salesByDate[$dateString] ?? 0),
            ]);
        }

        $lowStockProducts = Product::query()
            ->with(['category', 'supplier'])
            ->whereColumn('stock', '<=', 'min_stock')
            ->orderBy('stock')
            ->limit(10)
            ->get();

        $topProducts = TransactionItem::query()
            ->select('product_id', 'product_name')
            ->selectRaw('SUM(qty) as total_qty')
            ->selectRaw('SUM(subtotal) as total_revenue')
            ->whereHas('transaction', fn ($query) => $query->where('status', 'completed'))
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get();

        return $this->success('Data dashboard berhasil diambil.', [
            'total_sales_today' => (clone $todayTransactions)->count(),
            'total_revenue_today' => (float) (clone $todayTransactions)->sum('total_amount'),
            'total_products' => Product::count(),
            'low_stock_count' => Product::whereColumn('stock', '<=', 'min_stock')->count(),
            'recent_transactions' => Transaction::with('user')->latest()->limit(5)->get(),
            'low_stock_products' => $lowStockProducts,
            'top_products' => $topProducts,
            'sales_chart_data' => $salesChartData,
        ]);
    }
}
