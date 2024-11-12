import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import NextAuth from 'next-auth'
import { config } from '../../../../src/config/app'
import { locksmith } from '../../../../src/config/locksmith'

// Define auth options
export const authOptions = {
  secret: config.nexthAuthSecret as string,
  pages: {
    error: '/auth-error',
    signIn: '/google-sign-in',
  },
  providers: [
    GoogleProvider({
      clientId: config.googleClientId as string,
      clientSecret: config.googleClientSecret as string,
    }),
    CredentialsProvider({
      name: 'EmailCode',
      credentials: {
        email: { label: 'Email', type: 'email' },
        code: { label: 'Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.code) return null

        const res = await locksmith.verifyEmailCode(credentials.email, {
          code: credentials.code,
        })

        if (res.status == 200) {
          return { id: res.data.token as string, email: credentials.email }
        }
        return null
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }: { user: any; account: any }) {
      user.selectedProvider = account.provider
      user.idToken = account.id_token
      return true
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.selectedProvider = user.selectedProvider
        token.idToken = user.idToken
      }
      return token
    },
    async session({ session, token }: { session: any; token: any; user: any }) {
      if (token) {
        if (token.selectedProvider === 'google') {
          session.user.email = token.email
          session.user.token = token.idToken
        } else {
          session.user.token = token.sub
        }
      }
      return session
    },
  },
}

// Create handler
const handler = NextAuth(authOptions)

// Export handler functions
export { handler as GET, handler as POST }
