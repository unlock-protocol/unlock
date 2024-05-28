import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { config } from '~/config/app'
import { StorageService } from '~/services/storageService'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async session({ session }) {
      const storageService = new StorageService(config.services.storage.host)
      const waasToken = await storageService.getUserWaasUuid(session.user.email)
      // Send properties to the client, like an access_token and user id from a provider.
      session.waasToken = waasToken

      return session
    },
  },
}

export default NextAuth(authOptions)
