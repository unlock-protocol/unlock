import abis from '../../abis'
import v13 from '../v13'
import createLock from './createLock'

const { upgradeLock } = v13
export default {
  createLock,
  upgradeLock,
  version: 'v14',
  Unlock: abis.Unlock.v14,
}
