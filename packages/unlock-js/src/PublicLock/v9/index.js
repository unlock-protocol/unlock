import abis from '../../abis'
import purchaseKey from './purchaseKey'
import purchaseKeys from './purchaseKeys'
import setMaxNumberOfKeys from './setMaxNumberOfKeys'
import setExpirationDuration from './setExpirationDuration'
import setEventHooks from './setEventHooks'
import transferFrom from './transferFrom'
import setGasRefundValue from './setGasRefundValue'
import v8 from '../v8'

const {
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
  keyManagerOf,
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
  updateTransferFee,
  setKeyManagerOf,
} = v8

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
