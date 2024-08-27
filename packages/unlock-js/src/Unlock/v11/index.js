import abis from '../../abis'
import createLock from './createLock'
import upgradeLock from './upgradeLock'

export default {
  createLock,
  upgradeLock,
  version: 'v11',
  Unlock: abis.Unlock.v11,
}
