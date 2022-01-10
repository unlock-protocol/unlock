import abis from '../../abis'
import configureUnlock from './configureUnlock'
import createLock from './createLock'
import getLock from './getLock'


export default {
  configureUnlock,
  createLock,
  getLock,
  version: 'v4',
  Unlock: abis.Unlock.v4,
  PublicLock: abis.PublicLock.v4
}