import pool from '../lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const result = await pool.query(
      'SELECT DISTINCT tipo_documento FROM facturas WHERE tipo_documento IS NOT NULL ORDER BY tipo_documento'
    );
    res.json(result.rows.map(r => r.tipo_documento));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
