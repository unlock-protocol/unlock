import abis from '../../abis'
import configureUnlock from './configureUnlock'
import createLock from './createLock'

export default {
  configureUnlock,
  createLock,
  version: 'v4',
  Unlock: abis.Unlock.v4,
  PublicLock: abis.PublicLock.v4
}