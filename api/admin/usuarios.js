import db from '../../lib/db.js';

const KEY = 'texo2024';

export default async function handler(req, res) {
  const { key } = req.query;
  if (key !== KEY) return res.status(401).json({ error: 'No autorizado' });

  if (req.method === 'GET') {
    const usuarios = await db.query(`
      SELECT u.id, u.nombre, u.email, u.password, u.rol, u.activo, u.created_at
      FROM usuarios u ORDER BY u.id DESC
    `);

    // Empresas asignadas por usuario
    const asignaciones = await db.query(`
      SELECT ue.usuario_id, e.id as empresa_id, e.nombre as empresa_nombre
      FROM usuario_empresas ue
      JOIN empresas e ON ue.empresa_id = e.id
    `);

    // Agrupar empresas por usuario
    const mapaEmpresas = {};
    for (const a of asignaciones.rows) {
      if (!mapaEmpresas[a.usuario_id]) mapaEmpresas[a.usuario_id] = [];
      mapaEmpresas[a.usuario_id].push({ id: a.empresa_id, nombre: a.empresa_nombre });
    }

    const usuariosConEmpresas = usuarios.rows.map(u => ({
      ...u,
      empresas: mapaEmpresas[u.id] || [],
    }));

    const empresas = await db.query('SELECT id, nombre FROM empresas ORDER BY nombre');
    return res.json({ usuarios: usuariosConEmpresas, empresas: empresas.rows });
  }

  if (req.method === 'POST') {
    const { nombre, email, password, empresa_ids = [], rol } = req.body;
    if (!nombre || !email || !password) return res.status(400).json({ error: 'Faltan campos' });
    try {
      const result = await db.query(
        `INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)`,
        [nombre, email, password, rol || 'usuario']
      );
      const userId = result.lastInsertRowid;
      for (const eid of empresa_ids) {
        await db.query(`INSERT OR IGNORE INTO usuario_empresas (usuario_id, empresa_id) VALUES (?, ?)`, [userId, eid]);
      }
      return res.json({ ok: true });
    } catch (e) {
      return res.status(400).json({ error: 'Email ya existe' });
    }
  }

  if (req.method === 'PUT') {
    const { id, nombre, email, password, empresa_ids = [], rol, activo } = req.body;
    const fields = [];
    const params = [];
    if (nombre) { fields.push('nombre = ?'); params.push(nombre); }
    if (email)  { fields.push('email = ?');  params.push(email); }
    if (password) { fields.push('password = ?'); params.push(password); }
    if (rol)    { fields.push('rol = ?');    params.push(rol); }
    if (activo !== undefined) { fields.push('activo = ?'); params.push(activo ? 1 : 0); }
    if (fields.length) {
      params.push(id);
      await db.query(`UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`, params);
    }
    // Reemplazar empresas asignadas
    await db.query(`DELETE FROM usuario_empresas WHERE usuario_id = ?`, [id]);
    for (const eid of empresa_ids) {
      await db.query(`INSERT OR IGNORE INTO usuario_empresas (usuario_id, empresa_id) VALUES (?, ?)`, [id, eid]);
    }
    return res.json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    await db.query('DELETE FROM usuario_empresas WHERE usuario_id = ?', [id]);
    await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
    return res.json({ ok: true });
  }

  res.status(405).end();
}
