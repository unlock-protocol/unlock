import abis from '../../abis'
import createUpgradeableLock from './createUpgradeableLock'

import v9 from '../v9'

const { createLock, configureUnlock } = v8

export default {
  configureUnlock,
  createUpgradeableLock,
  createLock,
  version: 'v9',
  Unlock: abis.Unlock.v9,
  PublicLock: abis.PublicLock.v9,
}
