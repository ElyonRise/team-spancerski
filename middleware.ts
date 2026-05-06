import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_PATHS = ['/', '/login', '/redefinir-senha', '/api/auth/login', '/api/auth/reset-password']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith('/api/auth'))) {
    return NextResponse.next()
  }

  const token = request.cookies.get('spancerski_token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)

    // Protege rota /pro para apenas o profissional
    if (pathname.startsWith('/pro') && payload.role !== 'pro') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Protege rota /dashboard para apenas clientes
    if (pathname.startsWith('/dashboard') && payload.role !== 'client') {
      return NextResponse.redirect(new URL('/pro', request.url))
    }

    return NextResponse.next()
  } catch {
    const res = NextResponse.redirect(new URL('/login', request.url))
    res.cookies.delete('spancerski_token')
    return res
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/pro/:path*',  '/api/clientes/:path*', '/api/ia/:path*', '/api/galeria/:path*', '/api/imc/:path*', '/api/compras/:path*']
}
