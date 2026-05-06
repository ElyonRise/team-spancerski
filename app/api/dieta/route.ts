import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { parseDietWithAI } from '@/lib/groq'

async function extractContent(file: File): Promise<{ html: string; raw: string }> {
  const name = file.name.toLowerCase()

  if (name.endsWith('.docx') || name.endsWith('.doc')) {
    const mammoth = await import('mammoth')
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const htmlResult = await mammoth.convertToHtml({ buffer })
    const rawResult = await mammoth.extractRawText({ buffer })
    return { html: htmlResult.value || '', raw: rawResult.value || '' }
  }

  if (name.endsWith('.pdf')) {
    const pdfParse = require('pdf-parse')
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const result = await pdfParse(buffer)
    return { html: '', raw: result.text || '' }
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const text = buffer.toString('utf8').replace(/\0/g, '')
  return { html: '', raw: text }
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })

  try {
    const result = await db.query(
      `SELECT id, nome, conteudo_raw, conteudo_html, kcal, proteina, carboidratos, gorduras, created_at
       FROM dietas WHERE client_id = $1 ORDER BY created_at DESC`,
      [session.id]
    )
    return NextResponse.json(result.rows)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'pro') {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const client_id = formData.get('client_id') as string
    const nome = (formData.get('nome') as string) || 'Protocolo Nutricional'

    if (!file || !client_id) {
      return NextResponse.json({ error: 'Arquivo e cliente sao obrigatorios' }, { status: 400 })
    }

    const { html, raw } = await extractContent(file)

    if (!raw || raw.trim().length < 5) {
      return NextResponse.json({ error: 'Nao foi possivel extrair texto do arquivo.' }, { status: 400 })
    }

    let kcal = 0, proteina = 0, carboidratos = 0, gorduras = 0
    let protocolo: any[] = []
    let lista_compras: any[] = []

    try {
      const analise = await parseDietWithAI(raw)
      kcal = analise.kcal || 0
      proteina = analise.proteina || 0
      carboidratos = analise.carboidratos || 0
      gorduras = analise.gorduras || 0
      protocolo = analise.protocolo || []
      lista_compras = analise.lista_compras || []
    } catch (e) {
      console.error('Analise IA falhou:', e)
    }

    const result = await db.query(
      `INSERT INTO dietas (client_id, nome, conteudo_raw, conteudo_html, protocolo, kcal, proteina, carboidratos, gorduras)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [client_id, nome, raw, html, JSON.stringify(protocolo), kcal, proteina, carboidratos, gorduras]
    )

    const dietaId = result.rows[0].id

    if (lista_compras.length > 0) {
      await db.query('DELETE FROM lista_compras WHERE client_id=$1', [client_id])
      await db.query(
        `INSERT INTO lista_compras (client_id, dieta_id, itens, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [client_id, dietaId, JSON.stringify(lista_compras)]
      )
    }

    return NextResponse.json({ ok: true, id: dietaId })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Erro ao processar arquivo' }, { status: 500 })
  }
}
