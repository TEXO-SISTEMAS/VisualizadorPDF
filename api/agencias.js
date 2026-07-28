import pool from '../lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const result = await pool.query(
      'SELECT DISTINCT nombre FROM empresas ORDER BY nombre'
    );
    res.json(result.rows.map(r => r.nombre));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
