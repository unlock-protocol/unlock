import abis from '../../abis'
import purchaseKeys from './purchaseKeys'
import purchaseKey from './purchaseKey'
import extendKey from './extendKey'
import mergeKeys from './mergeKeys'
import shareKey from './shareKey'
import setMaxKeysPerAddress from './setMaxKeysPerAddress'
import expireAndRefundFor from './expireAndRefundFor'
import getTokenIdForOwner from './getTokenIdForOwner'
import getKeyExpirationByLockForOwner from './getKeyExpirationByLockForOwner'
import getCancelAndRefundValueFor from './getCancelAndRefundValueFor'
import approveBeneficiary from './approveBeneficiary'
import v9 from '../v9'

const {
  grantKey,
  grantKeys,
  updateKeyPrice,
  withdrawFromLock,
  initializeTemplate,
  isLockManager,
  isKeyGranter,
  addKeyGranter,
  cancelAndRefund,
  getLock,
  keyManagerOf,
  setMaxNumberOfKeys,
  setExpirationDuration,
  approveBeneficiary,
} = v9

export default {
  version: 'v10',
  PublicLock: abis.PublicLock.v10,
  grantKey,
  grantKeys,
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
  setMaxKeysPerAddress,
  getTokenIdForOwner,
  getKeyExpirationByLockForOwner,
  getCancelAndRefundValueFor,
  approveBeneficiary,
}
