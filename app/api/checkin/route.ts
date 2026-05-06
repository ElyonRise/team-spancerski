import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ erro: 'Nao autorizado' }, { status: 401 })

  try {
    const formData = await req.formData()
    const foto = formData.get('foto') as File
    const refeicao_nome = (formData.get('refeicao_nome') as string) || 'Refeicao'
    const horario = (formData.get('horario') as string) || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

    if (!foto) return NextResponse.json({ erro: 'Foto obrigatoria' }, { status: 400 })

    const arrayBuffer = await foto.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const mediaType = allowedTypes.includes(foto.type) ? foto.type : 'image/jpeg'

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            {
              type: 'text',
              text: `Analise este prato e retorne APENAS JSON valido sem markdown:
{
  "descricao": "alimentos identificados",
  "kcal": numero,
  "proteina": gramas,
  "carboidratos": gramas,
  "gorduras": gramas,
  "feedback": "avaliacao nutricional motivacional em portugues",
  "alinhamento_dieta": "porcentagem de 0 a 100 de adesao ao protocolo fitness",
  "sugestao": "sugestao curta de melhoria"
}`
            }
          ]
        }]
      })
    })

    const data = await response.json()
    const text = data.content?.[0]?.text || ''
    let resultado: any
    try {
      const clean = text.replace(/```json|```/g, '').trim()
      const match = clean.match(/\{[\s\S]*\}/)
      resultado = JSON.parse(match ? match[0] : clean)
    } catch {
      return NextResponse.json({ erro: 'Nao foi possivel interpretar a analise.' }, { status: 500 })
    }

    const fotoUrl = `data:${mediaType};base64,${base64}`

    try {
      await db.query(
        `INSERT INTO checkin_refeicoes (client_id, refeicao_nome, horario, foto_url, kcal, proteina, carboidratos, gorduras, descricao, feedback_ia, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
        [session.id, refeicao_nome, horario, fotoUrl, resultado.kcal||0, resultado.proteina||0, resultado.carboidratos||0, resultado.gorduras||0, resultado.descricao||'', resultado.feedback||'']
      )
    } catch (e) {
      console.error('Erro ao salvar checkin:', e)
    }

    return NextResponse.json(resultado)
  } catch (error: any) {
    return NextResponse.json({ erro: error.message || 'Erro ao analisar foto' }, { status: 500 })
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
      `SELECT cr.*, u.name as client_name FROM checkin_refeicoes cr
       LEFT JOIN users u ON cr.client_id = u.id
       WHERE cr.client_id = $1 ORDER BY cr.created_at DESC LIMIT 50`,
      [clientId]
    )
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json([])
  }
}
