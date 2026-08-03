import db from './db.js';

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  await db.query(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      usuario_email TEXT,
      usuario_nombre TEXT,
      accion TEXT NOT NULL,
      detalle TEXT,
      ip TEXT,
      pais TEXT,
      ciudad TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  tableReady = true;
}

async function getGeo(ip) {
  if (!ip || ip === '127.0.0.1' || ip.startsWith('::')) return {};
  try {
    const r = await fetch(`http://ip-api.com/json/${ip}?fields=country,city&lang=es`);
    const d = await r.json();
    return { pais: d.country || null, ciudad: d.city || null };
  } catch {
    return {};
  }
}

export function getIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket?.remoteAddress
    || null;
}

export async function log({ usuario_id, usuario_email, usuario_nombre, accion, detalle, ip, pais, ciudad }) {
  try {
    await ensureTable();
    await db.query(
      `INSERT INTO logs (usuario_id, usuario_email, usuario_nombre, accion, detalle, ip, pais, ciudad)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        usuario_id ?? null,
        usuario_email ?? null,
        usuario_nombre ?? null,
        accion,
        detalle ? JSON.stringify(detalle) : null,
        ip ?? null,
        pais ?? null,
        ciudad ?? null,
      ]
    );
  } catch (e) {
    console.error('Logger error:', e.message);
  }
}

export async function logWithGeo({ req, usuario_id, usuario_email, usuario_nombre, accion, detalle }) {
  const ip = getIp(req);
  const geo = await getGeo(ip);
  await log({ usuario_id, usuario_email, usuario_nombre, accion, detalle, ip, ...geo });
}
