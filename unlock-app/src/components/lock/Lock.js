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

export const Lock = ({
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
    return (
      <NoKeyLock
        lock={lock}
        disabled={disabled}
        purchaseKey={purchaseKey}
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
}

Lock.defaultProps = {
  lockKey: null,
  transaction: null,
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
  } else {
    transaction = state.transactions[lockKey.transaction]
  }

  return {
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
