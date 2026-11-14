// lib/anamnese.ts — SOMENTE servidor (usa o banco). O schema das perguntas está em lib/anamnese-schema.ts

import { db } from '@/lib/db'

// ─── Tabelas ────────────────────────────────────────────────────────────────

let ready: Promise<void> | null = null

export function ensureAnamneseTables(): Promise<void> {
  if (!ready) {
    ready = db.query(`
      CREATE TABLE IF NOT EXISTS anamneses (
        id               SERIAL PRIMARY KEY,
        client_id        INT REFERENCES users(id) ON DELETE CASCADE,
        token            VARCHAR(64) UNIQUE NOT NULL,
        status           VARCHAR(20) NOT NULL DEFAULT 'pendente',
        dados            JSONB NOT NULL DEFAULT '{}',
        assinatura_nome  TEXT,
        consentimento    BOOLEAN DEFAULT FALSE,
        expires_at       TIMESTAMPTZ NOT NULL,
        submitted_at     TIMESTAMPTZ,
        created_at       TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS anamnese_fotos (
        id           SERIAL PRIMARY KEY,
        anamnese_id  INT REFERENCES anamneses(id) ON DELETE CASCADE,
        posicao      VARCHAR(20) NOT NULL,
        url          TEXT NOT NULL,
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (anamnese_id, posicao)
      );
    `).then(() => undefined).catch(e => { ready = null; throw e })
  }
  return ready
}
