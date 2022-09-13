import v10 from '../v10'
import abis from '../../abis'
import grantKeyExtension from './grantKeyExtension'
import totalKeys from './totalKeys'

export default {
  ...v10,
  totalKeys,
  grantKeyExtension,
  version: 'v11',
  PublicLock: abis.PublicLock.v11,
}
