import { pathToRegexp } from 'path-to-regexp'

export const TOPIC_LOCKS = pathToRegexp('/api/hooks/:network/locks')
export const TOPIC_KEYS_ON_LOCK = pathToRegexp(
  '/api/hooks/:network/locks/:lock/keys'
)
export const TOPIC_KEYS_ON_NETWORK = pathToRegexp('/api/hooks/:network/keys')
