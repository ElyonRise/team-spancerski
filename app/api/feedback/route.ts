export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })

  if (session.role === 'pro') {
    const result = await db.query(
      `SELECT f.*, u.name as client_name FROM feedbacks f
       LEFT JOIN users u ON f.client_id = u.id
       ORDER BY f.created_at DESC`
    )
    return NextResponse.json(result.rows)
  }

  const result = await db.query(
    'SELECT * FROM feedbacks WHERE client_id=$1 ORDER BY created_at DESC',
    [session.id]
  )
  return NextResponse.json(result.rows)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })

  const { mensagem, tipo, feedback_id, resposta } = await req.json()

  if (session.role === 'pro' && feedback_id && resposta) {
    await db.query(
      `UPDATE feedbacks SET resposta=$1, lido=true, respondido_at=NOW() WHERE id=$2`,
      [resposta, feedback_id]
    )
    return NextResponse.json({ ok: true })
  }

  if (!mensagem) return NextResponse.json({ error: 'Mensagem obrigatoria' }, { status: 400 })

  const result = await db.query(
    `INSERT INTO feedbacks (client_id, mensagem, tipo, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id`,
    [session.id, mensagem, tipo || 'geral']
  )
  return NextResponse.json({ ok: true, id: result.rows[0].id })
}
