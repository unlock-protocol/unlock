import abis from '../../abis'
import upgradeLock from './upgradeLock'

import v9 from '../v9'

const { createLock, configureUnlock } = v9

export default {
  configureUnlock,
  createLock,
  upgradeLock,
  version: 'v10',
  Unlock: abis.Unlock.v10,
}
