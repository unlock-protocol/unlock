import abis from '../../abis'
import v14 from '../v14'
import purchaseKey from './purchaseKey'
import purchaseKeys from './purchaseKeys'
import preparePurchaseKeysTx from './preparePurchaseKeysTx'
import preparePurchaseKeyTx from './preparePurchaseKeyTx'

export default {
  ...v14,
  purchaseKey,
  purchaseKeys,
  preparePurchaseKeysTx,
  preparePurchaseKeyTx,
  version: 'v15',
  PublicLock: abis.PublicLock.v15,
}
