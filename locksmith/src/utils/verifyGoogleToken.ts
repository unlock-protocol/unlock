import { OAuth2Client } from 'google-auth-library'
import config from '../config/config'

export const verifyToken = async (email: string, token: string) => {
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
