export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import nodemailer from 'nodemailer'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { ensureAnamneseTables } from '@/lib/anamnese'

const DIAS_VALIDADE = 30

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
})

const esc = (s: string) =>
  String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))

async function requirePro() {
  const session = await getSession()
  return session && session.role === 'pro' ? session : null
}

// GET /api/anamnese            → lista (sem fotos nem respostas)
// GET /api/anamnese?id=12      → uma anamnese completa (respostas + fotos)
export async function GET(req: NextRequest) {
  if (!(await requirePro())) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  await ensureAnamneseTables()

  const id = new URL(req.url).searchParams.get('id')
  if (id) {
    const a = await db.query(
      `SELECT a.*, u.name AS client_name, u.email AS client_email
         FROM anamneses a JOIN users u ON u.id = a.client_id WHERE a.id = $1`, [id])
    if (!a.rows[0]) return NextResponse.json({ error: 'Não encontrada' }, { status: 404 })
    const fotos = await db.query(
      'SELECT posicao, url FROM anamnese_fotos WHERE anamnese_id = $1', [id])
    const { token, ...resto } = a.rows[0]
    return NextResponse.json({ ...resto, fotos: fotos.rows })
  }

  const r = await db.query(`
    SELECT a.id, a.client_id, a.token, a.status, a.expires_at, a.submitted_at, a.created_at,
           u.name AS client_name, u.email AS client_email, u.phone AS client_phone,
           (SELECT COUNT(*) FROM anamnese_fotos f WHERE f.anamnese_id = a.id)::int AS total_fotos
      FROM anamneses a JOIN users u ON u.id = a.client_id
     ORDER BY a.created_at DESC`)
  return NextResponse.json(r.rows)
}

// POST { client_id, send_email? } → cria (ou reaproveita) o link do aluno
export async function POST(req: NextRequest) {
  if (!(await requirePro())) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  await ensureAnamneseTables()

  const { client_id, send_email } = await req.json()
  if (!client_id) return NextResponse.json({ error: 'Selecione um cliente.' }, { status: 400 })

  const cli = await db.query(`SELECT id, name, email FROM users WHERE id=$1 AND role='client'`, [client_id])
  const cliente = cli.rows[0]
  if (!cliente) return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 })

  // Já existe uma pendente e válida? Reaproveita em vez de duplicar.
  const existente = await db.query(
    `SELECT id, token FROM anamneses
      WHERE client_id=$1 AND status='pendente' AND expires_at > NOW()
      ORDER BY created_at DESC LIMIT 1`, [client_id])

  let id: number, token: string
  if (existente.rows[0]) {
    ({ id, token } = existente.rows[0])
  } else {
    token = randomBytes(24).toString('hex') // 192 bits, não adivinhável
    const ins = await db.query(
      `INSERT INTO anamneses (client_id, token, expires_at)
       VALUES ($1, $2, NOW() + ($3 || ' days')::interval) RETURNING id`,
      [client_id, token, String(DIAS_VALIDADE)])
    id = ins.rows[0].id
  }

  const link = `${new URL(req.url).origin}/anamnese/${token}`

  let emailEnviado = false
  if (send_email) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: cliente.email,
        subject: 'Team Spancerski — Preencha sua ficha de anamnese',
        html: `
          <div style="background:#0a0a0a;color:#e5e7eb;padding:40px;font-family:sans-serif;border-radius:12px">
            <h1 style="color:#00ff41;letter-spacing:2px">TEAM SPANCERSKI</h1>
            <h3>Olá, ${esc(cliente.name)}!</h3>
            <p>Para montar seu planejamento de treino, preciso que você preencha sua <b>ficha de anamnese</b> e envie suas fotos de avaliação.</p>
            <p style="color:#9ca3af">Leva cerca de 10 minutos e você pode usar o celular. O link vale por ${DIAS_VALIDADE} dias.</p>
            <a href="${link}" style="display:inline-block;background:#00ff41;color:#000;padding:12px 28px;border-radius:8px;font-weight:700;text-decoration:none;margin:16px 0">
              PREENCHER ANAMNESE
            </a>
            <p style="color:#6b7280;font-size:12px">Suas informações são confidenciais e usadas apenas para o seu treinamento.</p>
          </div>`,
      })
      emailEnviado = true
    } catch (e) {
      console.error('Erro ao enviar e-mail da anamnese:', e)
    }
  }

  return NextResponse.json({ ok: true, id, link, emailEnviado })
}

// PATCH { id, action: 'reabrir' } → permite o aluno corrigir/reenviar
export async function PATCH(req: NextRequest) {
  if (!(await requirePro())) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  await ensureAnamneseTables()
  const { id, action } = await req.json()
  if (action !== 'reabrir') return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 })
  await db.query(
    `UPDATE anamneses SET status='pendente', submitted_at=NULL,
            expires_at = NOW() + ($2 || ' days')::interval WHERE id=$1`,
    [id, String(DIAS_VALIDADE)])
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  if (!(await requirePro())) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  await ensureAnamneseTables()
  const id = new URL(req.url).searchParams.get('id')
  await db.query('DELETE FROM anamneses WHERE id=$1', [id])
  return NextResponse.json({ ok: true })
}
