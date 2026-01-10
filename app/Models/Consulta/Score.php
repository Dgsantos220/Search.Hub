<?php

namespace App\Models\Consulta;

use Illuminate\Database\Eloquent\Model;

class Score extends Model
{
    protected $connection = 'sample_db';
    protected $table = 'SCORE';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'CONTATOS_ID',
        'CSB8',
        'CSB8_FAIXA',
        'CSBA',
        'CSBA_FAIXA',
    ];

    public function dados()
    {
        return $this->belongsTo(Dados::class, 'CONTATOS_ID', 'CONTATOS_ID');
    }
}
