<?php

namespace App\Models\Consulta;

use Illuminate\Database\Eloquent\Model;

class Email extends Model
{
    protected $connection = 'sample_db';
    protected $table = 'EMAIL';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'CONTATOS_ID',
        'EMAIL',
    ];

    public function dados()
    {
        return $this->belongsTo(Dados::class, 'CONTATOS_ID', 'CONTATOS_ID');
    }

    public function scopeByEmail($query, $email)
    {
        return $query->where('EMAIL', 'LIKE', strtolower($email) . '%');
    }
}
