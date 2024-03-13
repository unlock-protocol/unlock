import v10 from '../v10'
import abis from '../../abis'
import grantKeyExtension from './grantKeyExtension'
import totalKeys from './totalKeys'
import setEventHooks from './setEventHooks'
import setReferrerFee from './setReferrerFee'
import getTokenIdForOwner from './getTokenIdForOwner'

export default {
  ...v10,
  totalKeys,
  grantKeyExtension,
  setEventHooks,
  setReferrerFee,
  getTokenIdForOwner,
  version: 'v11',
  PublicLock: abis.PublicLock.v11,
}
