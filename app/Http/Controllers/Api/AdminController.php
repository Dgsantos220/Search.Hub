<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ConsultaHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminController extends Controller
{
    public function stats(): JsonResponse
    {
        $totalUsers = User::count();
        $activeUsers = User::where('created_at', '>=', Carbon::now()->subDays(30))->count();
        $todayConsultas = ConsultaHistory::whereDate('created_at', Carbon::today())->count();
        $monthConsultas = ConsultaHistory::whereMonth('created_at', Carbon::now()->month)->count();
        
        $consultasPorDia = ConsultaHistory::where('created_at', '>=', Carbon::now()->subDays(30))
            ->get()
            ->groupBy(function ($item) {
                return $item->created_at->format('Y-m-d');
            })
            ->map(function ($items, $date) {
                return ['date' => $date, 'total' => $items->count()];
            })
            ->values()
            ->toArray();

        $consultasPorMes = ConsultaHistory::where('created_at', '>=', Carbon::now()->subMonths(6))
            ->get()
            ->groupBy(function ($item) {
                return $item->created_at->format('Y-m');
            })
            ->map(function ($items, $month) {
                return ['month' => $month, 'total' => $items->count()];
            })
            ->values()
            ->toArray();

        $recentActivity = ConsultaHistory::with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'user' => $item->user?->name ?? 'Desconhecido',
                    'tipo' => $item->tipo,
                    'query' => substr($item->query, 0, 20) . '...',
                    'created_at' => $item->created_at->diffForHumans(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'users' => [
                    'total' => $totalUsers,
                    'active_last_30_days' => $activeUsers,
                ],
                'consultas' => [
                    'today' => $todayConsultas,
                    'this_month' => $monthConsultas,
                ],
                'charts' => [
                    'daily' => $consultasPorDia,
                    'monthly' => $consultasPorMes,
                ],
                'recent_activity' => $recentActivity,
            ],
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $search = $request->input('search');
        
        $query = User::with('roles')
            ->withCount(['consultaHistories as consultas_count'])
            ->orderBy('created_at', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->paginate($perPage);

        $users->getCollection()->transform(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                'is_verified' => $user->hasVerifiedEmail(),
                'roles' => $user->roles->pluck('name'),
                'consultas_count' => $user->consultas_count,
                'created_at' => $user->created_at->format('d/m/Y'),
                'last_login' => $user->updated_at->diffForHumans(),
                'status' => 'Ativo',
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function updateUser(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'status' => 'sometimes|string|in:Ativo,Bloqueado,Pendente',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Usuário atualizado com sucesso.',
            'data' => $user,
        ]);
    }

    public function deleteUser(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        
        if ($user->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Não é possível excluir um administrador.',
            ], 403);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Usuário excluído com sucesso.',
        ]);
    }

    public function verifyUser(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        
        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'message' => 'Usuário já está verificado.',
            ], 400);
        }

        $user->markEmailAsVerified();

        return response()->json([
            'success' => true,
            'message' => 'E-mail do usuário verificado com sucesso.',
            'data' => [
                'id' => $user->id,
                'email_verified_at' => $user->email_verified_at,
            ]
        ]);
    }

    public function systemStats(): JsonResponse
    {
        $dbDriver = config('database.default');
        $dbSize = 0;

        try {
            if ($dbDriver === 'sqlite') {
                $result = DB::select("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()");
                $dbSize = $result[0]->size ?? 0;
            } elseif ($dbDriver === 'pgsql') {
                $dbName = config('database.connections.pgsql.database');
                $result = DB::select("SELECT pg_database_size(?) as size", [$dbName]);
                $dbSize = $result[0]->size ?? 0;
            } elseif ($dbDriver === 'mysql') {
                $dbName = config('database.connections.mysql.database');
                $result = DB::select("SELECT SUM(data_length + index_length) as size FROM information_schema.TABLES WHERE table_schema = ?", [$dbName]);
                $dbSize = $result[0]->size ?? 0;
            }
        } catch (\Exception $e) {
            $dbSize = 0;
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'database' => [
                    'driver' => $dbDriver,
                    'size_bytes' => $dbSize,
                    'size_formatted' => $this->formatBytes($dbSize),
                ],
                'server' => [
                    'php_version' => PHP_VERSION,
                    'laravel_version' => app()->version(),
                    'memory_usage' => $this->formatBytes(memory_get_usage(true)),
                    'uptime' => 'N/A',
                ],
                'cache' => [
                    'driver' => config('cache.default'),
                    'status' => 'Operacional',
                ],
                'mail' => [
                    'driver' => config('mail.default'),
                    'host' => config('mail.mailers.smtp.host'),
                    'port' => config('mail.mailers.smtp.port'),
                    'from_address' => config('mail.from.address'),
                    'from_name' => config('mail.from.name'),
                ]
            ],
        ]);
    }

    public function updateMailSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mail_mailer' => 'required|string|in:smtp,ses,mailgun,postmark,sendmail,log',
            'mail_host' => 'required_if:mail_mailer,smtp|string|nullable',
            'mail_port' => 'required_if:mail_mailer,smtp|integer|nullable',
            'mail_username' => 'required_if:mail_mailer,smtp|string|nullable',
            'mail_password' => 'required_if:mail_mailer,smtp|string|nullable',
            'mail_encryption' => 'nullable|string|in:tls,ssl,null',
            'mail_from_address' => 'required|email',
            'mail_from_name' => 'required|string',
        ]);

        foreach ($validated as $key => $value) {
            \App\Models\SystemSetting::set(strtoupper($key), $value);
        }

        return response()->json([
            'success' => true,
            'message' => 'Configurações de e-mail atualizadas com sucesso.',
        ]);
    }

    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, 2) . ' ' . $units[$pow];
    }
}
