import { OAuth2Client } from 'google-auth-library'
import config from '../config/config'
import { UserAccountType } from '../controllers/userController'
import VerificationCodes from '../models/verificationCodes'

export const verifyNextAuthToken = async (
  selectedProvider: UserAccountType,
  email: string,
  token: string
) => {
  switch (selectedProvider) {
    case UserAccountType.GoogleAccount:
      return await verifyGoogleToken(email, token)
    case UserAccountType.EmailCodeAccount:
      return verifyEmailToken(email, token)
    default:
      return false
  }
}

export const verifyGoogleToken = async (email: string, token: string) => {
  const client = new OAuth2Client()
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: config.googleAuthClientId,
  })

  const payload = ticket.getPayload()

  if (payload?.email === email) {
    return true
  }

  return false
}

export const verifyEmailToken = async (email: string, token: string) => {
  const verificationEntry = await VerificationCodes.findOne({
    where: { emailAddress: email, code: token },
  })

  if (!verificationEntry) {
    return false
  }

  const currentTime = new Date()
  const expiration = new Date(Date.now() + 60 * 60 * 1000) // Expires in 1 hour
  if (verificationEntry.codeExpiration > currentTime) {
    // On login prolong the expiration time of the token
    verificationEntry.update({ codeExpiration: expiration })
    return true
  } else {
    return false
  }
}
