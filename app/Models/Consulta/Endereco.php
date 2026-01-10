<?php

namespace App\Models\Consulta;

use Illuminate\Database\Eloquent\Model;

class Endereco extends Model
{
    protected $connection = 'sample_db';
    protected $table = 'ENDERECOS';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'CONTATOS_ID',
        'LOGR_TIPO',
        'LOGR_NOME',
        'LOGR_NUMERO',
        'LOGR_COMPLEMENTO',
        'BAIRRO',
        'CIDADE',
        'UF',
        'CEP',
        'DT_ATUALIZACAO',
        'DT_INCLUSAO',
        'TIPO_ENDERECO_ID',
    ];

    public function dados()
    {
        return $this->belongsTo(Dados::class, 'CONTATOS_ID', 'CONTATOS_ID');
    }

    public function scopeByCep($query, $cep)
    {
        return $query->where('CEP', preg_replace('/\D/', '', $cep));
    }

    public function scopeByCidade($query, $cidade)
    {
        return $query->where('CIDADE', 'LIKE', '%' . strtoupper($cidade) . '%');
    }

    public function scopeByUf($query, $uf)
    {
        return $query->where('UF', strtoupper($uf));
    }
}
