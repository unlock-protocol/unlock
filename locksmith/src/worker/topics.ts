import { match } from 'path-to-regexp'

export const TOPIC_LOCKS = match('/api/hooks/:network/locks')
export const TOPIC_KEYS_ON_LOCK = match('/api/hooks/:network/locks/:lock/keys')
export const TOPIC_KEYS_ON_NETWORK = match('/api/hooks/:network/keys')
export const TOPIC_EXPIRED_KEYS_ON_NETWORK = match(
  '/api/hooks/:network/expired-keys'
)
