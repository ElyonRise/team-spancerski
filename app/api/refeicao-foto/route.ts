import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ erro: 'Nao autorizado' }, { status: 401 })

  try {
    const formData = await req.formData()
    const foto = formData.get('foto') as File

    if (!foto) return NextResponse.json({ erro: 'Foto obrigatoria' }, { status: 400 })

    const arrayBuffer = await foto.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const mediaType = allowedTypes.includes(foto.type) ? foto.type : 'image/jpeg'
    const dataUrl = `data:${mediaType};base64,${base64}`

    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      max_tokens: 800,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: dataUrl },
            },
            {
              type: 'text',
              text: `Analise esta foto de um prato de comida e retorne APENAS um JSON valido, sem markdown, sem texto extra:
{
  "descricao": "descricao breve dos alimentos identificados",
  "kcal": numero inteiro estimado de calorias,
  "proteina": numero inteiro de gramas de proteina,
  "carboidratos": numero inteiro de gramas de carboidratos,
  "gorduras": numero inteiro de gramas de gorduras,
  "feedback": "avaliacao nutricional curta e motivacional em portugues"
}`,
            },
          ],
        },
      ],
    })

    const text = response.choices[0].message.content || ''
    let resultado
    try {
      const clean = text.replace(/```json|```/g, '').trim()
      const match = clean.match(/\{[\s\S]*\}/)
      resultado = JSON.parse(match ? match[0] : clean)
    } catch {
      return NextResponse.json({ erro: 'Nao foi possivel interpretar a analise. Tente outra foto.' }, { status: 500 })
    }

    try {
      await db.query(
        `INSERT INTO refeicao_fotos (client_id, kcal, proteina, carboidratos, gorduras, descricao, feedback, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [session.id, resultado.kcal || 0, resultado.proteina || 0, resultado.carboidratos || 0, resultado.gorduras || 0, resultado.descricao || '', resultado.feedback || '']
      )
    } catch (e) {
      console.error('Erro ao salvar refeicao_fotos:', e)
    }

    return NextResponse.json(resultado)
  } catch (error: any) {
    console.error('refeicao-foto error:', error)
    return NextResponse.json({ erro: error.message || 'Erro ao analisar foto' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ erro: 'Nao autorizado' }, { status: 401 })

  const clientId = session.role === 'pro'
    ? new URL(req.url).searchParams.get('client_id')
    : session.id

  if (!clientId) return NextResponse.json([])

  try {
    const result = await db.query(
      `SELECT rf.*, u.name as client_name FROM refeicao_fotos rf
       LEFT JOIN users u ON rf.client_id = u.id
       WHERE rf.client_id = $1 ORDER BY rf.created_at DESC LIMIT 30`,
      [clientId]
    )
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json([])
  }
}
