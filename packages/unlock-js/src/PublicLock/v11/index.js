import v10 from '../v10'
import abis from '../../abis'
import grantKeyExtension from './grantKeyExtension'
import totalKeys from './totalKeys'
import setEventHooks from './setEventHooks'

export default {
  ...v10,
  totalKeys,
  grantKeyExtension,
  setEventHooks,
  version: 'v11',
  PublicLock: abis.PublicLock.v11,
}
