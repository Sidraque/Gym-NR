import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Verifica se existe o token de autenticação
  const session = request.cookies.get('__session')?.value;

  // URLs que não precisam de autenticação
  const publicUrls = ['/', '/api/auth'];
  const isPublicUrl = publicUrls.some(url => request.nextUrl.pathname.startsWith(url));

  // Redirecionar para a página inicial se não estiver autenticado
  // e estiver tentando acessar uma URL protegida
  if (!session && !isPublicUrl) {
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }

  // Redirecionar para o dashboard se estiver autenticado
  // e estiver tentando acessar a página inicial
  if (session && request.nextUrl.pathname === '/') {
    const url = new URL('/dashboard', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Define as rotas que serão verificadas pelo middleware
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
