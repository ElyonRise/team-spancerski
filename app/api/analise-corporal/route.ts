import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'pro') return NextResponse.json({ erro: 'Nao autorizado' }, { status: 401 })

  try {
    const formData = await req.formData()
    const fotoAntes = formData.get('foto_antes') as File
    const fotoDepois = formData.get('foto_depois') as File
    const client_id = formData.get('client_id') as string

    if (!fotoAntes || !fotoDepois || !client_id) {
      return NextResponse.json({ erro: 'Fotos antes e depois e cliente sao obrigatorios' }, { status: 400 })
    }

    const toBase64 = async (file: File) => {
      const ab = await file.arrayBuffer()
      return Buffer.from(ab).toString('base64')
    }
    const toMediaType = (file: File) => {
      const allowed = ['image/jpeg','image/png','image/webp']
      return allowed.includes(file.type) ? file.type : 'image/jpeg'
    }

    const b64Antes = await toBase64(fotoAntes)
    const b64Depois = await toBase64(fotoDepois)
    const mtAntes = toMediaType(fotoAntes)
    const mtDepois = toMediaType(fotoDepois)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mtAntes, data: b64Antes } },
            { type: 'image', source: { type: 'base64', media_type: mtDepois, data: b64Depois } },
            {
              type: 'text',
              text: `Voce e um especialista em avaliacoes corporais fitness. A primeira imagem e o ANTES e a segunda e o DEPOIS.
Faca uma analise comparativa detalhada e retorne APENAS JSON valido sem markdown:
{
  "resumo": "resumo geral da evolucao em 2-3 frases motivacionais",
  "pontos_positivos": ["mudanca positiva 1","mudanca positiva 2","mudanca positiva 3"],
  "areas_melhoria": ["area 1","area 2"],
  "composicao_corporal": "analise da composicao corporal visivel",
  "postura": "observacao sobre postura se visivel",
  "evolucao_estimada": "estimativa percentual de evolucao ex: 30 porcento",
  "recomendacoes": ["recomendacao nutricional 1","recomendacao 2"],
  "motivacao": "mensagem motivacional personalizada e poderosa"
}`
            }
          ]
        }]
      })
    })

    const data = await response.json()
    const text = data.content?.[0]?.text || ''
    let analise: any
    try {
      const clean = text.replace(/```json|```/g, '').trim()
      const match = clean.match(/\{[\s\S]*\}/)
      analise = JSON.parse(match ? match[0] : clean)
    } catch {
      return NextResponse.json({ erro: 'Nao foi possivel gerar analise.' }, { status: 500 })
    }

    const fotoAntesUrl = `data:${mtAntes};base64,${b64Antes}`
    const fotoDepoisUrl = `data:${mtDepois};base64,${b64Depois}`

    try {
      await db.query(
        `INSERT INTO analise_corporal (client_id, foto_antes_url, foto_depois_url, analise_ia, pontos_positivos, areas_melhoria, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [client_id, fotoAntesUrl, fotoDepoisUrl, analise.resumo||'', JSON.stringify(analise.pontos_positivos||[]), JSON.stringify(analise.areas_melhoria||[])]
      )
      await db.query(
        `INSERT INTO feedbacks (client_id, mensagem, tipo, created_at) VALUES ($1, $2, $3, NOW())`,
        [client_id, `Seu profissional gerou uma nova analise corporal comparativa. Confira na sua area!`, 'analise_corporal']
      )
    } catch (e) {
      console.error('Erro ao salvar analise:', e)
    }

    return NextResponse.json({ ...analise, foto_antes_url: fotoAntesUrl, foto_depois_url: fotoDepoisUrl })
  } catch (error: any) {
    return NextResponse.json({ erro: error.message || 'Erro ao gerar analise' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ erro: 'Nao autorizado' }, { status: 401 })

  const url = new URL(req.url)
  const clientId = session.role === 'pro' ? url.searchParams.get('client_id') : String(session.id)
  if (!clientId) return NextResponse.json([])

  try {
    const result = await db.query(
      'SELECT * FROM analise_corporal WHERE client_id=$1 ORDER BY created_at DESC LIMIT 10',
      [clientId]
    )
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json([])
  }
}
