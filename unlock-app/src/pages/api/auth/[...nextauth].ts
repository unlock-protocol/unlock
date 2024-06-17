import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { config } from '~/config/app'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId:
        '675014568942-01fiu2rsvaoscqq6ce21d3762hrupf4c.apps.googleusercontent.com',
      clientSecret: config.googleClientSecret as string,
    }),
  ],
  callbacks: {
    // We need to pass provider to the session so that we can use it in the WaasProvider
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
    async session({ session, token }: { session: any; token: any }) {
      session.user.selectedProvider = token.selectedProvider
      session.user.token = token.idToken

      return session
    },
  },
}

export default NextAuth(authOptions)
