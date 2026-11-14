export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ensureAnamneseTables } from '@/lib/anamnese'
import {
  SECTIONS, FOTO_POSICOES, FOTO_REGEX, FOTO_MAX_CHARS,
  missingRequired, sanitize,
} from '@/lib/anamnese-schema'

// Rotas PÚBLICAS (o aluno não precisa de login): a segurança vem do token
// aleatório de 192 bits, da validade de 30 dias e do envio único.

const TOKEN_OK = /^[a-f0-9]{48}$/

async function carregar(token: string) {
  if (!TOKEN_OK.test(token)) return null
  const r = await db.query(
    `SELECT a.id, a.status, a.expires_at < NOW() AS expirada,
            u.name, u.email, u.phone, u.weight_start, u.height_cm
       FROM anamneses a JOIN users u ON u.id = a.client_id
      WHERE a.token = $1`, [token])
  return r.rows[0] || null
}

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  await ensureAnamneseTables()
  const a = await carregar(params.token)
  if (!a) return NextResponse.json({ error: 'Link inválido.' }, { status: 404 })
  if (a.status === 'enviada') return NextResponse.json({ status: 'enviada' })
  if (a.expirada) return NextResponse.json({ status: 'expirada' }, { status: 410 })

  // Pré-preenche o que já sabemos do cadastro, para o aluno digitar menos.
  return NextResponse.json({
    status: 'pendente',
    nome: a.name,
    prefill: {
      nome: a.name,
      email: a.email,
      telefone: a.phone || '',
      peso: a.weight_start != null ? String(a.weight_start) : '',
      altura: a.height_cm != null ? String(a.height_cm) : '',
    },
  })
}

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  await ensureAnamneseTables()
  const a = await carregar(params.token)
  if (!a) return NextResponse.json({ error: 'Link inválido.' }, { status: 404 })
  if (a.status === 'enviada') return NextResponse.json({ error: 'Esta ficha já foi enviada.' }, { status: 409 })
  if (a.expirada) return NextResponse.json({ error: 'Este link expirou. Peça um novo ao seu treinador.' }, { status: 410 })

  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 }) }

  const dados = sanitize(body.dados)

  for (const s of SECTIONS) {
    const falta = missingRequired(s, dados)
    if (falta.length) {
      return NextResponse.json({ error: `Preencha: ${falta.map(f => f.label).join('; ')}` }, { status: 400 })
    }
  }

  const assinatura = String(body.assinatura_nome || '').trim().slice(0, 200)
  if (!body.consentimento || assinatura.length < 3) {
    return NextResponse.json({ error: 'Confirme o consentimento e digite seu nome como assinatura.' }, { status: 400 })
  }

  const fotos: { posicao: string; url: string }[] = []
  for (const p of FOTO_POSICOES) {
    const url = body.fotos?.[p.id]
    if (!url) continue
    if (typeof url !== 'string' || url.length > FOTO_MAX_CHARS || !FOTO_REGEX.test(url)) {
      return NextResponse.json({ error: `Foto "${p.label}" inválida ou muito grande.` }, { status: 400 })
    }
    fotos.push({ posicao: p.id, url })
  }

  const client = await db.connect()
  try {
    await client.query('BEGIN')
    // WHERE status='pendente' garante envio único mesmo com cliques duplos
    const up = await client.query(
      `UPDATE anamneses
          SET dados=$2, assinatura_nome=$3, consentimento=TRUE,
              status='enviada', submitted_at=NOW()
        WHERE id=$1 AND status='pendente' AND expires_at > NOW()
        RETURNING id`,
      [a.id, JSON.stringify(dados), assinatura])
    if (!up.rows[0]) {
      await client.query('ROLLBACK')
      return NextResponse.json({ error: 'Esta ficha já foi enviada ou expirou.' }, { status: 409 })
    }
    await client.query('DELETE FROM anamnese_fotos WHERE anamnese_id=$1', [a.id])
    for (const f of fotos) {
      await client.query(
        'INSERT INTO anamnese_fotos (anamnese_id, posicao, url) VALUES ($1,$2,$3)',
        [a.id, f.posicao, f.url])
    }
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('Erro ao salvar anamnese:', e)
    return NextResponse.json({ error: 'Erro ao salvar. Tente novamente.' }, { status: 500 })
  } finally {
    client.release()
  }

  return NextResponse.json({ ok: true })
}
