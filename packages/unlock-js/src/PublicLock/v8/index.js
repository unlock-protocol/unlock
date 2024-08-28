import abis from '../../abis'
import addKeyGranter from './addKeyGranter'
import addLockManager from './addLockManager'
import approveBeneficiary from './approveBeneficiary'
import cancelAndRefund from './cancelAndRefund'
import expireAndRefundFor from './expireAndRefundFor'
import getCancelAndRefundValueFor from './getCancelAndRefundValueFor'
import getKeyExpirationByLockForOwner from './getKeyExpirationByLockForOwner'
import getLock from './getLock'
import getTokenIdForOwner from './getTokenIdForOwner'
import grantKey from './grantKey'
import grantKeys from './grantKeys'
import initializeTemplate from './initializeTemplate'
import isKeyGranter from './isKeyGranter'
import isLockManager from './isLockManager'
import keyManagerOf from './keyManagerOf'
import purchaseKey from './purchaseKey'
import purchaseKeys from './purchaseKeys'
import renounceLockManager from './renounceLockManager'
import setBaseTokenURI from './setBaseTokenURI'
import setEventHooks from './setEventHooks'
import setKeyManagerOf from './setKeyManagerOf'
import shareKey from './shareKey'
import totalKeys from './totalKeys'
import updateKeyPrice from './updateKeyPrice'
import updateLockName from './updateLockName'
import updateLockSymbol from './updateLockSymbol'
import updateRefundPenalty from './updateRefundPenalty'
import updateTransferFee from './updateTransferFee'
import withdrawFromLock from './withdrawFromLock'

export default {
  version: 'v8',
  Unlock: abis.Unlock.v8,
  PublicLock: abis.PublicLock.v8,
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
  purchaseKey,
  purchaseKeys,
  renounceLockManager,
  setBaseTokenURI,
  setEventHooks,
  setKeyManagerOf,
  shareKey,
  totalKeys,
  updateKeyPrice,
  updateLockName,
  updateLockSymbol,
  updateRefundPenalty,
  updateTransferFee,
  withdrawFromLock,
}
