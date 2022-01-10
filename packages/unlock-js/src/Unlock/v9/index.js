import abis from '../../abis'
import configureUnlock from './configureUnlock'

import v8 from '../v8'

const { createLock } = v8

export default {
  configureUnlock,
  createLock,
  version: 'v9',
  Unlock: abis.Unlock.v9,
  PublicLock: abis.PublicLock.v9
}