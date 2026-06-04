<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\RespondsWithJson;
use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    use RespondsWithJson;

    public function index(): JsonResponse
    {
        return $this->success('Daftar kategori berhasil diambil.', Category::withCount('products')->orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $category = Category::create($this->validatedData($request));

        return $this->success('Kategori berhasil ditambahkan.', $category, 201);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $category->update($this->validatedData($request, $category));

        return $this->success('Kategori berhasil diperbarui.', $category);
    }

    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        return $this->success('Kategori berhasil dihapus.');
    }

    private function validatedData(Request $request, ?Category $category = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['required', 'string', 'max:120', Rule::unique('categories')->ignore($category)],
        ]);
    }
}
