import abis from '../../abis'
import purchaseKey from './purchaseKey'
import purchaseKeys from './purchaseKeys'
import setMaxNumberOfKeys from './setMaxNumberOfKeys'
import setExpirationDuration from './setExpirationDuration'
import setEventHooks from './setEventHooks'
import transferFrom from './transferFrom'
import setGasRefundValue from './setGasRefundValue'
import previous from '../previous'

const {
  addKeyGranter,
  addLockManager,
  approveBeneficiary,
  cancelAndRefund,
  expireAndRefundFor,
  getCancelAndRefundValueFor,
  getKeyExpirationByLockForOwner,
  getLock,
  getTokenIdForOwner,
  grantKey,
  grantKeys,
  initializeTemplate,
  isKeyGranter,
  isLockManager,
  keyManagerOf,
  renounceLockManager,
  setBaseTokenURI,
  setKeyManagerOf,
  shareKey,
  totalKeys,
  updateKeyPrice,
  updateLockName,
  updateLockSymbol,
  updateRefundPenalty,
  updateTransferFee,
  withdrawFromLock,
} = previous

export default {
  version: 'v9',
  Unlock: abis.Unlock.v9,
  PublicLock: abis.PublicLock.v9,
  grantKey,
  grantKeys,
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
  keyManagerOf,
  setMaxNumberOfKeys,
  setExpirationDuration,
  getCancelAndRefundValueFor,
  getTokenIdForOwner,
  getKeyExpirationByLockForOwner,
  approveBeneficiary,
  totalKeys,
  updateLockName,
  updateLockSymbol,
  setBaseTokenURI,
  addLockManager,
  renounceLockManager,
  updateRefundPenalty,
  setEventHooks,
  updateTransferFee,
  setKeyManagerOf,
  transferFrom,
  setGasRefundValue,
}
