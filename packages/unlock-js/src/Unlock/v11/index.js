import abis from '../../abis'
import createLock from './createLock'

import v10 from '../v10'

const { upgradeLock } = v10

export default {
  createLock,
  upgradeLock,
  version: 'v11',
  Unlock: abis.Unlock.v11,
}
