import v10 from '../v10'
import abis from '../../abis'
import grantKeyExtension from './grantKeyExtension'

export default {
  ...v10,
  grantKeyExtension,
  version: 'v11',
  PublicLock: abis.PublicLock.v11,
}
