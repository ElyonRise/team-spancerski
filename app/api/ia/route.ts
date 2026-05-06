import { NextRequest, NextResponse } from 'next/server'

import { getSession } from '@/lib/auth'

import { chatWithNutri, getMotivatinalQuote } from '@/lib/groq'

import { db } from '@/lib/db'



export async function POST(req: NextRequest) {

  const session = await getSession()

  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })



  const { messages, type } = await req.json()



  if (type === 'quote') {

    const quote = await getMotivatinalQuote()

    return NextResponse.json(quote)

  }



  // Busca contexto da dieta

  let dietContext = ''

  const dietResult = await db.query(

    'SELECT conteudo_raw FROM dietas WHERE client_id=$1 ORDER BY created_at DESC LIMIT 1',

    [session.id]

  )

  if (dietResult.rows[0]) dietContext = dietResult.rows[0].conteudo_raw



  const reply = await chatWithNutri(messages, dietContext)

  return NextResponse.json({ reply })

}
