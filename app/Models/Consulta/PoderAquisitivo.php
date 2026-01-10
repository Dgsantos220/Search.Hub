<?php

namespace App\Models\Consulta;

use Illuminate\Database\Eloquent\Model;

class PoderAquisitivo extends Model
{
    protected $connection = 'sample_db';
    protected $table = 'PODER_AQUISITIVO';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'CONTATOS_ID',
        'COD_PODER_AQUISITIVO',
        'PODER_AQUISITIVO',
        'RENDA_PODER_AQUISITIVO',
        'FX_PODER_AQUISITIVO',
    ];

    public function dados()
    {
        return $this->belongsTo(Dados::class, 'CONTATOS_ID', 'CONTATOS_ID');
    }
}
