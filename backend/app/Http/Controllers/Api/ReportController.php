<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\RespondsWithJson;
use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    use RespondsWithJson;

    public function sales(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);

        $dateFrom = Carbon::parse($validated['date_from'] ?? today()->subDays(29))->startOfDay();
        $dateTo = Carbon::parse($validated['date_to'] ?? today())->endOfDay();

        $transactions = Transaction::query()
            ->where('status', 'completed')
            ->whereBetween('created_at', [$dateFrom, $dateTo]);

        $salesByDate = (clone $transactions)
            ->selectRaw('DATE(created_at) as sale_date, COUNT(*) as transaction_count, SUM(total_amount) as total_revenue')
            ->groupBy('sale_date')
            ->pluck('total_revenue', 'sale_date');

        $chartData = collect(CarbonPeriod::create($dateFrom->copy()->startOfDay(), $dateTo->copy()->startOfDay()))
            ->map(fn ($date) => [
                'date' => $date->format('Y-m-d'),
                'total_revenue' => (float) ($salesByDate[$date->format('Y-m-d')] ?? 0),
            ]);

        $topProducts = TransactionItem::query()
            ->select('product_id', 'product_name')
            ->selectRaw('SUM(qty) as total_qty')
            ->selectRaw('SUM(subtotal) as total_revenue')
            ->whereHas('transaction', function ($query) use ($dateFrom, $dateTo) {
                $query->where('status', 'completed')
                    ->whereBetween('created_at', [$dateFrom, $dateTo]);
            })
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('total_qty')
            ->limit(10)
            ->get();

        $totalTransactions = (clone $transactions)->count();
        $totalRevenue = (float) (clone $transactions)->sum('total_amount');

        return $this->success('Laporan penjualan berhasil diambil.', [
            'period' => [
                'date_from' => $dateFrom->toDateString(),
                'date_to' => $dateTo->toDateString(),
            ],
            'summary' => [
                'total_transactions' => $totalTransactions,
                'total_revenue' => $totalRevenue,
                'average_transaction' => $totalTransactions > 0 ? $totalRevenue / $totalTransactions : 0,
            ],
            'chart_data' => $chartData,
            'top_products' => $topProducts,
        ]);
    }
}
