import v10 from '../v10'
import abis from '../../abis'

export default {
  version: 'v11',
  PublicLock: abis.PublicLock.v11,
  ...v10,
}
