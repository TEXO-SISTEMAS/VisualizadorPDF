<?php

namespace App\Http\Controllers\Api;

use App\Models\Factura;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Empresa;

class FacturaController extends Controller
{
    public function index(Request $request)
{
    $empresa = $request->query('agencia') ?? $request->query('empresa');
    $search = $request->query('q');
    $tipo = $request->query('tipo');

    $query = Factura::with(['empresa', 'cliente', 'items']);

    if ($empresa) {
        $query->whereHas('empresa', function ($q) use ($empresa) {
            $q->where('nombre', 'like', "%$empresa%");
        });
    }

    if ($search) {
        $query->where(function ($q) use ($search) {
            $q->where('numero', 'like', "%$search%")
              ->orWhereHas('cliente', function ($subQ) use ($search) {
                  $subQ->where('nombre', 'like', "%$search%");
              });
        });
    }

    if ($tipo) {
        $query->where('tipo_documento', 'like', "%$tipo%");
    }

    return response()->json($query->paginate(10));
}

    public function show($id)
    {
        $factura = Factura::with(['empresa', 'cliente', 'items'])->find($id);

        if (!$factura) {
            return response()->json(['error' => 'Factura no encontrada'], 404);
        }

        return response()->json($factura);
    }

    public function agencias()
{
    $agencias = Empresa::orderBy('nombre')->pluck('nombre');
    return response()->json($agencias);
}

public function tiposDocumento()
{
    $tipos = Factura::distinct()
        ->orderBy('tipo_documento')
        ->pluck('tipo_documento');

    return response()->json($tipos);
}

    public function generarPdf($id)
{
    $factura = Factura::with(['empresa', 'cliente', 'items'])->find($id);

    if (!$factura) {
        return response()->json(['error' => 'Factura no encontrada'], 404);
    }

    $logosMap = [
        1 => 'WILPAR.png',
        2 => 'brick.jpg',
        3 => 'ENE S.A..png',
        4 => 'FUNDACION TEXO PARA EL ARTE.png',
        5 => 'MEDIABRAND.png',
        6 => 'LA MEDIA DE LUPE S.A..png',
        7 => 'PUBLICITARIA NASTA S.A..png',
        8 => 'PROJECT SOCIEDAD ANONIMA.png',
        9 => 'ROW COMMS E.A.S..png',
        10 => 'TEXO S.A.png',
        11 => 'VILA ROMANA.png'
    ];

    $logoFile = $logosMap[$factura->empresa_id] ?? 'WILPAR.png';
    $logoPath = public_path($logoFile);

    $datos = [
        'ruc_empresa' => $factura->empresa->ruc . '-' . $factura->empresa->dv,
        'num_timbrado' => $factura->empresa->numero_timbrado ?? '',
        'num_factura' => $factura->numero,
        'fecha_emision' => $factura->fecha_emision->format('d-m-Y H:i:s'),
        'ruc_receptor' => $factura->cliente->ruc . '-' . $factura->cliente->dv,
        'codigo_cliente' => $factura->cliente->codigo_cliente ?? '',
        'nombre_cliente' => $factura->cliente->nombre,
        'condicion_venta' => $factura->desc_tipo_operacion ?? 'Crédito',
        'cuotas' => $factura->cuotas ?? 1,
        'moneda' => ($factura->moneda ?? 'USD') . ' Dollar',
        'direccion' => $factura->cliente->direccion ?? '',
        'email' => $factura->cliente->email ?? '',
        'tipo_cambio' => $factura->tasa_cambio ?? 0,
        'nombre_empresa' => $factura->empresa->nombre,
        'actividad_empresa' => $factura->empresa->actividad_economica ?? '',
        'direccion_empresa' => $factura->empresa->direccion ?? '',
        'ciudad_empresa' => $factura->empresa->ciudad ?? 'ASUNCION (DISTRITO)',
        'email_empresa' => $factura->empresa->email ?? '',
        'telefono_empresa' => $factura->empresa->telefono ?? '',
        'fecha_inicio_vigencia' => $factura->empresa->fecha_inicio_vigencia ? \Carbon\Carbon::parse($factura->empresa->fecha_inicio_vigencia)->format('d-m-Y') : '30-10-2024',
        'tipo_documento' => $factura->tipo_documento ?? 'Factura electrónica',
        'items' => $factura->items->map(function($item, $index) {
            return [
                'codigo' => $index + 1,
                'descripcion' => $item->descripcion,
                'unidad' => $item->unidad_medida ?? 'UNI',
                'cantidad' => intval($item->cantidad ?? 0),
                'precio_unitario' => number_format($item->precio_unitario ?? 0, 0, ',', '.'),
                'descuento' => '0',
                'exentas' => '0',
                'cinco_porciento' => '0',
                'diez_porciento' => number_format($item->total_item ?? 0, 2, ',', '.')
            ];
        })->all(),
        'subtotal' => $factura->subtotal ?? 0,
        'total_operacion' => $factura->subtotal ?? 0,
        'total_guaranies' => round($factura->total ?? 0),
        'iva_cinco' => 0,
        'iva_diez' => $factura->iva ?? 0,
        'total_iva' => $factura->iva ?? 0,
];

    if (file_exists($logoPath)) {
        $ext = pathinfo($logoPath, PATHINFO_EXTENSION);
        $mimeType = ($ext === 'jpg' || $ext === 'jpeg') ? 'image/jpeg' : 'image/png';
        $logoBase64 = 'data:' . $mimeType . ';base64,' . base64_encode(file_get_contents($logoPath));
    } else {
        $logoBase64 = 'data:image/png;base64,' . base64_encode(file_get_contents(public_path('WILPAR.png')));
    }

    $datos['logo_base64'] = $logoBase64;
    return view('facturas.factura', array_merge($datos, ['factura_id' => $factura->id]));
    return view('facturas.factura', $datos);
}

public function descargarPdf($id)
{
    $factura = Factura::with(['empresa', 'cliente', 'items'])->find($id);

    if (!$factura) {
        return response()->json(['error' => 'Factura no encontrada'], 404);
    }

    $datos = [
        'ruc_empresa' => $factura->empresa->ruc . '-' . $factura->empresa->dv,
        'num_timbrado' => $factura->empresa->numero_timbrado ?? '',
        'num_factura' => $factura->numero,
        'fecha_emision' => $factura->fecha_emision->format('d-m-Y H:i:s'),
        'ruc_receptor' => $factura->cliente->ruc . '-' . $factura->cliente->dv,
        'codigo_cliente' => $factura->cliente->codigo_cliente ?? '',
        'nombre_cliente' => $factura->cliente->nombre,
        'condicion_venta' => $factura->desc_tipo_operacion ?? 'Crédito',
        'cuotas' => $factura->cuotas ?? 1,
        'moneda' => ($factura->moneda ?? 'USD') . ' Dollar',
        'direccion' => $factura->cliente->direccion ?? '',
        'email' => $factura->cliente->email ?? '',
        'tipo_cambio' => $factura->tasa_cambio ?? 0,
        'nombre_empresa' => $factura->empresa->nombre,
        'actividad_empresa' => $factura->empresa->actividad_economica ?? '',
        'direccion_empresa' => $factura->empresa->direccion ?? '',
        'ciudad_empresa' => $factura->empresa->ciudad ?? 'ASUNCION (DISTRITO)',
        'email_empresa' => $factura->empresa->email ?? '',
        'telefono_empresa' => $factura->empresa->telefono ?? '',
        'fecha_inicio_vigencia' => $factura->empresa->fecha_inicio_vigencia ? \Carbon\Carbon::parse($factura->empresa->fecha_inicio_vigencia)->format('d-m-Y') : '30-10-2024',
        'tipo_documento' => $factura->tipo_documento ?? 'Factura electrónica',
        'items' => $factura->items->map(function($item, $index) {
            return [
                'codigo' => $index + 1,
                'descripcion' => $item->descripcion,
                'unidad' => $item->unidad_medida ?? 'UNI',
                'cantidad' => intval($item->cantidad ?? 0),
                'precio_unitario' => number_format($item->precio_unitario ?? 0, 0, ',', '.'),
                'descuento' => '0',
                'exentas' => '0',
                'cinco_porciento' => '0',
                'diez_porciento' => number_format($item->total_item ?? 0, 2, ',', '.')
            ];
        })->all(),
        'subtotal' => $factura->subtotal ?? 0,
        'total_operacion' => $factura->subtotal ?? 0,
        'total_guaranies' => round($factura->total ?? 0),
        'iva_cinco' => 0,
        'iva_diez' => $factura->iva ?? 0,
        'total_iva' => $factura->iva ?? 0,
    ];

    // Mapeo de empresas a logos
    $logosMap = [
        1 => 'WILPAR.png',
        2 => 'brick.jpg',
        3 => 'ENE S.A..png',
        4 => 'FUNDACION TEXO PARA EL ARTE.png',
        5 => 'MEDIABRAND.png',
        6 => 'LA MEDIA DE LUPE S.A..png',
        7 => 'PUBLICITARIA NASTA S.A..png',
        8 => 'PROJECT SOCIEDAD ANONIMA.png',
        9 => 'ROW COMMS E.A.S..png',
        10 => 'TEXO S.A.png',
        11 => 'VILA ROMANA.png'
    ];

    $logoFile = $logosMap[$factura->empresa_id] ?? 'WILPAR.png';
    $logoPath = public_path($logoFile);

    if (file_exists($logoPath)) {
        $ext = pathinfo($logoPath, PATHINFO_EXTENSION);
        $mimeType = ($ext === 'jpg' || $ext === 'jpeg') ? 'image/jpeg' : 'image/png';
        $logoBase64 = 'data:' . $mimeType . ';base64,' . base64_encode(file_get_contents($logoPath));
    } else {
        $logoBase64 = 'data:image/png;base64,' . base64_encode(file_get_contents(public_path('WILPAR.png')));
    }

    $datos['logo_base64'] = $logoBase64;

    $html = view('facturas.factura', $datos)->render();

    $client = new \GuzzleHttp\Client();
    $response = $client->post('http://localhost:3000/generar-pdf', [
        'json' => [
            'html' => $html,
            'filename' => 'factura_' . $factura->numero . '.pdf'
        ]
    ]);

    return response($response->getBody(), 200)
        ->header('Content-Type', 'application/pdf')
        ->header('Content-Disposition', 'attachment; filename="factura_' . $factura->numero . '.pdf"');
}
}
