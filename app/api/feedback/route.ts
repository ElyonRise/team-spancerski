export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })

  const url = new URL(req.url)
  const countOnly = url.searchParams.get('count') === '1'

  if (session.role === 'pro') {
    if (countOnly) {
      const r = await db.query('SELECT COUNT(*) as total FROM feedbacks WHERE lido=false')
      return NextResponse.json({ nao_lidos: parseInt(r.rows[0]?.total || '0') })
    }
    const result = await db.query(
      `SELECT f.*, u.name as client_name FROM feedbacks f
       LEFT JOIN users u ON f.client_id = u.id
       ORDER BY f.lido ASC, f.created_at DESC`
    )
    return NextResponse.json(result.rows)
  }

  if (countOnly) {
    const r = await db.query(
      'SELECT COUNT(*) as total FROM feedbacks WHERE client_id=$1 AND resposta IS NOT NULL AND lido=false',
      [session.id]
    )
    return NextResponse.json({ nao_lidos: parseInt(r.rows[0]?.total || '0') })
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
    const fb = await db.query('SELECT client_id FROM feedbacks WHERE id=$1', [feedback_id])
    if (fb.rows[0]) {
      await db.query('UPDATE feedbacks SET lido=false WHERE id=$1', [feedback_id])
    }
    return NextResponse.json({ ok: true })
  }

  if (!mensagem) return NextResponse.json({ error: 'Mensagem obrigatoria' }, { status: 400 })

  const result = await db.query(
    `INSERT INTO feedbacks (client_id, mensagem, tipo, lido, created_at) VALUES ($1, $2, $3, false, NOW()) RETURNING id`,
    [session.id, mensagem, tipo || 'geral']
  )

  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notificar-pro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: session.id, mensagem, tipo })
    })
  } catch {}

  return NextResponse.json({ ok: true, id: result.rows[0].id })
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })

  const { feedback_id } = await req.json()
  if (feedback_id) {
    await db.query('UPDATE feedbacks SET lido=true WHERE id=$1', [feedback_id])
  }
  return NextResponse.json({ ok: true })
}
