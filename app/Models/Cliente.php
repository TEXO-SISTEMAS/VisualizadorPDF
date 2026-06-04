<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    protected $table = 'clientes';
    public $timestamps = false;

    protected $fillable = [
        'empresa_id',
        'ruc',
        'dv',
        'nombre',
        'direccion',
        'email',
        'telefono',
        'naturaleza',
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }

    public function facturas()
    {
        return $this->hasMany(Factura::class, 'cliente_id');
    }
}
