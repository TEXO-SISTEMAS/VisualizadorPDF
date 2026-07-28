import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_TOKEN,
});

// Wrapper que imita la interfaz de pg: pool.query(sql, params) -> { rows }
async function query(sql, params = []) {
  const result = await client.execute({ sql, args: params });
  return { rows: result.rows };
}

export default { query };
