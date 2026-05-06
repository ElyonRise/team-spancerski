import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('spancerski_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Validação simples por enquanto
  return NextResponse.json({ 
    success: true, 
    message: 'Token presente' 
  });
}
