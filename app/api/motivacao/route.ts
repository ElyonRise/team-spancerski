export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'

import { db } from '@/lib/db'

import { getSession } from '@/lib/auth'



export async function GET() {

  const session = await getSession()

  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const result = await db.query(

    'SELECT data FROM motivacao_streak WHERE client_id=$1 ORDER BY data DESC LIMIT 30',

    [session.id]

  )

  return NextResponse.json(result.rows.map((r: any) => r.data))

}



export async function POST() {

  const session = await getSession()

  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const today = new Date().toISOString().split('T')[0]

  await db.query(

    'INSERT INTO motivacao_streak (client_id, data) VALUES ($1,$2) ON CONFLICT DO NOTHING',

    [session.id, today]

  )

  return NextResponse.json({ ok: true })

}
