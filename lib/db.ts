import { Pool } from 'pg'

declare global {
  var _pgPool: Pool | undefined
}

const pool = global._pgPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
})

if (process.env.NODE_ENV !== 'production') global._pgPool = pool

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
}

export async function setupDB() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'client',
      phone VARCHAR(50),
      goal VARCHAR(100),
      weight_start NUMERIC(5,2),
      height_cm INT,
      reset_token VARCHAR(255),
      reset_expires TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS dietas (
      id SERIAL PRIMARY KEY,
      client_id INT REFERENCES users(id) ON DELETE CASCADE,
      nome VARCHAR(255) NOT NULL,
      conteudo_raw TEXT,
      protocolo JSONB,
      kcal INT,
      proteina INT,
      carboidratos INT,
      gorduras INT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS lista_compras (
      id SERIAL PRIMARY KEY,
      client_id INT REFERENCES users(id) ON DELETE CASCADE,
      dieta_id INT REFERENCES dietas(id) ON DELETE CASCADE,
      itens JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS registros_imc (
      id SERIAL PRIMARY KEY,
      client_id INT REFERENCES users(id) ON DELETE CASCADE,
      peso NUMERIC(5,2),
      altura INT,
      imc NUMERIC(4,2),
      categoria VARCHAR(50),
      recorded_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS fotos_progresso (
      id SERIAL PRIMARY KEY,
      client_id INT REFERENCES users(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      tipo VARCHAR(20) DEFAULT 'progress',
      descricao TEXT,
      data_foto DATE,
      uploaded_by VARCHAR(20) DEFAULT 'client',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS motivacao_streak (
      id SERIAL PRIMARY KEY,
      client_id INT REFERENCES users(id) ON DELETE CASCADE,
      data DATE NOT NULL,
      UNIQUE(client_id, data)
    );
  `)
}
