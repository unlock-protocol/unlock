import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Svg from '../../svg'
import { LockButton } from '../Button'
import UnlockPropTypes from '../../../../propTypes'

export class Withdraw extends React.Component {
  render() {
    const { lock, withdraw, account } = this.props

    const startWithdrawal = () => {
      if (lock.balance > 0) {
        withdraw(lock, account)
      }
    }

    return (
      <LockButton title="Withdraw balance" {...this.props}>
        <Svg.Withdraw name="Withdraw" />
      </LockButton>
    )
  }
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
