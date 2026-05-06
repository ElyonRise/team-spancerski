import { NextRequest, NextResponse } from 'next/server'

import { db, setupDB } from '@/lib/db'

import { comparePassword, createToken } from '@/lib/auth'



export async function POST(req: NextRequest) {

  try {

    await setupDB()

    const { email, password } = await req.json()



    if (!email || !password) {

      return NextResponse.json({ error: 'Email e senha obrigatórios.' }, { status: 400 })

    }



    const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])

    const user = result.rows[0]



    if (!user) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 401 })



    const valid = await comparePassword(password, user.password_hash)

    if (!valid) return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 })



    const token = await createToken({ id: user.id, email: user.email, role: user.role, name: user.name })



    const res = NextResponse.json({ ok: true, role: user.role, name: user.name })

    res.cookies.set('spancerski_token', token, {

      httpOnly: true, secure: process.env.NODE_ENV === 'production',

      sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/'

    })

    return res

  } catch (err: any) {

    return NextResponse.json({ error: err.message }, { status: 500 })

  }

}
