import db from '../lib/db.js';

export default async function handler(req, res) {
  // Proteccion minima con password en query string: /api/admin-visitas?key=texo2024
  const { key, page = 1 } = req.query;
  if (key !== 'texo2024') {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const perPage = 50;
  const offset = (parseInt(page) - 1) * perPage;

  const countRes = await db.query('SELECT COUNT(*) as total FROM visitas');
  const total = parseInt(countRes.rows[0].total);

  const rows = await db.query(
    `SELECT id, ip, dispositivo, navegador, sistema_operativo, pagina, created_at
     FROM visitas ORDER BY id DESC LIMIT ? OFFSET ?`,
    [perPage, offset]
  );

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Control de Accesos - Texo Sistemas</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #0f1117; color: #e2e8f0; padding: 24px; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    p.sub { color: #718096; font-size: 13px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #1a1f2e; padding: 10px 12px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid #2d3748; }
    td { padding: 9px 12px; border-bottom: 1px solid #1e2330; vertical-align: top; }
    tr:hover td { background: #1a1f2e; }
    .ip { font-family: monospace; color: #68d391; }
    .nav { color: #63b3ed; }
    .pag { color: #fbd38d; font-size: 11px; }
    .date { color: #718096; font-size: 11px; }
    .pag-nav { margin-top: 16px; display: flex; gap: 8px; }
    .pag-nav a { color: #63b3ed; text-decoration: none; padding: 6px 12px; border: 1px solid #2d3748; border-radius: 4px; font-size: 13px; }
    .total { color: #a0aec0; font-size: 13px; margin-top: 6px; }
  </style>
</head>
<body>
  <h1>Control de Accesos</h1>
  <p class="sub">Texo Sistemas — Visualizador de Facturas</p>
  <p class="total">Total de visitas: <strong>${total}</strong> | Página ${page}</p>
  <br>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>IP</th>
        <th>Dispositivo</th>
        <th>Navegador</th>
        <th>Sistema</th>
        <th>Página</th>
        <th>Fecha (UTC)</th>
      </tr>
    </thead>
    <tbody>
      ${rows.rows.map(r => `
      <tr>
        <td class="date">${r.id}</td>
        <td class="ip">${r.ip}</td>
        <td>${r.dispositivo}</td>
        <td class="nav">${r.navegador}</td>
        <td>${r.sistema_operativo}</td>
        <td class="pag">${r.pagina}</td>
        <td class="date">${r.created_at}</td>
      </tr>`).join('')}
    </tbody>
  </table>
  <div class="pag-nav">
    ${parseInt(page) > 1 ? `<a href="?key=${key}&page=${parseInt(page)-1}">← Anterior</a>` : ''}
    ${offset + perPage < total ? `<a href="?key=${key}&page=${parseInt(page)+1}">Siguiente →</a>` : ''}
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
}
