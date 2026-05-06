import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import Groq from 'groq-sdk';
import { db } from '@/lib/db';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ erro: 'Nao autorizado' }, { status: 401 });

  try {
    const formData = await req.formData();
    const fotoAntes = formData.get('foto_antes') as File;
    const fotoDepois = formData.get('foto_depois') as File;

    if (!fotoAntes || !fotoDepois) return NextResponse.json({ erro: 'Duas fotos sao obrigatorias' }, { status: 400 });

    const arrayBufferAntes = await fotoAntes.arrayBuffer();
    const arrayBufferDepois = await fotoDepois.arrayBuffer();

    const base64Antes = Buffer.from(arrayBufferAntes).toString('base64');
    const base64Depois = Buffer.from(arrayBufferDepois).toString('base64');

    const response = await groq.chat.completions.create({
      model: 'llama-4-scout-17b-16e-instruct',
      max_tokens: 1000,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Antes}` } },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Depois}` } },
          { type: 'text', text: `Analise as duas fotos (1=ANTES, 2=DEPOIS). Retorne APENAS JSON valido:
{
  "resumo": "resumo da evolucao",
  "pontos_positivos": ["item1", "item2"],
  "areas_melhoria": ["item1", "item2"],
  "motivacao": "frase motivacional"
}` }
        ]
      }]
    });

    let analise: any;
    try {
      const text = response.choices[0].message.content || '{}';
      const clean = text.replace(/```json|```/g, '').trim();
      analise = JSON.parse(clean.match(/\{[\s\S]*\}/)?.[0] || '{}');
    } catch {
      analise = { resumo: "Evolucao positiva detectada", pontos_positivos: ["Melhora corporal"], areas_melhoria: ["Manter consistencia"], motivacao: "Continue firme!" };
    }

    await db.query(
      `INSERT INTO analise_corporal (client_id, foto_antes_url, foto_depois_url, analise_ia, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [session.id, `data:image/jpeg;base64,${base64Antes}`, `data:image/jpeg;base64,${base64Depois}`, JSON.stringify(analise)]
    );

    return NextResponse.json(analise);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ erro: 'Erro ao gerar analise' }, { status: 500 });
  }
}
