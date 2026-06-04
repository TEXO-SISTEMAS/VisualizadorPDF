<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('empresas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('ruc')->nullable();
            $table->string('dv')->nullable();
            $table->string('direccion')->nullable();
            $table->string('ciudad')->nullable();
            $table->string('telefono')->nullable();
            $table->string('email')->nullable();
            $table->string('actividad_economica')->nullable();
            $table->string('desc_actividad')->nullable();
            $table->string('certificado_path')->nullable();
            $table->string('certificado_password')->nullable();
            $table->string('punto_expedicion')->nullable();
            $table->string('establecimiento')->nullable();
            $table->string('numero_timbrado')->nullable();
            $table->date('fecha_inicio_vigencia')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('empresas');
    }
};
