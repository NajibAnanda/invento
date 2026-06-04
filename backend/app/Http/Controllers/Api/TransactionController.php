<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\RespondsWithJson;
use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\TransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TransactionController extends Controller
{
    use RespondsWithJson;

    public function __construct(private readonly TransactionService $transactionService)
    {
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'payment_amount' => ['required', 'numeric', 'min:0'],
        ]);

        $transaction = $this->transactionService->create($validated, $request->user());

        return $this->success('Transaksi berhasil dibuat.', $transaction, 201);
    }

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:30'],
            'status' => ['nullable', Rule::in(['completed', 'cancelled'])],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $transactions = Transaction::query()
            ->with('user')
            ->withCount('transactionItems')
            ->when($request->user()->role === 'kasir', fn ($query) => $query->where('user_id', $request->user()->id))
            ->when($validated['search'] ?? null, fn ($query, $search) => $query->where('invoice_no', 'like', "%{$search}%"))
            ->when($validated['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($validated['date_from'] ?? null, fn ($query, $date) => $query->whereDate('created_at', '>=', $date))
            ->when($validated['date_to'] ?? null, fn ($query, $date) => $query->whereDate('created_at', '<=', $date))
            ->latest()
            ->paginate($validated['per_page'] ?? 15)
            ->withQueryString();

        return $this->success('Daftar transaksi berhasil diambil.', $transactions);
    }

    public function show(Request $request, Transaction $transaction): JsonResponse
    {
        if ($request->user()->role === 'kasir' && $transaction->user_id !== $request->user()->id) {
            return $this->success('Anda tidak memiliki akses ke transaksi ini.', null, 403);
        }

        return $this->success('Detail transaksi berhasil diambil.', $transaction->load(['user', 'transactionItems.product']));
    }

    public function cancel(Request $request, Transaction $transaction): JsonResponse
    {
        $transaction = $this->transactionService->cancel($transaction, $request->user());

        return $this->success('Transaksi berhasil dibatalkan.', $transaction);
    }
}
