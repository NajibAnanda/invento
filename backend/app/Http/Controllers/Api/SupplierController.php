<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\RespondsWithJson;
use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    use RespondsWithJson;

    public function index(): JsonResponse
    {
        return $this->success('Daftar supplier berhasil diambil.', Supplier::withCount('products')->orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $supplier = Supplier::create($this->validatedData($request));

        return $this->success('Supplier berhasil ditambahkan.', $supplier, 201);
    }

    public function update(Request $request, Supplier $supplier): JsonResponse
    {
        $supplier->update($this->validatedData($request));

        return $this->success('Supplier berhasil diperbarui.', $supplier);
    }

    public function destroy(Supplier $supplier): JsonResponse
    {
        $supplier->delete();

        return $this->success('Supplier berhasil dihapus.');
    }

    private function validatedData(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
        ]);
    }
}
