import abis from '../../abis'
import configureUnlock from './configureUnlock'
import createLock from './createLock'

import v7 from '../v7'

const { getLock } = v7

export default {
  configureUnlock,
  createLock,
  getLock,
  version: 'v8',
  Unlock: abis.v8.Unlock,
  PublicLock: abis.v8.PublicLock
}