import { pathToRegexp } from 'path-to-regexp'

export const TOPIC_LOCKS = pathToRegexp('/api/hooks/:network/locks')
export const TOPIC_KEYS = pathToRegexp('/api/hooks/:network/locks/:lock/keys')
