import db from '../lib/db.js';

function parseUserAgent(ua) {
  if (!ua) return { dispositivo: 'Desconocido', navegador: 'Desconocido', so: 'Desconocido' };

  let so = 'Desconocido';
  if (ua.includes('Windows NT 10')) so = 'Windows 10/11';
  else if (ua.includes('Windows NT 6')) so = 'Windows 7/8';
  else if (ua.includes('Mac OS X')) so = 'macOS';
  else if (ua.includes('Android')) so = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) so = 'iOS';
  else if (ua.includes('Linux')) so = 'Linux';

  let navegador = 'Desconocido';
  if (ua.includes('Edg/')) navegador = 'Edge';
  else if (ua.includes('OPR/') || ua.includes('Opera')) navegador = 'Opera';
  else if (ua.includes('Chrome/')) navegador = 'Chrome';
  else if (ua.includes('Firefox/')) navegador = 'Firefox';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) navegador = 'Safari';

  const dispositivo = ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone') ? 'Móvil' : 'PC/Escritorio';

  return { dispositivo, navegador, so };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.headers['x-real-ip']
      || 'Desconocida';

    const ua = req.headers['user-agent'] || '';
    const { dispositivo, navegador, so } = parseUserAgent(ua);
    const pagina = req.body?.pagina || '/';

    await db.query(
      `INSERT INTO visitas (ip, dispositivo, navegador, sistema_operativo, pagina) VALUES (?, ?, ?, ?, ?)`,
      [ip, dispositivo, navegador, so, pagina]
    );

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
