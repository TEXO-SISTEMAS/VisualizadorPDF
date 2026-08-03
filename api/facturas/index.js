import db from '../../lib/db.js';
import { getUser } from '../../lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization');

  const user = getUser(req);
  if (!user) return res.status(401).json({ error: 'No autenticado' });

  try {
    const { empresa, agencia, q, tipo, page = 1 } = req.query;
    const empresaNombre = empresa || agencia;
    const perPage = 10;
    const offset = (parseInt(page) - 1) * perPage;

    const conditions = [];
    const params = [];

    // Restricción por empresas del usuario
    if (user.rol !== 'admin' && user.empresa_ids && user.empresa_ids.length > 0) {
      const placeholders = user.empresa_ids.map(() => '?').join(',');
      conditions.push(`e.id IN (${placeholders})`);
      params.push(...user.empresa_ids);
    }

    if (empresaNombre) {
      conditions.push(`e.nombre LIKE ?`);
      params.push(`%${empresaNombre}%`);
    }
    if (q) {
      conditions.push(`(f.numero LIKE ? OR c.nombre LIKE ?)`);
      params.push(`%${q}%`, `%${q}%`);
    }
    if (tipo) {
      conditions.push(`f.tipo_documento LIKE ?`);
      params.push(`%${tipo}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM facturas f
       JOIN empresas e ON f.empresa_id = e.id
       JOIN clientes c ON f.cliente_id = c.id ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    const dataResult = await db.query(
      `SELECT f.id, f.numero, f.fecha_emision, f.tipo_documento, f.moneda, f.subtotal, f.total,
              e.nombre as empresa_nombre, e.ruc as empresa_ruc,
              c.nombre as cliente_nombre, c.ruc as cliente_ruc
       FROM facturas f
       JOIN empresas e ON f.empresa_id = e.id
       JOIN clientes c ON f.cliente_id = c.id
       ${where}
       ORDER BY f.fecha_emision DESC
       LIMIT ? OFFSET ?`,
      [...params, perPage, offset]
    );

    const facturas = dataResult.rows.map(row => ({
      id: row.id,
      numero: row.numero,
      fecha_emision: row.fecha_emision,
      tipo_documento: row.tipo_documento,
      moneda: row.moneda,
      subtotal: row.subtotal,
      total: row.total,
      empresa: { nombre: row.empresa_nombre, ruc: row.empresa_ruc },
      cliente: { nombre: row.cliente_nombre, ruc: row.cliente_ruc },
    }));

    res.json({
      data: facturas,
      current_page: parseInt(page),
      last_page: Math.ceil(total / perPage),
      total,
      per_page: perPage,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
