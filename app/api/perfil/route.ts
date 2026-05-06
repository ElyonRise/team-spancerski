import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/lib/db'

import { getSession, comparePassword, hashPassword } from '@/lib/auth'



export async function GET() {

  const session = await getSession()

  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const r = await db.query('SELECT id,name,email,phone,goal,weight_start,height_cm,created_at FROM users WHERE id=$1', [session.id])

  return NextResponse.json(r.rows[0])

}



export async function PATCH(req: NextRequest) {

  const session = await getSession()

  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { name, phone, goal, oldPassword, newPassword } = await req.json()



  if (newPassword) {

    const r = await db.query('SELECT password_hash FROM users WHERE id=$1', [session.id])

    const valid = await comparePassword(oldPassword, r.rows[0].password_hash)

    if (!valid) return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 400 })

    const hash = await hashPassword(newPassword)

    await db.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, session.id])

    return NextResponse.json({ ok: true, message: 'Senha alterada.' })

  }



  await db.query('UPDATE users SET name=$1, phone=$2, goal=$3 WHERE id=$4', [name, phone, goal, session.id])

  return NextResponse.json({ ok: true })

}
