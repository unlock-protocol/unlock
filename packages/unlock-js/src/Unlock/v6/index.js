import abis from '../../abis'
import createLock from './createLock'

export default {
  createLock,
  version: 'v6',
  Unlock: abis.Unlock.v6,
  PublicLock: abis.PublicLock.v6,
}
