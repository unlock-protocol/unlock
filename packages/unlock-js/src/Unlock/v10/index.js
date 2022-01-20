import abis from '../../abis'
import upgradeLock from './upgradeLock'
import createLock from './createLock'

export default {
  createLock,
  upgradeLock,
  version: 'v10',
  Unlock: abis.Unlock.v10,
}
