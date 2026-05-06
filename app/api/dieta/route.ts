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

  const url = new URL(req.url)

  if (url.searchParams.get('action') === 'reprocessar') {
    if (session.role !== 'pro') return NextResponse.json({ error: 'Nao autorizado' }, { status: 403 })
    try {
      const semLista = await db.query(
        `SELECT d.id, d.client_id, d.conteudo_raw FROM dietas d
         LEFT JOIN lista_compras lc ON lc.dieta_id = d.id
         WHERE lc.id IS NULL AND d.conteudo_raw IS NOT NULL AND LENGTH(d.conteudo_raw) > 10`
      )
      let processadas = 0
      for (const dieta of semLista.rows) {
        try {
          const analise = await parseDietWithAI(dieta.conteudo_raw)
          if (analise.lista_compras && analise.lista_compras.length > 0) {
            await db.query('DELETE FROM lista_compras WHERE client_id=$1', [dieta.client_id])
            await db.query(
              `INSERT INTO lista_compras (client_id, dieta_id, itens, created_at) VALUES ($1, $2, $3, NOW())`,
              [dieta.client_id, dieta.id, JSON.stringify(analise.lista_compras)]
            )
            await db.query(
              `UPDATE dietas SET kcal=$1, proteina=$2, carboidratos=$3, gorduras=$4, protocolo=$5 WHERE id=$6`,
              [analise.kcal||0, analise.proteina||0, analise.carboidratos||0, analise.gorduras||0, JSON.stringify(analise.protocolo||[]), dieta.id]
            )
            processadas++
          }
        } catch (e) {
          console.error('Erro ao reprocessar dieta', dieta.id, e)
        }
      }
      return NextResponse.json({ ok: true, processadas, total: semLista.rows.length })
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  if (url.pathname.endsWith('/historico')) {
    if (session.role !== 'pro') return NextResponse.json({ error: 'Nao autorizado' }, { status: 403 })
    const result = await db.query(
      `SELECT d.id, d.nome, d.created_at, u.name as client_name
       FROM dietas d LEFT JOIN users u ON d.client_id = u.id
       ORDER BY d.created_at DESC LIMIT 50`
    )
    return NextResponse.json(result.rows)
  }

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
      try {
        await db.query('DELETE FROM lista_compras WHERE client_id=$1', [client_id])
        await db.query(
          `INSERT INTO lista_compras (client_id, dieta_id, itens, created_at) VALUES ($1, $2, $3, NOW())`,
          [client_id, dietaId, JSON.stringify(lista_compras)]
        )
      } catch (e) {
        console.error('Erro ao salvar lista de compras:', e)
      }
    }

    try {
      await db.query(
        `INSERT INTO feedbacks (client_id, mensagem, tipo, created_at) VALUES ($1, $2, $3, NOW())`,
        [client_id, `Novo protocolo de dieta enviado: "${nome}". Sua lista de compras foi gerada automaticamente!`, 'sistema']
      )
    } catch {}

    return NextResponse.json({ ok: true, id: dietaId, kcal, proteina, carboidratos, gorduras, itens: lista_compras.length })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Erro ao processar arquivo' }, { status: 500 })
  }
}
