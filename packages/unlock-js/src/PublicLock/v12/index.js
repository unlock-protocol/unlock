import v11 from '../v11'
import abis from '../../abis'
import setMaxKeysPerAddress from './setMaxKeysPerAddress'
import setMaxNumberOfKeys from './setMaxNumberOfKeys'
import setExpirationDuration from './setExpirationDuration'
import setBaseTokenURI from './setBaseTokenURI'
import updateLockName from './updateLockName'
import updateLockSymbol from './updateLockSymbol'
import approveBeneficiary from './approveBeneficiary'
import withdrawFromLock from './withdrawFromLock'

export default {
  ...v11,
  approveBeneficiary,
  setMaxKeysPerAddress,
  setExpirationDuration,
  setMaxNumberOfKeys,
  setBaseTokenURI,
  updateLockName,
  updateLockSymbol,
  withdrawFromLock,
  version: 'v12',
  PublicLock: abis.PublicLock.v12,
}
