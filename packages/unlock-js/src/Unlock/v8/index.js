import abis from '../../abis'
import createLock from './createLock'

export default {
  createLock,
  version: 'v8',
  Unlock: abis.Unlock.v8,
  PublicLock: abis.PublicLock.v8,
}
