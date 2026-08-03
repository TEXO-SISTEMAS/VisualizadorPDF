import db from '../lib/db.js';
import { log, getIp } from '../lib/logger.js';
import { getUser } from '../lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // POST — recibir evento desde el cliente
  if (req.method === 'POST') {
    const user = getUser(req);
    if (!user) return res.status(401).json({ error: 'No autenticado' });
    const { accion, detalle } = req.body || {};
    if (!accion) return res.status(400).end();
    const ip = getIp(req);
    await log({ usuario_id: user.id, usuario_email: user.email, usuario_nombre: user.nombre, accion, detalle, ip });
    return res.json({ ok: true });
  }

  // GET — panel de administración
  if (req.method === 'GET') {
    const { key, page = 1, usuario, accion } = req.query;
    if (key !== 'texo2024') return res.status(401).json({ error: 'No autorizado' });

    const perPage = 60;
    const offset = (parseInt(page) - 1) * perPage;
    const conditions = [];
    const params = [];

    if (usuario) {
      conditions.push('(usuario_email LIKE ? OR usuario_nombre LIKE ?)');
      params.push(`%${usuario}%`, `%${usuario}%`);
    }
    if (accion) {
      conditions.push('accion = ?');
      params.push(accion);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    try {
      const totalRes = await db.query(`SELECT COUNT(*) as n FROM logs ${where}`, params);
      const total = parseInt(totalRes.rows[0].n);
      const rows = await db.query(
        `SELECT * FROM logs ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
        [...params, perPage, offset]
      );
      return res.json({ logs: rows.rows, total, page: parseInt(page), pages: Math.ceil(total / perPage) });
    } catch {
      // La tabla puede no existir aún
      return res.json({ logs: [], total: 0, page: 1, pages: 1 });
    }
  }

  res.status(405).end();
}
