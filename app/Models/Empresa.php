<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Empresa extends Model
{
    protected $table = 'empresas';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'ruc',
        'dv',
        'direccion',
        'telefono',
        'email',
        'actividad_economica',
        'desc_actividad',
        'certificado_path',
        'certificado_password',
        'punto_expedicion',
        'establecimiento',
        'activo',
    ];

    public function facturas()
    {
        return $this->hasMany(Factura::class, 'empresa_id');
    }

    public function clientes()
    {
        return $this->hasMany(Cliente::class, 'empresa_id');
    }
}
