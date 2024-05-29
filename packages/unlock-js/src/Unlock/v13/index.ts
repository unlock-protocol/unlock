import abis from '../../abis'
import v12 from '../v12'

const { upgradeLock, createLock } = v12

export default {
  createLock,
  upgradeLock,
  version: 'v13',
  Unlock: abis.Unlock.v13,
}
