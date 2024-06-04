import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { config } from '~/config/app'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: config.googleClientId as string,
      clientSecret: config.googleClientSecret as string,
    }),
  ],
  callbacks: {
    // We need to pass provider to the session so that we can use it in the WaasProvider
    async signIn({ user, account }: { user: any; account: any }) {
      user.selectedProvider = account.provider

      return true
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.selectedProvider = user.selectedProvider
      }

      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      session.selectedProvider = token.selectedProvider

      return session
    },
  },
}

export default NextAuth(authOptions)
