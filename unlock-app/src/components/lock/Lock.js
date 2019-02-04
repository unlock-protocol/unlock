import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import UnlockPropTypes from '../../propTypes'
import withConfig from '../../utils/withConfig'

import { purchaseKey } from '../../actions/key'
import { openNewWindowModal } from '../../actions/modal'

import PendingKeyLock from './PendingKeyLock'
import ConfirmingKeyLock from './ConfirmingKeyLock'
import ConfirmedKeyLock from './ConfirmedKeyLock'
import NoKeyLock from './NoKeyLock'
import { UNLIMITED_KEYS_COUNT, TRANSACTION_TYPES } from '../../constants'

export const Lock = ({
  account,
  lock,
  lockKey,
  transaction,
  purchaseKey,
  config,
  disabled,
  hideModal,
}) => {
  if (
    transaction &&
    ['submitted', 'pending'].indexOf(transaction.status) > -1
  ) {
    return <PendingKeyLock lock={lock} />
  } else if (
    transaction &&
    transaction.status == 'mined' &&
    transaction.confirmations < config.requiredConfirmations
  ) {
    return <ConfirmingKeyLock lock={lock} transaction={transaction} />
  } else if (transaction && transaction.status == 'mined') {
    return <ConfirmedKeyLock lock={lock} hideModal={hideModal} />
  } else {
    const soldOut =
      lock.outstandingKeys >= lock.maxNumberOfKeys &&
      lock.maxNumberOfKeys !== UNLIMITED_KEYS_COUNT
    const tooExpensive =
      account && parseFloat(account.balance) <= parseFloat(lock.keyPrice)

    // When the lock is not disabled for other reasons (pending key on
    // other lock...), we need to ensure that the lock is disabled
    // when the lock is sold out or too expensive for the current account
    disabled = disabled || soldOut || tooExpensive

    return (
      <NoKeyLock
        lock={lock}
        disabled={disabled}
        purchaseKey={purchaseKey}
        soldOut={soldOut}
        tooExpensive={tooExpensive}
        lockKey={lockKey}
      />
    )
  }
}

Lock.propTypes = {
  lockKey: UnlockPropTypes.key,
  lock: UnlockPropTypes.lock.isRequired,
  transaction: UnlockPropTypes.transaction,
  purchaseKey: PropTypes.func.isRequired,
  config: UnlockPropTypes.configuration.isRequired,
  hideModal: PropTypes.func.isRequired,
  openInNewWindow: PropTypes.bool.isRequired,
}

Lock.defaultProps = {
  lockKey: null,
  transaction: null,
}

export const mapDispatchToProps = (
  dispatch,
  { showModal, openInNewWindow }
) => ({
  purchaseKey: key => {
    if (openInNewWindow) {
      return dispatch(openNewWindowModal())
    }
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

export default withConfig(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Lock)
)
