import abis from '../../abis'
import configureUnlock from './configureUnlock'
import createLock from './createLock'

export default {
  configureUnlock,
  createLock,
  version: 'v7',
  Unlock: abis.Unlock.v7,
  PublicLock: abis.PublicLock.v7,
}
