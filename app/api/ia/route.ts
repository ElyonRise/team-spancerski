export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { chatWithNutri, getMotivatinalQuote } from '@/lib/groq'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })

  const { messages, type } = await req.json()

  if (type === 'quote') {
    try {
      const quote = await getMotivatinalQuote()
      return NextResponse.json(quote)
    } catch (e) {
      return NextResponse.json({ frase: 'Disciplina e o que te leva onde a motivacao nao consegue.', autor: 'Team Spancerski' })
    }
  }

  let dietContext = ''
  try {
    const dietResult = await db.query(
      'SELECT conteudo_raw FROM dietas WHERE client_id=$1 ORDER BY created_at DESC LIMIT 1',
      [session.id]
    )
    if (dietResult.rows[0]) dietContext = dietResult.rows[0].conteudo_raw?.slice(0, 1500) || ''
  } catch {}

  try {
    const reply = await chatWithNutri(messages, dietContext)
    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error('IA error:', error)
    return NextResponse.json({ error: 'Erro ao conectar com IA. Verifique GROQ_API_KEY no Vercel.' }, { status: 500 })
  }
}
