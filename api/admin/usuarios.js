import db from '../../lib/db.js';

const KEY = 'texo2024';

export default async function handler(req, res) {
  const { key } = req.query;
  if (key !== KEY) return res.status(401).json({ error: 'No autorizado' });

  if (req.method === 'GET') {
    const rows = await db.query(`
      SELECT u.id, u.nombre, u.email, u.password, u.rol, u.activo, u.created_at,
             e.nombre as empresa_nombre
      FROM usuarios u
      LEFT JOIN empresas e ON u.empresa_id = e.id
      ORDER BY u.id DESC
    `);
    const empresas = await db.query('SELECT id, nombre FROM empresas ORDER BY nombre');
    return res.json({ usuarios: rows.rows, empresas: empresas.rows });
  }

  if (req.method === 'POST') {
    const { nombre, email, password, empresa_id, rol } = req.body;
    if (!nombre || !email || !password) return res.status(400).json({ error: 'Faltan campos' });
    try {
      await db.query(
        `INSERT INTO usuarios (nombre, email, password, empresa_id, rol) VALUES (?, ?, ?, ?, ?)`,
        [nombre, email, password, empresa_id || null, rol || 'usuario']
      );
      return res.json({ ok: true });
    } catch (e) {
      return res.status(400).json({ error: 'Email ya existe' });
    }
  }

  if (req.method === 'PUT') {
    const { id, nombre, email, password, empresa_id, rol, activo } = req.body;
    const fields = [];
    const params = [];
    if (nombre) { fields.push('nombre = ?'); params.push(nombre); }
    if (email) { fields.push('email = ?'); params.push(email); }
    if (password) { fields.push('password = ?'); params.push(password); }
    fields.push('empresa_id = ?'); params.push(empresa_id || null);
    if (rol) { fields.push('rol = ?'); params.push(rol); }
    if (activo !== undefined) { fields.push('activo = ?'); params.push(activo ? 1 : 0); }
    params.push(id);
    await db.query(`UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`, params);
    return res.json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
    return res.json({ ok: true });
  }

  res.status(405).end();
}
