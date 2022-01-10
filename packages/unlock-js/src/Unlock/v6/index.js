import abis from '../../abis'
import configureUnlock from './configureUnlock'
import createLock from './createLock'
import getLock from './getLock'


export default {
  configureUnlock,
  createLock,
  getLock,
  version: 'v6',
  Unlock: abis.Unlock.v6,
  PublicLock: abis.PublicLock.v6
}