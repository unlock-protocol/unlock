import abis from '../../abis'
import configureUnlock from './configureUnlock'
import createLock from './createLock'
import getLock from './getLock'


export default {
  configureUnlock,
  createLock,
  getLock,
  version: 'v7',
  Unlock: abis.v7.Unlock,
  PublicLock: abis.v7.PublicLock
}