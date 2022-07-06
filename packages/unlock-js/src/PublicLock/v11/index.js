import v10 from '../v10'
import abis from '../../abis'

export default {
  ...v10,
  version: 'v11',
  PublicLock: abis.PublicLock.v11,
}
