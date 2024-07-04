import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { config } from '~/config/app'
import NextAuth from 'next-auth'
import SequelizeAdapter, { models } from '@auth/sequelize-adapter'
import { Sequelize } from 'sequelize'
import { generateAuthToken } from '~/utils/generateAuthToken'
import WedlockService from '~/services/wedlockService'

const sequelize = new Sequelize(process.env.DATABASE_URL as string)

export const authOptions = {
  adapter: SequelizeAdapter(sequelize, {
    models: {
      Account: sequelize.define(
        'Account',
        { ...models.Account },
        { tableName: 'NextAuthAccount' }
      ),
      User: sequelize.define(
        'User',
        {
          ...models.User,
        },
        { tableName: 'NextAuthUser' }
      ),
      Session: sequelize.define(
        'Session',
        {
          ...models.Session,
        },
        { tableName: 'NextAuthSession' }
      ),
      VerificationToken: sequelize.define(
        'VerificationToken',
        {
          ...models.VerificationToken,
        },
        { tableName: 'NextAuthVerificationToken' }
      ),
    },
  }),
  secret: config.nexthAuthSecret as string,
  providers: [
    GoogleProvider({
      clientId: config.googleClientId as string,
      clientSecret: config.googleClientSecret as string,
    }),
    EmailProvider({
      server: process.env.SMTP_SERVER,
      from: process.env.EMAIL_FROM,
      maxAge: 10 * 60, // 10 minutes
      generateVerificationToken: async () => {
        const token = await generateAuthToken()
        return token
      },
      sendVerificationRequest: async ({ identifier: email, token }) => {
        const wedlockService = new WedlockService(config.services.wedlocks.host)
        wedlockService.nextAuthCodeEmail(email, token)
      },
    }),
  ],
  callbacks: {
    // We need to pass provider to the session so that we can use it in the WaasProvider
    async signIn({ user, account }: { user: any; account: any }) {
      user.selectedProvider = account.provider
      user.idToken = account.id_token

      return true
    },
    // This is not called in case of Email Login
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.selectedProvider = user.selectedProvider
        token.idToken = user.idToken
      }

      return token
    },
    async session({
      session,
      token,
      user,
    }: {
      session: any
      token: any
      user: any
    }) {
      if (token) {
        session.user.selectedProvider = token.selectedProvider
        session.user.token = token.idToken
      } else if (user) {
        // There is no way to pass provider type here form signIn, so if there is no token, we assume it is email
        session.user.selectedProvider = 'email'
        session.user.token = user.id
      }

      return session
    },
  },
}

// @ts-expect-error The types of 'adapter.createUser' are incompatible between these types.
export default NextAuth(authOptions)
