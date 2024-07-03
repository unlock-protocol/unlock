import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { config } from '~/config/app'
import NextAuth from 'next-auth'
import SequelizeAdapter, { models } from '@auth/sequelize-adapter'
import { Sequelize } from 'sequelize'
import nodemailer from 'nodemailer'
import { generateAuthToken } from '~/utils/generateAuthToken'
import { preview } from '@unlock-protocol/wedlocks/src/route'

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

      generateVerificationToken: async () => {
        const token = await generateAuthToken()
        return token
      },
      sendVerificationRequest: async ({
        identifier: email,
        url,
        token,
        provider,
      }) => {
        const template = await preview({
          template: 'inviteEvent',
          params: {
            eventName: '',
            eventDate: '',
            eventTime: '',
            eventUrl: '',
          },
        })
        console.log('Email', template)

        return new Promise(async (resolve, reject) => {
          const { server, from } = provider
          // Strip protocol from URL and use domain as site name
          nodemailer.createTransport(server).sendMail(
            {
              to: email,
              from,
              subject: `Authentication code: ${token}`,
              text: `Authentication code: ${token}`,
              html: '',
            },
            (error: any) => {
              if (error) {
                // logger.error('SEND_VERIFICATION_EMAIL_ERROR', email, error);
                console.error('SEND_VERIFICATION_EMAIL_ERROR', email, error)
                return reject(
                  new Error(`SEND_VERIFICATION_EMAIL_ERROR ${error}`)
                )
              }
              return resolve()
            }
          )
        })
      },
    }),
  ],
  callbacks: {
    // We need to pass provider to the session so that we can use it in the WaasProvider
    async signIn({ user, account }: { user: any; account: any }) {
      console.log('user', user)
      console.log('account', account)

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
      console.log('session user', user)
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

export default NextAuth(authOptions)
