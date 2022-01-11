import abis from '../../abis'
import createUpgradeableLock from './createUpgradeableLock'
import upgradeLock from './upgradeLock'
import { parseGetters } from '../../parser'

import v9 from '../v9'

const { createLock, configureUnlock } = v9

const getters = parseGetters(abis.Unlock.v10.abi)

export default {
  ...getters,
  configureUnlock,
  createUpgradeableLock,
  createLock,
  upgradeLock,
  version: 'v9',
  Unlock: abis.Unlock.v10,
}
