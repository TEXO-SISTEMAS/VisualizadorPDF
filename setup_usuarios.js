import { createClient } from '@libsql/client';

const c = createClient({ url: process.env.TURSO_URL, authToken: process.env.TURSO_TOKEN });

await c.execute(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    empresa_id INTEGER,
    rol TEXT DEFAULT 'usuario',
    activo INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

// Usuario admin por defecto
await c.execute(`
  INSERT OR IGNORE INTO usuarios (nombre, email, password, empresa_id, rol)
  VALUES ('Danilo Sosa', 'danilo.sosa@texo.com.py', 'cambiar123', NULL, 'admin')
`);

console.log('Tabla usuarios creada. Admin: danilo.sosa@texo.com.py / cambiar123');
c.close();
