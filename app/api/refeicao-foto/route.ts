import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ erro: 'Nao autorizado' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const foto = formData.get('foto') as File

    if (!foto) {
      return NextResponse.json({ erro: 'Foto obrigatoria' }, { status: 400 })
    }

    const arrayBuffer = await foto.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const mediaType = foto.type || 'image/jpeg'

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 600,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: base64 },
              },
              {
                type: 'text',
                text: `Analise esta foto de um prato de comida e retorne APENAS um JSON valido com os campos abaixo, sem texto adicional, sem markdown, sem explicacoes:
{
  "descricao": "descricao breve dos alimentos identificados no prato",
  "kcal": numero estimado de calorias totais,
  "proteina": gramas de proteina estimadas,
  "carboidratos": gramas de carboidratos estimados,
  "gorduras": gramas de gorduras estimadas,
  "feedback": "feedback nutricional curto e motivacional em portugues, avaliando se a refeicao esta alinhada com um protocolo fitness"
}`,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error('Erro na API de analise')
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''

    let resultado
    try {
      const clean = text.replace(/```json|```/g, '').trim()
      resultado = JSON.parse(clean)
    } catch {
      return NextResponse.json({ erro: 'Nao foi possivel interpretar a analise. Tente novamente.' }, { status: 500 })
    }

    // Salvar registro no banco e notificar profissional
    try {
      await db.query(
        `INSERT INTO refeicao_fotos (client_id, kcal, proteina, carboidratos, gorduras, descricao, feedback, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT DO NOTHING`,
        [
          session.id,
          resultado.kcal,
          resultado.proteina,
          resultado.carboidratos,
          resultado.gorduras,
          resultado.descricao,
          resultado.feedback,
        ]
      )
    } catch {
      // Tabela pode nao existir ainda — nao bloqueia a resposta ao cliente
    }

    return NextResponse.json(resultado)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ erro: error.message || 'Erro ao analisar foto' }, { status: 500 })
  }
}
