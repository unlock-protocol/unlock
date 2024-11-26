import abis from '../../abis'
import v14 from '../v14'
import purchaseKey from './purchaseKey'
import purchaseKeys from './purchaseKeys'

export default {
  ...v14,
  purchaseKey,
  purchaseKeys,
  version: 'v15',
  PublicLock: abis.PublicLock.v15,
}
