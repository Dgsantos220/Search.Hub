<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ApiKey;
use Inertia\Inertia;

class ApiKeyController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/ApiKeys', [
            'apiKeys' => ApiKey::with('user:id,name,email')->latest()->get(),
            'newKey' => session('newKey')
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $result = ApiKey::generate(auth()->id(), $validated['name']);

        return back()->with([
            'success' => 'Chave API gerada com sucesso!',
            'newKey' => $result['plainTextKey']
        ]);
    }

    public function toggle($id)
    {
        $apiKey = ApiKey::findOrFail($id);
        $apiKey->update(['active' => !$apiKey->active]);

        return back()->with('success', 'Status da chave API atualizado!');
    }

    public function destroy($id)
    {
        ApiKey::findOrFail($id)->delete();
        return back()->with('success', 'Chave API excluída!');
    }
}
