<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::create('items_factura', function (Blueprint $table) {
            $table->id();
            $table->foreignId('factura_id')->constrained('facturas')->onDelete('cascade');
            $table->string('codigo')->nullable();
            $table->text('descripcion')->nullable();
            $table->decimal('cantidad', 15, 2)->nullable();
            $table->string('unidad_medida')->nullable();
            $table->decimal('precio_unitario', 15, 2)->nullable();
            $table->decimal('total_bruto', 15, 2)->nullable();
            $table->decimal('descuento_item', 15, 2)->nullable();
            $table->decimal('total_item', 15, 2)->nullable();
            $table->string('afectacion_iva')->nullable();
            $table->decimal('tasa_iva', 5, 2)->nullable();
            $table->decimal('base_gravable_iva', 15, 2)->nullable();
            $table->decimal('liquido_iva', 15, 2)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('items_factura');
    }
};
