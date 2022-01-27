import abis from '../../abis'
import createLock from './createLock'

export default {
  createLock,
  version: 'v4',
  Unlock: abis.Unlock.v4,
  PublicLock: abis.PublicLock.v4,
}
