<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ConsultaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConsultaController extends Controller
{
    protected ConsultaService $consultaService;

    public function __construct(ConsultaService $consultaService)
    {
        $this->consultaService = $consultaService;
    }

    public function consultarCpf(string $cpf): JsonResponse
    {
        $cpfLimpo = preg_replace('/\D/', '', $cpf);
        
        if (strlen($cpfLimpo) !== 11) {
            return response()->json([
                'success' => false,
                'message' => 'CPF inválido. Deve conter 11 dígitos.',
            ], 400);
        }

        $resultado = $this->consultaService->buscarPorCpf($cpf);

        if (!$resultado) {
            return response()->json([
                'success' => false,
                'message' => 'Nenhum registro encontrado para o CPF informado.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $resultado,
        ]);
    }

    public function consultarTelefone(string $telefone): JsonResponse
    {
        $telefoneLimpo = preg_replace('/\D/', '', $telefone);
        
        if (strlen($telefoneLimpo) < 8 || strlen($telefoneLimpo) > 11) {
            return response()->json([
                'success' => false,
                'message' => 'Telefone inválido. Informe DDD + número.',
            ], 400);
        }

        $resultado = $this->consultaService->buscarPorTelefone($telefone);

        if (!$resultado) {
            return response()->json([
                'success' => false,
                'message' => 'Nenhum registro encontrado para o telefone informado.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $resultado,
        ]);
    }

    public function consultarEmail(string $email): JsonResponse
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return response()->json([
                'success' => false,
                'message' => 'E-mail inválido.',
            ], 400);
        }

        $resultado = $this->consultaService->buscarPorEmail($email);

        if (!$resultado) {
            return response()->json([
                'success' => false,
                'message' => 'Nenhum registro encontrado para o e-mail informado.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $resultado,
        ]);
    }

    public function consultarNome(Request $request): JsonResponse
    {
        $nome = $request->query('nome');
        $perPage = (int) $request->query('per_page', 10);
        
        if (!$nome || strlen($nome) < 3) {
            return response()->json([
                'success' => false,
                'message' => 'Informe pelo menos 3 caracteres para busca por nome.',
            ], 400);
        }

        $perPage = min(max($perPage, 1), 100);
        
        $filtros = [
            'nome_mae' => $request->query('nome_mae'),
            'exato' => filter_var($request->query('exato'), FILTER_VALIDATE_BOOLEAN),
        ];

        $resultado = $this->consultaService->buscarPorNome($nome, $perPage, $filtros);

        if ($resultado->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Nenhum registro encontrado para o nome informado.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $resultado->items(),
            'pagination' => [
                'current_page' => $resultado->currentPage(),
                'last_page' => $resultado->lastPage(),
                'per_page' => $resultado->perPage(),
                'total' => $resultado->total(),
            ],
        ]);
    }

    public function consultarParentes(string $cpf): JsonResponse
    {
        $cpfLimpo = preg_replace('/\D/', '', $cpf);
        
        if (strlen($cpfLimpo) !== 11) {
            return response()->json([
                'success' => false,
                'message' => 'CPF inválido. Deve conter 11 dígitos.',
            ], 400);
        }

        $resultado = $this->consultaService->buscarParentes($cpf);

        if (empty($resultado['parentes'])) {
            return response()->json([
                'success' => false,
                'message' => 'Nenhum parente encontrado para o CPF informado.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $resultado,
        ]);
    }

    public function consultarRg(string $rg): JsonResponse
    {
        $rgLimpo = preg_replace('/\D/', '', $rg);
        
        if (strlen($rgLimpo) < 5) {
            return response()->json([
                'success' => false,
                'message' => 'RG inválido.',
            ], 400);
        }

        $resultado = $this->consultaService->buscarPorRg($rg);

        if (!$resultado) {
            return response()->json([
                'success' => false,
                'message' => 'Nenhum registro encontrado para o RG informado.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $resultado,
        ]);
    }
}
