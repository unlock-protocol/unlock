import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Svg from '../../svg'
import Button from '../Button'
import DisabledButton from '../DisabledButton'
import UnlockPropTypes from '../../../../propTypes'
import { withdrawFromLock } from '../../../../actions/lock'

export const Withdraw = ({
  lock,
  withdrawalTransaction,
  withdraw,
  account,
  ...props
}) => {
  if (
    !(
      lock.balance == 0 ||
      (withdrawalTransaction && withdrawalTransaction.status === 'submitted')
    )
  ) {
    return (
      <Button
        label="Withdraw balance"
        action={() => {
          if (lock.balance > 0) {
            withdraw(lock, account)
          }
        }}
        {...props}
      >
        <Svg.Withdraw name="Withdraw" />
      </Button>
    )
  } else {
    return (
      <DisabledButton {...props}>
        <Svg.Withdraw name="Withdraw" />
      </DisabledButton>
    )
  }
}

Withdraw.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
  withdrawalTransaction: UnlockPropTypes.transaction,
  withdraw: PropTypes.func,
  account: UnlockPropTypes.account,
}

Withdraw.defaultProps = {
  withdrawalTransaction: null,
  account: null,
  withdraw: () => {},
}

const mapStateToProps = ({ account, transactions }, { lock }) => {
  let withdrawalTransaction = null
  Object.keys(transactions).forEach(el => {
    if (
      transactions[el].withdrawal &&
      transactions[el].withdrawal === lock.address
    )
      withdrawalTransaction = transactions[el]
  })
  return {
    account,
    withdrawalTransaction,
  }
}

const mapDispatchToProps = dispatch => ({
  withdraw: (lock, account) => dispatch(withdrawFromLock(lock, account)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Withdraw)
