import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathname.startsWith('/pro')) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/pro/:path*',  '/api/clientes/:path*', '/api/ia/:path*', '/api/galeria/:path*', '/api/imc/:path*', '/api/compras/:path*']
}
