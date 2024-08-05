import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { config } from '~/config/app'
import NextAuth from 'next-auth'
import { locksmith } from '~/config/locksmith'

export const authOptions = {
  secret: config.nexthAuthSecret as string,
  pages: {
    error: '/authError',
    signIn: '/authError',
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

export default NextAuth(authOptions)
