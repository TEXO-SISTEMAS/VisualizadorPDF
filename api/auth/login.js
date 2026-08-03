import db from '../../lib/db.js';
import { signToken } from '../../lib/auth.js';
import { logWithGeo } from '../../lib/logger.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Faltan campos' });

  const result = await db.query(
    `SELECT id, nombre, email, rol, activo FROM usuarios WHERE email = ? AND password = ?`,
    [email.trim().toLowerCase(), password]
  );

  if (!result.rows.length) {
    return res.status(401).json({ error: 'Email o contraseña incorrectos' });
  }

  const user = result.rows[0];

  if (!user.activo) {
    return res.status(403).json({ error: 'Usuario inactivo. Contactá al administrador.' });
  }

  const empresasRes = await db.query(
    `SELECT e.id, e.nombre FROM usuario_empresas ue JOIN empresas e ON ue.empresa_id = e.id WHERE ue.usuario_id = ?`,
    [user.id]
  );

  const token = signToken({
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    empresa_ids: empresasRes.rows.map(e => e.id),
    empresas: empresasRes.rows.map(e => e.nombre),
  });

  // Registrar login con geolocalización
  logWithGeo({
    req,
    usuario_id: user.id,
    usuario_email: user.email,
    usuario_nombre: user.nombre,
    accion: 'login',
    detalle: { rol: user.rol },
  }).catch(() => {});

  res.json({ token, nombre: user.nombre, rol: user.rol });
}
