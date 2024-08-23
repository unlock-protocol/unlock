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
  initializeTemplate,
  updateKeyPrice,
  grantKey,
  grantKeys,
  getLock,
  withdrawFromLock,
  isLockManager,
  isKeyGranter,
  addKeyGranter,
  expireAndRefundFor,
  cancelAndRefund,
  shareKey,
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
  setEventHooks,
  updateTransferFee,
  setKeyManagerOf,
}
