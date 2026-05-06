export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/lib/db'

import { getSession } from '@/lib/auth'

import { parseDietWithAI } from '@/lib/groq'



// GET: buscar dieta do cliente

export async function GET(req: NextRequest) {

  const session = await getSession()

  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })



  const { searchParams } = new URL(req.url)

  const clientId = session.role === 'pro' ? searchParams.get('client_id') : session.id



  const result = await db.query(

    'SELECT * FROM dietas WHERE client_id=$1 ORDER BY created_at DESC LIMIT 5',

    [clientId]

  )

  return NextResponse.json(result.rows)

}



// POST: criar dieta (apenas profissional) — chama a IA para parsear

export async function POST(req: NextRequest) {

  const session = await getSession()

  if (!session || session.role !== 'pro') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })



  const { client_id, nome, conteudo_raw } = await req.json()

  if (!client_id || !conteudo_raw) return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })



  // Chama Groq IA para estruturar a dieta

  const parsed = await parseDietWithAI(conteudo_raw)



  const result = await db.query(

    `INSERT INTO dietas (client_id, nome, conteudo_raw, protocolo, kcal, proteina, carboidratos, gorduras)

     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,

    [client_id, nome || 'Protocolo Nutricional', conteudo_raw, JSON.stringify(parsed.protocolo),

     parsed.kcal, parsed.proteina, parsed.carboidratos, parsed.gorduras]

  )



  // Salvar lista de compras automaticamente

  if (parsed.lista_compras?.length > 0) {

    await db.query(

      'INSERT INTO lista_compras (client_id, dieta_id, itens) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',

      [client_id, result.rows[0].id, JSON.stringify(parsed.lista_compras)]

    )

  }



  return NextResponse.json({ ok: true, id: result.rows[0].id, parsed })

}



// DELETE: remover dieta

export async function DELETE(req: NextRequest) {

  const session = await getSession()

  if (!session || session.role !== 'pro') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)

  await db.query('DELETE FROM dietas WHERE id=$1', [searchParams.get('id')])

  return NextResponse.json({ ok: true })

}
