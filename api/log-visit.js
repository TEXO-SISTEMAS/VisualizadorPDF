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

async function getGeo(ip) {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,isp,status&lang=es`);
    const data = await res.json();
    if (data.status === 'success') {
      return { pais: data.country, ciudad: data.city, isp: data.isp };
    }
  } catch {}
  return { pais: null, ciudad: null, isp: null };
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

    const { pais, ciudad, isp } = await getGeo(ip);

    await db.query(
      `INSERT INTO visitas (ip, dispositivo, navegador, sistema_operativo, pagina, pais, ciudad, isp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [ip, dispositivo, navegador, so, pagina, pais, ciudad, isp]
    );

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
