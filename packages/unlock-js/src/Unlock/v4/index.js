import abis from '../../abis'
import configureUnlock from './configureUnlock'
import createLock from './createLock'
import getLock from './getLock'


export default {
  configureUnlock,
  createLock,
  getLock,
  version: 'v4',
  Unlock: abis.v4.Unlock,
  PublicLock: abis.v4.PublicLock
}