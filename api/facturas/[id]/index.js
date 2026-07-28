import pool from '../../../lib/db.js';
import { renderFactura } from '../../../lib/template.js';
import { readFileSync } from 'fs';
import { join } from 'path';

const logosMap = {
  1: 'WILPAR.png', 2: 'brick.jpg', 3: 'ENE S.A..png',
  4: 'FUNDACION TEXO PARA EL ARTE.png', 5: 'MEDIABRAND.png',
  6: 'LA MEDIA DE LUPE S.A..png', 7: 'PUBLICITARIA NASTA S.A..png',
  8: 'PROJECT SOCIEDAD ANONIMA.png', 9: 'ROW COMMS E.A.S..png',
  10: 'TEXO S.A.png', 11: 'VILA ROMANA.png',
};

function getLogoBase64(empresaId) {
  const logoFile = logosMap[empresaId] || 'WILPAR.png';
  const logoPath = join(process.cwd(), 'public', logoFile);
  try {
    const ext = logoFile.split('.').pop().toLowerCase();
    const mimeType = (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : 'image/png';
    const data = readFileSync(logoPath);
    return `data:${mimeType};base64,${data.toString('base64')}`;
  } catch {
    const fallback = readFileSync(join(process.cwd(), 'public', 'WILPAR.png'));
    return `data:image/png;base64,${fallback.toString('base64')}`;
  }
}

function formatDate(dateVal) {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getDate())}-${pad(d.getMonth()+1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatDateShort(dateVal) {
  if (!dateVal) return '30-10-2024';
  const d = new Date(dateVal);
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getDate())}-${pad(d.getMonth()+1)}-${d.getFullYear()}`;
}

function formatNumber(val, decimals = 0) {
  return parseFloat(val || 0).toLocaleString('es-PY', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    const facturaResult = await pool.query(
      `SELECT f.*,
        e.nombre as empresa_nombre, e.ruc as empresa_ruc, e.dv as empresa_dv,
        e.numero_timbrado, e.actividad_economica,
        e.direccion as empresa_direccion, e.ciudad as empresa_ciudad,
        e.email as empresa_email, e.telefono as empresa_telefono,
        e.fecha_inicio_vigencia,
        c.nombre as cliente_nombre, c.ruc as cliente_ruc, c.dv as cliente_dv,
        c.codigo_cliente, c.direccion as cliente_direccion, c.email as cliente_email
       FROM facturas f
       JOIN empresas e ON f.empresa_id = e.id
       JOIN clientes c ON f.cliente_id = c.id
       WHERE f.id = $1`,
      [id]
    );

    if (facturaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    const f = facturaResult.rows[0];
    const itemsResult = await pool.query(
      'SELECT * FROM items_factura WHERE factura_id = $1 ORDER BY id',
      [id]
    );

    const items = itemsResult.rows.map((item, index) => ({
      codigo: index + 1,
      descripcion: item.descripcion,
      unidad: item.unidad_medida || 'UNI',
      cantidad: parseInt(item.cantidad || 0),
      precio_unitario: formatNumber(item.precio_unitario),
      descuento: '0',
      exentas: '0',
      cinco_porciento: '0',
      diez_porciento: formatNumber(item.total_item, 2),
    }));

    const datos = {
      logo_base64: getLogoBase64(f.empresa_id),
      ruc_empresa: `${f.empresa_ruc}-${f.empresa_dv}`,
      num_timbrado: f.numero_timbrado || '',
      num_factura: f.numero,
      fecha_emision: formatDate(f.fecha_emision),
      ruc_receptor: `${f.cliente_ruc}-${f.cliente_dv}`,
      codigo_cliente: f.codigo_cliente || '',
      nombre_cliente: f.cliente_nombre,
      condicion_venta: f.desc_tipo_operacion || 'Crédito',
      cuotas: f.cuotas || 1,
      moneda: `${f.moneda || 'USD'} Dollar`,
      direccion: f.cliente_direccion || '',
      email: f.cliente_email || '',
      tipo_cambio: f.tasa_cambio || 0,
      nombre_empresa: f.empresa_nombre,
      actividad_empresa: f.actividad_economica || '',
      direccion_empresa: f.empresa_direccion || '',
      ciudad_empresa: f.empresa_ciudad || 'ASUNCION (DISTRITO)',
      email_empresa: f.empresa_email || '',
      telefono_empresa: f.empresa_telefono || '',
      fecha_inicio_vigencia: formatDateShort(f.fecha_inicio_vigencia),
      tipo_documento: f.tipo_documento || 'Factura electrónica',
      items,
      subtotal: f.subtotal || 0,
      total_operacion: f.subtotal || 0,
      total_guaranies: Math.round(f.total || 0),
      iva_cinco: 0,
      iva_diez: f.iva || 0,
      total_iva: f.iva || 0,
      factura_id: f.id,
    };

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderFactura(datos));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
