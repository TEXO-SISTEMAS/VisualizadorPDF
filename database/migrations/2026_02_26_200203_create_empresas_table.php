<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::create('empresas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('ruc')->nullable();
            $table->string('dv')->nullable();
            $table->string('direccion')->nullable();
            $table->string('telefono')->nullable();
            $table->string('email')->nullable();
            $table->string('actividad_economica')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->string('numero_timbrado')->nullable();
            $table->date('fecha_inicio_vigencia')->nullable();
            $table->string('tipo_documento_defecto')->nullable();
            $table->string('ciudad')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('empresas');
    }
};
