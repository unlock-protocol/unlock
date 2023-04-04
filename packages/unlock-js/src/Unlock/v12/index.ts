import abis from '../../abis'
import v11 from '../v11'

const { upgradeLock, createLock } = v11

export default {
  createLock,
  upgradeLock,
  version: 'v12',
  Unlock: abis.Unlock.v12,
}
