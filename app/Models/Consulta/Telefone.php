<?php

namespace App\Models\Consulta;

use Illuminate\Database\Eloquent\Model;

class Telefone extends Model
{
    protected $connection = 'sample_db';
    protected $table = 'TELEFONE';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'CONTATOS_ID',
        'DDD',
        'TELEFONE',
        'TIPO_TELEFONE',
        'DT_INCLUSAO',
        'DT_INFORMACAO',
        'SIGILO',
        'NSU',
        'CLASSIFICACAO',
    ];

    public function dados()
    {
        return $this->belongsTo(Dados::class, 'CONTATOS_ID', 'CONTATOS_ID');
    }

    public function scopeByTelefone($query, $telefone)
    {
        $telefoneLimpo = preg_replace('/\D/', '', $telefone);
        
        if (strlen($telefoneLimpo) >= 10) {
            $ddd = substr($telefoneLimpo, 0, 2);
            $numero = substr($telefoneLimpo, 2);
            return $query->where('DDD', $ddd)->where('TELEFONE', $numero);
        }
        
        return $query->where('TELEFONE', $telefoneLimpo);
    }

    public function scopeByDddTelefone($query, $ddd, $telefone)
    {
        return $query->where('DDD', $ddd)->where('TELEFONE', preg_replace('/\D/', '', $telefone));
    }
}
