import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import UnlockPropTypes from '../../propTypes'
import withConfig from '../../utils/withConfig'

import { purchaseKey } from '../../actions/key'

import PendingKeyLock from './PendingKeyLock'
import ConfirmingKeyLock from './ConfirmingKeyLock'
import ConfirmedKeyLock from './ConfirmedKeyLock'
import NoKeyLock from './NoKeyLock'
import { UNLIMITED_KEYS_COUNT, TRANSACTION_TYPES } from '../../constants'
import usePurchaseKey from '../../hooks/usePurchaseKey'

export const Lock = ({
  account,
  lock,
  lockKey,
  transaction,
  purchaseKey,
  disabled,
  hideModal,
  openInNewWindow,
  keyStatus,
}) => {
  const purchase = usePurchaseKey(purchaseKey, openInNewWindow)
  const soldOut =
    lock.outstandingKeys >= lock.maxNumberOfKeys &&
    lock.maxNumberOfKeys !== UNLIMITED_KEYS_COUNT
  const tooExpensive =
    account && parseFloat(account.balance) <= parseFloat(lock.keyPrice)
  switch (keyStatus) {
    case 'submitted':
    case 'pending':
      return <PendingKeyLock lock={lock} />
    case 'confirming':
      return <ConfirmingKeyLock lock={lock} transaction={transaction} />
    case 'confirmed':
    case 'valid':
      return <ConfirmedKeyLock lock={lock} hideModal={hideModal} />
    case 'none':
    case 'expired':
    default:
      return (
        <NoKeyLock
          lock={lock}
          disabled={disabled || soldOut || tooExpensive}
          purchaseKey={purchase}
          soldOut={soldOut}
          tooExpensive={tooExpensive}
          lockKey={lockKey}
        />
      )
  }
}

Lock.propTypes = {
  account: UnlockPropTypes.account,
  lockKey: UnlockPropTypes.key,
  lock: UnlockPropTypes.lock.isRequired,
  transaction: UnlockPropTypes.transaction,
  purchaseKey: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired,
  openInNewWindow: PropTypes.bool.isRequired,
  keyStatus: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
}

Lock.defaultProps = {
  lockKey: null,
  transaction: null,
  disabled: false,
  account: null,
}

export const mapDispatchToProps = (dispatch, { showModal }) => ({
  purchaseKey: key => {
    showModal()
    dispatch(purchaseKey(key))
  },
})

export const mapStateToProps = (state, { lock }) => {
  const account = state.account

  // If there is no account (probably not loaded yet), we do not want to create a key
  if (!account) {
    return {}
  }

  let lockKey = Object.values(state.keys).find(
    key => key.lock === lock.address && key.owner === account.address
  )
  let transaction = null

  if (!lockKey) {
    lockKey = {
      lock: lock.address,
      owner: account.address,
    }
  }

  // Let's select the transaction corresponding to this key purchase, if it exists
  // This transaction is of type KEY_PURCHASE
  transaction = Object.values(state.transactions).find(
    transaction =>
      transaction.type === TRANSACTION_TYPES.KEY_PURCHASE &&
      transaction.key === lockKey.id
  )

  return {
    account,
    lockKey,
    transaction,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withConfig(Lock))
