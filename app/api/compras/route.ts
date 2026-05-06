import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/lib/db'

import { getSession } from '@/lib/auth'



export async function GET(req: NextRequest) {

  const session = await getSession()

  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })



  const clientId = session.role === 'pro'

    ? new URL(req.url).searchParams.get('client_id')

    : session.id



  const result = await db.query(

    'SELECT lc.*, d.nome as dieta_nome FROM lista_compras lc LEFT JOIN dietas d ON lc.dieta_id=d.id WHERE lc.client_id=$1 ORDER BY lc.created_at DESC LIMIT 1',

    [clientId]

  )

  return NextResponse.json(result.rows[0] || null)

}
