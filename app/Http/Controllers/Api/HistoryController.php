<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConsultaHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HistoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 20);
        $cursor = $request->input('cursor');
        
        $query = ConsultaHistory::byUser($request->user()->id)
            ->recent();

        if ($cursor) {
            $query->withCursor($cursor);
        }

        $history = $query->limit($perPage + 1)->get();
        
        $hasMore = $history->count() > $perPage;
        if ($hasMore) {
            $history = $history->take($perPage);
        }

        $nextCursor = $hasMore && $history->isNotEmpty() 
            ? ConsultaHistory::encodeCursor($history->last()->created_at->format('Y-m-d H:i:s'), $history->last()->id)
            : null;

        return response()->json([
            'success' => true,
            'data' => $history->map(fn($item) => [
                'id' => $item->id,
                'tipo' => $item->tipo,
                'query' => $item->query,
                'success' => $item->success,
                'resultado_resumo' => $item->resultado_resumo,
                'created_at' => $item->created_at->format('d/m/Y H:i'),
                'created_at_relative' => $item->created_at->diffForHumans(),
            ]),
            'next_cursor' => $nextCursor,
            'has_more' => $hasMore,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            \Log::info('📝 [History Store] Recebido POST', [
                'user' => auth()->id(),
                'body' => $request->all(),
            ]);

            if (!$request->user()) {
                \Log::warning('⚠️ [History Store] Usuário não autenticado!');
                return response()->json([
                    'success' => false,
                    'message' => 'Não autenticado',
                ], 401);
            }

            $validated = $request->validate([
                'tipo' => 'required|string|in:cpf,telefone,email,nome,rg,parentes',
                'query' => 'required|string|max:255',
                'success' => 'boolean',
                'resultado_resumo' => 'nullable|array',
            ]);

            \Log::info('✅ [History Store] Validação passou', $validated);

            $history = ConsultaHistory::create([
                'user_id' => $request->user()->id,
                'tipo' => $validated['tipo'],
                'query' => $validated['query'],
                'success' => $validated['success'] ?? true,
                'resultado_resumo' => $validated['resultado_resumo'] ?? null,
            ]);

            \Log::info('✅ [History Store] Histórico criado!', ['id' => $history->id]);

            return response()->json([
                'success' => true,
                'data' => $history,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('❌ [History Store] Erro de validação', $e->errors());
            throw $e;
        } catch (\Exception $e) {
            \Log::error('❌ [History Store] Erro geral', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $history = ConsultaHistory::findOrFail($id);
        
        if ($history->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Não autorizado.',
            ], 403);
        }

        $history->delete();

        return response()->json([
            'success' => true,
            'message' => 'Histórico removido.',
        ]);
    }

    public function clear(Request $request): JsonResponse
    {
        ConsultaHistory::where('user_id', $request->user()->id)->forceDelete();

        return response()->json([
            'success' => true,
            'message' => 'Histórico limpo com sucesso.',
        ]);
    }
}
