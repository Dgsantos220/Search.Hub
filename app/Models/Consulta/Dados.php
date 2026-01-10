<?php

namespace App\Models\Consulta;

use Illuminate\Database\Eloquent\Model;

class Dados extends Model
{
    protected $connection = 'sample_db';
    protected $table = 'DADOS';
    protected $primaryKey = 'CONTATOS_ID';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'CONTATOS_ID',
        'CPF',
        'RG',
        'NOME',
        'NOME_MAE',
        'NOME_PAI',
        'SEXO',
        'DT_NASCIMENTO',
        'SITUACAO_CPF',
        'DT_OBITO',
    ];

    public function telefones()
    {
        return $this->hasMany(Telefone::class, 'CONTATOS_ID', 'CONTATOS_ID');
    }

    public function emails()
    {
        return $this->hasMany(Email::class, 'CONTATOS_ID', 'CONTATOS_ID');
    }

    public function enderecos()
    {
        return $this->hasMany(Endereco::class, 'CONTATOS_ID', 'CONTATOS_ID');
    }

    public function score()
    {
        return $this->hasOne(Score::class, 'CONTATOS_ID', 'CONTATOS_ID');
    }

    public function poderAquisitivo()
    {
        return $this->hasOne(PoderAquisitivo::class, 'CONTATOS_ID', 'CONTATOS_ID');
    }

    public function tse()
    {
        return $this->hasOne(Tse::class, 'CONTATOS_ID', 'CONTATOS_ID');
    }

    public function pis()
    {
        return $this->hasOne(Pis::class, 'CONTATOS_ID', 'CONTATOS_ID');
    }

    public function parentes()
    {
        return $this->hasMany(Parentes::class, 'CPF_Completo', 'CPF');
    }

    public function scopeByCpf($query, $cpf)
    {
        $cpfLimpo = preg_replace('/\D/', '', $cpf);
        return $query->where('CPF', $cpfLimpo);
    }

    public function scopeByNome($query, $nome)
    {
        $nome = trim($nome);
        if (empty($nome)) {
            return $query;
        }

        // Quebra o nome em partes (ex: "Diego Santos" -> ["DIEGO", "SANTOS"])
        // Usa mb_strtoupper para garantir que acentos sejam tratados (ex: "João" -> "JOÃO")
        $partes = array_values(array_filter(explode(' ', mb_strtoupper($nome, 'UTF-8'))));
        
        if (empty($partes)) {
            return $query;
        }

        $primeiroNome = $partes[0];

        // OTIMIZAÇÃO CRÍTICA (RANGE SCAN):
        // Em vez de LIKE 'DIEGO%', usamos >= 'DIEGO' e < 'DIEGP'.
        // Isso força o banco a usar o índice B-Tree, pois é uma comparação de intervalo direta.
        // O LIKE as vezes é ignorado pelo otimizador do SQLite dependendo de collations.
        
        $proximoNome = $primeiroNome;
        $tamanho = strlen($proximoNome);
        if ($tamanho > 0) {
            // Incrementa o último caractere para pegar o limite superior
            // Ex: DIEGO -> DIEGP
            $proximoNome[$tamanho - 1] = chr(ord($proximoNome[$tamanho - 1]) + 1);
            
            $query->where(function($q) use ($primeiroNome, $proximoNome) {
                $q->where('NOME', '>=', $primeiroNome)
                  ->where('NOME', '<', $proximoNome);
            });
        } else {
             // Fallback (não deve acontecer devido ao check empty acima)
             $query->where('NOME', 'LIKE', $primeiroNome . '%');
        }

        // 2. Refinamento (Partes seguintes usam LIKE contém)
        if (count($partes) > 1) {
            for ($i = 1; $i < count($partes); $i++) {
                $query->where('NOME', 'LIKE', '%' . $partes[$i] . '%');
            }
        }

        return $query;
    }

    public function scopeByRg($query, $rg)
    {
        return $query->where('RG', preg_replace('/\D/', '', $rg));
    }
}
