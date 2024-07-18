import { GoogleAuth } from 'google-auth-library'
import config from '../../../config/config'

// Retrieve Google application credentials from the configuration
const googleWalletApplicationCredentials =
  config.googleWalletApplicationCredentials

/**
 * Initializes a `GoogleAuth` client with the provided credentials and scopes.
 *
 * @returns A configured GoogleAuth client instance.
 */
export const googleAuthClient = new GoogleAuth({
  credentials: googleWalletApplicationCredentials,
  scopes: 'https://www.googleapis.com/auth/wallet_object.issuer',
})
