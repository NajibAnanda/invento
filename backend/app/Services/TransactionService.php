<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class TransactionService
{
    public function create(array $data, User $user): Transaction
    {
        return DB::transaction(function () use ($data, $user) {
            $requestedItems = collect($data['items'])
                ->groupBy('product_id')
                ->map(fn ($items, $productId) => [
                    'product_id' => (int) $productId,
                    'qty' => $items->sum('qty'),
                ])
                ->values();

            $products = Product::query()
                ->whereIn('id', $requestedItems->pluck('product_id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            if ($products->count() !== $requestedItems->count()) {
                throw ValidationException::withMessages([
                    'items' => ['Salah satu produk tidak ditemukan.'],
                ]);
            }

            $total = 0;

            foreach ($requestedItems as $item) {
                $product = $products[$item['product_id']];

                if (! $product->is_active) {
                    throw ValidationException::withMessages([
                        'items' => ["Produk {$product->name} sedang tidak aktif."],
                    ]);
                }

                if ($product->stock < $item['qty']) {
                    throw ValidationException::withMessages([
                        'items' => ["Stok {$product->name} tidak mencukupi."],
                    ]);
                }

                $total += (float) $product->sell_price * $item['qty'];
            }

            if ($data['payment_amount'] < $total) {
                throw ValidationException::withMessages([
                    'payment_amount' => ['Jumlah pembayaran kurang dari total transaksi.'],
                ]);
            }

            $transaction = Transaction::create([
                'user_id' => $user->id,
                'invoice_no' => $this->generateInvoiceNumber(),
                'total_amount' => $total,
                'payment_amount' => $data['payment_amount'],
                'change_amount' => $data['payment_amount'] - $total,
                'status' => 'completed',
            ]);

            foreach ($requestedItems as $item) {
                $product = $products[$item['product_id']];
                $stockBefore = $product->stock;
                $subtotal = (float) $product->sell_price * $item['qty'];

                $transaction->transactionItems()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'qty' => $item['qty'],
                    'sell_price' => $product->sell_price,
                    'subtotal' => $subtotal,
                ]);

                $product->decrement('stock', $item['qty']);

                StockMovement::create([
                    'product_id' => $product->id,
                    'user_id' => $user->id,
                    'type' => 'out',
                    'qty' => -$item['qty'],
                    'stock_before' => $stockBefore,
                    'stock_after' => $stockBefore - $item['qty'],
                    'note' => 'Penjualan POS',
                    'reference_id' => $transaction->id,
                ]);
            }

            return $transaction->load(['user', 'transactionItems.product']);
        });
    }

    public function cancel(Transaction $transaction, User $user): Transaction
    {
        return DB::transaction(function () use ($transaction, $user) {
            $transaction = Transaction::query()
                ->with('transactionItems')
                ->lockForUpdate()
                ->findOrFail($transaction->id);

            if ($transaction->status === 'cancelled') {
                throw ValidationException::withMessages([
                    'transaction' => ['Transaksi sudah dibatalkan.'],
                ]);
            }

            foreach ($transaction->transactionItems as $item) {
                $product = Product::query()->lockForUpdate()->findOrFail($item->product_id);
                $stockBefore = $product->stock;

                $product->increment('stock', $item->qty);

                StockMovement::create([
                    'product_id' => $product->id,
                    'user_id' => $user->id,
                    'type' => 'adjustment',
                    'qty' => $item->qty,
                    'stock_before' => $stockBefore,
                    'stock_after' => $stockBefore + $item->qty,
                    'note' => 'Pengembalian stok dari pembatalan transaksi',
                    'reference_id' => $transaction->id,
                ]);
            }

            $transaction->update(['status' => 'cancelled']);

            return $transaction->load(['user', 'transactionItems.product']);
        });
    }

    private function generateInvoiceNumber(): string
    {
        do {
            $invoice = 'INV-'.now()->format('Ymd-His').'-'.Str::upper(Str::random(4));
        } while (Transaction::where('invoice_no', $invoice)->exists());

        return $invoice;
    }
}
