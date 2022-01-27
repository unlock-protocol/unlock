import abis from '../../abis'

import v8 from '../v8'

const { createLock } = v8

export default {
  createLock,
  version: 'v9',
  Unlock: abis.Unlock.v9,
  PublicLock: abis.PublicLock.v9,
}
