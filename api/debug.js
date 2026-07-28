export default async function handler(req, res) {
  const info = {
    node_version: process.version,
    env_vars: {
      DB_HOST: process.env.DB_HOST ? 'SET' : 'MISSING',
      DB_PORT: process.env.DB_PORT ? 'SET' : 'MISSING',
      DB_DATABASE: process.env.DB_DATABASE ? 'SET' : 'MISSING',
      DB_USERNAME: process.env.DB_USERNAME ? 'SET' : 'MISSING',
      DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'MISSING',
    },
  };

  try {
    const { default: pool } = await import('../lib/db.js');
    const result = await pool.query('SELECT 1 as ok');
    info.db_connection = 'OK';
    info.db_result = result.rows[0];
  } catch (e) {
    info.db_connection = 'FAILED';
    info.db_error = e.message;
    info.db_error_code = e.code;
  }

  res.json(info);
}
