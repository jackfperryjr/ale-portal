import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const ALLOWED = (process.env.BREWERY_ALLOWED_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export function isBrewmaster(email: string | null | undefined): boolean {
  return ALLOWED.includes((email ?? '').toLowerCase())
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    signIn() {
      return true  // any Google account can authenticate; page-level guards handle roles
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
}
