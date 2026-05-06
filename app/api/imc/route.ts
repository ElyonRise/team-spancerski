import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/lib/db'

import { getSession } from '@/lib/auth'



export async function GET() {

  const session = await getSession()

  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const result = await db.query(

    'SELECT * FROM registros_imc WHERE client_id=$1 ORDER BY recorded_at DESC LIMIT 10',

    [session.id]

  )

  return NextResponse.json(result.rows)

}



export async function POST(req: NextRequest) {

  const session = await getSession()

  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })



  const { peso, altura } = await req.json()

  const imc = +(peso / ((altura / 100) ** 2)).toFixed(2)

  let categoria = 'Normal'

  if (imc < 18.5) categoria = 'Abaixo do peso'

  else if (imc < 25) categoria = 'Normal'

  else if (imc < 30) categoria = 'Sobrepeso'

  else if (imc < 35) categoria = 'Obesidade Grau I'

  else if (imc < 40) categoria = 'Obesidade Grau II'

  else categoria = 'Obesidade Grau III'



  const result = await db.query(

    'INSERT INTO registros_imc (client_id, peso, altura, imc, categoria) VALUES ($1,$2,$3,$4,$5) RETURNING *',

    [session.id, peso, altura, imc, categoria]

  )

  return NextResponse.json(result.rows[0])

}
