<?php

namespace App\Models\Consulta;

use Illuminate\Database\Eloquent\Model;

class Parentes extends Model
{
    protected $connection = 'sample_db';
    protected $table = 'PARENTES';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'CPF_Completo',
        'NOME',
        'CPF_VINCULO',
        'NOME_VINCULO',
        'VINCULO',
    ];

    public function scopeByCpf($query, $cpf)
    {
        $cpfLimpo = preg_replace('/\D/', '', $cpf);
        return $query->where('CPF_Completo', $cpfLimpo);
    }

    public function scopeByCpfVinculo($query, $cpf)
    {
        $cpfLimpo = preg_replace('/\D/', '', $cpf);
        return $query->where('CPF_VINCULO', $cpfLimpo);
    }
}
