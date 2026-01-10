<?php

namespace App\Models\Consulta;

use Illuminate\Database\Eloquent\Model;

class Tse extends Model
{
    protected $connection = 'sample_db';
    protected $table = 'TSE';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'CONTATOS_ID',
        'TITULO_ELEITOR',
        'ZONA',
        'SECAO',
    ];

    public function dados()
    {
        return $this->belongsTo(Dados::class, 'CONTATOS_ID', 'CONTATOS_ID');
    }

    public function scopeByTitulo($query, $titulo)
    {
        return $query->where('TITULO_ELEITOR', preg_replace('/\D/', '', $titulo));
    }
}
