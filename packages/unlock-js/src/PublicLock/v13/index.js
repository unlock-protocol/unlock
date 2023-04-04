import v12 from '../v12'
import abis from '../../abis'
import setMaxKeysPerAddress from './setMaxKeysPerAddress'
import setMaxNumberOfKeys from './setMaxNumberOfKeys'
import setExpirationDuration from './setExpirationDuration'
import setBaseTokenURI from './setBaseTokenURI'
import updateLockName from './updateLockName'
import updateLockSymbol from './updateLockSymbol'
import approveBeneficiary from './approveBeneficiary'
import withdrawFromLock from './withdrawFromLock'
import setEventHooks from './setEventHooks'

export default {
  ...v12,
  version: 'v13',
  PublicLock: abis.PublicLock.v13,
}
