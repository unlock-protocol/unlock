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
  let ticket
  try {
    ticket = await client.verifyIdToken({
      idToken: token,
      audience: config.googleAuthClientId,
    })
  } catch (e) {
    console.error('Error verifying Google token', e)
    return false
  }

  const payload = ticket.getPayload()

  if (payload?.email === email) {
    return true
  }

  return false
}

export const verifyEmailToken = async (email: string, token: string) => {
  let verificationEntry
  try {
    verificationEntry = await VerificationCodes.findOne({
      where: { emailAddress: email, token: token },
    })
  } catch (e) {
    console.error('Error verifying email token', e)
    return false
  }

  if (!verificationEntry) {
    return false
  }

  const currentTime = new Date()
  if (verificationEntry.tokenExpiration > currentTime) {
    return true
  } else {
    return false
  }
}
