import { OAuth2Client } from 'google-auth-library'
import config from '../config/config'
import { UserAccountType } from '../controllers/userController'
import { NextAuthSession } from '../models/nextAuthSession'
import { Op } from 'sequelize'
import { NextAuthAccount } from '../models/nextAuthAccount'

export const verifyToken = async (
  selectedProvider: UserAccountType,
  email: string,
  token: string
) => {
  switch (selectedProvider) {
    case UserAccountType.GoogleAccount:
      return await verifyGoogleToken(email, token)
    case UserAccountType.EmailCodeAccount:
      console.log('email code account')
      return await verifyEmailToken(token)
    default:
      return false
  }
}

const verifyGoogleToken = async (email: string, token: string) => {
  const googleToken = await NextAuthAccount.findOne({
    where: {
      userId: token,
    },
  })

  const client = new OAuth2Client()
  const ticket = await client.verifyIdToken({
    idToken: googleToken?.id_token as string,
    audience: config.googleAuthClientId,
  })

  const payload = ticket.getPayload()

  if (payload?.email === email) {
    return true
  }

  return false
}

const verifyEmailToken = async (token: string) => {
  const session = await NextAuthSession.findOne({
    where: {
      userId: token,
      expires: {
        [Op.gt]: new Date(),
      },
    },
  })

  return session ? true : false
}
