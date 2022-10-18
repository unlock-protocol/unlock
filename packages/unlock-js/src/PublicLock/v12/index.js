import v11 from '../v11'
import abis from '../../abis'
import setMaxKeysPerAddress from './setMaxKeysPerAddress'
import setMaxNumberOfKeys from './setMaxNumberOfKeys'
import setExpirationDuration from './setExpirationDuration'
import setBaseTokenURI from './setBaseTokenURI'
import updateLockName from './updateLockName'
import updateLockSymbol from './updateLockSymbol'

export default {
  ...v11,
  setMaxKeysPerAddress,
  setExpirationDuration,
  setMaxNumberOfKeys,
  setBaseTokenURI,
  updateLockName,
  updateLockSymbol,
  version: 'v12',
  PublicLock: abis.PublicLock.v12,
}
