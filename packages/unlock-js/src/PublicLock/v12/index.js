import v11 from '../v11'
import abis from '../../abis'
import setMaxKeysPerAddress from './setMaxKeysPerAddress'
import setMaxNumberOfKeys from './setMaxNumberOfKeys'
import setExpirationDuration from './setExpirationDuration'

export default {
  ...v11,
  setMaxKeysPerAddress,
  setExpirationDuration,
  setMaxNumberOfKeys,
  version: 'v12',
  PublicLock: abis.PublicLock.v12,
}
