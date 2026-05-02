import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  if (process.env.SKIP_AUTH === 'true') return NextResponse.next()

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/review/:path*'],
}
