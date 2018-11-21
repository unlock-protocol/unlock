import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Svg from '../../svg'
import { LockButton } from '../Button'
import UnlockPropTypes from '../../../../propTypes'
import { withdrawFromLock } from '../../../../actions/lock'

export function Withdraw({ lock, withdraw, account, ...props }) {
  const startWithdrawal = () => {
    if (lock.balance > 0) {
      withdraw(lock, account)
    }
  }

  return (
    <LockButton title="Withdraw balance" action={startWithdrawal} {...props}>
      <Svg.Withdraw name="Withdraw" />
    </LockButton>
  )
}

Withdraw.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
  transaction: UnlockPropTypes.transaction,
  withdraw: PropTypes.func,
  account: UnlockPropTypes.account,
}

Withdraw.defaultProps = {
  transaction: null,
  account: null,
  withdraw: () => {},
}

const mapStateToProps = (state, { lock }) => {
  const account = state.account
  const transaction = state.transactions[lock.transaction]
  return {
    account,
    transaction,
  }
}

const mapDispatchToProps = dispatch => ({
  withdraw: (lock, account) => dispatch(withdrawFromLock(lock, account)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Withdraw)
