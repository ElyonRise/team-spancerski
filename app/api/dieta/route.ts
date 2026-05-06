import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { parseDietWithAI } from '@/lib/groq'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'pro') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const client_id = formData.get('client_id') as string
    const nome = formData.get('nome') as string || 'Protocolo Nutricional'

    if (!file || !client_id) {
      return NextResponse.json({ error: 'Arquivo e cliente são obrigatórios' }, { status: 400 })
    }

    const rawText = await file.text()

    if (!rawText || rawText.trim().length < 10) {
      return NextResponse.json({ error: 'Arquivo inválido ou vazio' }, { status: 400 })
    }

    const parsed = await parseDietWithAI(rawText)

    const result = await db.query(
      `INSERT INTO dietas (client_id, nome, conteudo_raw, protocolo, kcal, proteina, carboidratos, gorduras)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [client_id, nome, rawText, JSON.stringify(parsed.protocolo || []), 
       parsed.kcal || 0, parsed.proteina || 0, parsed.carboidratos || 0, parsed.gorduras || 0]
    )

    if (parsed.lista_compras?.length > 0) {
      await db.query(
        'INSERT INTO lista_compras (client_id, dieta_id, itens) VALUES ($1, $2, $3)',
        [client_id, result.rows[0].id, JSON.stringify(parsed.lista_compras)]
      )
    }

    return NextResponse.json({ 
      ok: true, 
      id: result.rows[0].id, 
      parsed 
    })

  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Erro ao processar' }, { status: 500 })
  }
}

