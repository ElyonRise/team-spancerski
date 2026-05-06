export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/lib/db'

import { getSession, hashPassword, generateTempPassword } from '@/lib/auth'

import nodemailer from 'nodemailer'



const transporter = nodemailer.createTransport({

  service: 'gmail',

  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },

})



// GET: listar clientes

export async function GET() {

  const session = await getSession()

  if (!session || session.role !== 'pro') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })



  const result = await db.query(`

    SELECT u.id, u.name, u.email, u.phone, u.goal, u.weight_start, u.height_cm, u.created_at,

      (SELECT COUNT(*) FROM dietas d WHERE d.client_id = u.id) as total_dietas,

      (SELECT COUNT(*) FROM motivacao_streak ms WHERE ms.client_id = u.id) as streak_total

    FROM users u WHERE u.role = 'client' ORDER BY u.created_at DESC

  `)

  return NextResponse.json(result.rows)

}



// POST: criar cliente

export async function POST(req: NextRequest) {

  const session = await getSession()

  if (!session || session.role !== 'pro') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })



  const { name, email, phone, goal, weight_start, height_cm } = await req.json()

  if (!name || !email) return NextResponse.json({ error: 'Nome e email obrigatórios.' }, { status: 400 })



  const existing = await db.query('SELECT id FROM users WHERE email=$1', [email.toLowerCase()])

  if (existing.rows[0]) return NextResponse.json({ error: 'Email já cadastrado.' }, { status: 409 })



  const tempPass = generateTempPassword()

  const hash = await hashPassword(tempPass)



  const result = await db.query(

    `INSERT INTO users (name, email, password_hash, role, phone, goal, weight_start, height_cm)

     VALUES ($1, $2, $3, 'client', $4, $5, $6, $7) RETURNING id`,

    [name, email.toLowerCase(), hash, phone, goal, weight_start, height_cm]

  )



  // Enviar email com credenciais

  await transporter.sendMail({

    from: process.env.EMAIL_FROM,

    to: email,

    subject: 'Team Spancerski — Seu acesso foi criado!',

    html: `

      <div style="background:#0a0a0a;color:#e5e7eb;padding:40px;font-family:sans-serif;border-radius:12px">

        <h1 style="color:#00ff41;letter-spacing:2px">TEAM SPANCERSKI</h1>

        <h3>Olá, ${name}! Seu acesso foi criado 🎉</h3>

        <p>Bem-vindo(a) à plataforma exclusiva de acompanhamento nutricional!</p>

        <div style="background:#1a1a2e;border-radius:10px;padding:20px;margin:20px 0;border-left:3px solid #00ff41">

          <p><b style="color:#9ca3af">Login:</b> ${email}</p>

          <p><b style="color:#9ca3af">Senha temporária:</b> <span style="color:#00ff41;font-size:1.2rem;font-weight:700">${tempPass}</span></p>

        </div>

        <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="display:inline-block;background:#00ff41;color:#000;padding:12px 28px;border-radius:8px;font-weight:700;text-decoration:none">

          ACESSAR PLATAFORMA

        </a>

        <p style="color:#6b7280;font-size:12px;margin-top:16px">

          ⚠️ Por segurança, redefina sua senha após o primeiro acesso em: Configurações → Segurança

        </p>

      </div>

    `

  })



  return NextResponse.json({ ok: true, id: result.rows[0].id, tempPass })

}



// DELETE: remover cliente

export async function DELETE(req: NextRequest) {

  const session = await getSession()

  if (!session || session.role !== 'pro') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)

  const id = searchParams.get('id')

  await db.query('DELETE FROM users WHERE id=$1 AND role=\'client\'', [id])

  return NextResponse.json({ ok: true })

}
