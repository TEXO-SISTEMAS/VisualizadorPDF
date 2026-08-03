import db from '../lib/db.js';
import { getUser } from '../lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization');

  const user = getUser(req);
  if (!user) return res.status(401).json({ error: 'No autenticado' });

  try {
    let rows;
    if (user.rol === 'admin' || !user.empresa_ids || user.empresa_ids.length === 0) {
      const result = await db.query('SELECT DISTINCT nombre FROM empresas ORDER BY nombre');
      rows = result.rows;
    } else {
      const placeholders = user.empresa_ids.map(() => '?').join(',');
      const result = await db.query(
        `SELECT nombre FROM empresas WHERE id IN (${placeholders}) ORDER BY nombre`,
        user.empresa_ids
      );
      rows = result.rows;
    }
    res.json(rows.map(r => r.nombre));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
