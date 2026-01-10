<?php

namespace App\Models\Consulta;

use Illuminate\Database\Eloquent\Model;

class Pis extends Model
{
    protected $connection = 'sample_db';
    protected $table = 'PIS';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'CONTATOS_ID',
        'PIS',
        'CADASTRO_ID',
        'DT_INCLUSAO',
    ];

    public function dados()
    {
        return $this->belongsTo(Dados::class, 'CONTATOS_ID', 'CONTATOS_ID');
    }
}
