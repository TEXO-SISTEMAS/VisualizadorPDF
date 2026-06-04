<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::create('facturas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained('empresas')->onDelete('cascade');
            $table->foreignId('cliente_id')->constrained('clientes')->onDelete('cascade');
            $table->string('numero')->nullable();
            $table->dateTime('fecha_emision')->nullable();
            $table->dateTime('fecha_vencimiento')->nullable();
            $table->integer('tipo_operacion')->nullable();
            $table->string('desc_tipo_operacion')->nullable();
            $table->string('tipo_impuesto')->nullable();
            $table->string('moneda')->nullable();
            $table->decimal('tasa_cambio', 15, 2)->nullable();
            $table->decimal('subtotal', 15, 2)->nullable();
            $table->decimal('descuento', 15, 2)->nullable();
            $table->decimal('base_gravable', 15, 2)->nullable();
            $table->decimal('iva', 15, 2)->nullable();
            $table->decimal('total', 15, 2)->nullable();
            $table->string('estado')->nullable();
            $table->text('xml_contenido')->nullable();
            $table->string('xml_archivo')->nullable();
            $table->string('firma_timestamp')->nullable();
            $table->string('numero_timbre')->nullable();
            $table->string('codigo_seguridad')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->string('creada_por')->nullable();
            $table->integer('cuotas')->nullable();
            $table->timestamp('creada_en')->nullable();
            $table->string('tipo_documento')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facturas');
    }
};
