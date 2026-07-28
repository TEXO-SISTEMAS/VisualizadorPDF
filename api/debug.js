export default async function handler(req, res) {
  const info = {
    node_version: process.version,
    env_vars: {
      TURSO_URL: process.env.TURSO_URL ? 'SET' : 'MISSING',
      TURSO_TOKEN: process.env.TURSO_TOKEN ? 'SET' : 'MISSING',
    },
  };

  try {
    const { default: db } = await import('../lib/db.js');
    const result = await db.query('SELECT COUNT(*) as total FROM facturas');
    info.db_connection = 'OK';
    info.facturas_count = result.rows[0].total;
  } catch (e) {
    info.db_connection = 'FAILED';
    info.db_error = e.message;
  }

  res.json(info);
}
