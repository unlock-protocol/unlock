import v11 from '../v11'
import abis from '../../abis'
import setMaxKeysPerAddress from './setMaxKeysPerAddress'

export default {
  ...v11,
  setMaxKeysPerAddress,
  version: 'v12',
  PublicLock: abis.PublicLock.v12,
}
