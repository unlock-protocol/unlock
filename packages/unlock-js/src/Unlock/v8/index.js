import abis from '../../abis'
import configureUnlock from './configureUnlock'
import createLock from './createLock'

export default {
  configureUnlock,
  createLock,
  version: 'v8',
  Unlock: abis.Unlock.v8,
  PublicLock: abis.PublicLock.v8
}