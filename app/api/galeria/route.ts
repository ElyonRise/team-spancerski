import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/lib/db'

import { getSession } from '@/lib/auth'



// GET: buscar fotos

export async function GET(req: NextRequest) {

  const session = await getSession()

  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })



  const clientId = session.role === 'pro'

    ? new URL(req.url).searchParams.get('client_id') || null

    : session.id



  const query = clientId

    ? 'SELECT * FROM fotos_progresso WHERE client_id=$1 ORDER BY created_at DESC'

    : 'SELECT fp.*, u.name as client_name FROM fotos_progresso fp JOIN users u ON fp.client_id=u.id ORDER BY fp.created_at DESC'



  const result = await db.query(query, clientId ? [clientId] : [])

  return NextResponse.json(result.rows)

}



// POST: salvar foto (base64 → salvo como data URL no banco — para produção real use Cloudinary)

export async function POST(req: NextRequest) {

  const session = await getSession()

  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })



  const { url, tipo, descricao, data_foto, client_id } = await req.json()

  const targetClientId = session.role === 'pro' ? client_id : session.id



  const result = await db.query(

    'INSERT INTO fotos_progresso (client_id, url, tipo, descricao, data_foto, uploaded_by) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',

    [targetClientId, url, tipo || 'progress', descricao, data_foto, session.role]

  )

  return NextResponse.json({ ok: true, id: result.rows[0].id })

}



export async function DELETE(req: NextRequest) {

  const session = await getSession()

  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const id = new URL(req.url).searchParams.get('id')

  await db.query('DELETE FROM fotos_progresso WHERE id=$1', [id])

  return NextResponse.json({ ok: true })

}
