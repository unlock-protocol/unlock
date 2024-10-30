import { pathToRegexp } from 'path-to-regexp'

export const TOPIC_LOCKS = pathToRegexp('/api/hooks/:network/locks').regexp
export const TOPIC_KEYS_ON_LOCK = pathToRegexp(
  '/api/hooks/:network/locks/:lock/keys'
).regexp
export const TOPIC_KEYS_ON_NETWORK = pathToRegexp(
  '/api/hooks/:network/keys'
).regexp
export const TOPIC_EXPIRED_KEYS_ON_NETWORK = pathToRegexp(
  '/api/hooks/:network/expired-keys'
).regexp
