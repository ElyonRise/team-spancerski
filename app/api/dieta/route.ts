import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase()

  if (name.endsWith('.docx') || name.endsWith('.doc')) {
    const mammoth = await import('mammoth')
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const result = await mammoth.extractRawText({ buffer })
    return result.value || ''
  }

  if (name.endsWith('.pdf')) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse')
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const result = await pdfParse(buffer)
    return result.text || ''
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  return buffer.toString('utf8').replace(/\0/g, '')
}

// GET - busca dietas do cliente logado
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }

  try {
    const result = await db.query(
      `SELECT id, nome, conteudo_raw, kcal, proteina, carboidratos, gorduras, created_at
       FROM dietas WHERE client_id = $1 ORDER BY created_at DESC`,
      [session.id]
    )
    return NextResponse.json(result.rows)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Erro ao buscar dietas' }, { status: 500 })
  }
}

// POST - profissional envia dieta
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

    const rawText = await extractText(file)

    if (!rawText || rawText.trim().length < 5) {
      return NextResponse.json({ error: 'Nao foi possivel extrair texto do arquivo.' }, { status: 400 })
    }

    const result = await db.query(
      `INSERT INTO dietas (client_id, nome, conteudo_raw, protocolo, kcal, proteina, carboidratos, gorduras)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [client_id, nome, rawText, JSON.stringify([]), 0, 0, 0, 0]
    )

    return NextResponse.json({ ok: true, id: result.rows[0].id })

  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Erro ao processar arquivo' }, { status: 500 })
  }
}
