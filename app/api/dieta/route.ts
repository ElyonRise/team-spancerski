import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'pro') {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const client_id = formData.get('client_id') as string
    const nome = formData.get('nome') as string || 'Protocolo Nutricional'

    if (!file || !client_id) {
      return NextResponse.json({ error: 'Arquivo e cliente sao obrigatorios' }, { status: 400 })
    }

    const rawText = await file.text()

    if (!rawText || rawText.trim().length < 10) {
      return NextResponse.json({ error: 'Arquivo invalido ou vazio' }, { status: 400 })
    }

    // Salva direto sem processar com IA
    const result = await db.query(
      `INSERT INTO dietas (client_id, nome, conteudo_raw, protocolo, kcal, proteina, carboidratos, gorduras)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [client_id, nome, rawText, JSON.stringify([]), 0, 0, 0, 0]
    )

    return NextResponse.json({
      ok: true,
      id: result.rows[0].id,
    })

  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Erro ao processar' }, { status: 500 })
  }
}
