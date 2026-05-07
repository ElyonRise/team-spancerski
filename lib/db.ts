// lib/db.ts
// Exporta tanto o cliente pg nativo (db + setupDB) usado pelas APIs
// quanto o Prisma Client (prisma) usado em app/pro/page.tsx

import { Pool } from 'pg'
import { PrismaClient } from '@prisma/client'

// ─── pg nativo (usado em todas as rotas de API) ───────────────────────────────

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export const db = pool

export async function setupDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      name          TEXT NOT NULL,
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'client',
      phone         TEXT,
      goal          TEXT,
      weight_start  NUMERIC,
      height_cm     NUMERIC,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS dietas (
      id          SERIAL PRIMARY KEY,
      client_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
      nome        TEXT,
      conteudo    TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS checkins (
      id          SERIAL PRIMARY KEY,
      client_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
      peso        NUMERIC,
      obs         TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS motivacao_streak (
      id          SERIAL PRIMARY KEY,
      client_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS feedbacks (
      id          SERIAL PRIMARY KEY,
      client_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
      texto       TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS galeria (
      id          SERIAL PRIMARY KEY,
      client_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
      url         TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS compras (
      id          SERIAL PRIMARY KEY,
      client_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
      descricao   TEXT,
      valor       NUMERIC,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS imc_registros (
      id          SERIAL PRIMARY KEY,
      client_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
      peso        NUMERIC,
      altura      NUMERIC,
      imc         NUMERIC,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `)
}

// ─── Prisma Client (usado em app/pro/page.tsx) ────────────────────────────────

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
