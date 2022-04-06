import abis from '../../abis'
import purchaseKeys from './purchaseKeys'
import purchaseKey from './purchaseKey'
import extendKey from './extendKey'
import mergeKeys from './mergeKeys'
import v9 from '../v9'

const {
  grantKey,
  updateKeyPrice,
  withdrawFromLock,
  initializeTemplate,
  isLockManager,
  isKeyGranter,
  addKeyGranter,
  expireAndRefundFor,
  cancelAndRefund,
  shareKey,
  getLock,
  keyManagerOf,
  setMaxNumberOfKeys,
  setExpirationDuration,
} = v9

export default {
  version: 'v10',
  PublicLock: abis.PublicLock.v10,
  grantKey,
  extendKey,
  updateKeyPrice,
  withdrawFromLock,
  initializeTemplate,
  isLockManager,
  isKeyGranter,
  addKeyGranter,
  expireAndRefundFor,
  cancelAndRefund,
  shareKey,
  getLock,
  purchaseKey,
  purchaseKeys,
  mergeKeys,
  keyManagerOf,
  setMaxNumberOfKeys,
  setExpirationDuration,
}
