import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { config } from '~/config/app'
import { StorageService } from '~/services/storageService'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization:
        'https://accounts.google.com/o/oauth2/auth?prompt=select_account',
    }),
  ],
  callbacks: {
    async session({ session }) {
      const storageService = new StorageService(config.services.storage.host)
      const waasToken = await storageService.getUserWaasUuid(session.user.email)
      // Send properties to the client
      session.waasToken = waasToken

      return session
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl
    },
  },
}

export default NextAuth(authOptions)
