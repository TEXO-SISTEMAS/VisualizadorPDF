<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ItemFactura extends Model
{
    protected $table = 'items_factura';
    protected $fillable = [
        'factura_id',
        'codigo',
        'descripcion',
        'cantidad',
        'unidad_medida',
        'precio_unitario',
        'total_bruto',
        'descuento_item',
        'total_item',
        'afectacion_iva',
        'tasa_iva',
        'base_gravable_iva',
        'liquido_iva',
    ];

    public $timestamps = false;

    protected $casts = [
        'cantidad' => 'decimal:2',
        'precio_unitario' => 'decimal:2',
        'total_bruto' => 'decimal:2',
        'descuento_item' => 'decimal:2',
        'total_item' => 'decimal:2',
        'tasa_iva' => 'decimal:2',
        'base_gravable_iva' => 'decimal:2',
        'liquido_iva' => 'decimal:2',
    ];

    public function factura()
    {
        return $this->belongsTo(Factura::class, 'factura_id');
    }
}
