export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/lib/db'

import { hashPassword, generateResetToken } from '@/lib/auth'

import nodemailer from 'nodemailer'



const transporter = nodemailer.createTransport({

  service: 'gmail',

  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },

})



// POST: solicitar reset

export async function POST(req: NextRequest) {

  const { email } = await req.json()

  const result = await db.query('SELECT id, name FROM users WHERE email = $1', [email.toLowerCase()])

  if (!result.rows[0]) {

    return NextResponse.json({ message: 'Se este email existir, você receberá o link em breve.' })

  }

  const user = result.rows[0]

  const token = generateResetToken()

  const expires = new Date(Date.now() + 3600000)

  await db.query('UPDATE users SET reset_token=$1, reset_expires=$2 WHERE id=$3', [token, expires, user.id])



  const link = `${process.env.NEXT_PUBLIC_APP_URL}/redefinir-senha?token=${token}`

  await transporter.sendMail({

    from: process.env.EMAIL_FROM,

    to: email,

    subject: 'Team Spancerski — Redefinição de senha',

    html: `

      <div style="background:#0a0a0a;color:#e5e7eb;padding:40px;font-family:sans-serif;border-radius:12px">

        <h2 style="color:#00ff41">Team Spancerski</h2>

        <p>Olá, ${user.name}!</p>

        <p>Clique no link abaixo para redefinir sua senha:</p>

        <a href="${link}" style="display:inline-block;background:#00ff41;color:#000;padding:12px 28px;border-radius:8px;font-weight:700;text-decoration:none;margin:16px 0">

          REDEFINIR SENHA

        </a>

        <p style="color:#6b7280;font-size:12px">Link válido por 1 hora. Se não solicitou, ignore este email.</p>

      </div>

    `

  })

  return NextResponse.json({ message: 'Se este email existir, você receberá o link em breve.' })

}



// PATCH: confirmar nova senha com token

export async function PATCH(req: NextRequest) {

  const { token, newPassword } = await req.json()

  const result = await db.query(

    'SELECT id FROM users WHERE reset_token=$1 AND reset_expires > NOW()',

    [token]

  )

  if (!result.rows[0]) return NextResponse.json({ error: 'Token inválido ou expirado.' }, { status: 400 })



  const hash = await hashPassword(newPassword)

  await db.query('UPDATE users SET password_hash=$1, reset_token=NULL, reset_expires=NULL WHERE id=$2',

    [hash, result.rows[0].id])

  return NextResponse.json({ ok: true })

}
