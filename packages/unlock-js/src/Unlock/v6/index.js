import abis from '../../abis'
import configureUnlock from './configureUnlock'
import createLock from './createLock'

export default {
  configureUnlock,
  createLock,
  version: 'v6',
  Unlock: abis.Unlock.v6,
  PublicLock: abis.PublicLock.v6,
}
