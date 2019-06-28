import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import UnlockPropTypes from '../../propTypes'

import { purchaseKey } from '../../actions/key'

import PendingKeyLock from './PendingKeyLock'
import ConfirmingKeyLock from './ConfirmingKeyLock'
import ConfirmedKeyLock from './ConfirmedKeyLock'
import NoKeyLock from './NoKeyLock'
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
  switch (keyStatus) {
    case 'submitted':
    case 'pending':
      return <PendingKeyLock lock={lock} />
    case 'confirming':
      return <ConfirmingKeyLock lock={lock} transaction={transaction} />
    case 'confirmed':
    case 'valid':
      return <ConfirmedKeyLock lock={lock} onClick={hideModal} />
    case 'none':
    case 'expired':
    default:
      return (
        <NoKeyLock
          account={account}
          lock={lock}
          disabled={disabled}
          purchaseKey={purchase}
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

export default connect(
  undefined, // no mapStateToProps needed
  mapDispatchToProps
)(Lock)
