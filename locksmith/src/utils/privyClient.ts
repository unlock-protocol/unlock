import { PrivyClient } from '@privy-io/server-auth'
import config from '../config/config'

const PRIVY_APP_ID = config.privyAppId
const PRIVY_APP_SECRET = config.privyAppSecret

if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
  throw new Error('Privy app ID or secret is not defined.')
}

export const privy = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET)
