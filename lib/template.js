function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderFactura(d) {
  const esFacturaElectronica = d.tipo_documento === 'Factura electrónica';

  const itemsHtml = d.items.map(item => `
    <tr>
      <td class="c-cod">${escapeHtml(item.codigo)}</td>
      <td class="c-desc">${escapeHtml(item.descripcion)}</td>
      <td class="c-uni">${escapeHtml(item.unidad)}</td>
      <td class="c-cant">${escapeHtml(item.cantidad)}</td>
      <td class="c-pu">${escapeHtml(item.precio_unitario)}</td>
      <td class="c-desc2">${escapeHtml(item.descuento)}</td>
      <td class="c-ex">${escapeHtml(item.exentas)}</td>
      <td class="c-5">${escapeHtml(item.cinco_porciento)}</td>
      <td class="c-10">${escapeHtml(item.diez_porciento)}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
html, body { height:100%; }
body { font-family: Arial, sans-serif; font-size: 11px; background:#fff; display:flex; justify-content:center; padding:20px; min-height:100vh; }
.page { width: 750px; display: flex; flex-direction: column; min-height: calc(100vh - 40px); }
.bloque { border: 1px solid #555; margin-bottom: 6px; flex-shrink: 0; }
.header { display:flex; align-items:stretch; padding:12px; gap:10px; }
.header-logo { width:110px; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
.header-logo img { width:90px; }
.header-center { flex:1; padding-left:10px; }
.header-center .doc-label { font-weight:bold; font-size:11px; }
.header-center .company { font-size:11px; margin:2px 0 6px; }
.header-center .info { font-size:10px; line-height:1.7; }
.header-right { width:220px; flex-shrink:0; font-size:10px; line-height:1.8; padding-left:14px; }
.header-right .doc-tipo { font-weight:bold; font-size:11px; }
.header-right .doc-num { font-size:11px; }
.receptor { padding: 8px 12px; font-size: 10px; line-height: 1.85; display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.receptor .col-left { grid-column: 1; }
.receptor .col-right { grid-column: 2; }
.receptor b { font-weight: bold; }
.tabla-bloque { border: 1px solid #555; flex: 1; overflow: hidden; }
.tabla-bloque table { width: 100%; border-collapse: collapse; font-size: 10px; table-layout: fixed; height: 100%; }
col.c-cod  { width: 42px; }
col.c-desc { width: auto; }
col.c-uni  { width: 52px; }
col.c-cant { width: 52px; }
col.c-pu   { width: 68px; }
col.c-desc2{ width: 40px; }
col.c-ex   { width: 60px; }
col.c-5    { width: 48px; }
col.c-10   { width: 62px; }
.c-cod  { text-align:center; }
.c-desc { text-align:left; }
.c-uni  { text-align:center; }
.c-cant { text-align:center; }
.c-pu   { text-align:right; padding-right:4px; }
.c-desc2{ text-align:center; }
.c-ex   { text-align:right; padding-right:4px; }
.c-5    { text-align:right; padding-right:4px; }
.c-10   { text-align:right; padding-right:4px; }
thead tr:first-child th { background:#d9d9d9; font-weight:bold; text-align:center; border:1px solid #999; padding:4px 3px; }
thead tr:last-child th { background:#d9d9d9; font-weight:bold; text-align:center; border:1px solid #999; padding:3px; font-size:9px; }
tbody.datos td { border-right: 1px solid #bbb; border-bottom: none; padding: 4px 3px; vertical-align: top; }
tbody.datos td:last-child { border-right: none; }
tbody.relleno { height: 100%; }
tbody.relleno tr { height: 100%; }
tbody.relleno td { border-right: 1px solid #bbb; border-bottom: none; height: 100%; padding: 0; vertical-align: top; }
tbody.relleno td:last-child { border-right: none; }
tfoot td { border: 1px solid #bbb; padding: 3px 4px; font-size: 10px; }
tfoot tr:first-child td { border-top: 1px solid #555; }
tfoot tr.sub  td { background: #d9d9d9; }
tfoot tr.guar td { background: #555; color: #fff; border-color: #555; }
tfoot tr.iva  td { background: #fff; }
tfoot tr.info td { background: #fff; }
tfoot .fw { font-weight: bold; }
tfoot .tr { text-align: right; }
.btn-imprimir { position: fixed; bottom: 20px; right: 20px; padding: 10px 15px; background: #007bff; color: white; border-radius: 5px; text-decoration: none; z-index: 1000; font-size: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); cursor: pointer; border: none; }
@media print { .btn-imprimir { display: none !important; } }
</style>
</head>
<body>
<div class="page">

  <div class="bloque">
    <div class="header">
      <div class="header-logo">
        <img src="${d.logo_base64}" alt="Logo" style="width:100px;">
      </div>
      <div class="header-center">
        <div class="doc-label">KuDE de Factura electrónica</div>
        <div class="company">${escapeHtml(d.nombre_empresa)}</div>
        <div class="info">
          ${escapeHtml(d.actividad_empresa)}<br>
          ${escapeHtml(d.direccion_empresa)}<br><br>
          ${escapeHtml(d.ciudad_empresa)}<br>
          ${escapeHtml(d.email_empresa)} &nbsp; ${escapeHtml(d.telefono_empresa)}
        </div>
      </div>
      <div class="header-right">
        <div><b>RUC:</b> ${escapeHtml(d.ruc_empresa)}</div>
        <div><b>Timbrado N°:</b> ${escapeHtml(d.num_timbrado)}</div>
        <div><b>Inicio de vigencia:</b> ${escapeHtml(d.fecha_inicio_vigencia)}</div>
        <div class="doc-tipo">${escapeHtml(d.tipo_documento)}</div>
        <div class="doc-num"><b>N°:</b> ${escapeHtml(d.num_factura)}</div>
      </div>
    </div>
  </div>

  <div class="bloque">
    <div class="receptor">
      <div class="col-left"><b>Fecha de emisión:</b> ${escapeHtml(d.fecha_emision)}</div>
      ${esFacturaElectronica
        ? `<div class="col-right"><b>Condición de venta:</b> ${escapeHtml(d.condicion_venta)}</div>`
        : `<div class="col-right">&nbsp;</div>`}

      <div class="col-left"><b>RUC/documento de identidad:</b> ${escapeHtml(d.ruc_receptor)}</div>
      ${esFacturaElectronica
        ? `<div class="col-right"><b>Cuotas:</b> ${escapeHtml(String(d.cuotas))}</div>`
        : `<div class="col-right">&nbsp;</div>`}

      <div class="col-left"><b>Código Cliente:</b> ${escapeHtml(d.codigo_cliente)}</div>
      <div class="col-right">&nbsp;</div>

      <div class="col-left"><b>Nombre o razón social:</b> ${escapeHtml(d.nombre_cliente)}</div>
      <div class="col-right"><b>Moneda:</b> ${escapeHtml(d.moneda)}</div>

      <div class="col-left" style="padding-top:4px;"><b>Tipo de transacción:</b> Prestación de servicios</div>
      <div class="col-right" style="padding-top:4px;"><b>Dirección:</b> ${escapeHtml(d.direccion)}</div>

      <div class="col-left">&nbsp;</div>
      <div class="col-right"><b>Correo electrónico:</b> ${escapeHtml(d.email)}</div>

      <div class="col-left">&nbsp;</div>
      <div class="col-right" style="padding-bottom:4px;"><b>Tipo de cambio:</b> <span data-number="${d.tipo_cambio}">${d.tipo_cambio}</span></div>
    </div>
  </div>

  <div class="tabla-bloque">
    <table>
      <colgroup>
        <col class="c-cod"><col class="c-desc"><col class="c-uni"><col class="c-cant">
        <col class="c-pu"><col class="c-desc2"><col class="c-ex"><col class="c-5"><col class="c-10">
      </colgroup>
      <thead>
        <tr>
          <th class="c-cod" rowspan="2">Código</th>
          <th class="c-desc" rowspan="2">Descripción</th>
          <th class="c-uni" rowspan="2">Unidad</th>
          <th class="c-cant" rowspan="2">Cantidad</th>
          <th class="c-pu" rowspan="2">Precio<br>Unitario</th>
          <th class="c-desc2" rowspan="2">Desc.</th>
          <th colspan="3">Valor de Venta</th>
        </tr>
        <tr>
          <th class="c-ex">Exentas</th>
          <th class="c-5">5%</th>
          <th class="c-10">10%</th>
        </tr>
      </thead>
      <tbody class="datos">
        ${itemsHtml}
      </tbody>
      <tbody class="relleno">
        <tr>
          <td class="c-cod"></td><td class="c-desc"></td><td class="c-uni"></td>
          <td class="c-cant"></td><td class="c-pu"></td><td class="c-desc2"></td>
          <td class="c-ex"></td><td class="c-5"></td><td class="c-10"></td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="sub">
          <td colspan="6" class="fw">SUBTOTAL</td>
          <td class="tr">0</td>
          <td class="tr">0</td>
          <td class="tr" data-number="${d.subtotal}">${d.subtotal}</td>
        </tr>
        <tr class="sub">
          <td colspan="8" class="fw">TOTAL DE LA OPERACIÓN</td>
          <td class="tr" data-number="${d.total_operacion}">${d.total_operacion}</td>
        </tr>
        <tr class="guar">
          <td colspan="8" class="fw">TOTAL EN GUARANÍES</td>
          <td class="tr" data-number="${d.total_guaranies}">${d.total_guaranies}</td>
        </tr>
        <tr class="iva">
          <td colspan="3" class="fw">LIQUIDACIÓN IVA</td>
          <td colspan="2">(5%) &nbsp; <span data-number="${d.iva_cinco}">${d.iva_cinco}</span></td>
          <td colspan="2">(10%) &nbsp; <span data-number="${d.iva_diez}">${d.iva_diez}</span></td>
          <td colspan="2" class="fw">TOTAL IVA: &nbsp; <span data-number="${d.total_iva}">${d.total_iva}</span></td>
        </tr>
        <tr class="info">
          <td colspan="9">Info fiscal</td>
        </tr>
      </tfoot>
    </table>
  </div>

</div>

<button class="btn-imprimir" onclick="window.print()">📥 Descargar PDF</button>

<script>
function formatNumberPY(value) {
  if (!value || value == 0) return '0';
  const num = parseFloat(value);
  if (Number.isInteger(num)) return num.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.');
  const parts = num.toFixed(2).split('.');
  const integerPart = parts[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.');
  if (parts[1] === '00') return integerPart;
  if (parts[1].endsWith('0')) return integerPart + ',' + parts[1][0];
  return integerPart + ',' + parts[1];
}
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-number]').forEach(el => {
    el.textContent = formatNumberPY(el.getAttribute('data-number'));
  });
  if (new URLSearchParams(window.location.search).get('print') === '1') {
    setTimeout(() => window.print(), 500);
  }
});
</script>
</body>
</html>`;
}
