import abis from '../../abis'
import createLock from './createLock'

export default {
  createLock,
  version: 'v7',
  Unlock: abis.Unlock.v7,
  PublicLock: abis.PublicLock.v7,
}
