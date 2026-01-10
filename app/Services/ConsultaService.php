<?php

namespace App\Services;

use App\Models\Consulta\Dados;
use App\Models\Consulta\Telefone;
use App\Models\Consulta\Email;
use App\Models\Consulta\Parentes;
use Illuminate\Support\Facades\Cache;

class ConsultaService
{
    protected $cacheTime = 300;

    protected function convertToUtf8($value)
    {
        if (is_null($value)) {
            return null;
        }
        
        if (is_array($value)) {
            return array_map([$this, 'convertToUtf8'], $value);
        }
        
        if (is_object($value)) {
            foreach ($value as $key => $val) {
                $value->$key = $this->convertToUtf8($val);
            }
            return $value;
        }
        
        if (is_string($value)) {
            if (mb_detect_encoding($value, 'UTF-8', true) === false) {
                return mb_convert_encoding($value, 'UTF-8', 'ISO-8859-1');
            }
        }
        
        return $value;
    }

    public function buscarPorCpf(string $cpf): ?array
    {
        $cpfLimpo = preg_replace('/\D/', '', $cpf);
        
        return Cache::remember("consulta_cpf_{$cpfLimpo}", $this->cacheTime, function () use ($cpfLimpo) {
            $pessoa = Dados::byCpf($cpfLimpo)
                ->with(['telefones', 'emails', 'enderecos', 'score', 'poderAquisitivo', 'tse', 'pis'])
                ->first();

            if (!$pessoa) {
                return null;
            }

            return $this->convertToUtf8($this->formatarDadosCompletos($pessoa));
        });
    }

    public function buscarPorTelefone(string $telefone): ?array
    {
        $telefoneLimpo = preg_replace('/\D/', '', $telefone);
        
        return Cache::remember("consulta_tel_{$telefoneLimpo}", $this->cacheTime, function () use ($telefoneLimpo) {
            $telefoneRecord = Telefone::byTelefone($telefoneLimpo)->first();

            if (!$telefoneRecord) {
                return null;
            }

            $pessoa = Dados::where('CONTATOS_ID', $telefoneRecord->CONTATOS_ID)
                ->with(['telefones', 'emails', 'enderecos', 'score', 'poderAquisitivo', 'tse', 'pis'])
                ->first();

            if (!$pessoa) {
                return null;
            }

            return $this->convertToUtf8($this->formatarDadosCompletos($pessoa));
        });
    }

    public function buscarPorEmail(string $email): ?array
    {
        $emailLower = strtolower(trim($email));
        
        return Cache::remember("consulta_email_" . md5($emailLower), $this->cacheTime, function () use ($emailLower) {
            $emailRecord = Email::where('EMAIL', $emailLower)->first();

            if (!$emailRecord) {
                return null;
            }

            $pessoa = Dados::where('CONTATOS_ID', $emailRecord->CONTATOS_ID)
                ->with(['telefones', 'emails', 'enderecos', 'score', 'poderAquisitivo', 'tse', 'pis'])
                ->first();

            if (!$pessoa) {
                return null;
            }

            return $this->convertToUtf8($this->formatarDadosCompletos($pessoa));
        });
    }

    public function buscarPorNome(string $nome, int $perPage = 10, array $filtros = [])
    {
        $nome = trim(mb_strtoupper($nome, 'UTF-8'));
        $query = Dados::query(); // Inicia query limpa para não duplicar wheres do scope se usarmos manualmente

        // 1. Lógica Principal: Nome Exato ou Aproximado
        if (!empty($filtros['exato'])) {
            // Busca Exata (Rápida com Índice)
            $query->where('NOME', $nome);
        } else {
            // Busca Híbrida Inteligente (Range Scan + Like)
            $partes = array_values(array_filter(explode(' ', $nome)));
            if (empty($partes)) return $query->whereRaw('0 = 1'); // Retorna vazio se nome vazio

            $primeiroNome = $partes[0];

            // OTIMIZAÇÃO CRÍTICA (RANGE SCAN)
            $proximoNome = $primeiroNome;
            $tamanho = strlen($proximoNome);
            if ($tamanho > 0) {
                // Incrementa ultimo char para range
                $proximoNome[$tamanho - 1] = chr(ord($proximoNome[$tamanho - 1]) + 1);
                
                $query->where(function($q) use ($primeiroNome, $proximoNome) {
                    $q->where('NOME', '>=', $primeiroNome)
                      ->where('NOME', '<', $proximoNome);
                });
            } else {
                $query->where('NOME', 'LIKE', $primeiroNome . '%');
            }

            // Refinamento das outras partes do nome
            if (count($partes) > 1) {
                for ($i = 1; $i < count($partes); $i++) {
                    $query->where('NOME', 'LIKE', '%' . $partes[$i] . '%');
                }
            }
        }
        
        // 2. Filtro Secundário: Nome da Mãe (Performático pois atua no subset filtrado acima)
        if (!empty($filtros['nome_mae'])) {
            $mae = trim(mb_strtoupper($filtros['nome_mae'], 'UTF-8'));
            // Usamos LIKE para permitir busca parcial da mãe (Ex: "MARIA")
            $query->where('NOME_MAE', 'LIKE', '%' . $mae . '%');
        }

        return $query->with(['telefones', 'emails', 'enderecos', 'score', 'poderAquisitivo', 'tse', 'pis', 'parentes'])
            ->paginate($perPage)
            ->through(function ($pessoa) {
                return $this->convertToUtf8($this->formatarDadosCompletos($pessoa));
            });
    }

    public function buscarParentes(string $cpf): array
    {
        $cpfLimpo = preg_replace('/\D/', '', $cpf);
        
        return Cache::remember("consulta_parentes_{$cpfLimpo}", $this->cacheTime, function () use ($cpfLimpo) {
            $parentes = Parentes::byCpf($cpfLimpo)->get();
            
            $resultado = [
                'cpf_consultado' => $cpfLimpo,
                'parentes' => []
            ];

            foreach ($parentes as $parente) {
                $dadosParente = null;
                
                if ($parente->CPF_VINCULO) {
                    $pessoa = Dados::byCpf($parente->CPF_VINCULO)
                        ->with(['telefones', 'emails', 'enderecos'])
                        ->first();
                    
                    if ($pessoa) {
                        $dadosParente = $this->formatarDadosBasicos($pessoa);
                    }
                }

                $resultado['parentes'][] = [
                    'nome' => $parente->NOME_VINCULO,
                    'cpf' => $parente->CPF_VINCULO,
                    'vinculo' => $parente->VINCULO,
                    'dados_completos' => $dadosParente
                ];
            }

            return $this->convertToUtf8($resultado);
        });
    }

    public function buscarPorRg(string $rg): ?array
    {
        $rgLimpo = preg_replace('/\D/', '', $rg);
        
        return Cache::remember("consulta_rg_{$rgLimpo}", $this->cacheTime, function () use ($rgLimpo) {
            $pessoa = Dados::byRg($rgLimpo)
                ->with(['telefones', 'emails', 'enderecos', 'score', 'poderAquisitivo', 'tse', 'pis'])
                ->first();

            if (!$pessoa) {
                return null;
            }

            return $this->convertToUtf8($this->formatarDadosCompletos($pessoa));
        });
    }

    protected function formatarDadosCompletos($pessoa): array
    {
        return [
            'dados_pessoais' => [
                'contatos_id' => $pessoa->CONTATOS_ID,
                'cpf' => $pessoa->CPF,
                'rg' => $pessoa->RG,
                'nome' => $pessoa->NOME,
                'nome_mae' => $pessoa->NOME_MAE ?? null,
                'nome_pai' => $pessoa->NOME_PAI ?? null,
                'sexo' => $pessoa->SEXO ?? null,
                'data_nascimento' => $pessoa->NASC ?? null,
                'situacao_cpf' => $pessoa->SITUACAO_CPF ?? null,
                'data_obito' => $pessoa->DT_OB ?? null,
            ],
            'telefones' => $pessoa->telefones->map(function ($tel) {
                return [
                    'ddd' => $tel->DDD,
                    'telefone' => $tel->TELEFONE,
                    'tipo' => $tel->TIPO_TELEFONE,
                    'classificacao' => $tel->CLASSIFICACAO ?? null,
                    'data_inclusao' => $tel->DT_INCLUSAO ?? null,
                ];
            })->toArray(),
            'emails' => $pessoa->emails->pluck('EMAIL')->toArray(),
            'enderecos' => $pessoa->enderecos->map(function ($end) {
                return [
                    'logradouro_tipo' => $end->LOGR_TIPO,
                    'logradouro' => $end->LOGR_NOME,
                    'numero' => $end->LOGR_NUMERO,
                    'complemento' => $end->LOGR_COMPLEMENTO,
                    'bairro' => $end->BAIRRO,
                    'cidade' => $end->CIDADE,
                    'uf' => $end->UF,
                    'cep' => $end->CEP,
                    'data_atualizacao' => $end->DT_ATUALIZACAO ?? null,
                ];
            })->toArray(),
            'score' => $pessoa->score ? [
                'csb8' => $pessoa->score->CSB8,
                'csb8_faixa' => $pessoa->score->CSB8_FAIXA,
                'csba' => $pessoa->score->CSBA,
                'csba_faixa' => $pessoa->score->CSBA_FAIXA,
            ] : null,
            'parentes' => $pessoa->parentes->map(function ($p) {
                return [
                    'nome' => $p->NOME_VINCULO,
                    'cpf' => $p->CPF_VINCULO,
                    'vinculo' => $p->VINCULO,
                ];
            })->toArray(),
            'poder_aquisitivo' => $pessoa->poderAquisitivo ? [
                'codigo' => $pessoa->poderAquisitivo->COD_PODER_AQUISITIVO,
                'descricao' => $pessoa->poderAquisitivo->PODER_AQUISITIVO,
                'renda' => $pessoa->poderAquisitivo->RENDA_PODER_AQUISITIVO,
                'faixa' => $pessoa->poderAquisitivo->FX_PODER_AQUISITIVO,
            ] : null,
            'tse' => $pessoa->tse ? [
                'titulo_eleitor' => $pessoa->tse->TITULO_ELEITOR,
                'zona' => $pessoa->tse->ZONA,
                'secao' => $pessoa->tse->SECAO,
            ] : null,
            'pis' => $pessoa->pis ? [
                'numero' => $pessoa->pis->PIS,
                'cadastro_id' => $pessoa->pis->CADASTRO_ID,
                'data_inclusao' => $pessoa->pis->DT_INCLUSAO,
            ] : null,
        ];
    }

    protected function formatarDadosBasicos($pessoa): array
    {
        return [
            'dados_pessoais' => [
                'cpf' => $pessoa->CPF,
                'nome' => $pessoa->NOME,
            ],
            'telefones' => $pessoa->telefones->map(function ($tel) {
                return [
                    'ddd' => $tel->DDD,
                    'telefone' => $tel->TELEFONE,
                ];
            })->toArray(),
            'emails' => $pessoa->emails->pluck('EMAIL')->toArray(),
            'enderecos' => $pessoa->enderecos->map(function ($end) {
                return [
                    'cidade' => $end->CIDADE,
                    'uf' => $end->UF,
                ];
            })->toArray(),
        ];
    }
}
