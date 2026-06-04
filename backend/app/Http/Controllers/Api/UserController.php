<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\RespondsWithJson;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    use RespondsWithJson;

    public function index(): JsonResponse
    {
        return $this->success('Daftar pengguna berhasil diambil.', User::orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validatedData($request);
        $validated['password'] = Hash::make($validated['password']);
        $user = User::create($validated);

        return $this->success('Pengguna berhasil ditambahkan.', $user, 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $this->validatedData($request, $user);

        if ($request->user()->is($user) && array_key_exists('is_active', $validated) && ! $validated['is_active']) {
            return $this->success('Anda tidak dapat menonaktifkan akun sendiri.', null, 422);
        }

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return $this->success('Pengguna berhasil diperbarui.', $user);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($request->user()->is($user)) {
            return $this->success('Anda tidak dapat menghapus akun sendiri.', null, 422);
        }

        if ($user->transactions()->exists()) {
            $user->update(['is_active' => false]);

            return $this->success('Pengguna memiliki riwayat transaksi dan telah dinonaktifkan.', $user);
        }

        $user->delete();

        return $this->success('Pengguna berhasil dihapus.');
    }

    private function validatedData(Request $request, ?User $user = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150', Rule::unique('users')->ignore($user)],
            'password' => [$user ? 'nullable' : 'required', 'string', 'min:3'],
            'role' => ['required', Rule::in(['super_admin', 'admin', 'kasir', 'gudang'])],
            'is_active' => ['nullable', 'boolean'],
        ]);
    }
}
