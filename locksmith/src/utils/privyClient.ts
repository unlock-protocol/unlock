import { PrivyClient } from '@privy-io/server-auth'
import config from '../config/config'

const PRIVY_APP_ID = config.privyAppId
const PRIVY_APP_SECRET = config.privyAppSecret

let privy: PrivyClient | null = null

if (PRIVY_APP_ID && PRIVY_APP_SECRET) {
  privy = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET)
} else if ('test' !== process.env?.NODE_ENV) {
  console.warn(
    'Privy app ID or secret is not defined. Privy functionality will be unavailable.'
  )
}

export { privy }
